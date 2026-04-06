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
            height REAL,
            weight REAL,
            activityLevel TEXT,
            goal TEXT,
            bmi REAL,
            bmr INTEGER,
            tdee INTEGER,
            dailyCalories INTEGER
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
    height: float
    weight: float
    activityLevel: str
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
    
    bmi = calculate_bmi(req.weight, req.height)
    bmr = calculate_bmr(req.weight, req.height, req.age, req.gender)
    tdee = calculate_tdee(bmr, req.activityLevel)
    daily_calories = calculate_calories(tdee, req.goal)

    # Insert new user into database
    conn.execute(
        "INSERT INTO users (username, password, age, gender, height, weight, activityLevel, goal, bmi, bmr, tdee, dailyCalories) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (req.username, hash_password(req.password), req.age, req.gender, req.height, req.weight, req.activityLevel, req.goal, bmi, bmr, tdee, daily_calories)
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
            "height": user["height"],
            "weight": user["weight"],
            "activityLevel": user["activityLevel"],
            "goal": user["goal"],
            "bmi": user["bmi"],
            "bmr": user["bmr"],
            "tdee": user["tdee"],
            "dailyCalories": user["dailyCalories"]
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

# Calculate BMI, BMR, and TDEE
def calculate_bmi(weight, height):
    height_m = height / 100
    return round(weight / (height_m ** 2), 1)

# BMR calculation using Mifflin-St Jeor Equation
def calculate_bmr(weight, height, age, gender):
    if gender == "male":
        return round(10 * weight + 6.25 * height - 5 * age + 5)
    elif gender == "female":
        return round(10 * weight + 6.25 * height - 5 * age - 161)
    else:
        male_bmr = 10 * weight + 6.25 * height - 5 * age + 5
        female_bmr = 10 * weight + 6.25 * height - 5 * age - 161
        return round((male_bmr + female_bmr) / 2)

def calculate_tdee(bmr, activity_level):
    multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "very_active": 1.725,
    }
    return round(bmr * multipliers.get(activity_level, 1.2))

def calculate_calories(tdee, goal):
    adjustments = {
        "lose_weight": -500,
        "maintain": 0,
        "gain_muscle": 300,
        "gain_weight": 500,
    }
    return round(tdee + adjustments.get(goal, 0))