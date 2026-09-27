from datetime import datetime

from schemas.models import (
    DocumentRequirement,
    OfficialSource,
    Procedure,
    ProcedureStatus,
    Step,
    SourceType,
)

from neo4j_service.service import save_procedure


def seed_demo_procedures():

    now = datetime.now()

    procedures = [

        Procedure(
            service="domicile_certificate",
            jurisdiction="Maharashtra",
            eligibility="Applicant must be a resident of Maharashtra.",
            prerequisites=[],
            documents=[
                DocumentRequirement(
                    id="doc_1",
                    name="Aadhaar Card",
                    description="Proof of identity and address.",
                    source_ids=["src_1"]
                ),
                DocumentRequirement(
                    id="doc_2",
                    name="Address Proof",
                    description="Valid proof of residence.",
                    source_ids=["src_1"]
                )
            ],
            steps=[
                Step(
                    id="step_1",
                    order=1,
                    title="Collect documents",
                    description="Collect the required identity and residence documents.",
                    department="Revenue Department",
                    office="Tehsil Office",
                    documents=["doc_1", "doc_2"],
                    depends_on=[],
                    source_ids=["src_1"]
                ),
                Step(
                    id="step_2",
                    order=2,
                    title="Submit application",
                    description="Submit the domicile certificate application.",
                    department="Revenue Department",
                    office="Tehsil Office",
                    documents=["doc_1", "doc_2"],
                    depends_on=["step_1"],
                    source_ids=["src_1"]
                )
            ],
            sources=[
                OfficialSource(
                    id="src_1",
                    title="Maharashtra Government Portal",
                    url="https://www.maharashtra.gov.in",
                    domain="maharashtra.gov.in",
                    source_type=SourceType.STATE_PORTAL,
                    verified_at=now
                )
            ],
            verified_at=now,
            status=ProcedureStatus.DEMO
        ),

        Procedure(
            service="income_certificate",
            jurisdiction="Maharashtra",
            eligibility="Applicant must provide valid income information.",
            prerequisites=[],
            documents=[
                DocumentRequirement(
                    id="doc_1",
                    name="Aadhaar Card",
                    description="Proof of identity.",
                    source_ids=["src_1"]
                ),
                DocumentRequirement(
                    id="doc_2",
                    name="Income Proof",
                    description="Proof supporting declared income.",
                    source_ids=["src_1"]
                )
            ],
            steps=[
                Step(
                    id="step_1",
                    order=1,
                    title="Collect documents",
                    description="Collect identity and income documents.",
                    department="Revenue Department",
                    office="Tehsil Office",
                    documents=["doc_1", "doc_2"],
                    depends_on=[],
                    source_ids=["src_1"]
                ),
                Step(
                    id="step_2",
                    order=2,
                    title="Submit application",
                    description="Submit the income certificate application.",
                    department="Revenue Department",
                    office="Tehsil Office",
                    documents=["doc_1", "doc_2"],
                    depends_on=["step_1"],
                    source_ids=["src_1"]
                )
            ],
            sources=[
                OfficialSource(
                    id="src_1",
                    title="Maharashtra Government Portal",
                    url="https://www.maharashtra.gov.in",
                    domain="maharashtra.gov.in",
                    source_type=SourceType.STATE_PORTAL,
                    verified_at=now
                )
            ],
            verified_at=now,
            status=ProcedureStatus.DEMO
        ),

        Procedure(
            service="caste_certificate",
            jurisdiction="Maharashtra",
            eligibility="Applicant must provide supporting caste documents.",
            prerequisites=[],
            documents=[
                DocumentRequirement(
                    id="doc_1",
                    name="Aadhaar Card",
                    description="Proof of identity.",
                    source_ids=["src_1"]
                ),
                DocumentRequirement(
                    id="doc_2",
                    name="Caste Proof",
                    description="Supporting caste document.",
                    source_ids=["src_1"]
                )
            ],
            steps=[
                Step(
                    id="step_1",
                    order=1,
                    title="Collect documents",
                    description="Collect identity and caste documents.",
                    department="Revenue Department",
                    office="Tehsil Office",
                    documents=["doc_1", "doc_2"],
                    depends_on=[],
                    source_ids=["src_1"]
                ),
                Step(
                    id="step_2",
                    order=2,
                    title="Submit application",
                    description="Submit the caste certificate application.",
                    department="Revenue Department",
                    office="Tehsil Office",
                    documents=["doc_1", "doc_2"],
                    depends_on=["step_1"],
                    source_ids=["src_1"]
                )
            ],
            sources=[
                OfficialSource(
                    id="src_1",
                    title="Maharashtra Government Portal",
                    url="https://www.maharashtra.gov.in",
                    domain="maharashtra.gov.in",
                    source_type=SourceType.STATE_PORTAL,
                    verified_at=now
                )
            ],
            verified_at=now,
            status=ProcedureStatus.DEMO
        ),

        Procedure(
            service="birth_certificate",
            jurisdiction="Maharashtra",
            eligibility="The birth must be registered with the relevant authority.",
            prerequisites=[],
            documents=[
                DocumentRequirement(
                    id="doc_1",
                    name="Hospital Birth Record",
                    description="Birth record issued by the hospital.",
                    source_ids=["src_1"]
                ),
                DocumentRequirement(
                    id="doc_2",
                    name="Parent Identity Proof",
                    description="Identity proof of parent or guardian.",
                    source_ids=["src_1"]
                )
            ],
            steps=[
                Step(
                    id="step_1",
                    order=1,
                    title="Collect birth documents",
                    description="Collect birth and parent identity records.",
                    department="Municipal Corporation",
                    office="Birth and Death Registration Office",
                    documents=["doc_1", "doc_2"],
                    depends_on=[],
                    source_ids=["src_1"]
                ),
                Step(
                    id="step_2",
                    order=2,
                    title="Submit registration",
                    description="Submit the birth registration request.",
                    department="Municipal Corporation",
                    office="Birth and Death Registration Office",
                    documents=["doc_1", "doc_2"],
                    depends_on=["step_1"],
                    source_ids=["src_1"]
                )
            ],
            sources=[
                OfficialSource(
                    id="src_1",
                    title="Maharashtra Government Portal",
                    url="https://www.maharashtra.gov.in",
                    domain="maharashtra.gov.in",
                    source_type=SourceType.STATE_PORTAL,
                    verified_at=now
                )
            ],
            verified_at=now,
            status=ProcedureStatus.DEMO
        ),

        Procedure(
            service="aadhaar_address_update",
            jurisdiction="Maharashtra",
            eligibility="Aadhaar holders can request an address update with valid proof.",
            prerequisites=[],
            documents=[
                DocumentRequirement(
                    id="doc_1",
                    name="Aadhaar Card",
                    description="Existing Aadhaar identification.",
                    source_ids=["src_1"]
                ),
                DocumentRequirement(
                    id="doc_2",
                    name="Address Proof",
                    description="Proof of the new address.",
                    source_ids=["src_1"]
                )
            ],
            steps=[
                Step(
                    id="step_1",
                    order=1,
                    title="Prepare address proof",
                    description="Prepare valid proof of the new address.",
                    department="UIDAI",
                    office="Aadhaar Enrolment Centre",
                    documents=["doc_2"],
                    depends_on=[],
                    source_ids=["src_1"]
                ),
                Step(
                    id="step_2",
                    order=2,
                    title="Submit update request",
                    description="Submit the Aadhaar address update request.",
                    department="UIDAI",
                    office="Aadhaar Enrolment Centre",
                    documents=["doc_1", "doc_2"],
                    depends_on=["step_1"],
                    source_ids=["src_1"]
                )
            ],
            sources=[
                OfficialSource(
                    id="src_1",
                    title="UIDAI Official Portal",
                    url="https://uidai.gov.in",
                    domain="uidai.gov.in",
                    source_type=SourceType.GOVERNMENT_PORTAL,
                    verified_at=now
                )
            ],
            verified_at=now,
            status=ProcedureStatus.DEMO
        ),

        Procedure(
            service="driving_license",
            jurisdiction="Maharashtra",
            eligibility="Applicant must satisfy the applicable driving licence requirements.",
            prerequisites=[],
            documents=[
                DocumentRequirement(
                    id="doc_1",
                    name="Aadhaar Card",
                    description="Proof of identity.",
                    source_ids=["src_1"]
                ),
                DocumentRequirement(
                    id="doc_2",
                    name="Address Proof",
                    description="Proof of residence.",
                    source_ids=["src_1"]
                ),
                DocumentRequirement(
                    id="doc_3",
                    name="Learner Licence",
                    description="Required learner licence.",
                    source_ids=["src_1"]
                )
            ],
            steps=[
                Step(
                    id="step_1",
                    order=1,
                    title="Prepare documents",
                    description="Collect identity, address and learner licence documents.",
                    department="Transport Department",
                    office="Regional Transport Office",
                    documents=["doc_1", "doc_2", "doc_3"],
                    depends_on=[],
                    source_ids=["src_1"]
                ),
                Step(
                    id="step_2",
                    order=2,
                    title="Submit application",
                    description="Submit the driving licence application.",
                    department="Transport Department",
                    office="Regional Transport Office",
                    documents=["doc_1", "doc_2", "doc_3"],
                    depends_on=["step_1"],
                    source_ids=["src_1"]
                ),
                Step(
                    id="step_3",
                    order=3,
                    title="Driving test",
                    description="Complete the applicable driving test.",
                    department="Transport Department",
                    office="Regional Transport Office",
                    documents=[],
                    depends_on=["step_2"],
                    source_ids=["src_1"]
                )
            ],
            sources=[
                OfficialSource(
                    id="src_1",
                    title="Parivahan Sewa",
                    url="https://parivahan.gov.in",
                    domain="parivahan.gov.in",
                    source_type=SourceType.GOVERNMENT_PORTAL,
                    verified_at=now
                )
            ],
            verified_at=now,
            status=ProcedureStatus.DEMO
        )
    ]

    for procedure in procedures:
        save_procedure(procedure)


if __name__ == "__main__":
    seed_demo_procedures()