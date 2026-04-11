import { useState, useEffect } from "react";
import API from "../API";

export default function LogMealModal({ onClose, onSubmit }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!query.trim() || form) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      API.get("/foods/search", { params: { q: query } })
        .then((res) => setResults(res.data))
        .catch(() => setResults([]));
    }, 300);

    return () => clearTimeout(timer);
  }, [query, form]);

  const handleSelect = (food) => {
    setForm({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    });
    setQuery("");
    setResults([]);
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form || !form.name.trim()) return;
    onSubmit({
      meal_name: form.name,
      calories: Number(form.calories),
      protein: Number(form.protein),
      carbs: Number(form.carbs),
      fat: Number(form.fat),
      meal_type: form.mealType || "",
    });
  };

  const handleSaveFood = async () => {
    if (!form || !form.name.trim()) return;
    try {
      await API.post("/add-food", {
        name: form.name,
        calories: Number(form.calories),
        protein: Number(form.protein),
        carbs: Number(form.carbs),
        fat: Number(form.fat),
      });
      alert("Food added successfully!");
    } catch (err) {
      alert("Failed to add food.");
    }
  };

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col bg-black/60 rounded-2xl"
      onClick={onClose}
    >
      <div
        className="relative bg-gray-900 border border-gray-800 mt-13 rounded-2xl p-6 mx-3 mb-3 flex flex-col min-h-0 flex-1 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-1 right-2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer text-lg z-20"
        >
          ✕
        </button>
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setForm(null);
            }}
            placeholder="Search foods..."
            autoFocus
            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />

          {results.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-gray-950 border border-gray-800 rounded-lg overflow-hidden z-20 max-h-40 overflow-y-auto">
              {results.map((food) => (
                <button
                  key={food.id}
                  onClick={() => handleSelect(food)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-800/50 transition-colors cursor-pointer text-left"
                >
                  <span className="text-sm text-gray-300">{food.name}</span>
                  <span className="text-xs text-gray-500">{food.calories} kcal</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Left / Right split */}
        <div className="flex gap-4 mt-4 flex-1">

          {/* LEFT — Summary + Submit */}
          <div className="flex-1 flex flex-col">

          </div>

          {/* RIGHT — Editable fields */}
          <div className="flex-1 flex flex-col">
            
            <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Name</label>
                <input
                type="text"
                value={form?.name ?? ""}
                onChange={(e) => updateForm("name", e.target.value)}
                placeholder="Select a food above"
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-40"
                />
            </div>

            <div className="mt-3">
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Calories <span className="text-gray-600 lowercase">(kcal)</span></label>
                <input
                type="number"
                value={form?.calories ?? ""}
                onChange={(e) => updateForm("calories", e.target.value)} 
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-40"
                />
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3">
                {[
                { key: "protein", label: "Protein", unit: "g" },
                { key: "carbs", label: "Carbs", unit: "g" },
                { key: "fat", label: "Fat", unit: "g" },
                ].map(({ key, label, unit }) => (
                <div key={key}>
                    <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">
                    {label} <span className="text-gray-600 lowercase">({unit})</span>
                    </label>
                    <input
                    type="number"
                    value={form?.[key] ?? ""}
                    onChange={(e) => updateForm(key, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-40"
                    />
                </div>
                ))}
            </div>

            <div className="mt-3">
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Tags</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { type: "Breakfast", active: "bg-amber-600/20 border-amber-500 text-amber-300" },
                  { type: "Lunch",     active: "bg-emerald-600/20 border-emerald-500 text-emerald-300" },
                  { type: "Dinner",    active: "bg-blue-600/20 border-blue-500 text-blue-300" },
                  { type: "Supper",    active: "bg-purple-600/20 border-purple-500 text-purple-300" },
                  { type: "Snack",     active: "bg-rose-600/20 border-rose-500 text-rose-300" },
                ].map(({ type, active }) => {
                  const selected = form?.mealType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateForm("mealType", selected ? "" : type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 border ${
                        selected
                          ? active
                          : "bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-600"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-auto pt-4 flex justify-end gap-2">
                <button
                  onClick={handleSaveFood}
                  disabled={!form}
                  className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    form
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-800 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  Add Food
                </button>

                <button
                onClick={handleSubmit}
                disabled={!form}
                className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    form
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                    : "bg-gray-800 text-gray-600 cursor-not-allowed"
                }`}
                >
                Log Meal
                </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}