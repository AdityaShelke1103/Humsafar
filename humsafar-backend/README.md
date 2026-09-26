# Humsafar Backend

AI-powered civic procedure navigator — backend service.

## Setup

```
pip install -r requirements.txt
copy .env.example .env      (Windows)
cp .env.example .env        (Mac/Linux)
```

Fill in your `.env` with real keys as they become available.

## Run

```
uvicorn api.main:app --reload
```

Visit `http://127.0.0.1:8000/docs` for the interactive API docs.

## File Ownership — DO NOT edit outside your own folder

| Folder / File | Owner | Notes |
|---|---|---|
| `neo4j_service/service.py` | Person 1 | Neo4j reads/writes, demo procedure seeding |
| `search_service/service.py` | Person 2 | Tavily / web search integration |
| `source_filter/filter.py` | Person 2 | Official-source filtering |
| `llm_service/provider.py` | Person 3 | Grok -> Gemini Flash provider abstraction, extraction, doubt assistant |
| `normalizer/normalizer.py` | Person 4 | Query -> service + jurisdiction |
| `validator/validator.py` | Person 4 | Procedure validation before storage |
| `orchestrator/orchestrator.py` | Person 4 | Wires the full pipeline together |
| `api/main.py` | Person 4 | FastAPI endpoints |
| `schemas/models.py` | Person 4 (shared) | The data contract. Propose changes, don't silently edit. |

**Rule:** only touch your own file(s). If you need a change to `schemas/models.py`
or the orchestrator, message Person 4 first — don't edit it directly.

## Workflow

1. Pull the repo.
2. Implement your function(s) in your own file, matching the existing signature.
3. Test your function standalone first (a quick scratch script calling it directly with fake input).
4. Once it works, run `uvicorn api.main:app --reload` and hit `/docs` to confirm
   it flows correctly through the full pipeline.
5. Commit and push. Do not force-push over someone else's branch.

## Architecture

```
API (FastAPI)
  -> Orchestrator
       -> Normalizer
       -> Neo4j Service (fresh procedure check)
       -> Search Service (if miss/stale)
       -> Source Filter
       -> LLM Provider (Grok -> Gemini Flash)
       -> Validator
       -> Neo4j Service (save)
  -> Roadmap response
```

See `schemas/models.py` for the full data contract (Procedure, Step,
OfficialSource, DocumentRequirement, request/response models).