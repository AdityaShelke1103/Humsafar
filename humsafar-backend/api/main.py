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
from llm_service.provider import answer_doubt, check_provider_availability
from neo4j_service.service import is_connected

app = FastAPI(title="Humsafar Backend")


@app.post("/api/roadmap", response_model=RoadmapResponse)
def roadmap_endpoint(request: RoadmapRequest) -> RoadmapResponse:
    return generate_roadmap(request)


@app.post("/api/doubt", response_model=DoubtResponse)
def doubt_endpoint(request: DoubtRequest) -> DoubtResponse:
    # TODO (Person 4): fetch real step context + relevant sources
    # from the stored procedure (via neo4j_service) before calling
    # answer_doubt, instead of passing an empty context.
    step_context = ""  # placeholder
    relevant_sources = []  # placeholder

    return answer_doubt(
        service=request.service,
        jurisdiction=request.jurisdiction,
        step_context=step_context,
        relevant_sources=relevant_sources,
        question=request.question,
    )


@app.get("/api/health", response_model=HealthResponse)
def health_endpoint() -> HealthResponse:
    return HealthResponse(
        status="ok",
        neo4j_connected=is_connected(),
        llm_provider_available=check_provider_availability(),
    )