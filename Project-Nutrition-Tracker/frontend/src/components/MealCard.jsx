import { useState } from "react";

export default function MealCard({ meal, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...meal });

  const tagColor = {
    Breakfast: "bg-amber-600/20 border-amber-500 text-amber-300",
    Lunch:     "bg-emerald-600/20 border-emerald-500 text-emerald-300",
    Dinner:    "bg-blue-600/20 border-blue-500 text-blue-300",
    Supper:    "bg-purple-600/20 border-purple-500 text-purple-300",
    Snack:     "bg-rose-600/20 border-rose-500 text-rose-300",
  };

  const handleSave = () => {
    onEdit({
      ...form,
      calories: Number(form.calories),
      protein: Number(form.protein),
      carbs: Number(form.carbs),
      fat: Number(form.fat),
    });
    setEditing(false);
  };

  if (editing) {
    return (
        <div className="relative grid grid-cols-[1fr_15rem_8rem_3rem] items-center pl-4 min-h-16 shrink-0 bg-gray-950 border border-indigo-500/50 rounded-lg">
          {/* Name + Tag */}
          <div className="min-w-0 flex flex-col items-start gap-y-1">
            <input
              type="text"
              value={form.meal_name}
              onChange={(e) => setForm({ ...form, meal_name: e.target.value })}
              className="w-full bg-transparent text-sm text-white font-medium truncate p-0 focus:outline-none border-b border-gray-700 focus:border-indigo-500"
            />
            <div className="flex gap-1 flex-wrap">
              {["Breakfast", "Lunch", "Dinner", "Supper", "Snack"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, meal_type: form.meal_type === type ? "" : type })}
                  className={`self-start mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                    form.meal_type === type
                      ? tagColor[type]
                      : "bg-gray-800 text-gray-600 hover:text-gray-400"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-[5rem_5rem_5rem] items-start gap-y-1">
            {[
              { key: "protein", label: "Protein" },
              { key: "carbs",   label: "Carbs" },
              { key: "fat",     label: "Fat" },
            ].map(({ key, label }) => (
              <div key={key} className="flex flex-col items-center justify-center gap-1">
                <p className="text-[12px] text-gray-500 tracking-wider">{label}(g)</p>
                <input
                  type="number"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-8 bg-transparent text-xs text-gray-300 font-medium text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none border-b border-gray-700 focus:border-indigo-500"
                />
              </div>
            ))}
          </div>

          {/* Calories - editing */}
          <div className="flex items-center justify-end gap-1">
            <input
              type="number"
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: e.target.value })}
              className="w-12 bg-transparent text-sm font-semibold text-indigo-400 text-right focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none border-b border-gray-700 focus:border-indigo-500"
            />
            <span className="text-sm font-semibold text-indigo-400">kcal</span>
          </div>

          {/* Save / Cancel / Delete */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleSave}
              className="text-emerald-500 hover:text-emerald-300 transition-colors cursor-pointer text-xs"
            >
              ✓
            </button>
            <button
              onClick={() => { setForm({ ...meal }); setEditing(false); }}
              className="text-gray-600 hover:text-gray-300 transition-colors cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        </div>
    );
  }
  return (
    <div className="grid grid-cols-[1fr_15rem_8rem_3rem] items-center pl-4 min-h-16 shrink-0 bg-gray-950 border border-gray-800 rounded-lg">
      {/* Name + Tag */}
      <div className="min-w-0 flex flex-col items-start gap-y-1">
        <p className="text-sm text-white font-medium truncate border-b border-transparent">{meal.meal_name}</p>
        {meal.meal_type ? (
          <span className={`self-start mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium ${tagColor[meal.meal_type] || "bg-gray-700 text-gray-300"}`}>
            {meal.meal_type}
          </span>
        ) : (
          <span className="self-start mt-0.5 px-2 py-0.5 rounded text-[10px] opacity-0">_</span>
        )}
      </div>

      {/* Macros */}
      <div className="grid grid-cols-[5rem_5rem_5rem] items-start gap-y-1">
        {[
          { label: "Protein", value: meal.protein },
          { label: "Carbs",   value: meal.carbs },
          { label: "Fat",     value: meal.fat },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center justify-center gap-1">
            <p className="text-[12px] text-gray-500 tracking-wider">{label}(g)</p>
            <p className="w-8 text-xs text-gray-300 text-center mx-auto font-medium">{value}</p>
          </div>
        ))}
      </div>

      {/* Calories - read only */}
      <div className="flex items-center justify-end gap-1">
        <span className="text-sm font-semibold text-indigo-400">{meal.calories}</span>
        <span className="text-sm font-semibold text-indigo-400">kcal</span>
      </div>

      {/* Edit / Delete */}
      <div className="flex flex-col items-center gap-0.5">
        <button
          onClick={() => setEditing(true)}
          className="text-gray-600 hover:text-gray-300 transition-colors cursor-pointer text-lg"
        >
          ✎
        </button>
        <button
          onClick={onDelete}
          className="text-red-900 hover:text-red-400 transition-colors cursor-pointer text-lg"
        >
          ⊗
        </button>
      </div>
    </div>
  );
}