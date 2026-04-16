import { useState, useMemo } from "react";

//  Progress Calendar
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
                hover:bg-gray-800/50
                ${todayMark ? "ring-2 ring-indigo-500/50" : ""}
                ${`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` === selectedDate
                  ? "bg-gray-800/50"
                  : ""
                }
              `}
            >
              <span
                className={`
                  w-6 h-6 flex items-center justify-center rounded-full leading-none text-center
                  ${logged ? "bg-indigo-600/30 text-indigo-300 font-medium" : "text-gray-500"}
                `}
              >
                {day}
              </span>
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

// Tooltip
function Tooltip({ text, children }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-[11px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
      </div>
    </div>
  );
} 

//  Profile Card
function ProfileCard({ user }) {
  const goals = {
    lose_weight:  { label: "Lose Weight",     tip: "−500 kcal from TDEE" },
    maintain:     { label: "Maintain Weight",  tip: "No adjustment to TDEE" },
    gain_muscle:  { label: "Gain Muscle",      tip: "+300 kcal above TDEE" },
    gain_weight:  { label: "Gain Weight",      tip: "+500 kcal above TDEE" },
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
          <Tooltip text={goals[user.goal]?.tip || ""}>
            <p className="text-[11px] text-gray-500 cursor-help">
              {goals[user.goal]?.label || user.goal}
            </p>
          </Tooltip>
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
              {item.unit && <span className="text-[10px] text-gray-500 ml-0.5">{item.unit}</span>}
            </p>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="space-y-1.5 px-0.5">
        <div className="flex justify-between text-[12px]">
          <span className="text-gray-500">Gender</span>
          <span className="text-gray-300 capitalize">{user.gender}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-gray-500">Activity</span>
          <span className="text-gray-300">{activityLabels[user.activityLevel] || user.activityLevel}</span>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-800/60">
        {[
          { label: "BMR", value: user.bmr, icon: "🔥", tip: "Basal Metabolic Rate: calories your body burns at rest" },
          { label: "TDEE", value: user.tdee, icon: "⚡", tip: "Total Daily Energy Expenditure: calories you burn per day" },
          { label: "Target", value: user.dailyCalories, icon: "🎯", tip: "Your daily calorie goal based on your activity and goal" },
        ].map((m) => (
          <Tooltip key={m.label} text={m.tip}>
            <div className="text-center cursor-help">
              <span className="text-xs">{m.icon}</span>
              <p className="text-white font-semibold text-xs mt-0.5">{m.value}</p>
              <p className="text-[9px] text-gray-500 uppercase">{m.label}</p>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

//  Sidebar
export default function Sidebar({ user, consumed = 0, loggedDays = [], selectedDate, onSelectDate, today }) {
  return (
    <aside className="flex-1 min-w-0 space-y-6">
      <ProfileCard user={user} />
      <ProgressCalendar loggedDays={loggedDays} selectedDate={selectedDate} onSelectDate={onSelectDate} today={today} />
    </aside>
  );
}