# File: vibecoder/backend/app.py

import logging
import re
import json
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .deepseek_client import DeepSeekClient

# — Setup logging —
logging.basicConfig(level=logging.INFO)

# — Initialize FastAPI and CORS —
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # tighten in prod
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# — Instantiate your LLM client wrapper —
client = DeepSeekClient()

# — Request schemas —
class Spec(BaseModel):
    app_name: str
    description: str
    features: list[str]

class FileReq(Spec):
    path: str

@app.get("/ping")
async def ping():
    return {"status": "ok"}

@app.post("/scaffold")
async def scaffold(spec: Spec = Body(...)):
    logging.info(f"POST /scaffold payload: {spec.json()}")

    # Directly pass the spec dict into your client
    raw = client.generate_scaffold(spec.dict())

    # Strip any fenced sections entirely
    cleaned = re.sub(r'```[\s\S]*?```', '', raw, flags=re.DOTALL).strip()

    # Extract the JSON array describing the tree
    m = re.search(r'(\[.*\])', cleaned, flags=re.DOTALL)
    if not m:
        logging.error("Invalid scaffold format:\n" + cleaned)
        raise HTTPException(500, "Invalid scaffold format from model")
    try:
        tree = json.loads(m.group(1))
    except json.JSONDecodeError as e:
        logging.error("JSON parse error:\n" + str(e))
        raise HTTPException(500, f"JSON parse error: {e}")

    return {"tree": tree}

@app.post("/file")
async def file(request: FileReq = Body(...)):
    logging.info(f"POST /file payload: {request.json()}")

    # Directly ask for this file
    raw = client.generate_file(request.dict(), request.path)

    # Remove any stray <think>…</think> blocks
    code = re.sub(r'<think>[\s\S]*?<\/think>', '', raw, flags=re.DOTALL)

    # Remove any leading/trailing fenced lines
    code = re.sub(r'```[a-zA-Z]*\n?', '', code, flags=re.MULTILINE).strip()

    return {"code": code}
