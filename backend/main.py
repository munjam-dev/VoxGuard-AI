"""Small FastAPI adapter for the VoxGuard baseline model.

The service intentionally returns an unavailable result until a trained model is
provided. This keeps the UI honest: no fabricated confidence values are shown.
"""

from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="VoxGuard baseline API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_SUFFIXES = {".wav", ".flac"}
MAX_BYTES = 50 * 1024 * 1024


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model": "unavailable"}


@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)) -> dict:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_SUFFIXES:
        raise HTTPException(status_code=415, detail="Only WAV and FLAC files are supported.")
    contents = await file.read(MAX_BYTES + 1)
    if len(contents) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds the 50 MB limit.")

    # The adapter is real and validates/transports audio, but a model artifact
    # must be installed before making an authenticity claim.
    return {
        "fileName": file.filename,
        "status": "complete",
        "label": "Baseline model unavailable",
        "scoreLabel": "No confidence score",
        "metrics": [
            {"label": "Payload size", "value": f"{len(contents) // 1024:,} KB"},
            {"label": "Format", "value": suffix[1:].upper()},
            {"label": "Model output", "value": "Unavailable"},
        ],
        "note": "The API received and validated this recording. Add a trained baseline artifact to enable measurable authenticity output.",
    }
