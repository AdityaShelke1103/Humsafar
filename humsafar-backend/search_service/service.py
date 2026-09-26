"""
search_service/service.py

Owner: Person 2 (Search / API integration)

Responsible for querying the web search provider (Tavily or equivalent)
to find government sources for a given service + jurisdiction.

Official-source filtering is handled separately by:
source_filter/filter.py
"""

import os
import time
from typing import List
from urllib.parse import urlparse

import httpx
from dotenv import load_dotenv

from schemas.models import OfficialSource


load_dotenv()

TAVILY_API_URL = "https://api.tavily.com/search"

SEARCH_TIMEOUT_SECONDS = 20
MAX_RETRIES = 2


def _extract_domain(url: str) -> str:
    """Extract a normalised hostname from a URL."""
    return urlparse(url).netloc.lower().removeprefix("www.")


def find_sources(service: str, jurisdiction: str) -> List[OfficialSource]:
    """
    Search Tavily for information about a service + jurisdiction.

    Raw results may include non-official websites.
    Official-source filtering is intentionally handled by
    source_filter.filter_official().
    """

    api_key = os.getenv("TAVILY_API_KEY")

    if not api_key:
        print("Search service: TAVILY_API_KEY is not configured.")
        return []

    query = f"{service} {jurisdiction} government procedure"

    payload = {
        "api_key": api_key,
        "query": query,
        "max_results": 10,
    }

    for attempt in range(MAX_RETRIES + 1):
        try:
            response = httpx.post(
                TAVILY_API_URL,
                json=payload,
                timeout=SEARCH_TIMEOUT_SECONDS,
            )
            response.raise_for_status()

            data = response.json()
            results = data.get("results", [])

            sources: List[OfficialSource] = []

            for index, result in enumerate(results, start=1):
                url = result.get("url")
                title = result.get("title")
                content = result.get("content")

                if not url or not title:
                    continue

                sources.append(
                    OfficialSource(
                        id=f"tavily_{index}",
                        title=title,
                        url=url,
                        domain=_extract_domain(url),
                        content=content,
                    )
                )

            return sources

        except (httpx.TimeoutException, httpx.NetworkError) as exc:
            if attempt < MAX_RETRIES:
                time.sleep(1)
                continue

            print(f"Search service: Tavily request failed: {exc}")
            return []

        except httpx.HTTPStatusError as exc:
            print(
                f"Search service: Tavily returned HTTP "
                f"{exc.response.status_code}."
            )
            return []

        except (ValueError, KeyError) as exc:
            print(f"Search service: Invalid Tavily response: {exc}")
            return []

    return []