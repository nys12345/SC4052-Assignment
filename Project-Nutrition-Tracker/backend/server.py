from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import hashlib

app = FastAPI()

# Run with: uvicorn server:app --reload
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
    conn.execute("""
        CREATE TABLE IF NOT EXISTS meal_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            meal_name TEXT NOT NULL,
            calories INTEGER,
            protein REAL,
            carbs REAL,
            fat REAL,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
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
    user_id: int
    date: str

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
    # TODO: Replace with actual LLM call
    result = {
        "meal_name": req.meal,
        "calories": 550,
        "protein": 35.0,
        "carbs": 60.0,
        "fat": 18.0,
    }

    conn = get_db()
    conn.execute(
        "INSERT INTO meal_logs (user_id, date, meal_name, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (req.user_id, req.date, result["meal_name"], result["calories"], result["protein"], result["carbs"], result["fat"])
    )
    conn.commit()
    conn.close()

    return result

@app.get("/meals")
def get_meals(user_id: int, date: str):
    conn = get_db()
    meals = conn.execute(
        "SELECT * FROM meal_logs WHERE user_id = ? AND date = ?",
        (user_id, date)
    ).fetchall()
    conn.close()
    return [dict(m) for m in meals]

@app.get("/logged-days")
def get_logged_days(user_id: int):
    conn = get_db()
    rows = conn.execute(
        "SELECT DISTINCT date FROM meal_logs WHERE user_id = ?",
        (user_id,)
    ).fetchall()
    conn.close()
    return [row["date"] for row in rows]

@app.post("/mock")
def add_mock_data(user_id: int):
    from datetime import date, timedelta
    import random

    meals = [
        ("Nasi Lemak with Egg", 550, 18, 65, 24),
        ("Chicken Rice", 650, 35, 80, 15),
        ("Protein Shake", 200, 30, 10, 5),
        ("Mee Goreng", 480, 15, 60, 20),
        ("Grilled Salmon with Rice", 600, 40, 50, 22),
        ("Roti Prata with Curry", 450, 12, 55, 20),
        ("Caesar Salad", 350, 25, 15, 22),
        ("Banana Smoothie", 280, 8, 45, 8),
        ("Eggs on Toast", 320, 20, 30, 14),
        ("Laksa", 550, 22, 60, 25),
    ]

    conn = get_db()
    today = date.today()

    for days_ago in range(14):
        d = (today - timedelta(days=days_ago)).isoformat()
        num_meals = random.randint(2, 4)
        chosen = random.sample(meals, num_meals)
        for meal_name, cal, protein, carbs, fat in chosen:
            conn.execute(
                "INSERT INTO meal_logs (user_id, date, meal_name, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (user_id, d, meal_name, cal, protein, carbs, fat)
            )

    conn.commit()
    conn.close()
    return {"message": f"Mock data added for last 14 days"}

# --- Helper ---

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

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