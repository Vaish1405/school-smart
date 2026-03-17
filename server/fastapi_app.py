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
# Load local env files for dev convenience.
# Precedence: `.env` then `ibm-credentials.env` (both optional).
load_dotenv(ROOT_DIR / ".env", override=True)
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


class TutorSessionRequest(BaseModel):
    courseKey: str
    studentId: str | None = None
    keyword: str | None = None


class FollowUpGenerateRequest(BaseModel):
    courseKey: str
    studentId: str


class QuizAttemptRequest(BaseModel):
    studentId: str
    courseKey: str
    track: str | None = None
    sessionId: str | None = None
    quizTitle: str | None = None
    questionId: str | None = None
    prompt: str | None = None
    selectedChoiceIndex: int | None = None
    correctChoiceIndex: int | None = None
    isCorrect: bool | None = None
    explanation: str | None = None
    createdAt: str | None = None


RECORDS_DIR = ROOT_DIR / "records"


def _read_json(path: Path) -> Any:
    try:
        if not path.exists():
            return None
        raw = path.read_text(encoding="utf-8")
        return json.loads(raw) if raw.strip() else None
    except Exception:  # noqa: BLE001
        return None


def _read_json_array(path: Path) -> list[Any]:
    data = _read_json(path)
    return data if isinstance(data, list) else []


def _read_json_object(path: Path) -> dict[str, Any]:
    data = _read_json(path)
    return data if isinstance(data, dict) else {}


def _write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")


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


def _safe_json_from_text(text: str) -> dict[str, Any] | None:
    raw = (text or "").strip()
    if not raw:
        return None
    try:
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, dict) else None
    except Exception:  # noqa: BLE001
        pass

    # Fallback: find the first valid JSON object embedded in the text.
    # Many LLMs prepend non-JSON text and then include the required JSON object.
    start = raw.find("{")
    if start < 0:
        return None

    decoder = json.JSONDecoder()
    for idx in range(start, min(len(raw), start + 20000)):
        if raw[idx] != "{":
            continue
        try:
            obj, _end = decoder.raw_decode(raw[idx:])
            return obj if isinstance(obj, dict) else None
        except Exception:  # noqa: BLE001
            continue

    return None


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


@app.post("/api/tutor-session")
async def tutor_session(payload: TutorSessionRequest) -> JSONResponse:
    course_key = (payload.courseKey or "").strip()
    if not course_key:
        raise HTTPException(status_code=400, detail="Missing 'courseKey'.")

    student_id = (payload.studentId or "").strip() or None
    keyword = (payload.keyword or "").strip() or "TUTOR_STUDIO_REVIEW"

    # Demo mapping (courseKey -> classId). Expand if you add more record-backed courses.
    course_key_to_class_id = {"chemistry": "c1"}
    class_id = course_key_to_class_id.get(course_key, course_key)

    # IMPORTANT: Per requirement, only send Orchestrate these three fields:
    # courseKey, studentId, keyword. Do not include records context.
    cls = None

    session_schema = {
        "sessionId": "string",
        "courseKey": "string",
        "classId": "string",
        "generatedAt": "ISO-8601 string",
        "practice": {
            "title": "string",
            "summary": "string",
            "studyGuide": {
                "title": "string",
                "markdown": "string",
            },
            "quiz": {
                "title": "string",
                "questions": [
                    {
                        "id": "string",
                        "prompt": "string",
                        "choices": ["string"],
                        "correctChoiceIndex": "number",
                        "explanation": "string",
                    }
                ],
            },
            "chatPrompt": "string",
        },
        "sharpen": {
            "title": "string",
            "summary": "string",
            "quiz": {
                "title": "string",
                "questions": [
                    {
                        "id": "string",
                        "prompt": "string",
                        "choices": ["string"],
                        "correctChoiceIndex": "number",
                        "explanation": "string",
                    }
                ],
            },
            "chatPrompt": "string",
        },
    }

    # IMPORTANT: Per requirement, keep the message minimal.
    # The Orchestrate-side agent should route by keyword and enforce the JSON schema.
    question = f"{keyword}: Generate Tutor Studio review for {course_key} for {student_id or ''}."

    if IBM_ORCHESTRA_SIMULATE:
        mock = {
            "sessionId": f"sess_{__import__('time').time_ns()}",
            "courseKey": course_key,
            "classId": class_id,
            "generatedAt": __import__("datetime").datetime.utcnow().isoformat() + "Z",
            "practice": {
                "title": "Practice (build back the basics)",
                "summary": "Review weak topics from completed work so far and check understanding with a short quiz.",
                "studyGuide": {
                    "title": "Practice Study Guide",
                    "markdown": "## Focus today\\n- Significant figures\\n- Unit conversion\\n\\n## Quick reminders\\n- Track units at every step\\n- Round at the end\\n",
                },
                "quiz": {
                    "title": "Practice Quiz (5 questions)",
                    "questions": [
                        {
                            "id": "p1",
                            "prompt": "How many significant figures are in 0.00450?",
                            "choices": ["2", "3", "4", "5"],
                            "correctChoiceIndex": 1,
                            "explanation": "Leading zeros are not significant; 4, 5, and the trailing 0 after 5 are significant -> 3.",
                        },
                        {
                            "id": "p2",
                            "prompt": "Which unit conversion is correct for 3.0 m = ? cm",
                            "choices": ["300 cm", "30 cm", "0.30 cm", "3000 cm"],
                            "correctChoiceIndex": 0,
                            "explanation": "1 m = 100 cm so 3.0 m = 300 cm.",
                        },
                        {
                            "id": "p3",
                            "prompt": "When should you round in a multi-step calculation?",
                            "choices": ["After every step", "Only at the end", "Never", "Only at the start"],
                            "correctChoiceIndex": 1,
                            "explanation": "Keep guard digits and round only at the end to avoid compounding error.",
                        },
                        {
                            "id": "p4",
                            "prompt": "Scientific notation for 0.00072 is:",
                            "choices": ["7.2×10^-4", "7.2×10^-3", "72×10^-5", "0.72×10^-3"],
                            "correctChoiceIndex": 0,
                            "explanation": "Move the decimal 4 places right -> exponent -4.",
                        },
                        {
                            "id": "p5",
                            "prompt": "Accuracy means:",
                            "choices": ["Close to the true value", "Repeatable results", "Many measurements", "Using more decimals"],
                            "correctChoiceIndex": 0,
                            "explanation": "Accuracy is closeness to the true value; precision is repeatability.",
                        },
                    ],
                },
                "chatPrompt": f"You are my tutor. Start the PRACTICE track for {course_key}. Use the study guide and then quiz me. Give feedback and short explanations.",
            },
            "sharpen": {
                "title": "Sharpen (push your strengths)",
                "summary": "Tackle slightly harder questions in topics you already do well to build speed and confidence.",
                "quiz": {
                    "title": "Sharpen Quiz (5 questions)",
                    "questions": [
                        {
                            "id": "s1",
                            "prompt": "A value is recorded as 12.30 g. How many significant figures?",
                            "choices": ["2", "3", "4", "5"],
                            "correctChoiceIndex": 2,
                            "explanation": "All digits including trailing zeros after a decimal are significant -> 4.",
                        },
                        {
                            "id": "s2",
                            "prompt": "Convert 2.50×10^3 mg to g.",
                            "choices": ["2.50 g", "0.250 g", "250 g", "0.00250 g"],
                            "correctChoiceIndex": 0,
                            "explanation": "1000 mg = 1 g, so 2500 mg = 2.50 g.",
                        },
                        {
                            "id": "s3",
                            "prompt": "Which rounding keeps correct sig figs for 3.456×10^2 (3 sig figs)?",
                            "choices": ["3.45×10^2", "3.46×10^2", "3.5×10^2", "3.456×10^2"],
                            "correctChoiceIndex": 1,
                            "explanation": "3 sig figs -> 3.46×10^2.",
                        },
                        {
                            "id": "s4",
                            "prompt": "If a measurement tool reads to 0.01, what does that imply about uncertainty (roughly)?",
                            "choices": ["±0.01", "±0.005", "±0.1", "±1"],
                            "correctChoiceIndex": 1,
                            "explanation": "A common estimate is half the smallest division -> ±0.005.",
                        },
                        {
                            "id": "s5",
                            "prompt": "Which is most likely to improve precision?",
                            "choices": ["Calibrating the scale", "Repeating trials consistently", "Changing the true value", "Rounding earlier"],
                            "correctChoiceIndex": 1,
                            "explanation": "Precision improves with consistent repeatable measurement/trials.",
                        },
                    ],
                },
                "chatPrompt": f"You are my tutor. Start the SHARPEN track for {course_key}. Ask me harder multiple-choice questions and explain mistakes.",
            },
        }
        return JSONResponse(mock)

    if not IBM_ORCHESTRA_API_URL:
        raise HTTPException(status_code=500, detail="Missing IBM_ORCHESTRA_API_URL.")
    if not IBM_ORCHESTRA_AGENT_ID:
        raise HTTPException(status_code=500, detail="Missing IBM_ORCHESTRA_AGENT_ID.")

    use_iam = IBM_ORCHESTRA_USE_IAM or not IBM_ORCHESTRA_BEARER_TOKEN
    bearer_token = await _get_iam_token() if use_iam else IBM_ORCHESTRA_BEARER_TOKEN

    ibm_payload: dict[str, Any] = {
        "message": {
            "role": "user",
            "content": _build_message_content(question, None, "tutor-session"),
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
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Unable to reach IBM Orchestra API: {exc}") from exc

    try:
        content_type = (response.headers.get("content-type") or "").lower()
        if "text/event-stream" in content_type:
            raw_stream = response.text or ""
            stream_answer = _extract_text_from_stream_body(raw_stream)
            data: Any = {"answer": stream_answer, "raw_stream": raw_stream}
        else:
            data = response.json() if response.content else {}
    except Exception:  # noqa: BLE001
        data = {"raw": response.text}

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail={"error": "IBM request failed", "details": data})

    answer_text = _extract_first_text(data)
    if not answer_text:
        raise HTTPException(status_code=502, detail={"error": "No answer text in IBM response", "raw": data})

    parsed = _safe_json_from_text(answer_text)
    if not parsed:
        raise HTTPException(
            status_code=502,
            detail={
                "error": "Orchestrate did not return valid JSON for tutor session.",
                "expectedShape": session_schema,
                "rawText": _clean_agent_answer(answer_text),
            },
        )

    parsed.setdefault("sessionId", f"sess_{__import__('time').time_ns()}")
    parsed.setdefault("courseKey", course_key)
    parsed.setdefault("classId", class_id)
    return JSONResponse(parsed)


@app.get("/api/follow-ups")
async def list_followups(courseKey: str, studentId: str) -> JSONResponse:
    course_key = (courseKey or "").strip()
    student_id = (studentId or "").strip()
    if not course_key or not student_id:
        raise HTTPException(status_code=400, detail="Missing courseKey or studentId.")

    path = RECORDS_DIR / "follow_up_assignments.json"
    items = _read_json_array(path)
    filtered = [
        x
        for x in items
        if isinstance(x, dict)
        and str(x.get("courseKey") or "") == course_key
        and str(x.get("studentId") or "") == student_id
    ]
    return JSONResponse({"items": filtered})


@app.post("/api/follow-ups/generate")
async def generate_followup(payload: FollowUpGenerateRequest) -> JSONResponse:
    course_key = (payload.courseKey or "").strip()
    student_id = (payload.studentId or "").strip()
    if not course_key or not student_id:
        raise HTTPException(status_code=400, detail="Missing courseKey or studentId.")

    course_key_to_class_id = {"chemistry": "c1"}
    class_id = course_key_to_class_id.get(course_key, course_key)

    assignments = _read_json_array(RECORDS_DIR / "assignments.json")
    grades = _read_json_array(RECORDS_DIR / "assignment_grades.json")
    templates = _read_json_object(RECORDS_DIR / "review_templates.json").get(course_key, [])

    # Determine weakest scored assignment for this student in this class.
    class_assignments = {a.get("id"): a for a in assignments if isinstance(a, dict) and a.get("classId") == class_id}
    student_grades = [
        g
        for g in grades
        if isinstance(g, dict)
        and g.get("studentId") == student_id
        and g.get("assignmentId") in class_assignments
    ]
    if not student_grades:
        raise HTTPException(status_code=404, detail="No assignment grades found for this student/course.")

    def pct(g: dict[str, Any]) -> float:
        a = class_assignments.get(g.get("assignmentId"))
        possible = float(a.get("pointsPossible") or 0) if isinstance(a, dict) else 0.0
        earned = float(g.get("earnedPoints") or 0)
        return (earned / possible) if possible > 0 else 1.0

    weakest = sorted(student_grades, key=pct)[0]
    source_assignment = class_assignments.get(weakest.get("assignmentId")) or {}

    # Avoid generating duplicates for same source assignment.
    store_path = RECORDS_DIR / "follow_up_assignments.json"
    existing = _read_json_array(store_path)
    for item in existing:
        if (
            isinstance(item, dict)
            and item.get("studentId") == student_id
            and item.get("courseKey") == course_key
            and item.get("sourceAssignmentId") == source_assignment.get("id")
        ):
            return JSONResponse(item)

    # Build a small quiz from templates (no Orchestrate required).
    tmpl_list = [t for t in templates if isinstance(t, dict)]
    distractors = [str(t.get("idealAnswer") or "") for t in tmpl_list if str(t.get("idealAnswer") or "").strip()]

    questions: list[dict[str, Any]] = []
    for idx, t in enumerate(tmpl_list[:5]):
        ideal = str(t.get("idealAnswer") or "").strip()
        misconception = str(t.get("misconception") or "").strip()
        expl = str(t.get("explanation") or "").strip()
        prompt = str(t.get("prompt") or "").strip()
        if not prompt or not ideal:
            continue
        other = [d for d in distractors if d and d != ideal][:2]
        choices = [ideal, misconception, *other]
        # De-dup + cap at 4 choices
        uniq: list[str] = []
        for c in choices:
            c = (c or "").strip()
            if c and c not in uniq:
                uniq.append(c)
        uniq = uniq[:4]
        if ideal not in uniq:
            uniq = [ideal, *uniq][:4]
        correct_idx = uniq.index(ideal)
        questions.append(
            {
                "id": f"fu_{source_assignment.get('id','a')}_{idx+1}",
                "prompt": prompt,
                "choices": uniq,
                "correctChoiceIndex": correct_idx,
                "explanation": expl or "",
            }
        )

    import datetime as _dt

    today = _dt.datetime.utcnow().date()
    due_date = (today + _dt.timedelta(days=3)).isoformat()
    title_bits = [str(source_assignment.get("title") or "Follow-up").strip()]
    desc = str(source_assignment.get("description") or "").strip()
    topics: list[str] = []
    # Heuristic topics from assignment title keywords.
    low = " ".join(title_bits).lower()
    for key in ["significant", "measurement", "unit", "acid", "base", "titration", "stoichiometry", "safety", "notebook"]:
        if key in low and key not in topics:
            topics.append(key)
    topics = topics[:3]
    topic_str = ", ".join([t.title() if t != "unit" else "Unit conversions" for t in topics]) if topics else "targeted review"

    followup = {
        "id": f"fu_{__import__('time').time_ns()}",
        "studentId": student_id,
        "courseKey": course_key,
        "classId": class_id,
        "createdAt": _dt.datetime.utcnow().isoformat() + "Z",
        "dueDate": due_date,
        "sourceAssignmentId": source_assignment.get("id"),
        "sourceAssignmentTitle": source_assignment.get("title"),
        "title": f"Follow-up: {source_assignment.get('title') or 'Practice'} ({topic_str})",
        "summary": f"Based on performance in {source_assignment.get('title') or 'recent work'}, complete this quick follow-up before {due_date}.",
        "studyGuide": {
            "title": f"{source_assignment.get('title') or course_key}: quick refresher",
            "markdown": (
                f"## Follow-up focus: {topic_str}\n\n"
                f"**Source:** {source_assignment.get('title') or ''}\n\n"
                f"{desc}\n\n"
                "### What to do\n"
                "- Review the key idea(s)\n"
                "- Take the short quiz\n"
                "- Re-attempt one similar problem and explain your steps\n"
            ),
        },
        "quiz": {"title": "Follow-up Quiz", "questions": questions},
        "status": "assigned",
    }

    existing.append(followup)
    _write_json(store_path, existing)
    return JSONResponse(followup)


@app.post("/api/quiz-attempts")
async def record_quiz_attempt(payload: QuizAttemptRequest) -> JSONResponse:
    student_id = (payload.studentId or "").strip()
    course_key = (payload.courseKey or "").strip()
    if not student_id or not course_key:
        raise HTTPException(status_code=400, detail="Missing studentId or courseKey.")

    import datetime as _dt

    attempt = payload.model_dump()
    attempt["studentId"] = student_id
    attempt["courseKey"] = course_key
    attempt.setdefault("createdAt", _dt.datetime.utcnow().isoformat() + "Z")
    attempt.setdefault("id", f"qa_{__import__('time').time_ns()}")

    path = RECORDS_DIR / "quiz_attempts.json"
    items = _read_json_array(path)
    items.append(attempt)
    _write_json(path, items)
    return JSONResponse({"ok": True, "id": attempt["id"]})


@app.get("/health")
async def health() -> dict[str, bool]:
    return {"ok": True}


app.mount("/", StaticFiles(directory=str(ROOT_DIR), html=True), name="static")
