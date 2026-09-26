"""
source_filter/filter.py

Owner: Person 2 (Search / API integration)

Filters raw search results down to authoritative government sources.
Blogs, forums, SEO sites and social media are excluded.
"""

from typing import List
from urllib.parse import urlparse

from schemas.models import OfficialSource, SourceType


TRUSTED_DOMAIN_SUFFIXES = (
    ".gov.in",
    ".nic.in",
)


def _normalise_domain(url: str) -> str:
    """Extract and normalise the hostname from a URL."""
    hostname = urlparse(url).hostname or ""
    return hostname.lower().removeprefix("www.")


def _classify_source(domain: str) -> SourceType:
    """
    Classify an already-trusted government domain.

    This is intentionally heuristic. The important authority check is
    performed by the trusted-domain rule.
    """
    if domain.endswith(".nic.in"):
        return SourceType.DEPARTMENT_SITE

    if domain.endswith(".gov.in"):
        if any(
            keyword in domain
            for keyword in (
                "municipal",
                "mcgm",
                "pmc",
                "nmc",
                "kmc",
                "bmc",
            )
        ):
            return SourceType.MUNICIPAL_PORTAL

        if any(
            keyword in domain
            for keyword in (
                "maharashtra",
                "gujarat",
                "karnataka",
                "delhi",
                "rajasthan",
                "kerala",
                "tamilnadu",
            )
        ):
            return SourceType.STATE_PORTAL

        return SourceType.GOVERNMENT_PORTAL

    return SourceType.OTHER


def filter_official(sources: List[OfficialSource]) -> List[OfficialSource]:
    """
    Return only sources hosted on trusted government domains.

    Non-official search results are discarded. The original source
    objects are preserved, with their domain and source_type updated.
    """

    official_sources: List[OfficialSource] = []

    for source in sources:
        domain = _normalise_domain(str(source.url))

        if not domain:
            continue

        if not domain.endswith(TRUSTED_DOMAIN_SUFFIXES):
            continue

        source.domain = domain
        source.source_type = _classify_source(domain)

        official_sources.append(source)

    return official_sources