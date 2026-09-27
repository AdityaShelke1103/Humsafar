"""
validator/validator.py

Owner: Person 4 (Orchestrator)

Validates a structured Procedure before it's stored in the database or
returned to the frontend (spec section 9, Step 5).

Checks implemented:
  - required fields exist (service, jurisdiction)
  - step IDs are unique
  - document IDs are unique
  - depends_on references point to real step IDs
  - no circular dependencies (real DFS cycle detection)
  - step.documents references point to real document IDs
  - source_ids referenced by steps/documents actually exist in
    procedure.sources
  - service/jurisdiction are consistent (non-empty, matching strings)

URL well-formedness is already enforced by Pydantic's HttpUrl type at
the schema level, so it isn't re-checked here.
"""

from dataclasses import dataclass, field
from typing import List, Set

from schemas.models import Procedure


@dataclass
class ValidationResult:
    is_valid: bool
    errors: List[str] = field(default_factory=list)


def _detect_cycle(step_ids: List[str], depends_on_map: dict) -> List[str]:
    """
    Runs a DFS over the step dependency graph to detect cycles.

    depends_on_map: {step_id: [list of step_ids it depends on]}

    Returns a list of error strings — one per cycle found. Empty list
    means no cycles.
    """
    errors: List[str] = []

    WHITE, GRAY, BLACK = 0, 1, 2
    color = {sid: WHITE for sid in step_ids}
    path: List[str] = []

    def visit(node: str) -> bool:
        """Returns True if a cycle was found starting from this node."""
        color[node] = GRAY
        path.append(node)

        for neighbor in depends_on_map.get(node, []):
            if neighbor not in color:
                # Unknown step id — already reported separately by the
                # dependency-reference check, skip here to avoid noise.
                continue
            if color[neighbor] == GRAY:
                # Found a cycle — build a readable path for the error
                cycle_start = path.index(neighbor)
                cycle_path = path[cycle_start:] + [neighbor]
                errors.append(
                    "Circular dependency detected: "
                    + " -> ".join(cycle_path)
                )
                return True
            if color[neighbor] == WHITE:
                if visit(neighbor):
                    return True

        path.pop()
        color[node] = BLACK
        return False

    for sid in step_ids:
        if color[sid] == WHITE:
            visit(sid)

    return errors


def validate(procedure: Procedure) -> ValidationResult:
    errors: List[str] = []

    # -- required fields ------------------------------------------------
    if not procedure.service or not procedure.service.strip():
        errors.append("Missing or empty service.")
    if not procedure.jurisdiction or not procedure.jurisdiction.strip():
        errors.append("Missing or empty jurisdiction.")

    if not procedure.steps:
        errors.append("Procedure has no steps.")
        # No point checking further structural stuff with zero steps.
        return ValidationResult(is_valid=False, errors=errors)

    # -- unique step IDs --------------------------------------------------
    step_ids = [s.id for s in procedure.steps]
    seen_steps: Set[str] = set()
    for sid in step_ids:
        if sid in seen_steps:
            errors.append(f"Duplicate step id: {sid}")
        seen_steps.add(sid)

    valid_step_ids = set(step_ids)

    # -- unique document IDs ----------------------------------------------
    doc_ids = [d.id for d in procedure.documents]
    seen_docs: Set[str] = set()
    for did in doc_ids:
        if did in seen_docs:
            errors.append(f"Duplicate document id: {did}")
        seen_docs.add(did)

    valid_doc_ids = set(doc_ids)
    valid_source_ids = {s.id for s in procedure.sources}

    # -- depends_on references point to real steps -------------------------
    depends_on_map = {}
    for step in procedure.steps:
        depends_on_map[step.id] = step.depends_on
        for dep in step.depends_on:
            if dep not in valid_step_ids:
                errors.append(
                    f"Step {step.id} depends_on unknown step id: {dep}"
                )

    # -- no self-dependency (a trivial 1-node cycle) ------------------------
    for step in procedure.steps:
        if step.id in step.depends_on:
            errors.append(f"Step {step.id} cannot depend on itself.")

    # -- real cycle detection (DFS) -----------------------------------------
    cycle_errors = _detect_cycle(step_ids, depends_on_map)
    errors.extend(cycle_errors)

    # -- step.documents reference real document ids -------------------------
    for step in procedure.steps:
        for doc_ref in step.documents:
            if doc_ref not in valid_doc_ids:
                errors.append(
                    f"Step {step.id} references unknown document id: {doc_ref}"
                )

    # -- source_ids on steps reference real sources ---------------------------
    for step in procedure.steps:
        for src_id in step.source_ids:
            if src_id not in valid_source_ids:
                errors.append(
                    f"Step {step.id} references unknown source_id: {src_id}"
                )

    # -- source_ids on documents reference real sources ------------------------
    for doc in procedure.documents:
        for src_id in doc.source_ids:
            if src_id not in valid_source_ids:
                errors.append(
                    f"Document {doc.id} references unknown source_id: {src_id}"
                )

    return ValidationResult(is_valid=(len(errors) == 0), errors=errors)