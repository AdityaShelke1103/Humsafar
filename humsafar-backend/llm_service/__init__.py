"""
llm_service/__init__.py

Owner: Person 3 (LLM)

Public surface area of the llm_service module. Person 4 (orchestrator)
imports from here; do NOT import directly from sub-files unless you are
within the llm_service package.
"""

from llm_service.extraction_service import extract_procedure
from llm_service.doubt_assistant import answer_step_question
from llm_service.provider import (
    LLMServiceUnavailable,
    call_llm,
    check_provider_availability,
)

__all__ = [
    "extract_procedure",
    "answer_step_question",
    "LLMServiceUnavailable",
    "call_llm",
    "check_provider_availability",
]
