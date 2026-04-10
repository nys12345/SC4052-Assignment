import { useState } from "react";

export default function MealCard({ meal, onEdit }) {
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
      <div className="px-4 py-3 bg-gray-950 border border-indigo-500/50 rounded-lg shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500 uppercase">Name</label>
            <input
              type="text"
              value={form.meal_name}
              onChange={(e) => setForm({ ...form, meal_name: e.target.value })}
              className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase">Calories</label>
            <input
              type="number"
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: e.target.value })}
              className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[
            { key: "protein", label: "Protein" },
            { key: "carbs",   label: "Carbs" },
            { key: "fat",     label: "Fat" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-[10px] text-gray-500 uppercase">{label}</label>
              <input
                type="number"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => { setForm({ ...meal }); setEditing(false); }}
            className="px-3 py-1 text-xs text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[1fr_12rem_8rem_2rem] items-center px-4 min-h-16 shrink-0 bg-gray-950 border border-gray-800 rounded-lg">
      {/* Name + Tag */}
      <div className="min-w-0">
        <p className="text-sm text-white font-medium truncate">{meal.meal_name}</p>
        {meal.meal_type ? (
          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium ${tagColor[meal.meal_type] || "bg-gray-700 text-gray-300"}`}>
            {meal.meal_type}
          </span>
        ) : (
          <span className="inline-block mt-0.5 h-4" />
        )}
      </div>

      {/* Macros */}
      <div className="grid grid-cols-[4rem_4rem_4rem] items-center">
        {[
          { label: "Protein", value: meal.protein },
          { label: "Carbs",   value: meal.carbs },
          { label: "Fat",     value: meal.fat },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="text-[12px] text-gray-500 uppercase tracking-wider">{label}</p>
            <p className="text-xs text-gray-300 font-medium">{value}g</p>
          </div>
        ))}
      </div>

      {/* Calories */}
      <span className="text-sm font-semibold text-indigo-400 text-right">
        {meal.calories} kcal
      </span>

      {/* Edit */}
      <button
        onClick={() => setEditing(true)}
        className="text-gray-600 hover:text-gray-300 transition-colors cursor-pointer text-right"
      >
        ✎
      </button>
    </div>
  );
}