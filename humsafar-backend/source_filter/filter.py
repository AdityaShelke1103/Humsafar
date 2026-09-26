"""
source_filter/filter.py

Owner: Person 2 (Search / API integration)

Filters raw search results down to sources authoritative enough to
back government claims (spec section 9, Step 3). Blogs, forums, SEO
sites and social media should never pass through as authoritative.
"""

from typing import List

from schemas.models import OfficialSource

# Domains/suffixes considered authoritative by default.
# TODO (Person 2): expand this list with real state/municipal portal domains.
TRUSTED_DOMAIN_SUFFIXES = [".gov.in", ".nic.in"]


def filter_official(sources: List[OfficialSource]) -> List[OfficialSource]:
    """
    Given raw search results, return only the sources that qualify
    as official government sources.

    TODO (Person 2): implement real domain/heuristic filtering.
    Non-official sources may still be used to *discover* an official
    portal, but should not be returned here as authoritative.
    """
    # fake: currently passes everything through unfiltered
    return sources