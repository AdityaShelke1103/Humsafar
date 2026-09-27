"""
llm_service/provider.py

Owner: Person 3 (LLM)

Core provider abstraction: Groq (primary) -> Gemini Flash (fallback).

Handles:
  - Sending a structured JSON prompt to the active LLM provider.
  - Retrying once on Groq before falling over to Gemini.
  - Returning the raw parsed JSON dict (caller is responsible for
    interpreting the shape -- extraction_service and doubt_assistant use this).
  - Logging which provider was used and why failover happened.
  - Raising LLMServiceUnavailable if both providers fail.

NOTE: Uses JSON mode on both providers to minimise invalid-output retries:
  - Groq: response_format={"type": "json_object"}
  - Gemini: response_mime_type="application/json"
"""

import json
import logging
import os
from typing import Any, Dict, Optional

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

# -- config from .env ---------------------------------------------------------

GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY")
GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

LLM_TIMEOUT: int = int(os.getenv("LLM_TIMEOUT_SECONDS", "20"))

# -- custom exception ---------------------------------------------------------


class LLMServiceUnavailable(Exception):
    """Raised when both Groq and Gemini are unavailable or return invalid output."""
    pass


# -- internal helpers ---------------------------------------------------------

def _call_groq(system_prompt: str, user_prompt: str) -> Dict[str, Any]:
    """
    Call Groq with JSON mode enabled.
    Raises any exception on failure (caller handles retry/fallback).
    """
    try:
        from groq import Groq  # type: ignore
    except ImportError:
        raise RuntimeError("groq package not installed. Run: pip install groq")

    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not set in environment.")

    client = Groq(api_key=GROQ_API_KEY, timeout=LLM_TIMEOUT)

    logger.info("Calling Groq | model=%s", GROQ_MODEL)
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
    )

    raw = response.choices[0].message.content
    if not raw:
        raise ValueError("Groq returned an empty response.")

    parsed = json.loads(raw)  # raises json.JSONDecodeError on bad output
    logger.info("Groq call succeeded.")
    return parsed


def _call_gemini(system_prompt: str, user_prompt: str) -> Dict[str, Any]:
    """
    Call Gemini Flash with JSON mime type.
    Uses the new google.genai SDK (preferred). Falls back to the old
    google.generativeai SDK if google-genai is not installed.
    Raises any exception on failure (caller handles retry/fallback).
    """
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set in environment.")

    # -- Try new google.genai SDK first (not deprecated) ---------------------
    try:
        from google import genai as new_genai  # type: ignore
        from google.genai import types as genai_types  # type: ignore

        client = new_genai.Client(api_key=GEMINI_API_KEY)
        logger.info("Calling Gemini (google.genai SDK) | model=%s", GEMINI_MODEL)

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=user_prompt,
            config=genai_types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                temperature=0.1,
            ),
        )
        raw = response.text
        if not raw:
            raise ValueError("Gemini returned an empty response.")
        parsed = json.loads(raw)
        logger.info("Gemini call succeeded (google.genai SDK).")
        return parsed

    except ImportError:
        logger.warning(
            "google-genai not installed, falling back to google.generativeai SDK."
        )

    # -- Fallback: old google.generativeai SDK (deprecated but functional) --
    try:
        import warnings
        import google.generativeai as genai  # type: ignore
    except ImportError:
        raise RuntimeError(
            "Neither google-genai nor google-generativeai is installed. "
            "Run: pip install google-genai"
        )

    with warnings.catch_warnings():
        warnings.simplefilter("ignore", FutureWarning)
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            system_instruction=system_prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.1,
            ),
        )
        logger.info(
            "Calling Gemini (google.generativeai SDK, deprecated) | model=%s",
            GEMINI_MODEL,
        )
        response = model.generate_content(
            user_prompt, request_options={"timeout": LLM_TIMEOUT}
        )
        raw = response.text
        if not raw:
            raise ValueError("Gemini returned an empty response.")
        parsed = json.loads(raw)
        logger.info("Gemini call succeeded (google.generativeai SDK).")
        return parsed


# -- public API ---------------------------------------------------------------

def call_llm(system_prompt: str, user_prompt: str) -> Dict[str, Any]:
    """
    Attempt Groq (with one automatic retry), then fall back to Gemini.

    Returns parsed JSON dict on success.
    Raises LLMServiceUnavailable if both providers fail completely.

    Logs every attempt, failure reason, and which provider ultimately served.
    """
    groq_errors = []

    # -- Groq attempt 1 -------------------------------------------------------
    try:
        result = _call_groq(system_prompt, user_prompt)
        logger.info("[LLM] Provider used: GROQ (attempt 1)")
        return result
    except Exception as e:
        groq_errors.append(f"Groq attempt 1 failed: {type(e).__name__}: {e}")
        logger.warning("Groq attempt 1 failed: %s", e)

    # -- Groq retry (attempt 2) -----------------------------------------------
    try:
        result = _call_groq(system_prompt, user_prompt)
        logger.info("[LLM] Provider used: GROQ (attempt 2 / retry)")
        return result
    except Exception as e:
        groq_errors.append(f"Groq attempt 2 failed: {type(e).__name__}: {e}")
        logger.warning("Groq attempt 2 (retry) also failed: %s", e)

    logger.warning(
        "[LLM] Groq unavailable after 2 attempts. Falling back to Gemini Flash. "
        "Groq errors: %s",
        groq_errors,
    )

    # -- Gemini fallback ------------------------------------------------------
    try:
        result = _call_gemini(system_prompt, user_prompt)
        logger.info("[LLM] Provider used: GEMINI FLASH (fallback)")
        return result
    except Exception as e:
        logger.error(
            "[LLM] Gemini Flash also failed: %s. Both providers exhausted. "
            "Groq history: %s",
            e,
            groq_errors,
        )
        raise LLMServiceUnavailable(
            f"Both Groq and Gemini Flash failed. "
            f"Groq errors: {groq_errors}. "
            f"Gemini error: {type(e).__name__}: {e}"
        ) from e


def check_provider_availability() -> str:
    """
    Lightweight availability check used by the /health endpoint.

    Returns "groq", "gemini_flash", or "none" to indicate which
    provider is currently reachable.
    """
    # Try a minimal Groq call (just validate the key/model)
    try:
        from groq import Groq  # type: ignore
        if GROQ_API_KEY:
            client = Groq(api_key=GROQ_API_KEY, timeout=5)
            client.models.list()  # lightweight ping, no tokens consumed
            logger.info("[health] Groq is reachable.")
            return "groq"
    except Exception as e:
        logger.warning("[health] Groq not reachable: %s", e)

    # Try Gemini
    try:
        import google.generativeai as genai  # type: ignore
        if GEMINI_API_KEY:
            genai.configure(api_key=GEMINI_API_KEY)
            list(genai.list_models())
            logger.info("[health] Gemini is reachable.")
            return "gemini_flash"
    except Exception as e:
        logger.warning("[health] Gemini not reachable: %s", e)

    return "none"
