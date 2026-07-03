# Estato AI — React Frontend

React + Vite + TypeScript frontend for the Grad1 real estate RAG search app.

## Setup

```bash
cd frontend
npm install        # or: pnpm install
npm run dev        # starts on http://localhost:5173
```

## Requirements

The FastAPI backend must be running before using the frontend:

```bash
# From the repo root
uvicorn backend.api:app --reload
# Runs on http://127.0.0.1:8000
```

Also set your Groq API key in a `.env` file at the repo root:

```
GROQ_API_KEY=your_key_here
```

## Features

- Natural language property search powered by FAISS + Llama 3.1
- AI-generated summary of results via Groq
- Property cards showing price (EGP), beds/baths/area, features, and description
- Suggestion chips for common queries
- Fully responsive layout
