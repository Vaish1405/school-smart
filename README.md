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
