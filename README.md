# SchoolSmart LMS

A student portal MVP with dashboard, course details, calendar, and an in-app AI Study Helper.

## AI Helper setup (Gemini)

1. Copy `ibm-credentials.env.example` to `ibm-credentials.env`.
2. Add your `GEMINI_API_KEY` in `ibm-credentials.env`.
3. Keep or change `GEMINI_MODEL` as needed.

The top-right custom chat panel now calls `/api/study-helper`, which is backed by Gemini and supports:
- text questions
- image uploads
- document uploads (for supported mime types)

## Run the app

From project root:

```bash
npm install
npm start
```

Then open:

```text
http://127.0.0.1:3000
```

## Notes

- The left-side IBM embedded widget is still loaded by script in `index.html`.
- The custom AI Study Helper (top-right panel) is Gemini-backed.
