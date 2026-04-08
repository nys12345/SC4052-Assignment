import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API";
import Sidebar from "../components/Sidebar";
import DailyNutritionTab from "../components/DailyNutritionTab";
import MealLog from "../components/MealLog";

// ── Main Dashboard ─────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const getLocalDate = (date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDate());

  const [meals, setMeals] = useState([]);
  const [loggedDays, setLoggedDays] = useState([]);

  const consumed = meals.reduce(
    (totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein: totals.protein + meal.protein,
      carbs: totals.carbs + meal.carbs,
      fat: totals.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(stored));
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    API.get("/meals", { params: { user_id: user.id, date: selectedDate } })
      .then((res) => setMeals(res.data))
      .catch((err) => console.error("Failed to fetch meals:", err));
  }, [selectedDate, user]);

  useEffect(() => {
    if (!user) return;
    API.get("/logged-days", { params: { user_id: user.id } })
      .then((res) => setLoggedDays(res.data))
      .catch((err) => console.error("Failed to fetch logged days:", err));
  }, [user]);

  if (!user) return null;

  // Rough macro targets based on daily calories
  const macroTargets = {
    protein: Math.round((user.dailyCalories * 0.3) / 4),
    carbs: Math.round((user.dailyCalories * 0.45) / 4),
    fat: Math.round((user.dailyCalories * 0.25) / 9),
  };

  return (
    <div className="min-h-screen bg-gray-950">

      {/* ── Top Bar ─────────────────────────────── */}
      <header className="border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥗</span>
            <span className="text-base font-bold text-white tracking-tight">Nutri-Tracker</span>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/");
            }}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Content ─────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6 min-h-[calc(100vh-7rem)]">

        {/* ── LEFT: Sidebar Component ─────────── */}
        <Sidebar
          user={user}
          consumed={consumed.calories}
          loggedDays={loggedDays}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          today={getLocalDate()}
        />

        {/* ── RIGHT: Main Area ──────────────────── */}
        <main className="flex-2 min-w-0 flex flex-col gap-6 self-start sticky top-20 h-[calc(100vh-8rem)]">

          <DailyNutritionTab
            consumed={consumed}
            dailyCalories={user.dailyCalories}
            macroTargets={macroTargets}
          />

          <MealLog
            meals={meals}
            selectedDate={selectedDate}
            today={getLocalDate()}
          />

        </main>
      </div>
    </div>
  );
}