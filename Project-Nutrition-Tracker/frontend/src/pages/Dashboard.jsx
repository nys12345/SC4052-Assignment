import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DailyNutritionTab from "../components/DailyNutritionTab";

// ── Main Dashboard ─────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Placeholder consumed values (will come from meal logging later)
  const [consumed] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Placeholder logged days (will come from DB later)
  const [loggedDays] = useState([]);

  const getLocalDate = (date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(stored));
  }, [navigate]);

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
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6">

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
        <main className="flex-2 min-w-0 space-y-6">

          <DailyNutritionTab
            consumed={consumed}
            dailyCalories={user.dailyCalories}
            macroTargets={macroTargets}
          />

          {/* Meal log placeholder */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white"> 
                {selectedDate === getLocalDate()
                  ? "Today's Meals"
                  : new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric"
                    })
                }
              </h3>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer">
                + Log Meal
              </button>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-4xl mb-3">🍽️</span>
              <p className="text-sm text-gray-400">No meals logged yet today</p>
              <p className="text-xs text-gray-600 mt-1">Start tracking by logging your first meal</p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}