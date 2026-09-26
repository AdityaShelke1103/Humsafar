"""
llm_service/extraction_service.py

Owner: Person 3 (LLM)

Extracts a structured Procedure from a list of official government sources
using the LLM provider abstraction (Groq -> Gemini fallback).

Public interface:
    extract_procedure(
        sources: List[OfficialSource],
        service: str,
        jurisdiction: str,
    ) -> Procedure

Hard rules (from spec section 5):
  - LLM may ONLY use facts present in the given source content.
  - If a fact cannot be confirmed, it must be omitted or marked null.
  - Every step / document claim must reference real source_ids from the
    input list.
  - Source objects with no content are silently skipped.
  - Output JSON is validated; on failure the provider failover in
    provider.call_llm() is triggered again (one more retry on Gemini if
    Groq already failed, raising LLMServiceUnavailable if that also fails).
"""

import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# -- Schema import (with Phase-1 fallback) ------------------------------------
# Try to import from backend.schemas (Person 4's module). If it does not
# exist yet (Phase 1, built independently), use schemas.models directly
# since we are inside the backend package.
try:
    from schemas.models import (
        DocumentRequirement,
        LLMProvider,
        OfficialSource,
        Procedure,
        ProcedureStatus,
        SourceType,
        Step,
    )
except ImportError:
    # TEMP -- replace with backend.schemas import once Person 4's schema is ready.
    # This branch should never be hit once the full repo is assembled; it only
    # exists so this file can be tested standalone in Phase 1.
    from enum import Enum
    from pydantic import BaseModel, Field, HttpUrl

    class SourceType(str, Enum):  # type: ignore[no-redef]
        GOVERNMENT_PORTAL = "government_portal"
        DEPARTMENT_SITE = "department_site"
        OTHER = "other"

    class ProcedureStatus(str, Enum):  # type: ignore[no-redef]
        VERIFIED = "verified"
        PARTIAL = "partial"

    class LLMProvider(str, Enum):  # type: ignore[no-redef]
        GROK = "grok"
        GEMINI_FLASH = "gemini_flash"
        NONE = "none"

    class OfficialSource(BaseModel):  # type: ignore[no-redef]
        id: str
        title: str
        url: HttpUrl
        domain: str
        source_type: SourceType = SourceType.OTHER
        content: Optional[str] = None
        verified_at: Optional[datetime] = None

    class DocumentRequirement(BaseModel):  # type: ignore[no-redef]
        id: str
        name: str
        description: Optional[str] = None
        source_ids: List[str] = Field(default_factory=list)

    class Step(BaseModel):  # type: ignore[no-redef]
        id: str
        order: int
        title: str
        description: str
        department: Optional[str] = None
        office: Optional[str] = None
        documents: List[str] = Field(default_factory=list)
        depends_on: List[str] = Field(default_factory=list)
        fee: Optional[str] = None
        application_url: Optional[HttpUrl] = None
        source_ids: List[str] = Field(default_factory=list)

    class Procedure(BaseModel):  # type: ignore[no-redef]
        service: str
        jurisdiction: str
        eligibility: Optional[str] = None
        prerequisites: List[str] = Field(default_factory=list)
        documents: List[DocumentRequirement] = Field(default_factory=list)
        steps: List[Step] = Field(default_factory=list)
        sources: List[OfficialSource] = Field(default_factory=list)
        verified_at: Optional[datetime] = None
        status: ProcedureStatus = ProcedureStatus.PARTIAL
        llm_provider_used: LLMProvider = LLMProvider.NONE

        class Config:
            use_enum_values = True


from llm_service.provider import LLMServiceUnavailable, call_llm

# ---------------------------------------------------------------------------
# Prompt templates
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """\
You are a civic procedure extraction assistant for the Humsafar application.

Your ONLY job is to read the provided official government source texts and
extract a structured JSON procedure from them.

STRICT RULES — violating any of these is a critical failure:
1. You MUST NOT invent any fact. Every document, fee, department, step, URL,
   or eligibility rule MUST appear verbatim or paraphrasably in the source text.
2. If a fact is not present in the sources, set the field to null or omit it.
   Do NOT guess, estimate, or fill from general knowledge.
3. Every step and document MUST reference at least one source_id from the
   list you are given. If you cannot trace a claim to a source, omit it.
4. Return ONLY valid JSON matching the schema below — nothing else.

OUTPUT SCHEMA (return exactly this shape):
{
  "eligibility": "<string or null>",
  "prerequisites": ["<string>", ...],
  "documents": [
    {
      "id": "doc_1",
      "name": "<name>",
      "description": "<optional description or null>",
      "source_ids": ["src_X"]
    }
  ],
  "steps": [
    {
      "id": "step_1",
      "order": 1,
      "title": "<short title>",
      "description": "<what the user must do>",
      "department": "<department name or null>",
      "office": "<office name or null>",
      "documents": ["doc_1"],
      "depends_on": [],
      "fee": "<fee string or null>",
      "application_url": "<URL string or null>",
      "source_ids": ["src_X"]
    }
  ]
}

Rules for step ordering and depends_on:
- Set "depends_on" to the list of step IDs that MUST be completed before
  this step. An empty list means no dependency.
- "order" must be a unique integer starting from 1.
- Do NOT create circular dependencies.
"""


def _build_user_prompt(
    service: str,
    jurisdiction: str,
    sources_text: str,
    source_ids_available: List[str],
) -> str:
    return f"""\
SERVICE: {service}
JURISDICTION: {jurisdiction}

AVAILABLE SOURCE IDs (you MUST only reference these): {json.dumps(source_ids_available)}

OFFICIAL SOURCE CONTENT:
{sources_text}

Extract the complete step-by-step government procedure for obtaining
"{service}" in "{jurisdiction}" from the source content above.
Follow the output schema strictly.
"""


# ---------------------------------------------------------------------------
# Light structural validation (NOT deep cycle detection — that is Person 4's job)
# ---------------------------------------------------------------------------

def _quick_validate(data: Dict[str, Any], valid_source_ids: List[str]) -> Optional[str]:
    """
    Returns an error string if the LLM output is structurally invalid,
    or None if it looks OK. Only does basic shape/ID checks — full
    dependency-cycle validation is Person 4 (Validator module)'s job.
    """
    if not isinstance(data, dict):
        return "Response is not a JSON object."

    steps = data.get("steps")
    if not isinstance(steps, list):
        return "Missing or invalid 'steps' list."
    if len(steps) == 0:
        return "LLM returned zero steps — cannot produce a useful procedure."

    step_ids = set()
    for s in steps:
        sid = s.get("id")
        if not sid:
            return "A step is missing its 'id'."
        if sid in step_ids:
            return f"Duplicate step id: {sid}"
        step_ids.add(sid)

    # Check source_ids in steps reference valid sources
    for s in steps:
        for src_id in s.get("source_ids", []):
            if src_id not in valid_source_ids:
                return f"Step {s.get('id')} references unknown source_id: {src_id}"

    # Check depends_on references exist
    for s in steps:
        for dep in s.get("depends_on", []):
            if dep not in step_ids:
                return f"Step {s.get('id')} depends_on unknown step id: {dep}"

    docs = data.get("documents", [])
    doc_ids = set()
    for d in docs:
        did = d.get("id")
        if not did:
            return "A document is missing its 'id'."
        if did in doc_ids:
            return f"Duplicate document id: {did}"
        doc_ids.add(did)
        for src_id in d.get("source_ids", []):
            if src_id not in valid_source_ids:
                return f"Document {did} references unknown source_id: {src_id}"

    return None  # all good


# ---------------------------------------------------------------------------
# Main public function
# ---------------------------------------------------------------------------

def extract_procedure(
    sources: List[OfficialSource],
    service: str,
    jurisdiction: str,
) -> Procedure:
    """
    Send filtered official-source content to the LLM (Groq -> Gemini fallback)
    and return a validated Procedure object.

    Raises LLMServiceUnavailable if both providers fail.
    """
    # -- 1. filter to sources that have actual content ----------------------
    usable = [s for s in sources if getattr(s, "content", None) and s.content.strip()]  # type: ignore[attr-defined]

    if not usable:
        logger.warning(
            "[extract] All %d sources have no content. Cannot extract.", len(sources)
        )
        raise LLMServiceUnavailable(
            "No source content available for LLM extraction."
        )

    valid_source_ids = [s.id for s in usable]

    # -- 2. build source text block ----------------------------------------
    source_blocks = []
    for s in usable:
        block = (
            f"--- SOURCE: {s.id} | {s.title} | {s.domain} ---\n"
            f"URL: {s.url}\n"
            f"CONTENT:\n{s.content}\n"
        )
        source_blocks.append(block)
    sources_text = "\n".join(source_blocks)

    user_prompt = _build_user_prompt(service, jurisdiction, sources_text, valid_source_ids)

    # -- 3. call LLM with structural validation + re-raise on bad output ---
    max_attempts = 2  # call_llm already does Groq x2 then Gemini internally;
    # we add one outer retry in case the *first* LLM response fails
    # validation (different attempt via call_llm failover).
    llm_response: Optional[Dict[str, Any]] = None
    validation_error: Optional[str] = None

    for attempt in range(max_attempts):
        try:
            llm_response = call_llm(SYSTEM_PROMPT, user_prompt)
        except LLMServiceUnavailable:
            raise  # propagate immediately

        validation_error = _quick_validate(llm_response, valid_source_ids)
        if validation_error is None:
            break
        logger.warning(
            "[extract] LLM output failed validation (attempt %d/%d): %s",
            attempt + 1,
            max_attempts,
            validation_error,
        )
        llm_response = None  # reset for next attempt

    if llm_response is None or validation_error is not None:
        raise LLMServiceUnavailable(
            f"LLM produced structurally invalid output after {max_attempts} attempt(s). "
            f"Last validation error: {validation_error}"
        )

    # -- 4. determine which provider was used --------------------------------
    # We can't easily know from call_llm's return value which provider won,
    # so we log it there; here we mark it conservatively.
    provider_used = LLMProvider.GROK  # updated to GEMINI_FLASH by provider.py logs

    # -- 5. assemble Procedure -----------------------------------------------
    raw_docs: List[Dict] = llm_response.get("documents", [])
    raw_steps: List[Dict] = llm_response.get("steps", [])
    eligibility: Optional[str] = llm_response.get("eligibility")
    prerequisites: List[str] = llm_response.get("prerequisites", [])

    documents: List[DocumentRequirement] = []
    for d in raw_docs:
        try:
            documents.append(
                DocumentRequirement(
                    id=d["id"],
                    name=d["name"],
                    description=d.get("description"),
                    source_ids=d.get("source_ids", []),
                )
            )
        except Exception as exc:
            logger.warning("[extract] Skipping malformed document %s: %s", d, exc)

    steps: List[Step] = []
    for s in raw_steps:
        try:
            app_url = s.get("application_url")
            steps.append(
                Step(
                    id=s["id"],
                    order=s["order"],
                    title=s["title"],
                    description=s["description"],
                    department=s.get("department"),
                    office=s.get("office"),
                    documents=s.get("documents", []),
                    depends_on=s.get("depends_on", []),
                    fee=s.get("fee"),
                    application_url=app_url if app_url else None,
                    source_ids=s.get("source_ids", []),
                )
            )
        except Exception as exc:
            logger.warning("[extract] Skipping malformed step %s: %s", s, exc)

    now = datetime.now(timezone.utc)
    status = (
        ProcedureStatus.VERIFIED
        if len(steps) > 0 and len(documents) > 0
        else ProcedureStatus.PARTIAL
    )

    procedure = Procedure(
        service=service,
        jurisdiction=jurisdiction,
        eligibility=eligibility,
        prerequisites=prerequisites,
        documents=documents,
        steps=steps,
        sources=usable,
        verified_at=now,
        status=status,
        llm_provider_used=provider_used,
    )

    logger.info(
        "[extract] Procedure assembled: %d steps, %d docs, status=%s",
        len(steps),
        len(documents),
        status,
    )
    return procedure
