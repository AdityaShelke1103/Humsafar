"""
check_validator.py

Standalone test script for validator/validator.py.
Run from the project root: python check_validator.py

Tests:
  1. A valid procedure -> should pass with no errors.
  2. A procedure with a circular dependency -> should be caught.
  3. A procedure with an unknown source_id reference -> should be caught.
  4. A procedure with a self-dependency -> should be caught.
"""

from schemas.models import (
    DocumentRequirement,
    OfficialSource,
    Procedure,
    SourceType,
    Step,
)
from validator.validator import validate


def make_source(id_: str) -> OfficialSource:
    return OfficialSource(
        id=id_,
        title="Test Source",
        url="https://example.gov.in/test",
        domain="example.gov.in",
        source_type=SourceType.GOVERNMENT_PORTAL,
    )


print("=" * 60)
print("TEST 1: Valid procedure (no cycles, all references correct)")
print("=" * 60)

valid_procedure = Procedure(
    service="test_service",
    jurisdiction="TestState",
    documents=[
        DocumentRequirement(id="doc_1", name="Test Doc", source_ids=["src_1"]),
    ],
    steps=[
        Step(id="step_1", order=1, title="Step 1", description="First step",
             documents=["doc_1"], depends_on=[], source_ids=["src_1"]),
        Step(id="step_2", order=2, title="Step 2", description="Second step",
             documents=[], depends_on=["step_1"], source_ids=["src_1"]),
        Step(id="step_3", order=3, title="Step 3", description="Third step",
             documents=[], depends_on=["step_2"], source_ids=["src_1"]),
    ],
    sources=[make_source("src_1")],
)

result = validate(valid_procedure)
print(f"is_valid: {result.is_valid}")
print(f"errors: {result.errors}")
assert result.is_valid, "TEST 1 FAILED — valid procedure was rejected!"
print("PASSED\n")


print("=" * 60)
print("TEST 2: Circular dependency (step_1 -> step_2 -> step_3 -> step_1)")
print("=" * 60)

cyclic_procedure = Procedure(
    service="test_service",
    jurisdiction="TestState",
    documents=[],
    steps=[
        Step(id="step_1", order=1, title="Step 1", description="First step",
             documents=[], depends_on=["step_3"], source_ids=["src_1"]),
        Step(id="step_2", order=2, title="Step 2", description="Second step",
             documents=[], depends_on=["step_1"], source_ids=["src_1"]),
        Step(id="step_3", order=3, title="Step 3", description="Third step",
             documents=[], depends_on=["step_2"], source_ids=["src_1"]),
    ],
    sources=[make_source("src_1")],
)

result = validate(cyclic_procedure)
print(f"is_valid: {result.is_valid}")
print(f"errors: {result.errors}")
assert not result.is_valid, "TEST 2 FAILED — cycle was not detected!"
assert any("Circular dependency" in e for e in result.errors), \
    "TEST 2 FAILED — error message doesn't mention the cycle!"
print("PASSED\n")


print("=" * 60)
print("TEST 3: Unknown source_id reference")
print("=" * 60)

bad_source_procedure = Procedure(
    service="test_service",
    jurisdiction="TestState",
    documents=[],
    steps=[
        Step(id="step_1", order=1, title="Step 1", description="First step",
             documents=[], depends_on=[], source_ids=["src_does_not_exist"]),
    ],
    sources=[make_source("src_1")],
)

result = validate(bad_source_procedure)
print(f"is_valid: {result.is_valid}")
print(f"errors: {result.errors}")
assert not result.is_valid, "TEST 3 FAILED — unknown source_id was not caught!"
print("PASSED\n")


print("=" * 60)
print("TEST 4: Self-dependency (step_1 depends on itself)")
print("=" * 60)

self_dep_procedure = Procedure(
    service="test_service",
    jurisdiction="TestState",
    documents=[],
    steps=[
        Step(id="step_1", order=1, title="Step 1", description="First step",
             documents=[], depends_on=["step_1"], source_ids=["src_1"]),
    ],
    sources=[make_source("src_1")],
)

result = validate(self_dep_procedure)
print(f"is_valid: {result.is_valid}")
print(f"errors: {result.errors}")
assert not result.is_valid, "TEST 4 FAILED — self-dependency was not caught!"
print("PASSED\n")


print("=" * 60)
print("ALL TESTS PASSED")
print("=" * 60)