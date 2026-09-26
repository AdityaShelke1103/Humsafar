"""
orchestrator/orchestrator.py

Owner: Person 4 (Orchestrator)

Wires the full Humsafar pipeline together (spec sections 2 and 9):

  normalize -> Neo4j check -> search -> filter -> LLM extract
  -> validate -> save -> build roadmap response

This is the ONLY file that should call across all other modules.
Persons 1-3 should not need to edit this file — if their module's
signature needs to change, they raise it with Person 4 first.
"""

from schemas.models import (
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
from llm_service.provider import extract_procedure
from validator.validator import validate

# TODO (Person 4): wire in real demo-procedure lookup for final fallback
DEMO_PROCEDURES = {}  # e.g. {("domicile_certificate", "Maharashtra"): Procedure(...)}


def generate_roadmap(request: RoadmapRequest) -> RoadmapResponse:
    # 1. Normalize
    service, jurisdiction, clarification = normalize_request(
        request.query, request.service_hint, request.jurisdiction_hint
    )
    if clarification:
        return RoadmapResponse(success=False, clarification=clarification)

    # 2. Check Neo4j for a fresh verified procedure
    procedure = get_fresh_procedure(service, jurisdiction)
    if procedure:
        return RoadmapResponse(success=True, procedure=procedure)

    # 3. Live discovery pipeline
    raw_sources = find_sources(service, jurisdiction)
    official_sources = filter_official(raw_sources)
    procedure = extract_procedure(service, jurisdiction, official_sources)

    # 4. LLM failed entirely -> fall back
    if procedure is None:
        stale = get_stale_procedure(service, jurisdiction)
        if stale:
            return RoadmapResponse(success=True, procedure=stale)

        demo = DEMO_PROCEDURES.get((service, jurisdiction))
        if demo:
            return RoadmapResponse(success=True, procedure=demo)

        return RoadmapResponse(
            success=False,
            error="We couldn't retrieve this procedure right now. Please try again shortly.",
        )

    # 5. Validate
    result = validate(procedure)
    if not result.is_valid:
        # TODO (Person 4): decide fallback behavior on validation failure
        # (retry once? fall back to stale/demo? for now, surface an error)
        return RoadmapResponse(
            success=False,
            error=f"Generated procedure failed validation: {result.errors}",
        )

    # 6. Store validated procedure for reuse
    procedure.status = ProcedureStatus.VERIFIED
    save_procedure(procedure)

    # 7. Return to frontend
    return RoadmapResponse(success=True, procedure=procedure)