# SchoolSmart LMS

A student portal demo with dashboard, course details, calendar, and an in-app AI Study Helper. Assignment data for **Chemistry Lab Foundations** is loaded from `records/assignments.json`.

## How to run the UI

The app is static HTML/CSS/JS. To use it (and to load `records/assignments.json`), you need to serve the project over **HTTP**, not open `index.html` as a file (`file://`). Here are simple ways to do it.

### Option 1: Node.js (npx)

From the project root:

```bash
npx --yes serve .
```

Then open **http://localhost:3000** in your browser (or the URL shown in the terminal).

### Option 2: Python 3

From the project root:

```bash
python -m http.server 8000
```

Then open **http://localhost:8000**.

### Option 3: VS Code / Cursor

If you have the **Live Server** extension, right‑click `index.html` → **Open with Live Server**. It will serve the folder and open the app in the browser.

---

After the app is running, open **Chemistry Lab Foundations** from the dashboard to see assignments and modules loaded from `records/assignments.json`. Other courses still use placeholder data.

## FastAPI backend for IBM Orchestrate

The frontend chat already calls `POST /api/study-helper`. You can now run a Python FastAPI backend that:

1. Serves the static UI
2. Proxies chat requests to IBM Orchestrate

### 1) Install Python dependencies

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-fastapi.txt
```

### 2) Configure `ibm-credentials.env`

Use these variables:

```env
IBM_ORCHESTRA_API_URL=https://api.au-syd.watson-orchestrate.cloud.ibm.com/instances/<instance-id>/v1/orchestrate/runs
IBM_ORCHESTRA_AGENT_ID=<agent-id>
IBM_ORCHESTRA_AGENT_ENV_ID=<optional-agent-env-id>
IBM_ORCHESTRA_ORCHESTRATION_ID=<optional-orchestration-id>

# Auth option A: direct bearer token
IBM_ORCHESTRA_BEARER_TOKEN=<bearer-token>

# Auth option B: IAM exchange (recommended for long-running local dev)
IBM_ORCHESTRA_USE_IAM=true
IBM_ORCHESTRA_API_KEY=<iam-api-key>
IBM_IAM_TOKEN_URL=https://iam.cloud.ibm.com/identity/token
```

Optional:

```env
IBM_ORCHESTRA_SIMULATE=false
IBM_ORCHESTRA_TIMEOUT_MS=30000
IBM_ORCHESTRA_STREAM=true
IBM_ORCHESTRA_STREAM_TIMEOUT=120000
IBM_ORCHESTRA_MULTIPLE_CONTENT=true
INCLUDE_PAGE_CONTEXT=true
MAX_CONTEXT_CHARS=12000
```

### 3) Run server

```bash
uvicorn server.fastapi_app:app --host 127.0.0.1 --port 8000 --reload
```

Open **http://127.0.0.1:8000**.

The chat window in your HTML will now send requests to FastAPI and receive IBM responses.
