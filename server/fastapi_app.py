from __future__ import annotations

import os
import json
import re
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel


ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / "ibm-credentials.env", override=True)

app = FastAPI(title="SchoolSmart FastAPI Backend", version="1.0.0")

cors_origins = os.getenv("CORS_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in cors_origins.split(",")] if cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StudyHelperRequest(BaseModel):
    question: str
    pageContext: str | None = None
    currentView: str | None = None


IBM_ORCHESTRA_API_URL = os.getenv(
    "IBM_ORCHESTRA_API_URL",
    "https://api.au-syd.watson-orchestrate.cloud.ibm.com/instances/"
    "e7380f9b-2bfd-4aa2-b4d8-0e9382c8c76d/v1/orchestrate/runs",
)
IBM_ORCHESTRA_AGENT_ID = os.getenv("IBM_ORCHESTRA_AGENT_ID", "").strip()
IBM_ORCHESTRA_AGENT_ENV_ID = os.getenv("IBM_ORCHESTRA_AGENT_ENV_ID", "").strip()
IBM_ORCHESTRA_ORCHESTRATION_ID = os.getenv("IBM_ORCHESTRA_ORCHESTRATION_ID", "").strip()
IBM_ORCHESTRA_API_KEY = (
    os.getenv("IBM_ORCHESTRA_API_KEY")
    or os.getenv("ORCHESTRATE_APIKEY")
    or os.getenv("ORCHESTRATE_IAM_APIKEY")
    or os.getenv("IBM_IAM_API_KEY")
    or ""
).strip()
IBM_ORCHESTRA_BEARER_TOKEN = (os.getenv("IBM_ORCHESTRA_BEARER_TOKEN") or "").strip()
IBM_ORCHESTRA_TIMEOUT_MS = int(os.getenv("IBM_ORCHESTRA_TIMEOUT_MS", "30000"))
IBM_ORCHESTRA_SIMULATE = os.getenv("IBM_ORCHESTRA_SIMULATE", "false").lower() == "true"
IBM_ORCHESTRA_USE_IAM = os.getenv("IBM_ORCHESTRA_USE_IAM", "false").lower() == "true"
IBM_IAM_TOKEN_URL = os.getenv("IBM_IAM_TOKEN_URL", "https://iam.cloud.ibm.com/identity/token")
INCLUDE_PAGE_CONTEXT = os.getenv("INCLUDE_PAGE_CONTEXT", "true").lower() == "true"
MAX_CONTEXT_CHARS = int(os.getenv("MAX_CONTEXT_CHARS", "12000"))
IBM_ORCHESTRA_STREAM = os.getenv("IBM_ORCHESTRA_STREAM", "true").lower() == "true"
IBM_ORCHESTRA_STREAM_TIMEOUT = os.getenv("IBM_ORCHESTRA_STREAM_TIMEOUT", "120000")
IBM_ORCHESTRA_MULTIPLE_CONTENT = os.getenv("IBM_ORCHESTRA_MULTIPLE_CONTENT", "true")

_cached_iam_token: str = ""
_cached_iam_expiry_epoch: float = 0.0


def _extract_first_text(value: Any) -> str:
    if isinstance(value, str):
        text = value.strip()
        return text

    if isinstance(value, dict):
        # Skip obvious metadata-only payloads.
        metadata_keys = {
            "id",
            "message_id",
            "run_id",
            "event_id",
            "created_at",
            "updated_at",
            "event",
            "type",
            "status",
            "timestamp",
        }
        if value.keys() and all(k in metadata_keys for k in value.keys()):
            return ""

        direct_keys = [
            "answer",
            "response",
            "output_text",
            "text",
            "content",
            "message",
            "delta",
            "partial_response",
        ]
        for key in direct_keys:
            if key in value:
                extracted = _extract_first_text(value[key])
                if extracted:
                    return extracted
        for k, nested in value.items():
            if k in metadata_keys:
                continue
            extracted = _extract_first_text(nested)
            if extracted:
                return extracted

    if isinstance(value, list):
        for item in value:
            extracted = _extract_first_text(item)
            if extracted:
                return extracted

    return ""


def _query_has_key(url: str, key: str) -> bool:
    return key in parse_qs(urlparse(url).query)


def _extract_text_from_stream_body(raw_text: str) -> str:
    """
    IBM streaming can arrive as SSE ('data: ...') or line-delimited JSON.
    This normalizes chunks and extracts the best text found.
    """
    candidates: list[str] = []
    control_tokens = {
        "run.started",
        "message.started",
        "run.step.intermediate",
        "message.delta",
        "message.created",
        "message.completed",
        "run.completed",
        "done",
    }

    id_like_pattern = re.compile(r"^\d{10,}-\d+$")

    for raw_line in raw_text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if line.startswith("event:"):
            continue
        if line.startswith("id:"):
            continue
        if line.startswith("retry:"):
            continue
        if line.startswith(":"):
            continue
        if id_like_pattern.match(line):
            continue

        payload_line = line
        if line.startswith("data:"):
            payload_line = line[5:].strip()
            if not payload_line or payload_line == "[DONE]":
                continue
            if payload_line.startswith("id:"):
                continue
            if id_like_pattern.match(payload_line):
                continue

        # Try JSON chunk first
        try:
            chunk_obj = json.loads(payload_line)
            extracted = _extract_first_text(chunk_obj)
            if extracted:
                candidates.append(extracted)
            continue
        except Exception:  # noqa: BLE001
            pass

        # Fallback to raw text chunk
        lowered = payload_line.strip().lower()
        if lowered and lowered not in control_tokens:
            candidates.append(payload_line)

    # Keep order but remove exact duplicates
    deduped: list[str] = []
    seen: set[str] = set()
    for item in candidates:
        clean = item.strip()
        clean_lower = clean.lower()
        if clean and clean_lower not in control_tokens and clean not in seen:
            deduped.append(clean)
            seen.add(clean)

    return "\n".join(deduped).strip()


def _clean_agent_answer(answer: str) -> str:
    text = (answer or "").strip()
    if not text:
        return ""

    # Remove UUID-like and id-like tokens that leak from stream metadata.
    text = re.sub(r"\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b", " ", text, flags=re.I)
    text = re.sub(r"\b\d{10,}-\d+\b", " ", text)

    # Remove orchestration status phrases.
    noise_phrases = [
        "The agent is processing your request…",
        "The agent is processing your request...",
        "Thinking this through…",
        "Thinking this through...",
    ]
    for phrase in noise_phrases:
        text = text.replace(phrase, " ")

    # Normalize broken punctuation spacing from streamed tokenization.
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    text = re.sub(r"([(\[])\s+", r"\1", text)
    text = re.sub(r"\s+([)\]])", r"\1", text)
    text = re.sub(r"\s+'\s*", "'", text)
    text = re.sub(r"\s{2,}", " ", text).strip()

    # Normalize markdown bold fragments: "** Chem istry **" -> "**Chem istry**"
    text = re.sub(r"\*\*\s*([^*]+?)\s*\*\*", lambda m: f"**{m.group(1).strip()}**", text)

    # Sentence-level de-duplication while preserving order.
    sentence_split = re.split(r"(?<=[.!?])\s+", text)
    seen: set[str] = set()
    cleaned_sentences: list[str] = []
    for sentence in sentence_split:
        s = sentence.strip()
        if not s:
            continue
        key = re.sub(r"[^a-z0-9]+", "", s.lower())
        if not key or key in seen:
            continue
        seen.add(key)
        cleaned_sentences.append(s)

    cleaned = " ".join(cleaned_sentences).strip()
    return cleaned or text


async def _get_iam_token() -> str:
    # IBM IAM tokens are short-lived; this simple cache avoids frequent token calls.
    import time

    global _cached_iam_token, _cached_iam_expiry_epoch
    now = time.time()
    if _cached_iam_token and (_cached_iam_expiry_epoch - now) > 60:
        return _cached_iam_token

    if not IBM_ORCHESTRA_API_KEY:
        raise HTTPException(status_code=500, detail="Missing IBM_ORCHESTRA_API_KEY for IAM token exchange.")

    body = {
        "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
        "apikey": IBM_ORCHESTRA_API_KEY,
    }
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
    }
    timeout_sec = IBM_ORCHESTRA_TIMEOUT_MS / 1000
    async with httpx.AsyncClient(timeout=timeout_sec) as client:
        response = await client.post(IBM_IAM_TOKEN_URL, data=body, headers=headers)

    data = response.json() if response.content else {}
    if response.status_code >= 400 or not data.get("access_token"):
        raise HTTPException(status_code=502, detail=f"IAM token request failed: {data}")

    expires_in = int(data.get("expires_in", 3600))
    _cached_iam_token = str(data["access_token"])
    _cached_iam_expiry_epoch = now + expires_in
    return _cached_iam_token


def _build_message_content(question: str, page_context: str | None, current_view: str | None) -> str:
    if not INCLUDE_PAGE_CONTEXT or not page_context:
        return question

    context = page_context[:MAX_CONTEXT_CHARS].strip()
    view = (current_view or "unknown view").strip()
    return (
        f"{question}\n\n"
        "[HIDDEN_CONTEXT_FOR_AGENT_ONLY]\n"
        f"Current LMS view: {view}\n"
        "Use this LMS page context to answer accurately:\n"
        f"{context}"
    )


@app.post("/api/study-helper")
async def study_helper(payload: StudyHelperRequest) -> JSONResponse:
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Missing 'question'.")

    if IBM_ORCHESTRA_SIMULATE:
        snippet = (payload.pageContext or "").replace("\n", " ").strip()[:180]
        return JSONResponse(
            {
                "answer": (
                    f"Simulated IBM response: You asked '{question}'. "
                    f"Context snippet: '{snippet or 'no page context'}'."
                )
            }
        )

    if not IBM_ORCHESTRA_API_URL:
        raise HTTPException(status_code=500, detail="Missing IBM_ORCHESTRA_API_URL.")

    if not IBM_ORCHESTRA_AGENT_ID:
        raise HTTPException(status_code=500, detail="Missing IBM_ORCHESTRA_AGENT_ID.")

    use_iam = IBM_ORCHESTRA_USE_IAM or not IBM_ORCHESTRA_BEARER_TOKEN
    bearer_token = ""
    if use_iam:
        bearer_token = await _get_iam_token()
    else:
        bearer_token = IBM_ORCHESTRA_BEARER_TOKEN

    ibm_payload: dict[str, Any] = {
        "message": {
            "role": "user",
            "content": _build_message_content(question, payload.pageContext, payload.currentView),
        },
        "agent_id": IBM_ORCHESTRA_AGENT_ID,
    }
    if IBM_ORCHESTRA_AGENT_ENV_ID:
        ibm_payload["agent_environment_id"] = IBM_ORCHESTRA_AGENT_ENV_ID
    if IBM_ORCHESTRA_ORCHESTRATION_ID:
        ibm_payload["orchestration_id"] = IBM_ORCHESTRA_ORCHESTRATION_ID

    headers = {
        "Authorization": f"Bearer {bearer_token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    if IBM_ORCHESTRA_API_KEY:
        headers["IAM-API_KEY"] = IBM_ORCHESTRA_API_KEY

    timeout_sec = IBM_ORCHESTRA_TIMEOUT_MS / 1000
    request_params: dict[str, str] = {}
    if not _query_has_key(IBM_ORCHESTRA_API_URL, "stream"):
        request_params["stream"] = "true" if IBM_ORCHESTRA_STREAM else "false"
    if not _query_has_key(IBM_ORCHESTRA_API_URL, "stream_timeout"):
        request_params["stream_timeout"] = IBM_ORCHESTRA_STREAM_TIMEOUT
    if not _query_has_key(IBM_ORCHESTRA_API_URL, "multiple_content"):
        request_params["multiple_content"] = IBM_ORCHESTRA_MULTIPLE_CONTENT

    try:
        async with httpx.AsyncClient(timeout=timeout_sec) as client:
            response = await client.post(
                IBM_ORCHESTRA_API_URL,
                params=request_params or None,
                json=ibm_payload,
                headers=headers,
            )
            # If direct bearer was stale/invalid, retry once with fresh IAM token.
            if response.status_code == 401 and not use_iam and IBM_ORCHESTRA_API_KEY:
                fresh_token = await _get_iam_token()
                retry_headers = dict(headers)
                retry_headers["Authorization"] = f"Bearer {fresh_token}"
                response = await client.post(
                    IBM_ORCHESTRA_API_URL,
                    params=request_params or None,
                    json=ibm_payload,
                    headers=retry_headers,
                )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Unable to reach IBM Orchestra API: {exc}") from exc

    data: Any
    try:
        content_type = (response.headers.get("content-type") or "").lower()
        if "text/event-stream" in content_type:
            raw_stream = response.text or ""
            stream_answer = _extract_text_from_stream_body(raw_stream)
            data = {"answer": stream_answer, "raw_stream": raw_stream}
        else:
            data = response.json() if response.content else {}
    except Exception:  # noqa: BLE001
        data = {"raw": response.text}

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail={"error": "IBM request failed", "details": data})

    answer = _extract_first_text(data)
    if not answer:
        raise HTTPException(status_code=502, detail={"error": "No answer text in IBM response", "raw": data})

    return JSONResponse({"answer": _clean_agent_answer(answer)})


@app.get("/health")
async def health() -> dict[str, bool]:
    return {"ok": True}


app.mount("/", StaticFiles(directory=str(ROOT_DIR), html=True), name="static")
