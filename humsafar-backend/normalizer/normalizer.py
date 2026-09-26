"""
normalizer/normalizer.py

Owner: Person 4 (Orchestrator)

Turns a raw natural-language query into a normalized
(service, jurisdiction) pair, or flags that clarification is needed
(spec section 9, Step 1).
"""

from typing import Optional, Tuple

from schemas.models import ClarificationNeeded


def normalize_request(
    query: str,
    service_hint: Optional[str] = None,
    jurisdiction_hint: Optional[str] = None,
) -> Tuple[Optional[str], Optional[str], Optional[ClarificationNeeded]]:
    """
    Returns (service, jurisdiction, clarification_needed).

    Exactly one of the following holds:
      - service and jurisdiction are both set, clarification is None
      - service/jurisdiction may be partially set, clarification is set

    Do NOT guess jurisdiction if it's essential and missing — ask instead
    (spec section 9, Step 1 + section 26).

    TODO (Person 4): implement real normalization. Even a simple
    keyword/regex approach is fine for the hackathon; an LLM call
    here is optional, not required.
    """
    # fake: naive placeholder logic
    service = service_hint or "unknown_service"
    jurisdiction = jurisdiction_hint or None

    if jurisdiction is None:
        return service, None, ClarificationNeeded(
            reason="Jurisdiction could not be determined from the query.",
            missing_field="jurisdiction",
            prompt_to_user="Which state or city is this for?",
        )

    return service, jurisdiction, None