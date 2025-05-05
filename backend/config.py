# File: vibecoder/backend/config.py

# Your Together.ai API key for DeepSeek-R1-70B-free
DEEPSEEK_API_KEY = "tgp_v1_UaDAyciJU0EAQtyvwagpE6SzMpQzlVqISJHojc4nwwI"

# Together.ai chat completions endpoint
API_URL = "https://api.together.xyz/v1/chat/completions"

# The DeepSeek model identifier on Together
MODEL_NAME = "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free"

# == PROMPTS ==

# 1) Strict scaffold prompt: output ONLY a JSON array of {"type","path"} objects
SCAFFOLD_PROMPT = """
You are VibeCoder. When given a project spec (app_name, description, features),
you MUST respond with exactly one JSON array and nothing else.
Each array element is an object with two keys:
- type: either "directory" or "file"
- path: the relative path to that directory or file
Do NOT include markdown, ellipses, comments, or any extra text.
Example output:
[{"type":"directory","path":"vibecoder"},{"type":"file","path":"vibecoder/.env.example"}, ...]
"""

# 2) File prompt: output ONLY the raw file contents (no JSON, no commentary)
FILE_PROMPT = """
You are a code generator.  When asked for a file, output **only** the file’s raw source code.
Do **not** include any explanations, file headers, markdown fences (```), or extra text.
Requested file path: {path}
"""

