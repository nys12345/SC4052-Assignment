from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import hashlib

app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Database Setup ---

def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            age INTEGER,
            gender TEXT,
            weight REAL,
            goal TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()


# --- Request Models ---

class SignUpRequest(BaseModel):
    username: str
    password: str
    age: int
    gender: str
    weight: float
    goal: str

class LoginRequest(BaseModel):
    username: str
    password: str

class AnalyzeRequest(BaseModel):
    meal: str


# --- Helper ---

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


# --- Routes ---

@app.get("/")
def root():
    return {"message": "Nutri-Tracker API is running"}

@app.post("/signup")
def signup(req: SignUpRequest):
    conn = get_db()

    # Check if username already exists
    existing = conn.execute("SELECT id FROM users WHERE username = ?", (req.username,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Username already taken")

    # Insert new user
    conn.execute(
        "INSERT INTO users (username, password, age, gender, weight, goal) VALUES (?, ?, ?, ?, ?, ?)",
        (req.username, hash_password(req.password), req.age, req.gender, req.weight, req.goal)
    )
    conn.commit()
    conn.close()

    return {"message": "Account created successfully"}

@app.post("/login")
def login(req: LoginRequest):
    conn = get_db()

    user = conn.execute(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        (req.username, hash_password(req.password))
    ).fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "age": user["age"],
            "gender": user["gender"],
            "weight": user["weight"],
            "goal": user["goal"]
        }
    }

@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    # Mock response for now - will replace with AI later
    return {
        "meal": req.meal,
        "calories": 550,
        "protein": 35,
        "carbs": 60,
        "fat": 18,
        "fiber": 8,
        "suggestions": [
            "Good protein content for muscle maintenance",
            "Consider adding more vegetables for micronutrients",
            "Balanced macro split for your goals"
        ]
    }