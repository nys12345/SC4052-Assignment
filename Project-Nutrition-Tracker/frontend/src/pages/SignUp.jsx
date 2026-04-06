import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
    weight: "",
    goal: "",
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Username is required";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!form.age) e.age = "Age is required";
    else if (form.age < 10 || form.age > 120) e.age = "Enter a valid age";
    if (!form.gender) e.gender = "Please select a gender";
    if (!form.weight) e.weight = "Weight is required";
    else if (form.weight < 20 || form.weight > 300) e.weight = "Enter a valid weight";
    if (!form.goal) e.goal = "Please select a goal";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Sign up data:", form);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

          <h2 className="text-xl font-semibold text-white mb-1">Create your account</h2>
          <p className="text-sm text-gray-500 mb-6">Set up your profile and nutrition goals</p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username */}
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                placeholder="Choose a username"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Age and Weight row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                  Age <span className="text-gray-600 lowercase"></span>
                </label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => update("age", e.target.value)}
                  placeholder="25"
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                  Weight <span className="text-gray-600 lowercase">(kg)</span>
                </label>
                <input
                  type="number"
                  value={form.weight}
                  onChange={(e) => update("weight", e.target.value)}
                  placeholder="70"
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "male", label: "♂ Male" },
                  { id: "female", label: "♀ Female" },
                  { id: "other", label: "Other" },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => update("gender", g.id)}
                    className={`py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer
                      ${form.gender === g.id
                        ? "bg-indigo-600/20 border border-indigo-500 text-indigo-300"
                        : "bg-gray-950 border border-gray-800 text-gray-500 hover:border-gray-600"
                      }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>

            {/* Goal */}
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
                Your Goal
              </label>
              <div className="space-y-2">
                {[
                  { id: "lose_weight", label: "Lose Weight", icon: "🔥", desc: "Caloric deficit plan" },
                  { id: "gain_weight", label: "Gain Weight", icon: "📈", desc: "Caloric surplus plan" },
                ].map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => update("goal", goal.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer
                      ${form.goal === goal.id
                        ? "bg-indigo-600/20 border border-indigo-500"
                        : "bg-gray-950 border border-gray-800 hover:border-gray-600"
                      }`}
                  >
                    <span className="text-xl">{goal.icon}</span>
                    <div>
                      <p className={`text-sm font-medium ${form.goal === goal.id ? "text-indigo-300" : "text-gray-300"}`}>
                        {goal.label}
                      </p>
                      <p className="text-xs text-gray-500">{goal.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              {errors.goal && <p className="text-red-500 text-xs mt-1">{errors.goal}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer mt-2"
            >
              Create Account
            </button>

          </form>

          {/* Back to login */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <span
                onClick={() => navigate("/")}
                className="text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors"
            >
                Sign In
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}

export default SignUp;