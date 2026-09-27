"""
api/main.py

Owner: Person 4 (Orchestrator)

FastAPI app exposing the three endpoints the frontend needs
(spec section 14): roadmap generation, doubt assistant, health.
"""

from fastapi import FastAPI

from schemas.models import (
    DoubtRequest,
    DoubtResponse,
    HealthResponse,
    RoadmapRequest,
    RoadmapResponse,
)
from orchestrator.orchestrator import generate_roadmap
from llm_service import answer_step_question, check_provider_availability
from neo4j_service.service import is_connected, get_fresh_procedure

app = FastAPI(title="Humsafar Backend")


@app.post("/api/roadmap", response_model=RoadmapResponse)
def roadmap_endpoint(request: RoadmapRequest) -> RoadmapResponse:
    return generate_roadmap(request)


@app.post("/api/doubt", response_model=DoubtResponse)
def doubt_endpoint(request: DoubtRequest) -> DoubtResponse:
    # Fetch the stored procedure so we can find the actual Step object
    # and its relevant sources — answer_step_question needs the real
    # Step, not just a step_id string.
    procedure = get_fresh_procedure(request.service, request.jurisdiction)

    if procedure is None:
        return DoubtResponse(
            success=False,
            answer="",
            confirmed=False,
            source_ids=[],
            error="No stored procedure found for this service/jurisdiction.",
        )

    current_step = next((s for s in procedure.steps if s.id == request.step_id), None)

    if current_step is None:
        return DoubtResponse(
            success=False,
            answer="",
            confirmed=False,
            source_ids=[],
            error=f"Step '{request.step_id}' not found in this procedure.",
        )

    # Only pass sources relevant to this specific step, per spec section 15
    relevant_sources = [
        s for s in procedure.sources if s.id in current_step.source_ids
    ]

    result = answer_step_question(
        service=request.service,
        jurisdiction=request.jurisdiction,
        current_step=current_step,
        relevant_sources=relevant_sources,
        question=request.question,
    )

    return DoubtResponse(
        success=True,
        answer=result.get("answer", ""),
        confirmed=result.get("confirmed", False),
        source_ids=result.get("source_ids", []),
    )


@app.get("/api/health", response_model=HealthResponse)
def health_endpoint() -> HealthResponse:
    return HealthResponse(
        status="ok",
        neo4j_connected=is_connected(),
        llm_provider_available=check_provider_availability(),
    )