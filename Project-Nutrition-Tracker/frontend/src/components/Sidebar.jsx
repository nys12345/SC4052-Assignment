import { useState, useMemo } from "react";

// ════════════════════════════════════════════════════════════
//  BMI Gauge
// ════════════════════════════════════════════════════════════
function BMIGauge({ bmi }) {
  const getBMICategory = (val) => {
    if (val < 18.5) return { label: "Underweight", color: "text-blue-400", bg: "bg-blue-500", dot: "#60a5fa" };
    if (val < 25) return { label: "Normal", color: "text-emerald-400", bg: "bg-emerald-500", dot: "#34d399" };
    if (val < 30) return { label: "Overweight", color: "text-amber-400", bg: "bg-amber-500", dot: "#fbbf24" };
    return { label: "Obese", color: "text-red-400", bg: "bg-red-500", dot: "#f87171" };
  };

  const category = getBMICategory(bmi);
  const percent = Math.min(Math.max(((bmi - 10) / 30) * 100, 0), 100);

  // Arc gauge: 180° arc
  const radius = 52;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wider">BMI</span>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${category.color} bg-gray-800`}>
          {category.label}
        </span>
      </div>

      {/* Arc gauge */}
      <div className="flex justify-center py-2">
        <svg width="160" height="90" viewBox="0 0 160 90">
          {/* Background arc */}
          <path
            d="M 16 80 A 64 64 0 0 1 144 80"
            fill="none"
            stroke="#1f2937"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Colored segments – faint */}
          <path d="M 16 80 A 64 64 0 0 1 48 28" fill="none" stroke="#3b82f6" strokeWidth="10" strokeLinecap="round" opacity="0.15" />
          <path d="M 48 28 A 64 64 0 0 1 112 28" fill="none" stroke="#10b981" strokeWidth="10" opacity="0.15" />
          <path d="M 112 28 A 64 64 0 0 1 136 52" fill="none" stroke="#f59e0b" strokeWidth="10" opacity="0.15" />
          <path d="M 136 52 A 64 64 0 0 1 144 80" fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" opacity="0.15" />
          {/* Needle dot */}
          {(() => {
            const angle = Math.PI + (percent / 100) * Math.PI; // 180° to 360°
            const cx = 80 + 64 * Math.cos(angle);
            const cy = 80 + 64 * Math.sin(angle);
            return (
              <circle cx={cx} cy={cy} r="6" fill={category.dot} stroke="#030712" strokeWidth="2.5">
                <animate attributeName="r" from="4" to="6" dur="0.5s" fill="freeze" />
              </circle>
            );
          })()}
          {/* Center value */}
          <text x="80" y="70" textAnchor="middle" className="fill-white text-2xl font-bold" style={{ fontSize: "26px", fontWeight: 700 }}>
            {bmi}
          </text>
          <text x="80" y="85" textAnchor="middle" className="fill-gray-500" style={{ fontSize: "9px" }}>
            kg/m²
          </text>
        </svg>
      </div>

      {/* Range labels */}
      <div className="flex justify-between px-1 -mt-1">
        <span className="text-[9px] text-gray-600">10</span>
        <span className="text-[9px] text-gray-600">18.5</span>
        <span className="text-[9px] text-gray-600">25</span>
        <span className="text-[9px] text-gray-600">30</span>
        <span className="text-[9px] text-gray-600">40</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  Progress Calendar
// ════════════════════════════════════════════════════════════
function ProgressCalendar({ loggedDays = [], selectedDate, onSelectDate, today }) {
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName = viewDate.toLocaleString("default", { month: "long", year: "numeric" });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay(); // 0 = Sun

  const isToday = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return dateStr === today;
  };

  // Convert loggedDays (array of "YYYY-MM-DD" strings) to a Set of day numbers for this month
  const loggedSet = useMemo(() => {
    const set = new Set();
    loggedDays.forEach((dateStr) => {
      const d = new Date(dateStr);
      if (d.getFullYear() === year && d.getMonth() === month) {
        set.add(d.getDate());
      }
    });
    return set;
  }, [loggedDays, year, month]);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // Build grid: 7 cols, pad start
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Progress</span>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer text-sm px-1">‹</button>
          <span className="text-xs text-gray-400 font-medium w-28 text-center">{monthName}</span>
          <button onClick={nextMonth} className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer text-sm px-1">›</button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-[9px] text-gray-600 text-center font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;

          const logged = loggedSet.has(day);
          const todayMark = isToday(day);

          return (
            <div
              key={day}
              onClick={() => {
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                onSelectDate(dateStr);
              }}
              className={`
                relative aspect-square flex items-center justify-center rounded-lg text-[11px] transition-colors cursor-pointer
                ${logged
                  ? "bg-indigo-600/20 text-indigo-300 font-medium"
                  : "text-gray-500 hover:bg-gray-800/50"
                }
                ${todayMark ? "ring-2 ring-indigo-500/50" : ""}
                ${`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` === selectedDate
                  ? "bg-gray-800/50"
                  : ""
                }
              `}
            >
              {day}
              {logged && (
                <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-indigo-400" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-800/60">
        <span className="text-[10px] text-gray-600 ml-auto">
          {loggedSet.size}/{daysInMonth} days
        </span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  Profile Card
// ════════════════════════════════════════════════════════════
function ProfileCard({ user }) {
  const goalLabels = {
    lose_weight: "Lose Weight",
    maintain: "Maintain",
    gain_muscle: "Gain Muscle",
    gain_weight: "Gain Weight",
  };

  const activityLabels = {
    sedentary: "Sedentary",
    light: "Lightly Active",
    moderate: "Moderately Active",
    very_active: "Very Active",
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <span className="text-indigo-300 font-bold text-base">
            {user.username.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h2 className="text-white font-semibold text-sm">{user.username}</h2>
          <p className="text-[11px] text-gray-500">{goalLabels[user.goal] || user.goal}</p>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        {[
          { label: "Age", value: user.age, unit: "" },
          { label: "Height", value: user.height, unit: "cm" },
          { label: "Weight", value: user.weight, unit: "kg" },
        ].map((item) => (
          <div key={item.label} className="bg-gray-950/60 rounded-lg py-2 px-1.5">
            <p className="text-white font-semibold text-xs">
              {item.value}
              {item.unit && <span className="text-[9px] text-gray-500 ml-0.5">{item.unit}</span>}
            </p>
            <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="space-y-1.5 px-0.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">Gender</span>
          <span className="text-gray-300 capitalize">{user.gender}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">Activity</span>
          <span className="text-gray-300">{activityLabels[user.activityLevel] || user.activityLevel}</span>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-800/60">
        {[
          { label: "BMR", value: user.bmr, icon: "🔥" },
          { label: "TDEE", value: user.tdee, icon: "⚡" },
          { label: "Target", value: user.dailyCalories, icon: "🎯" },
        ].map((m) => (
          <div key={m.label} className="text-center">
            <span className="text-xs">{m.icon}</span>
            <p className="text-white font-semibold text-xs mt-0.5">{m.value}</p>
            <p className="text-[9px] text-gray-500 uppercase">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  Sidebar (exported)
// ════════════════════════════════════════════════════════════
export default function Sidebar({ user, consumed = 0, loggedDays = [], selectedDate, onSelectDate, today }) {
  return (
    <aside className="flex-1 min-w-0 space-y-4">
      <ProfileCard user={user} />
      {/* <BMIGauge bmi={user.bmi} /> */}
      {/* <CalorieIntake consumed={consumed} target={user.dailyCalories} /> */}
      <ProgressCalendar loggedDays={loggedDays} selectedDate={selectedDate} onSelectDate={onSelectDate} today={today} />
    </aside>
  );
}