"""
llm_service/test_llm_service.py

Owner: Person 3 (LLM)

Standalone test script for the llm_service module.

Person 2's search/filter module is not ready yet (Phase 1), so we
create fake OfficialSource objects with realistic government procedure
text as "content".

How to run:
    cd humsafar-backend
    python -m llm_service.test_llm_service

Flags at the top of this file:
    FORCE_GROQ_FAILURE  -- set True to simulate Groq being broken so
                           you can manually verify Gemini fallback triggers.
"""

import json
import sys
from datetime import datetime, timezone

# ============================================================
# MANUAL TOGGLE — set True to simulate Groq failure
# ============================================================
FORCE_GROQ_FAILURE = False


# ---------------------------------------------------------------------------
# Path hack so this can also be run as a plain script from the repo root
# (in addition to `python -m llm_service.test_llm_service`)
# ---------------------------------------------------------------------------
import os, sys  # noqa: E401

_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

# If FORCE_GROQ_FAILURE is on, override the key with a bad value BEFORE
# any llm_service imports so provider.py reads the bad key at import time.
if FORCE_GROQ_FAILURE:
    os.environ["GROQ_API_KEY"] = "INVALID_KEY_FORCED_FAILURE_FOR_TEST"
    print("\n[TEST] FORCE_GROQ_FAILURE=True — GROQ_API_KEY has been overridden "
          "with an invalid value. Groq calls will fail and Gemini fallback "
          "should trigger automatically.\n")

# ---------------------------------------------------------------------------
# Imports
# ---------------------------------------------------------------------------
from dotenv import load_dotenv
load_dotenv()

# Try shared schema first, fall back to local stubs if not assembled yet
try:
    from schemas.models import OfficialSource, SourceType, Step
    _USING_SHARED_SCHEMA = True
except ImportError:
    from enum import Enum
    from typing import List, Optional
    from pydantic import BaseModel, Field, HttpUrl

    class SourceType(str, Enum):  # type: ignore[no-redef]
        GOVERNMENT_PORTAL = "government_portal"
        DEPARTMENT_SITE = "department_site"
        OTHER = "other"

    class OfficialSource(BaseModel):  # type: ignore[no-redef]
        id: str
        title: str
        url: HttpUrl
        domain: str
        source_type: SourceType = SourceType.OTHER
        content: Optional[str] = None
        verified_at: Optional[datetime] = None

    class Step(BaseModel):  # type: ignore[no-redef]
        id: str
        order: int
        title: str
        description: str
        department: Optional[str] = None
        office: Optional[str] = None
        documents: List[str] = Field(default_factory=list)
        depends_on: List[str] = Field(default_factory=list)
        fee: Optional[str] = None
        application_url: Optional[HttpUrl] = None
        source_ids: List[str] = Field(default_factory=list)

    _USING_SHARED_SCHEMA = False

from llm_service.extraction_service import extract_procedure
from llm_service.doubt_assistant import answer_step_question
from llm_service.provider import LLMServiceUnavailable

# ---------------------------------------------------------------------------
# Fake official sources with realistic Maharashtra domicile certificate text
# ---------------------------------------------------------------------------

NOW = datetime.now(timezone.utc)

FAKE_SOURCES = [
    OfficialSource(
        id="src_1",
        title="Maharashtra e-District Portal — Domicile Certificate",
        url="https://aaplesarkar.mahaonline.gov.in/en/domicile",
        domain="mahaonline.gov.in",
        source_type=SourceType.GOVERNMENT_PORTAL,
        verified_at=NOW,
        content="""\
Domicile Certificate (Rahan Shijapatra) — Maharashtra State

Eligibility:
The applicant must have been a resident of Maharashtra for at least 15 years.
Persons born in Maharashtra are also eligible.

Required Documents:
1. Aadhaar Card (mandatory for identity proof)
2. Ration Card or utility bill as address proof
3. School Leaving Certificate (for date of birth proof)
4. Self-attested declaration of 15-year residency
5. Passport-size photographs (2 copies)
6. Previous domicile certificate (if renewal)

Procedure:
Step 1 — Online Application
Visit https://aaplesarkar.mahaonline.gov.in and click on "Revenue Department Services".
Select "Domicile Certificate". Create an account if you do not have one.
Fill in the online application form with your personal details and upload all required documents.

Step 2 — Pay Application Fee
The application fee for a domicile certificate in Maharashtra is Rs. 20 (non-refundable).
Payment can be made online via net banking, debit card, or credit card through the portal.

Step 3 — Verification by Talathi/Revenue Officer
After submission, your application is sent to the local Talathi office for verification.
The Talathi may visit your residence or contact you for additional verification within 7 working days.

Step 4 — Approval by Tehsildar
Once the Talathi completes verification, the file is forwarded to the Tehsildar (Revenue Department)
for final approval. The Tehsildar's office is at the District Collectorate.

Step 5 — Certificate Issuance
After approval, the digitally signed domicile certificate is issued via the aaple sarkar portal.
You can download and print it. The certificate is valid for lifetime unless the applicant's
domicile changes.

Processing Time: 21 working days from the date of submission.
Application Portal: https://aaplesarkar.mahaonline.gov.in
Department: Revenue Department, Government of Maharashtra
""",
    ),
    OfficialSource(
        id="src_2",
        title="Revenue Department Maharashtra — Official Circular on Domicile",
        url="https://revenue.maharashtra.gov.in/circulars/domicile-2021",
        domain="revenue.maharashtra.gov.in",
        source_type=SourceType.DEPARTMENT_SITE,
        verified_at=NOW,
        content="""\
Government of Maharashtra — Revenue Department
Circular: Requirements for Domicile Certificate — Updated 2021

Documents Accepted as Address Proof (any one):
- Maharashtra Ration Card
- Electricity bill (not older than 3 months)
- Telephone bill (not older than 3 months)
- Bank passbook with address

Documents NOT Accepted:
- Voter ID alone is not sufficient as address proof.
- PAN card is not accepted as identity proof for this application.

Fee: Rs. 20 per application. No additional charges.

Contact: District Collectorate Revenue Branch, or visit the e-District portal
at https://aaplesarkar.mahaonline.gov.in

Grievance: In case of delay beyond 21 working days, applicants may contact
the District Collector's office helpline.
""",
    ),
    OfficialSource(
        id="src_3",
        title="Empty source — should be skipped",
        url="https://example.gov.in/empty",
        domain="example.gov.in",
        source_type=SourceType.OTHER,
        verified_at=NOW,
        content=None,  # intentionally empty — test that we skip it gracefully
    ),
]


# ---------------------------------------------------------------------------
# Helper: pretty print
# ---------------------------------------------------------------------------

def _print_section(title: str) -> None:
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


# ---------------------------------------------------------------------------
# Test 1 — extract_procedure
# ---------------------------------------------------------------------------

def test_extraction() -> None:
    _print_section("TEST 1: extract_procedure()")
    print("Using fake sources (1 empty source will be skipped).")
    print("Calling LLM to extract domicile_certificate procedure for Maharashtra...\n")

    try:
        procedure = extract_procedure(
            sources=FAKE_SOURCES,
            service="domicile_certificate",
            jurisdiction="Maharashtra",
        )
        # Convert to dict for pretty printing
        # Use model_dump if available (Pydantic v2), else dict()
        try:
            data = procedure.model_dump(mode="json")
        except AttributeError:
            data = json.loads(procedure.json())

        print(json.dumps(data, indent=2, default=str))
        print(f"\n[OK] Extraction succeeded. Provider used: {procedure.llm_provider_used}")
        print(f"     Steps extracted: {len(procedure.steps)}")
        print(f"     Documents extracted: {len(procedure.documents)}")
        print(f"     Status: {procedure.status}")
        return procedure
    except LLMServiceUnavailable as exc:
        print(f"[FAIL] Both LLM providers failed: {exc}")
        return None
    except Exception as exc:
        print(f"[ERROR] Unexpected error: {type(exc).__name__}: {exc}")
        import traceback; traceback.print_exc()
        return None


# ---------------------------------------------------------------------------
# Test 2 — answer_step_question (doubt assistant)
# ---------------------------------------------------------------------------

def test_doubt_assistant(procedure=None) -> None:
    _print_section("TEST 2: answer_step_question() — Doubt Assistant")

    # Use the first step from the extracted procedure, or build a fake step
    if procedure and procedure.steps:
        step = procedure.steps[0]
        print(f"Using extracted step: {step.id} — '{step.title}'")
    else:
        print("No procedure available, building a fake Step for the test.")
        step = Step(
            id="step_1",
            order=1,
            title="Online Application Submission",
            description=(
                "Visit the Aaple Sarkar portal and fill in the online application form "
                "for the Domicile Certificate. Upload all required documents."
            ),
            department="Revenue Department",
            office="District Collectorate",
            documents=[],
            depends_on=[],
            fee="Rs. 20",
            application_url="https://aaplesarkar.mahaonline.gov.in",
            source_ids=["src_1", "src_2"],
        )

    # Use only sources that have content
    sources_with_content = [s for s in FAKE_SOURCES if getattr(s, "content", None)]

    questions = [
        "Can I use an electricity bill as address proof?",
        "How many days does it take to get the certificate?",
        "Can I use my PAN card as identity proof?",
        "Is there a penalty for submitting wrong documents?",  # Not in sources — expect unconfirmed
    ]

    for question in questions:
        print(f"\n  Q: {question}")
        result = answer_step_question(
            service="domicile_certificate",
            jurisdiction="Maharashtra",
            current_step=step,
            relevant_sources=sources_with_content,
            question=question,
        )
        print(f"  A: {result['answer']}")
        print(f"     Confirmed: {result['confirmed']} | Sources: {result['source_ids']}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    schema_msg = "shared schemas.models" if _USING_SHARED_SCHEMA else "local fallback stubs"
    print(f"\n[test] Using schema from: {schema_msg}")
    print(f"[test] FORCE_GROQ_FAILURE = {FORCE_GROQ_FAILURE}")

    procedure = test_extraction()
    test_doubt_assistant(procedure)

    print("\n" + "=" * 60)
    print("  All tests complete.")
    print("=" * 60 + "\n")
