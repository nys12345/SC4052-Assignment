from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import hashlib
import base64
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
# Top of server.py
client = None
try:
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        client = genai.Client(api_key=api_key)
except Exception as e:
    print(f"⚠️  Gemini client init failed: {e}")
    client = None

# change model here if needed
GEMINI_MODEL = "gemini-2.5-flash"

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


# Database Setup

def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()

    # user data
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

    # meal logs
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
            meal_type TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # food database
    conn.execute("""
        CREATE TABLE IF NOT EXISTS foods (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            calories INTEGER,
            protein REAL,
            carbs REAL,
            fat REAL
        )
    """)
    conn.commit()
    conn.close()

init_db()


# Request Models

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

class AnalyseRequest(BaseModel):
    query: str = ""
    image_base64: str = ""
    image_type: str = ""

class LogMealRequest(BaseModel):
    user_id: int
    date: str
    meal_name: str
    calories: int
    protein: float
    carbs: float
    fat: float
    meal_type: str = ""

class AddFoodRequest(BaseModel):
    name: str
    calories: float
    protein: float = 0
    carbs: float = 0
    fat: float = 0

class UpdateMealRequest(BaseModel):
    meal_name: str
    calories: float
    protein: float
    carbs: float
    fat: float
    meal_type: str = ""

# Routes

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

@app.post("/analyse")
def analyse(req: AnalyseRequest):
    import json

    prompt = """You are a nutrition estimator. Analyse the food and return ONLY a JSON object with no markdown, no explanation.

    Rules:
    - Estimate for one typical serving
    - calories must be an integer
    - protein, carbs, fat in grams rounded to 1 decimal
    - name should be concise

    {"name": "...", "calories": 0, "protein": 0.0, "carbs": 0.0, "fat": 0.0}"""

    if req.image_base64:
        import PIL.Image, io
        img_bytes = base64.b64decode(req.image_base64)
        img = PIL.Image.open(io.BytesIO(img_bytes))
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[prompt, img]
        )
    elif req.query:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=f"{prompt}\n\nFood: {req.query}"
        )
    else:
        raise HTTPException(status_code=400, detail="Provide a query or image")

    try:
        result = json.loads(response.text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")

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

@app.post("/log-meal")
def log_meal(req: LogMealRequest):
    conn = get_db()
    conn.execute(
        "INSERT INTO meal_logs (user_id, date, meal_name, calories, protein, carbs, fat, meal_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (req.user_id, req.date, req.meal_name, req.calories, req.protein, req.carbs, req.fat, req.meal_type)
    )
    conn.commit()
    conn.close()
    return {"message": "Meal logged"}

@app.post("/add-food")
def add_food(req: AddFoodRequest):
    conn = get_db()
    conn.execute(
        "INSERT INTO foods (name, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?)",
        (req.name, req.calories, req.protein, req.carbs, req.fat)
    )
    conn.commit()
    conn.close()
    return {"message": "Food saved"}

@app.put("/meals/{meal_id}")
def update_meal(meal_id: int, req: UpdateMealRequest):
    conn = get_db()
    conn.execute(
        "UPDATE meal_logs SET meal_name=?, calories=?, protein=?, carbs=?, fat=?, meal_type=? WHERE id=?",
        (req.meal_name, req.calories, req.protein, req.carbs, req.fat, req.meal_type, meal_id)
    )
    conn.commit()
    conn.close()
    return {"message": "Meal updated"}

@app.get("/foods/search")
def search_foods(q: str = ""):
    if not q.strip():
        return []
    conn = get_db()
    results = conn.execute(
        "SELECT * FROM foods WHERE name LIKE ? LIMIT 10",
        (f"%{q}%",)
    ).fetchall()
    conn.close()
    return [dict(r) for r in results]

@app.delete("/meals/{meal_id}")
def delete_meal(meal_id: int):
    conn = get_db()
    conn.execute("DELETE FROM meal_logs WHERE id = ?", (meal_id,))
    conn.commit()
    conn.close()
    return {"message": "Meal deleted"}

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
                "INSERT INTO meal_logs (user_id, date, meal_name, calories, protein, carbs, fat, meal_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (user_id, d, meal_name, cal, protein, carbs, fat, "")
            )

    conn.commit()
    conn.close()
    return {"message": f"Mock data added for last 14 days"}
    
@app.post("/seed-foods")
def seed_foods():
    foods = [
        ("Chicken Rice", 650, 35, 80, 15),
        ("Nasi Lemak with Egg", 550, 18, 65, 24),
        ("Roti Prata with Curry", 450, 12, 55, 20),
        ("Mee Goreng", 480, 15, 60, 20),
        ("Laksa", 550, 22, 60, 25),
        ("Grilled Salmon with Rice", 600, 40, 50, 22),
        ("Caesar Salad", 350, 25, 15, 22),
        ("Protein Shake", 200, 30, 10, 5),
        ("Banana Smoothie", 280, 8, 45, 8),
        ("Eggs on Toast", 320, 20, 30, 14),
        ("Nasi Padang", 750, 30, 85, 30),
        ("Chicken Breast (grilled)", 165, 31, 0, 3.6),
        ("White Rice (1 cup)", 206, 4.3, 45, 0.4),
        ("Fried Egg", 90, 6, 0.6, 7),
        ("Teh Tarik", 120, 3, 18, 4),
        ("Kopi O", 10, 0.3, 2, 0),
        ("Milo (1 cup)", 190, 6, 30, 5),
        ("Char Kway Teow", 600, 20, 65, 28),
        ("Yong Tau Foo (6 pcs)", 350, 22, 30, 14),
        ("Fish Ball Noodles", 400, 20, 55, 10),
        ("Satay (10 sticks)", 500, 35, 15, 34),
        ("Prata Egg", 350, 12, 40, 16),
        ("Chendol", 320, 3, 55, 10),
        ("Ice Kachang", 280, 4, 60, 3),
        ("Hokkien Mee", 550, 25, 60, 22),
    ]

    conn = get_db()
    existing = conn.execute("SELECT COUNT(*) FROM foods").fetchone()[0]
    if existing > 0:
        conn.close()
        return {"message": "Foods already seeded"}

    conn.executemany(
        "INSERT INTO foods (name, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?)",
        foods
    )
    conn.commit()
    conn.close()
    return {"message": f"Seeded {len(foods)} foods"}

# Helper Functions

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