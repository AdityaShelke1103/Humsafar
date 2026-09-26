# llm_service

**Owner: Person 3 (LLM)**

## What this module does

Implements the Groq -> Gemini Flash provider abstraction and all LLM-powered
features for Humsafar:

1. **provider.py** — Core provider abstraction.
   - `call_llm(system_prompt, user_prompt) -> dict` — tries Groq (x2 retries), then Gemini Flash fallback.
   - `check_provider_availability() -> str` — lightweight ping for /health endpoint.
   - `LLMServiceUnavailable` — raised when both providers fail; catch this in orchestrator.

2. **extraction_service.py** — Structured procedure extraction.
   - `extract_procedure(sources, service, jurisdiction) -> Procedure`
   - Sends filtered official-source content to LLM and returns a validated Procedure.

3. **doubt_assistant.py** — Context-only Q&A for the active roadmap step.
   - `answer_step_question(service, jurisdiction, current_step, relevant_sources, question) -> dict`
   - Returns `{answer, confirmed, source_ids}`.
   - Never guesses; if answer is not in context, says so explicitly.

4. **test_llm_service.py** — Standalone test script.
   - Run with: `python -m llm_service.test_llm_service` from `humsafar-backend/`.
   - Set `FORCE_GROQ_FAILURE = True` at top of file to test Gemini fallback path.

## How Person 4 (Orchestrator) should use this

```python
from llm_service import extract_procedure, answer_step_question, LLMServiceUnavailable

# In the orchestrator pipeline:
try:
    procedure = extract_procedure(
        sources=filtered_official_sources,
        service="domicile_certificate",
        jurisdiction="Maharashtra",
    )
except LLMServiceUnavailable:
    # fall back to stale Neo4j data or demo data
    pass

# For the doubt assistant endpoint:
result = answer_step_question(
    service=..., jurisdiction=...,
    current_step=step_obj,
    relevant_sources=sources_for_this_step,
    question=user_question,
)
# result = {"answer": str, "confirmed": bool, "source_ids": list}
```

## IMPORTANT: OfficialSource.content field

**This is a flag for Person 4 (schemas owner).**

The `OfficialSource` class in `schemas/models.py` is currently missing
the `content: Optional[str]` field. This field is needed by Person 3
(extraction_service.py) to hold the scraped/retrieved text from each
official source, which is then fed to the LLM for extraction.

Person 2 (search_service) will retrieve this content and set it;
Person 3 (llm_service) reads it.

**Action required from Person 4:** Please add this field to `OfficialSource`
in `schemas/models.py`:

```python
content: Optional[str] = Field(
    None,
    description="Retrieved text content from the official source, "
                "used for LLM extraction. Set by search_service/source_filter.",
)
```

Until this is added, `extraction_service.py` uses `getattr(s, "content", None)`
defensively so it will not crash, but it will skip all sources (no content to
extract from), which means the LLM call will be skipped entirely.

## Environment variables used

| Variable | Default | Description |
|---|---|---|
| `GROQ_API_KEY` | (required) | Groq API key |
| `GROQ_MODEL` | `llama3-70b-8192` | Groq model to use |
| `GEMINI_API_KEY` | (required) | Gemini API key |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Gemini model to use |
| `LLM_TIMEOUT_SECONDS` | `20` | Timeout per LLM call |

## Dependencies added

```
groq
google-genai        # new Gemini SDK (not deprecated)
google-generativeai # fallback if google-genai not installed
python-dotenv
httpx
```

## Provider failover flow

```
Groq attempt 1
    |-- success --> return result
    |-- fail    --> retry
Groq attempt 2 (retry)
    |-- success --> return result
    |-- fail    --> fall back to Gemini

Gemini Flash
    |-- success --> return result
    |-- fail    --> raise LLMServiceUnavailable

Caller (orchestrator) catches LLMServiceUnavailable
    --> use stale Neo4j data
    --> use demo data
    --> show clear error
```
