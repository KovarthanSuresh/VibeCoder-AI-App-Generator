# File: vibecoder/Makefile
# ------------------------
.PHONY: install run-backend run-frontend run

install:
	pip install -r backend/requirements.txt
	cd frontend && npm install

run-backend:
	uvicorn backend.app:app --reload --port 8001

run-frontend:
	cd frontend && npm run dev

run: install run-backend run-frontend
