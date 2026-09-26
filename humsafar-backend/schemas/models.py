"""
schemas/models.py

Shared data contract for the Humsafar backend.

Every module (Neo4j service, Search service, LLM service, Validator,
Orchestrator) reads and writes these exact models. Do NOT create
parallel/competing versions of these models in your own folder.

If you need a field that doesn't exist here, raise it with Person 4
(orchestrator owner) before adding it — this file is the single
source of truth for the roadmap data contract (see spec section 11).
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, HttpUrl


# ============================================================
# ENUMS
# ============================================================

class SourceType(str, Enum):
    GOVERNMENT_PORTAL = "government_portal"
    STATE_PORTAL = "state_portal"
    MUNICIPAL_PORTAL = "municipal_portal"
    DEPARTMENT_SITE = "department_site"
    OTHER = "other"


class ProcedureStatus(str, Enum):
    VERIFIED = "verified"          # confirmed from official sources
    STALE = "stale"                 # exists but past freshness window
    DEMO = "demo"                   # hardcoded fallback demo data
    PARTIAL = "partial"             # some fields unknown/unconfirmed


class LLMProvider(str, Enum):
    GROK = "grok"
    GEMINI_FLASH = "gemini_flash"
    NONE = "none"                   # used when no LLM call succeeded


# ============================================================
# CORE ENTITIES
# ============================================================

class OfficialSource(BaseModel):
    """
    A single official government source backing a claim in the
    procedure (a document requirement, a fee, an application link, etc).
    """
    id: str = Field(..., description="Unique ID, e.g. 'src_1'")
    title: str
    url: HttpUrl
    domain: str = Field(..., description="e.g. 'maharashtra.gov.in'")
    source_type: SourceType = SourceType.OTHER
    content: Optional[str] = Field(
        None,
        description="Retrieved content from the official source used for LLM extraction",
    )
    verified_at: Optional[datetime] = None


class DocumentRequirement(BaseModel):
    """A required document/checklist item for the procedure."""
    id: str = Field(..., description="Unique ID, e.g. 'doc_1'")
    name: str
    description: Optional[str] = None
    source_ids: List[str] = Field(
        default_factory=list,
        description="IDs of OfficialSource entries backing this requirement",
    )


class Step(BaseModel):
    """
    A single step in the roadmap journey.
    """
    id: str = Field(..., description="Unique ID, e.g. 'step_1'")
    order: int = Field(..., description="1-indexed position in the journey")
    title: str
    description: str

    department: Optional[str] = None
    office: Optional[str] = None

    documents: List[str] = Field(
        default_factory=list,
        description="IDs of DocumentRequirement entries needed for this step",
    )
    depends_on: List[str] = Field(
        default_factory=list,
        description="IDs of Step entries that must be completed before this one",
    )

    fee: Optional[str] = Field(
        None, description="Fee amount/description if officially confirmed"
    )
    application_url: Optional[HttpUrl] = None

    source_ids: List[str] = Field(
        default_factory=list,
        description="IDs of OfficialSource entries backing this step's claims",
    )


class Procedure(BaseModel):
    """
    A complete, structured civic procedure — the core object stored
    in Neo4j and returned to the frontend as a roadmap.
    """
    service: str = Field(..., description="Normalized service key, e.g. 'domicile_certificate'")
    jurisdiction: str = Field(..., description="Normalized jurisdiction, e.g. 'Maharashtra'")

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


# ============================================================
# API REQUEST / RESPONSE MODELS
# ============================================================

class RoadmapRequest(BaseModel):
    """
    Incoming request from the frontend when a user submits a
    natural-language civic query.
    """
    query: str = Field(..., description="Raw user input, e.g. 'domicile certificate in Maharashtra'")
    # Optional pre-known context if the frontend already has it
    # (e.g. from a follow-up clarification round)
    service_hint: Optional[str] = None
    jurisdiction_hint: Optional[str] = None


class ClarificationNeeded(BaseModel):
    """
    Returned instead of a roadmap when essential info (usually
    jurisdiction) is missing from the user's query.
    """
    reason: str
    missing_field: str  # e.g. "jurisdiction"
    prompt_to_user: str  # e.g. "Which state or city is this for?"


class RoadmapResponse(BaseModel):
    """
    Response returned to the frontend. Exactly one of `procedure`
    or `clarification` will be set.
    """
    success: bool
    procedure: Optional[Procedure] = None
    clarification: Optional[ClarificationNeeded] = None
    error: Optional[str] = None


class DoubtRequest(BaseModel):
    """
    A user question about the currently active step.
    """
    service: str
    jurisdiction: str
    step_id: str
    question: str


class DoubtResponse(BaseModel):
    """
    Answer to a step-level question. Must be grounded ONLY in the
    sources tied to that step (see spec section 15) — if the answer
    can't be confirmed, `confirmed` is False and `answer` explains that.
    """
    success: bool
    answer: str
    confirmed: bool = Field(
        ..., description="True if the answer is backed by official sources"
    )
    source_ids: List[str] = Field(default_factory=list)
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = "ok"
    neo4j_connected: bool = False
    llm_provider_available: Optional[LLMProvider] = None