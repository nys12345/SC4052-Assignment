import { useState } from "react";
import LogMealModal from "./LogMealModal";
import MealCard from "./MealCard";

export default function MealLog({ meals, selectedDate, today, onLogMeal, onEdit }) {
  const [showModal, setShowModal] = useState(false);
  const isToday = selectedDate === today;

  const dateLabel = isToday
    ? "Today's Meals"
    : new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
  
  const tagOrder = ["Breakfast", "Lunch", "Dinner", "Supper", "Snack"];

  const sortedMeals = [...meals].sort((a, b) => {
    const aIdx = tagOrder.indexOf(a.meal_type);
    const bIdx = tagOrder.indexOf(b.meal_type);
    const aOrder = aIdx === -1 ? tagOrder.length : aIdx;
    const bOrder = bIdx === -1 ? tagOrder.length : bIdx;
    return aOrder - bOrder;
  });

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col flex-1 relative min-h-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">{dateLabel}</h3>
        <button
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          + Log Meal
        </button>
      </div>

      {meals.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <span className="text-4xl mb-3">🍽️</span>
          <p className="text-sm text-gray-400">No meals logged yet today</p>
          <p className="text-xs text-gray-600 mt-1">
            Start tracking by logging your first meal
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-0 scrollbar-hide">
          {sortedMeals.map((meal, i) => (
            <MealCard key={meal.id ?? i} meal={meal} onEdit={onEdit}/>
          ))}
        </div>
      )}

      {showModal && (
        <LogMealModal
          onClose={() => setShowModal(false)}
          onSubmit={(meal) => {
            setShowModal(false);
            onLogMeal(meal);
          }}
        />
      )}
    </div>
  );
}