# File: vibecoder/backend/deepseek_client.py

import requests
from .config import (
    DEEPSEEK_API_KEY,
    API_URL,
    MODEL_NAME,
    SCAFFOLD_PROMPT,
    FILE_PROMPT,
)

class DeepSeekClient:
    def __init__(self):
        self.api_key = DEEPSEEK_API_KEY
        self.url     = API_URL
        self.model   = MODEL_NAME

    def _chat(self, messages: list[dict]) -> str:
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type":  "application/json"
        }
        resp = requests.post(self.url, json=payload, headers=headers, timeout=60)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]

    def generate_scaffold(self, spec: dict) -> str:
        # system + user
        return self._chat([
            {"role": "system", "content": SCAFFOLD_PROMPT},
            {"role": "user",   "content": "\n".join([
                spec["app_name"],
                spec["description"],
                *spec["features"]
            ])}
        ])

    def generate_file(self, spec: dict, path: str) -> str:
        # include the path as part of the user message
        return self._chat([
            {"role": "system", "content": FILE_PROMPT},
            {"role": "user",   "content": "\n".join([
                spec["app_name"],
                spec["description"],
                *spec["features"],
                f"FILE_PATH: {path}"
            ])}
        ])
