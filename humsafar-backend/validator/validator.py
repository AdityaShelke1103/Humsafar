"""
validator/validator.py

Owner: Person 4 (Orchestrator)

Validates a structured Procedure before it's stored in Neo4j or
returned to the frontend (spec section 9, Step 5).
"""

from dataclasses import dataclass, field
from typing import List

from schemas.models import Procedure


@dataclass
class ValidationResult:
    is_valid: bool
    errors: List[str] = field(default_factory=list)


def validate(procedure: Procedure) -> ValidationResult:
    """
    Checks to implement (spec section 9, Step 5):
      - required fields exist (service, jurisdiction)
      - step IDs are unique
      - depends_on references point to real step IDs
      - no dependency cycles
      - source_ids referenced actually exist in procedure.sources
      - URLs are well-formed (Pydantic's HttpUrl already helps here)
      - service/jurisdiction are consistent across steps/documents

    TODO (Person 4): implement full validation logic. Below is a
    minimal placeholder that only checks the most basic things so
    the pipeline runs end-to-end immediately.
    """
    errors: List[str] = []

    if not procedure.service:
        errors.append("Missing service")
    if not procedure.jurisdiction:
        errors.append("Missing jurisdiction")

    step_ids = [s.id for s in procedure.steps]
    if len(step_ids) != len(set(step_ids)):
        errors.append("Duplicate step IDs found")

    valid_ids = set(step_ids)
    for step in procedure.steps:
        for dep in step.depends_on:
            if dep not in valid_ids:
                errors.append(f"Step {step.id} depends on unknown step {dep}")

    # TODO: real cycle detection (DFS) once steps/dependencies are populated

    return ValidationResult(is_valid=(len(errors) == 0), errors=errors)