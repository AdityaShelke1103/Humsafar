"""
llm_service/test_llm_service_integration.py

Owner: Person 3 (LLM) — Phase 2 Integration Test

Tests the REAL pipeline end-to-end:
    find_sources() [Person 2] -> filter_official() [Person 2] -> extract_procedure() [Person 3]

Unlike test_llm_service.py (which uses fake OfficialSource objects),
this test calls Person 2's real Tavily search and source filter modules
and feeds the real output into Person 3's extraction service.

How to run:
    cd humsafar-backend
    python -m llm_service.test_llm_service_integration

Flags at the top of this file:
    FORCE_GROQ_FAILURE  -- set True to test Gemini fallback with real data
    TEST_QUERY_SERVICE  -- service name to search for
    TEST_QUERY_JURISDICTION -- jurisdiction to search in
"""

import json
import os
import sys

# ============================================================
# MANUAL TOGGLES
# ============================================================
FORCE_GROQ_FAILURE = False   # flip to True to test Gemini fallback path

TEST_QUERY_SERVICE      = "domicile_certificate"
TEST_QUERY_JURISDICTION = "Maharashtra"

# ---------------------------------------------------------------------------
# Path hack so this works as both `python -m llm_service.test_llm_service_integration`
# and as a plain script from the repo root.
# ---------------------------------------------------------------------------
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

# Override Groq key BEFORE any imports so provider.py picks up the bad key
if FORCE_GROQ_FAILURE:
    os.environ["GROQ_API_KEY"] = "INVALID_KEY_FORCED_FAILURE_FOR_TEST"
    print(
        "\n[TEST] FORCE_GROQ_FAILURE=True — Groq key overridden. "
        "Gemini fallback should trigger automatically.\n"
    )

# ---------------------------------------------------------------------------
# Imports
# ---------------------------------------------------------------------------
from dotenv import load_dotenv
load_dotenv()

from search_service.service import find_sources
from source_filter.filter import filter_official
from llm_service.extraction_service import extract_procedure
from llm_service.doubt_assistant import answer_step_question
from llm_service.provider import LLMServiceUnavailable
from schemas.models import OfficialSource, Step


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _sep(title: str) -> None:
    print("\n" + "=" * 64)
    print(f"  {title}")
    print("=" * 64)


def _json(obj) -> str:
    try:
        return json.dumps(obj.model_dump(mode="json"), indent=2, default=str)
    except AttributeError:
        return json.dumps(json.loads(obj.json()), indent=2, default=str)


# ---------------------------------------------------------------------------
# Phase 2 Integration Tests
# ---------------------------------------------------------------------------

def test_search_and_filter() -> list:
    """
    Test 1 — Run Person 2's real find_sources() + filter_official().
    Returns the list of official sources for use in downstream tests.
    """
    _sep(f"TEST 1: find_sources() + filter_official() — {TEST_QUERY_SERVICE} / {TEST_QUERY_JURISDICTION}")

    print(f"\nCalling find_sources('{TEST_QUERY_SERVICE}', '{TEST_QUERY_JURISDICTION}')...")
    raw_sources = find_sources(TEST_QUERY_SERVICE, TEST_QUERY_JURISDICTION)
    print(f"  Raw sources returned by Tavily : {len(raw_sources)}")
    for s in raw_sources:
        print(f"    [{s.id}] {s.domain:40s} content_len={len(s.content) if s.content else 0}")

    print(f"\nCalling filter_official() ...")
    official = filter_official(raw_sources)
    print(f"  Official sources after filtering: {len(official)}")

    if not official:
        print("\n  [WARN] No official sources found for this query.")
        print("         This is a known limitation — Tavily doesn't always return .gov.in results.")
        print("         The LLM extraction step will be SKIPPED.")
        return []

    for s in official:
        content_preview = ""
        if s.content:
            # trim to 200 chars for display, replace newlines
            preview = s.content[:200].replace("\n", " ").strip()
            content_preview = preview + ("..." if len(s.content) > 200 else "")
        print(f"\n    [{s.id}] domain    : {s.domain}")
        print(f"            type      : {s.source_type}")
        print(f"            content   : {len(s.content) if s.content else 0} chars")
        print(f"            preview   : {content_preview.encode('ascii', errors='replace').decode('ascii') or 'EMPTY'}")

    print(f"\n[OK] Search + Filter passed. {len(official)} official source(s) ready for LLM.")
    return official


def test_real_extraction(official_sources: list):
    """
    Test 2 — Feed real official sources into extract_procedure().
    """
    _sep("TEST 2: extract_procedure() — with REAL official sources")

    if not official_sources:
        print("[SKIP] No official sources available — skipping extraction test.")
        return None

    sources_with_content = [s for s in official_sources if s.content and s.content.strip()]
    print(f"\nSources with content: {len(sources_with_content)} / {len(official_sources)}")

    if not sources_with_content:
        print("[SKIP] All official sources have empty content — skipping extraction.")
        return None

    print(f"\nCalling extract_procedure() for '{TEST_QUERY_SERVICE}' / '{TEST_QUERY_JURISDICTION}'...")
    print("(This calls the LLM — may take 5-20 seconds)\n")

    try:
        procedure = extract_procedure(
            sources=official_sources,
            service=TEST_QUERY_SERVICE,
            jurisdiction=TEST_QUERY_JURISDICTION,
        )
    except LLMServiceUnavailable as exc:
        print(f"[FAIL] Both LLM providers failed: {exc}")
        return None
    except Exception as exc:
        import traceback
        print(f"[ERROR] Unexpected error in extract_procedure: {type(exc).__name__}: {exc}")
        traceback.print_exc()
        return None

    print("\n--- Extracted Procedure JSON ---")
    print(_json(procedure))

    print(f"\n[OK] Extraction SUCCEEDED.")
    print(f"     Steps extracted   : {len(procedure.steps)}")
    print(f"     Documents found   : {len(procedure.documents)}")
    print(f"     Eligibility       : {procedure.eligibility or 'not stated in sources'}")
    print(f"     Status            : {procedure.status}")
    print(f"     LLM Provider used : {procedure.llm_provider_used}")

    # Quality check: warn if very few steps (real content is messy)
    if len(procedure.steps) == 0:
        print("\n  [WARN] LLM returned 0 steps — real scraped content may be too sparse/boilerplate.")
        print("         This is expected if Tavily returned mostly navigation/menu pages.")
        print("         Not a code failure — a data quality issue.")
    elif len(procedure.steps) < 2:
        print("\n  [WARN] Only 1 step extracted — real content may be limited.")

    return procedure


def test_doubt_assistant_real(procedure, official_sources: list):
    """
    Test 3 — Test the doubt assistant with a real extracted step.
    Falls back to a fake step if extraction produced nothing.
    """
    _sep("TEST 3: answer_step_question() — Doubt Assistant with real data")

    # Use first extracted step or build a minimal fallback step
    if procedure and procedure.steps:
        step = procedure.steps[0]
        print(f"\nUsing real extracted step: [{step.id}] '{step.title}'")
    else:
        print("\nNo real step available — using fallback stub step.")
        step = Step(
            id="step_1",
            order=1,
            title="Online Application",
            description="Apply for the certificate via the government portal.",
            source_ids=[s.id for s in official_sources[:2]],
        )

    sources_with_content = [s for s in official_sources if s.content and s.content.strip()]

    questions = [
        "What documents do I need?",
        "How long does the process take?",
        "Is there a penalty if I submit the wrong documents?",  # likely unconfirmed
    ]

    for q in questions:
        print(f"\n  Q: {q}")
        result = answer_step_question(
            service=TEST_QUERY_SERVICE,
            jurisdiction=TEST_QUERY_JURISDICTION,
            current_step=step,
            relevant_sources=sources_with_content,
            question=q,
        )
        answer_safe = result['answer'].encode('ascii', errors='replace').decode('ascii')
        print(f"  A: {answer_safe[:300]}{'...' if len(answer_safe) > 300 else ''}")
        print(f"     confirmed={result['confirmed']} | sources cited={result['source_ids']}")


def test_force_groq_failure_note():
    """Print a note about FORCE_GROQ_FAILURE if it was used."""
    if FORCE_GROQ_FAILURE:
        _sep("FORCE_GROQ_FAILURE CHECK")
        print("\n  FORCE_GROQ_FAILURE was True for this run.")
        print("  If extraction and doubt assistant above succeeded, it means")
        print("  Gemini Flash correctly took over as fallback. Failover WORKING.")
        print("\n  To reset: set FORCE_GROQ_FAILURE = False at the top of this file.")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print(f"\n[integration-test] Phase 2 — Real Data Integration")
    print(f"[integration-test] FORCE_GROQ_FAILURE = {FORCE_GROQ_FAILURE}")
    print(f"[integration-test] Query: {TEST_QUERY_SERVICE} / {TEST_QUERY_JURISDICTION}")

    # Test 1: Real search + filter
    official_sources = test_search_and_filter()

    # Test 2: Real extraction with LLM
    procedure = test_real_extraction(official_sources)

    # Test 3: Doubt assistant on real data
    if official_sources:
        test_doubt_assistant_real(procedure, official_sources)

    # Failover note
    test_force_groq_failure_note()

    print("\n" + "=" * 64)
    print("  Phase 2 Integration Tests Complete.")
    print("=" * 64 + "\n")
