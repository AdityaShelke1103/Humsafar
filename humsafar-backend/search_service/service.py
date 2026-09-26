"""
search_service/service.py

Owner: Person 2 (Search / API integration)

Responsible for querying the web search provider (Tavily or equivalent)
to find official government sources for a given service + jurisdiction.
"""

from typing import List

from schemas.models import OfficialSource


def find_sources(service: str, jurisdiction: str) -> List[OfficialSource]:
    """
    Search the web for official government information about this
    service + jurisdiction (spec section 9, Step 2).

    Query strategy suggestion: "{service} {jurisdiction} government procedure"

    Returns a list of OfficialSource objects. Raw/unfiltered results
    can include non-official sources too — filtering happens in
    source_filter.filter_official(), not here.

    TODO (Person 2): implement real Tavily API call.
    """
    # fake data so the orchestrator can run end-to-end
    return [
        OfficialSource(
            id="src_1",
            title=f"[FAKE] Official portal for {service} in {jurisdiction}",
            url="https://example.gov.in/fake-source",
            domain="example.gov.in",
            source_type="government_portal",
            verified_at=None,
        )
    ]