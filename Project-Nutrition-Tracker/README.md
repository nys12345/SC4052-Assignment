# Nutri-Tracker — Local Setup Guide

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (3.11+)

## Backend Setup

1. `cd` into the `backend` folder
2. Install requirements:
```bash
   pip install -r requirements.txt
```
3. Create a `.env` file in the backend folder with:
   GEMINI_API_KEY=your_key_here

4. Run the server:
```bash
   uvicorn server:app --reload
```

The backend runs on `http://localhost:8000`.

### Getting a free Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an account and generate an API key
3. Check the **Rate Limits** tab to see which models are available on the free tier
4. This project uses **Gemini 2.5 Flash** by default
5. If a different model is available to you, update the model name in `server.py`:
```python
   # change model here if needed
   GEMINI_MODEL = "gemini-2.5-flash"
```

## Frontend Setup

In a **separate terminal**:

1. `cd` into the `frontend` folder
2. Install dependencies:
```bash
   npm install
```
3. Start the dev server:
```bash
   npm run dev
```

The frontend runs on `http://localhost:5173`.

## Extra Setup

### Seed the food library

Populates the food catalog used by the search function. Run **one** of the following:

**Option A — curl:**
```bash
curl -X POST http://localhost:8000/seed-foods
```

**Option B — Swagger UI:**
1. Open `http://localhost:8000/docs` in your browser
2. Find `POST /seed-foods`
3. Click **Try it out** → **Execute**

### Add mock data (optional)

`POST /mock?user_id=<your_user_id>` populates the past 14 days with sample meal logs for demo purposes.
