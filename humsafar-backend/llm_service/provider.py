"""
llm_service/provider.py

Owner: Person 3 (LLM)

Implements the Grok -> Gemini Flash provider abstraction (spec section 6),
structured extraction of procedures from official source content, and
the current-step doubt assistant (spec section 15).

IMPORTANT: the LLM must never invent documents, fees, departments,
URLs, or prerequisites. If something can't be confirmed from the
supplied sources, it must be marked unknown/omitted, not guessed.
"""

from typing import List, Optional

from schemas.models import (
    DoubtResponse,
    LLMProvider,
    OfficialSource,
    Procedure,
    ProcedureStatus,
)


def extract_procedure(
    service: str,
    jurisdiction: str,
    official_sources: List[OfficialSource],
) -> Optional[Procedure]:
    """
    Send filtered official-source content to the runtime LLM (Grok
    first, Gemini Flash on failure) and get back a structured Procedure.

    Returns None if BOTH Grok and Gemini fail (orchestrator then falls
    back to existing Neo4j data or demo data — see spec section 6).

    TODO (Person 3):
      1. Try Grok API call with the sources + service + jurisdiction.
      2. On timeout/error/invalid output, automatically try Gemini Flash.
      3. Parse the LLM's JSON output into a Procedure object.
      4. Set procedure.llm_provider_used accordingly.
      5. Return None if both providers fail.
    """
    # fake: returns a minimal placeholder procedure so downstream
    # (validator, roadmap builder) has something to work with
    return Procedure(
        service=service,
        jurisdiction=jurisdiction,
        eligibility=None,
        prerequisites=[],
        documents=[],
        steps=[],
        sources=official_sources,
        verified_at=None,
        status=ProcedureStatus.PARTIAL,
        llm_provider_used=LLMProvider.NONE,
    )


def answer_doubt(
    service: str,
    jurisdiction: str,
    step_context: str,
    relevant_sources: List[OfficialSource],
    question: str,
) -> DoubtResponse:
    """
    Answer a user's question about the current step, using ONLY the
    supplied step context + sources (spec section 15). This is not a
    general-purpose chatbot — if the answer can't be confirmed from
    the given context, say so explicitly.

    TODO (Person 3): implement real Grok/Gemini call constrained to
    the supplied context only.
    """
    # fake: always returns "could not be confirmed" until implemented
    return DoubtResponse(
        success=True,
        answer="[FAKE] This could not be confirmed from the available official sources.",
        confirmed=False,
        source_ids=[],
    )


def check_provider_availability() -> LLMProvider:
    """
    Used by the /health endpoint to report which LLM provider is
    currently reachable, if any.

    TODO (Person 3): implement a lightweight ping/check for Grok,
    fall back to checking Gemini Flash.
    """
    return LLMProvider.NONE  # fake: report unavailable until implemented