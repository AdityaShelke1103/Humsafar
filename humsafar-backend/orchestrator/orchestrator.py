"""
orchestrator/orchestrator.py

Owner: Person 4 (Orchestrator)

Wires the full Humsafar pipeline together (spec sections 2 and 9):

  normalize -> Neo4j check -> search -> filter -> LLM extract
  -> validate -> save -> build roadmap response

Fallback hierarchy on any failure (spec sections 6 and 17):

  fresh Neo4j -> live pipeline (search + LLM) -> stale Neo4j
  -> demo procedure -> clear error

This is the ONLY file that should call across all other modules.
Persons 1-3 should not need to edit this file — if their module's
signature needs to change, they raise it with Person 4 first.
"""

import logging

from schemas.models import (
    Procedure,
    ProcedureStatus,
    RoadmapRequest,
    RoadmapResponse,
)

from normalizer.normalizer import normalize_request
from neo4j_service.service import (
    get_fresh_procedure,
    get_stale_procedure,
    save_procedure,
)
from search_service.service import find_sources
from source_filter.filter import filter_official
from llm_service import extract_procedure, LLMServiceUnavailable
from validator.validator import validate
from orchestrator.demo_procedures import DEMO_PROCEDURES

logger = logging.getLogger("humsafar.orchestrator")


def _fallback_after_live_failure(
    service: str, jurisdiction: str, reason: str
) -> RoadmapResponse:
    """
    Shared fallback path used whenever the live pipeline (search + LLM)
    cannot produce a usable procedure: try stale Neo4j data, then a
    verified demo procedure, then give up with a clear error.
    Never returns a blank/broken response (spec section 6, 17, 20).
    """
    logger.warning(f"Live pipeline unavailable ({reason}) for {service}/{jurisdiction}")

    stale = get_stale_procedure(service, jurisdiction)
    if stale:
        stale.status = ProcedureStatus.STALE
        return RoadmapResponse(success=True, procedure=stale)

    demo = DEMO_PROCEDURES.get((service, jurisdiction))
    if demo:
        demo.status = ProcedureStatus.DEMO
        return RoadmapResponse(success=True, procedure=demo)

    return RoadmapResponse(
        success=False,
        error=(
            "We couldn't retrieve official information for this request "
            "right now. Please try again shortly, or try a different "
            "service/jurisdiction."
        ),
    )


def generate_roadmap(request: RoadmapRequest) -> RoadmapResponse:
    # 1. Normalize
    service, jurisdiction, clarification = normalize_request(
        request.query, request.service_hint, request.jurisdiction_hint
    )
    if clarification:
        return RoadmapResponse(success=False, clarification=clarification)

    # 2. Check Neo4j for a fresh verified procedure
    try:
        procedure = get_fresh_procedure(service, jurisdiction)
    except Exception as exc:
        logger.error(f"Neo4j lookup failed: {exc}")
        procedure = None

    if procedure:
        return RoadmapResponse(success=True, procedure=procedure)

    # 3. Live discovery pipeline — search
    try:
        raw_sources = find_sources(service, jurisdiction)
    except Exception as exc:
        return _fallback_after_live_failure(service, jurisdiction, f"search error: {exc}")

    # 4. Filter to official sources only
    try:
        official_sources = filter_official(raw_sources)
    except Exception as exc:
        return _fallback_after_live_failure(service, jurisdiction, f"filter error: {exc}")

    # 5. No official sources survived filtering -> don't bother calling
    #    the LLM with nothing, go straight to fallback (spec section 9
    #    Step 3: don't treat unofficial sources as authoritative).
    if not official_sources:
        return _fallback_after_live_failure(
            service, jurisdiction, "no official sources found"
        )

    # 6. Extract structured procedure via LLM (Groq -> Gemini Flash).
    #    Person 3's extract_procedure raises LLMServiceUnavailable on
    #    total failure instead of returning None — catch that here.
    try:
        procedure = extract_procedure(
            sources=official_sources,
            service=service,
            jurisdiction=jurisdiction,
        )
    except LLMServiceUnavailable as exc:
        return _fallback_after_live_failure(
            service, jurisdiction, f"both LLM providers failed: {exc}"
        )
    except Exception as exc:
        # Any other unexpected error from the LLM layer — don't let it
        # crash the request, treat it the same as a provider failure.
        logger.error(f"LLM extraction raised an unexpected exception: {exc}")
        return _fallback_after_live_failure(
            service, jurisdiction, f"unexpected LLM error: {exc}"
        )

    # 7. Reject a procedure with no actual steps — extraction "succeeded"
    #    but produced nothing usable (e.g. sources had no content).
    if not procedure.steps:
        return _fallback_after_live_failure(
            service, jurisdiction, "LLM returned no steps"
        )

    # 8. Validate
    result = validate(procedure)
    if not result.is_valid:
        logger.warning(f"Validation failed: {result.errors}")
        return _fallback_after_live_failure(
            service, jurisdiction, f"validation failed: {result.errors}"
        )

    # 9. Store validated procedure for reuse
    procedure.status = ProcedureStatus.VERIFIED
    try:
        save_procedure(procedure)
    except Exception as exc:
        # Don't fail the user's request just because the save failed —
        # they still get a valid roadmap, it just won't be cached.
        logger.error(f"Failed to save procedure to Neo4j: {exc}")

    # 10. Return to frontend
    return RoadmapResponse(success=True, procedure=procedure)