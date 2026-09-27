"""
orchestrator/demo_procedures.py

Owner: Person 4 (Orchestrator)

Hardcoded, verified demo procedures used as the final fallback tier
before returning an error (spec section 17):

  fresh Neo4j/SQLite -> live pipeline -> stale data -> DEMO -> error

These must follow the exact same Procedure schema as live-generated
data (spec section 11) — no separate/competing format.

Import DEMO_PROCEDURES into orchestrator.py:
    from orchestrator.demo_procedures import DEMO_PROCEDURES
"""

from datetime import datetime, timezone

from schemas.models import (
    DocumentRequirement,
    LLMProvider,
    OfficialSource,
    Procedure,
    ProcedureStatus,
    SourceType,
    Step,
)


# ============================================================
# DOMICILE CERTIFICATE — MAHARASHTRA
# Based on a real successfully-extracted procedure (aaplesarkar.mahaonline.gov.in
# + satara.gov.in), hardcoded here as a guaranteed fallback.
# ============================================================

_domicile_maharashtra_sources = [
    OfficialSource(
        id="demo_src_1",
        title="Age Nationality and Domicile Certificate",
        url="https://aaplesarkar.mahaonline.gov.in/en/Login/Certificate_Documents?ServiceId=1253",
        domain="aaplesarkar.mahaonline.gov.in",
        source_type=SourceType.STATE_PORTAL,
        verified_at=datetime(2026, 9, 26, tzinfo=timezone.utc),
    ),
    OfficialSource(
        id="demo_src_2",
        title="Age Nationality and Domicile Certificate",
        url="https://www.satara.gov.in/en/service/age-nationality-and-domicile-certificate",
        domain="satara.gov.in",
        source_type=SourceType.GOVERNMENT_PORTAL,
        verified_at=datetime(2026, 9, 26, tzinfo=timezone.utc),
    ),
]

_domicile_maharashtra_documents = [
    DocumentRequirement(
        id="doc_1",
        name="Self-Declaration",
        source_ids=["demo_src_2"],
    ),
    DocumentRequirement(
        id="doc_2",
        name="Proof of Identity (any one)",
        description=(
            "PAN Card, Passport, RSBY Card, Aadhaar Card, Voter ID Card, "
            "MNREGA Job Card, Driving License, or any government/"
            "semi-government identity card"
        ),
        source_ids=["demo_src_2"],
    ),
    DocumentRequirement(
        id="doc_3",
        name="Residence Proof (any one)",
        description="Residence Proof by Talathi, Gram Sevak, or Bill Collector",
        source_ids=["demo_src_2"],
    ),
    DocumentRequirement(
        id="doc_4",
        name="Photo of Applicant",
        source_ids=["demo_src_2"],
    ),
    DocumentRequirement(
        id="doc_5",
        name="Signature of Applicant",
        source_ids=["demo_src_2"],
    ),
    DocumentRequirement(
        id="doc_6",
        name="Proof of Address (any one)",
        source_ids=["demo_src_2"],
    ),
]

_domicile_maharashtra_steps = [
    Step(
        id="step_1",
        order=1,
        title="Collect Required Documents",
        description=(
            "Gather all mandatory documents: self-declaration, any one "
            "proof of identity, any one residence proof, applicant's "
            "photo, signature, and any one proof of address."
        ),
        documents=["doc_1", "doc_2", "doc_3", "doc_4", "doc_5", "doc_6"],
        depends_on=[],
        source_ids=["demo_src_2"],
    ),
    Step(
        id="step_2",
        order=2,
        title="Submit Application",
        description=(
            "Apply online through the Maharashtra Aaple Sarkar portal, "
            "or visit the designated centre to submit the application "
            "along with the collected documents."
        ),
        documents=["doc_1", "doc_2", "doc_3", "doc_4", "doc_5", "doc_6"],
        depends_on=["step_1"],
        application_url="https://aaplesarkar.mahaonline.gov.in/en/Login/Certificate_Documents?ServiceId=1253",
        source_ids=["demo_src_1", "demo_src_2"],
    ),
    Step(
        id="step_3",
        order=3,
        title="Receive Domicile Certificate",
        description=(
            "After processing, the Age-Nationality-and-Domicile "
            "Certificate will be delivered to the applicant's doorstep."
        ),
        documents=[],
        depends_on=["step_2"],
        source_ids=["demo_src_1"],
    ),
]

DOMICILE_MAHARASHTRA = Procedure(
    service="domicile_certificate",
    jurisdiction="Maharashtra",
    eligibility=None,
    prerequisites=[],
    documents=_domicile_maharashtra_documents,
    steps=_domicile_maharashtra_steps,
    sources=_domicile_maharashtra_sources,
    verified_at=datetime(2026, 9, 26, tzinfo=timezone.utc),
    status=ProcedureStatus.DEMO,
    llm_provider_used=LLMProvider.NONE,
)


# ============================================================
# INCOME CERTIFICATE — MAHARASHTRA
# Sourced from Maharashtra's Aaple Sarkar portal process (issued by
# the Naib Tahsildar, ~15 working days turnaround per public
# government-service guides).
# ============================================================

_income_maharashtra_sources = [
    OfficialSource(
        id="demo_src_3",
        title="Aaple Sarkar — Income Certificate (Utpanna Praman Patra)",
        url="https://aaplesarkar.mahaonline.gov.in/",
        domain="aaplesarkar.mahaonline.gov.in",
        source_type=SourceType.STATE_PORTAL,
        verified_at=datetime(2026, 9, 27, tzinfo=timezone.utc),
    ),
]

_income_maharashtra_documents = [
    DocumentRequirement(
        id="doc_1",
        name="Proof of Identity (any one)",
        description="Aadhaar Card, Voter ID, or Driving License",
        source_ids=["demo_src_3"],
    ),
    DocumentRequirement(
        id="doc_2",
        name="Proof of Address (any one)",
        description=(
            "Ration Card, Voter ID, Passport, Driving License, "
            "Electricity Bill, Water Bill, or Property Tax Receipt"
        ),
        source_ids=["demo_src_3"],
    ),
    DocumentRequirement(
        id="doc_3",
        name="Passport-Sized Photograph",
        source_ids=["demo_src_3"],
    ),
    DocumentRequirement(
        id="doc_4",
        name="Self-Declaration / Affidavit of Income",
        description="A sworn declaration affirming the accuracy of the declared family income",
        source_ids=["demo_src_3"],
    ),
]

_income_maharashtra_steps = [
    Step(
        id="step_1",
        order=1,
        title="Collect Required Documents",
        description=(
            "Gather proof of identity, proof of address, a passport-size "
            "photograph, and a self-declaration/affidavit stating your "
            "family's total annual income from all sources."
        ),
        documents=["doc_1", "doc_2", "doc_3", "doc_4"],
        depends_on=[],
        source_ids=["demo_src_3"],
    ),
    Step(
        id="step_2",
        order=2,
        title="Submit Application via Aaple Sarkar",
        description=(
            "Register/log in on the Aaple Sarkar portal, fill in personal "
            "and income details, upload the required documents, and pay "
            "the nominal application fee."
        ),
        documents=["doc_1", "doc_2", "doc_3", "doc_4"],
        depends_on=["step_1"],
        application_url="https://aaplesarkar.mahaonline.gov.in/",
        source_ids=["demo_src_3"],
    ),
    Step(
        id="step_3",
        order=3,
        title="Verification by Naib Tahsildar",
        description=(
            "The application and declared income are reviewed by the "
            "Naib Tahsildar (revenue officer) at the local Tehsil office."
        ),
        department="Revenue Department",
        office="Tehsil Office",
        documents=[],
        depends_on=["step_2"],
        source_ids=["demo_src_3"],
    ),
    Step(
        id="step_4",
        order=4,
        title="Receive Income Certificate",
        description=(
            "The certificate is typically issued within about 15 working "
            "days of submission and can be downloaded from the portal."
        ),
        documents=[],
        depends_on=["step_3"],
        source_ids=["demo_src_3"],
    ),
]

INCOME_MAHARASHTRA = Procedure(
    service="income_certificate",
    jurisdiction="Maharashtra",
    eligibility=None,
    prerequisites=[],
    documents=_income_maharashtra_documents,
    steps=_income_maharashtra_steps,
    sources=_income_maharashtra_sources,
    verified_at=datetime(2026, 9, 27, tzinfo=timezone.utc),
    status=ProcedureStatus.DEMO,
    llm_provider_used=LLMProvider.NONE,
)


# ============================================================
# AADHAAR ADDRESS UPDATE
# Sourced from UIDAI's myAadhaar self-service portal process.
# Note: this is a central/national process, not state-specific,
# but is kept keyed under "Maharashtra" to match how the normalizer
# will route a query like "update Aadhaar address in Maharashtra".
# ============================================================

_aadhaar_sources = [
    OfficialSource(
        id="demo_src_4",
        title="myAadhaar — Update Aadhaar Online (Address)",
        url="https://myaadhaar.uidai.gov.in/",
        domain="myaadhaar.uidai.gov.in",
        source_type=SourceType.GOVERNMENT_PORTAL,
        verified_at=datetime(2026, 9, 27, tzinfo=timezone.utc),
    ),
]

_aadhaar_documents = [
    DocumentRequirement(
        id="doc_1",
        name="Proof of Address (any one)",
        description=(
            "Passport, Bank Statement/Passbook, Ration Card, Voter ID, "
            "Driving License, or a utility bill (electricity/water, "
            "not older than 3 months)"
        ),
        source_ids=["demo_src_4"],
    ),
    DocumentRequirement(
        id="doc_2",
        name="Registered Mobile Number",
        description="Required for OTP-based authentication; must be linked to the Aadhaar",
        source_ids=["demo_src_4"],
    ),
]

_aadhaar_steps = [
    Step(
        id="step_1",
        order=1,
        title="Prepare Address Proof and Mobile Access",
        description=(
            "Scan a valid proof-of-address document (JPEG/PNG/PDF, under "
            "2MB) and ensure you have access to the mobile number linked "
            "to your Aadhaar for OTP verification."
        ),
        documents=["doc_1", "doc_2"],
        depends_on=[],
        source_ids=["demo_src_4"],
    ),
    Step(
        id="step_2",
        order=2,
        title="Log In to myAadhaar Portal",
        description=(
            "Visit myaadhaar.uidai.gov.in, enter your 12-digit Aadhaar "
            "number and captcha, then authenticate using the OTP sent to "
            "your registered mobile number."
        ),
        documents=[],
        depends_on=["step_1"],
        application_url="https://myaadhaar.uidai.gov.in/",
        source_ids=["demo_src_4"],
    ),
    Step(
        id="step_3",
        order=3,
        title="Submit Address Update Request",
        description=(
            "Select 'Address Update', enter the new address exactly as "
            "it appears on your proof document, upload the scanned proof, "
            "and submit. You will receive a Service Request Number (SRN) "
            "or Update Request Number (URN) for tracking."
        ),
        documents=["doc_1"],
        depends_on=["step_2"],
        fee="Free online until 14 June 2027 per UIDAI's May 2026 office memorandum; ₹75 at a physical centre",
        source_ids=["demo_src_4"],
    ),
    Step(
        id="step_4",
        order=4,
        title="Track and Confirm Update",
        description=(
            "UIDAI verifies the submitted documents; the update typically "
            "reflects within 10-15 days. Use the SRN/URN to check status, "
            "and you will receive a confirmation SMS once complete."
        ),
        documents=[],
        depends_on=["step_3"],
        source_ids=["demo_src_4"],
    ),
]

AADHAAR_ADDRESS_UPDATE = Procedure(
    service="aadhaar_address_update",
    jurisdiction="Maharashtra",
    eligibility=None,
    prerequisites=[],
    documents=_aadhaar_documents,
    steps=_aadhaar_steps,
    sources=_aadhaar_sources,
    verified_at=datetime(2026, 9, 27, tzinfo=timezone.utc),
    status=ProcedureStatus.DEMO,
    llm_provider_used=LLMProvider.NONE,
)


# ============================================================
# REGISTRY — add more demo procedures here following the same
# pattern as the examples above.
# ============================================================

DEMO_PROCEDURES: dict[tuple[str, str], Procedure] = {
    ("domicile_certificate", "Maharashtra"): DOMICILE_MAHARASHTRA,
    ("income_certificate", "Maharashtra"): INCOME_MAHARASHTRA,
    ("aadhaar_address_update", "Maharashtra"): AADHAAR_ADDRESS_UPDATE,
    # TODO: add remaining demo procedures, e.g.:
    # ("caste_certificate", "Maharashtra"): CASTE_MAHARASHTRA,
    # ("birth_certificate", "Mumbai"): BIRTH_MUMBAI,
    # ("income_certificate", "Gujarat"): INCOME_GUJARAT,
}