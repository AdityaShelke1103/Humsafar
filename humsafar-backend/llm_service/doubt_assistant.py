"""
llm_service/doubt_assistant.py

Owner: Person 3 (LLM)

Context-only Q&A assistant for the active roadmap step (spec section 15).

The assistant MUST answer ONLY using the current step information and the
relevant official sources supplied. It is NOT a general chatbot. If the
answer cannot be confirmed from the given context, it must say so explicitly
instead of guessing.

Public interface:
    answer_step_question(
        service: str,
        jurisdiction: str,
        current_step: Step,
        relevant_sources: List[OfficialSource],
        question: str,
    ) -> dict   # {"answer": str, "source_ids": List[str], "confirmed": bool}
"""

import logging
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# -- Schema import (with Phase-1 fallback) ------------------------------------
try:
    from schemas.models import OfficialSource, Step
except ImportError:
    # TEMP -- replace with backend.schemas import once Person 4's schema is ready.
    from datetime import datetime
    from enum import Enum
    from typing import Optional
    from pydantic import BaseModel, Field, HttpUrl

    class SourceType(str, Enum):  # type: ignore[no-redef]
        GOVERNMENT_PORTAL = "government_portal"
        DEPARTMENT_SITE = "department_site"
        OTHER = "other"

    class OfficialSource(BaseModel):  # type: ignore[no-redef]
        id: str
        title: str
        url: HttpUrl
        domain: str
        source_type: SourceType = SourceType.OTHER
        content: Optional[str] = None
        verified_at: Optional[datetime] = None

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


from llm_service.provider import LLMServiceUnavailable, call_llm

# ---------------------------------------------------------------------------
# Prompt templates
# ---------------------------------------------------------------------------

DOUBT_SYSTEM_PROMPT = """\
You are a civic procedure assistant for the Humsafar application.

A user is currently at a specific step in a government procedure and has a
question about it.

YOUR STRICT RULES:
1. Answer ONLY using the step information and official source content provided.
   Do NOT use any general knowledge, assumptions, or information not in the context.
2. If the answer cannot be confirmed from the given context, respond with:
   "This could not be confirmed from the available official sources."
   and set "confirmed" to false.
3. Cite the source_id(s) that back your answer in the "source_ids" list.
   If you cannot cite any source, you must mark "confirmed" as false.
4. Keep your answer concise, plain, and helpful. Do not fabricate specifics.
5. Return ONLY valid JSON matching this schema:
   {
     "answer": "<your answer string>",
     "confirmed": true/false,
     "source_ids": ["src_X", ...]
   }
"""


def _build_doubt_user_prompt(
    service: str,
    jurisdiction: str,
    current_step: Step,
    relevant_sources: List[OfficialSource],
    question: str,
) -> str:
    step_context = (
        f"STEP: {current_step.title} (step {current_step.order})\n"
        f"Description: {current_step.description}\n"
        f"Department: {current_step.department or 'not specified'}\n"
        f"Office: {current_step.office or 'not specified'}\n"
        f"Fee: {current_step.fee or 'not specified'}\n"
        f"Application URL: {current_step.application_url or 'not specified'}\n"
        f"Source IDs tied to this step: {current_step.source_ids}\n"
    )

    usable = [
        s for s in relevant_sources
        if getattr(s, "content", None) and s.content.strip()  # type: ignore[attr-defined]
    ]

    source_blocks = []
    for s in usable:
        block = (
            f"--- SOURCE: {s.id} | {s.title} | {s.domain} ---\n"
            f"URL: {s.url}\n"
            f"CONTENT:\n{s.content}\n"
        )
        source_blocks.append(block)
    sources_text = "\n".join(source_blocks) if source_blocks else "(No source content available)"

    return (
        f"SERVICE: {service}\n"
        f"JURISDICTION: {jurisdiction}\n\n"
        f"CURRENT STEP CONTEXT:\n{step_context}\n"
        f"OFFICIAL SOURCE CONTENT:\n{sources_text}\n\n"
        f"USER QUESTION: {question}\n\n"
        "Answer using ONLY the above context. Return JSON."
    )


# ---------------------------------------------------------------------------
# Main public function
# ---------------------------------------------------------------------------

def answer_step_question(
    service: str,
    jurisdiction: str,
    current_step: Step,
    relevant_sources: List[OfficialSource],
    question: str,
) -> Dict[str, Any]:
    """
    Answer a user's question about the current step using ONLY the supplied
    step context and official source content.

    Returns a dict with:
        answer: str
        confirmed: bool
        source_ids: List[str]

    If both LLM providers fail, returns a safe "could not confirm" response
    instead of raising (the user should see something helpful, not a crash).
    """
    user_prompt = _build_doubt_user_prompt(
        service, jurisdiction, current_step, relevant_sources, question
    )

    try:
        result = call_llm(DOUBT_SYSTEM_PROMPT, user_prompt)
    except LLMServiceUnavailable as exc:
        logger.error("[doubt] Both LLM providers failed: %s", exc)
        return {
            "answer": (
                "We could not reach the AI assistant right now. "
                "Please refer to the official sources linked in this step."
            ),
            "confirmed": False,
            "source_ids": [],
        }
    except Exception as exc:
        logger.error("[doubt] Unexpected error calling LLM: %s", exc)
        return {
            "answer": "An unexpected error occurred. Please try again.",
            "confirmed": False,
            "source_ids": [],
        }

    # -- parse and sanitise the result ------------------------------------
    answer = str(result.get("answer", "")).strip()
    confirmed = bool(result.get("confirmed", False))
    source_ids = result.get("source_ids", [])

    # Safety net: if the model claims confirmed but cites no sources, downgrade.
    if confirmed and not source_ids:
        logger.warning(
            "[doubt] LLM said confirmed=true but gave no source_ids. Downgrading."
        )
        confirmed = False

    # Safety net: if answer is empty, fall back gracefully.
    if not answer:
        answer = "This could not be confirmed from the available official sources."
        confirmed = False
        source_ids = []

    logger.info(
        "[doubt] Answer ready | confirmed=%s | sources cited=%s",
        confirmed,
        source_ids,
    )

    return {
        "answer": answer,
        "confirmed": confirmed,
        "source_ids": source_ids,
    }
