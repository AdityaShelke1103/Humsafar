"""
neo4j_service/service.py

Owner: Person 1 (GraphDB)

Responsible for all reads/writes to the Neo4j Government Procedure
Knowledge Graph. Nobody outside this file should talk to Neo4j directly.
"""

from datetime import datetime, timedelta
from typing import Optional

from schemas.models import Procedure, ProcedureStatus

# Configurable freshness window (spec section 8) — tune as needed
FRESHNESS_WINDOW = timedelta(days=30)


def get_fresh_procedure(service: str, jurisdiction: str) -> Optional[Procedure]:
    """
    Look up a procedure in Neo4j by normalized (service, jurisdiction).

    Returns:
        - A Procedure if a FRESH verified one exists.
        - None if nothing exists, or the existing one is stale
          (staleness handling can be a separate function if you prefer,
          e.g. get_stale_procedure()).

    TODO (Person 1): implement real Neo4j query.
    """
    return None  # fake: always a miss for now


def get_stale_procedure(service: str, jurisdiction: str) -> Optional[Procedure]:
    """
    Fallback lookup: return an existing procedure even if it's stale,
    used when live search + LLM extraction both fail (spec section 6/17).

    TODO (Person 1): implement real Neo4j query.
    """
    return None  # fake: nothing stored yet


def save_procedure(procedure: Procedure) -> None:
    """
    Persist a validated procedure (and its steps/documents/sources)
    into Neo4j so future identical requests can reuse it.

    TODO (Person 1): implement real Neo4j write (MERGE, not CREATE,
    to avoid duplicate nodes on repeated saves).
    """
    pass  # fake: no-op for now


def is_connected() -> bool:
    """
    Used by the /health endpoint to report Neo4j connectivity.

    TODO (Person 1): implement a real ping/connectivity check.
    """
    return False  # fake: report disconnected until implemented