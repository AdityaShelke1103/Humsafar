"""
normalizer/normalizer.py

Owner: Person 4 (Orchestrator)

Turns a raw natural-language query into a normalized
(service, jurisdiction) pair, or flags that clarification is needed
(spec section 9, Step 1).

Approach: simple keyword matching. This is intentionally NOT an LLM
call — it's fast, free, deterministic, and good enough for a 24-hour
hackathon's known set of services + jurisdictions.
"""

import re
from typing import Optional, Tuple

from schemas.models import ClarificationNeeded


# ============================================================
# SERVICE KEYWORDS
# Map any phrase that might appear in a user query -> normalized
# service key. Add more as your demo procedures expand.
# ============================================================

SERVICE_KEYWORDS = {
    "domicile": "domicile_certificate",
    "income certificate": "income_certificate",
    "income proof": "income_certificate",
    "caste certificate": "caste_certificate",
    "caste": "caste_certificate",
    "birth certificate": "birth_certificate",
    "birth proof": "birth_certificate",
    "aadhaar address": "aadhaar_address_update",
    "aadhar address": "aadhaar_address_update",
    "address change": "aadhaar_address_update",
    "address update": "aadhaar_address_update",
    "aadhaar update": "aadhaar_address_update",
}

# Order matters: check longer/more specific phrases before shorter ones
# to avoid "income" matching before "income certificate" would (not an
# issue here since dict iteration order = insertion order in Python 3.7+,
# but keep specific phrases listed above generic ones as a habit).


# ============================================================
# JURISDICTION KEYWORDS
# Indian states/UTs + a few major cities users are likely to type.
# Extend as needed.
# ============================================================

JURISDICTION_KEYWORDS = {
    "maharashtra": "Maharashtra",
    "gujarat": "Gujarat",
    "karnataka": "Karnataka",
    "delhi": "Delhi",
    "rajasthan": "Rajasthan",
    "kerala": "Kerala",
    "tamil nadu": "Tamil Nadu",
    "tamilnadu": "Tamil Nadu",
    "uttar pradesh": "Uttar Pradesh",
    "west bengal": "West Bengal",
    "punjab": "Punjab",
    "haryana": "Haryana",
    "madhya pradesh": "Madhya Pradesh",
    "bihar": "Bihar",
    "telangana": "Telangana",
    "andhra pradesh": "Andhra Pradesh",
    # major cities -> mapped to their state, since most government
    # procedures in this project are state-level, not city-level
    "mumbai": "Maharashtra",
    "pune": "Maharashtra",
    "nagpur": "Maharashtra",
    "ahmedabad": "Gujarat",
    "surat": "Gujarat",
    "bangalore": "Karnataka",
    "bengaluru": "Karnataka",
    "new delhi": "Delhi",
}


def _match_keyword(text: str, keyword_map: dict) -> Optional[str]:
    """
    Return the normalized value for the first keyword found in text,
    checking longer keywords first so "tamil nadu" matches before
    any shorter substring could.
    """
    text_lower = text.lower()
    # sort keys by length descending so multi-word phrases are checked first
    for keyword in sorted(keyword_map.keys(), key=len, reverse=True):
        # word-boundary-ish check to avoid partial-word false matches
        pattern = r"\b" + re.escape(keyword) + r"\b"
        if re.search(pattern, text_lower):
            return keyword_map[keyword]
    return None


def normalize_request(
    query: str,
    service_hint: Optional[str] = None,
    jurisdiction_hint: Optional[str] = None,
) -> Tuple[Optional[str], Optional[str], Optional[ClarificationNeeded]]:
    """
    Returns (service, jurisdiction, clarification_needed).

    Exactly one of the following holds:
      - service and jurisdiction are both set, clarification is None
      - clarification is set (service may or may not be set)

    Jurisdiction is treated as essential: if it can't be determined
    from the hint or the query text, we ask rather than guess
    (spec section 9, Step 1 + section 26).
    """
    service = service_hint or _match_keyword(query, SERVICE_KEYWORDS)
    jurisdiction = jurisdiction_hint or _match_keyword(query, JURISDICTION_KEYWORDS)

    if not service:
        return None, jurisdiction, ClarificationNeeded(
            reason="Could not identify which government service this request is for.",
            missing_field="service",
            prompt_to_user=(
                "Which service do you need help with? "
                "(e.g. domicile certificate, income certificate, "
                "caste certificate, birth certificate, Aadhaar address update)"
            ),
        )

    if not jurisdiction:
        return service, None, ClarificationNeeded(
            reason="Jurisdiction could not be determined from the query.",
            missing_field="jurisdiction",
            prompt_to_user="Which state or city is this for?",
        )

    return service, jurisdiction, None