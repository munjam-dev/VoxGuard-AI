# VoxGuard AI

VoxGuard is a local-first voice authenticity workspace and cinematic research landing page. The Vite frontend provides a lazy-loaded React Three Fiber voice core, scroll-led analysis story, upload and recording affordances, validation, progress, history, speaker enrollment states, model-mode labeling, and a typed API boundary. It does not invent confidence values when the model service is unavailable.

Routes include `/` (landing page), `/analyze` (upload and analysis workspace), `/history` (local history), and `/results/:id` (dashboard result surface).

## Run locally

```powershell
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`).

To run the FastAPI adapter in a second terminal:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Copy `.env.example` to `.env.local` and set `VITE_API_URL=http://localhost:8000/api` if you are not using the Vite `/api` proxy path. The included adapter validates WAV/FLAC payloads and returns an explicit “model unavailable” response until a trained artifact is installed.

For UI-only development, set `VITE_ENABLE_FIXTURE=true`. Fixture mode is deterministic metadata-only output, clearly labeled in the result dashboard, and intentionally has no confidence score.

## Checks

```powershell
npm run build
npm run lint
```
