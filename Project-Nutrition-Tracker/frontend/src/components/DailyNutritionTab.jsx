import { useMemo } from "react";

function MacroBar({ label, current, target, color, unit = "g" }) {
  const percent = Math.min((current / target) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-500">
          <span className="text-gray-300 font-medium">{current}</span>/{target}{unit}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function DailyNutritionTab({ consumed, dailyCalories, macroTargets }) {
  const percent = dailyCalories > 0 ? Math.min((consumed.calories / dailyCalories) * 100, 100) : 0;
  const remaining = Math.max(dailyCalories - consumed.calories, 0);
  const over = consumed.calories > dailyCalories;

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <span className="text-xs text-gray-500 uppercase tracking-wider">Daily Nutrition</span>

      <div className="flex gap-6 mt-4">

        {/* LEFT — Calorie Ring */}
        <div className="shrink-0 flex flex-col items-center">
          <div className="relative">
            <svg width="116" height="116" className="-rotate-90">
              <circle cx="58" cy="58" r={radius} fill="none" stroke="#1f2937" strokeWidth="9" />
              <circle
                cx="58" cy="58" r={radius} fill="none"
                stroke={over ? "#f87171" : "url(#calGrad)"}
                strokeWidth="9" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="calGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-lg font-bold ${over ? "text-red-400" : "text-white"}`}>
                {over ? `+${consumed.calories - dailyCalories}` : remaining}
              </span>
              <span className="text-[9px] text-gray-500 uppercase tracking-wider">
                {over ? "over" : "left"}
              </span>
            </div>
          </div>

          <div className="text-center mt-2">
            <p className="text-xs text-gray-400">
              <span className="text-gray-300 font-medium">{consumed.calories}</span> / {dailyCalories}
            </p>
            <p className="text-[10px] text-gray-600">{Math.round(percent)}% of daily goal</p>
          </div>
        </div>

        {/* RIGHT — Macro Bars */}
        <div className="flex-1 flex flex-col justify-center space-y-4">
          <MacroBar label="Protein" current={consumed.protein} target={macroTargets.protein} color="bg-indigo-500" />
          <MacroBar label="Carbs" current={consumed.carbs} target={macroTargets.carbs} color="bg-amber-500" />
          <MacroBar label="Fat" current={consumed.fat} target={macroTargets.fat} color="bg-rose-500" />
          <div className="text-[10px] text-gray-600 text-center pt-1">
            30% protein · 45% carbs · 25% fat
          </div>
        </div>

      </div>
    </div>
  );
}