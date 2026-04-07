import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/login", { username, password });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.data?.detail) {
        alert(err.response.data.detail);
      } else {
        alert("Something went wrong");
      }
    }
  };

  const handleGuest = () => {
    console.log("Continue as guest");
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">

      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl">🥗</span>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Nutri-Tracker
            </h1>
          </div>

        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

          <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-6">Sign in to your account</p>

          <form onSubmit={handleSignIn} className="space-y-4">

            {/* Username */}
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-800"></div>
            <span className="text-xs text-gray-600 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-gray-800"></div>
          </div>

          {/* Create Account */}
          <button
            onClick={() => navigate("/signup")}
            className="w-full py-3 bg-transparent border border-gray-700 hover:border-gray-500 text-gray-300 font-medium rounded-lg text-sm transition-colors cursor-pointer mb-3"
          >
            Create Account
          </button>

          {/* Continue as Guest */}
          <button
            onClick={handleGuest}
            className="w-full py-3 text-gray-500 hover:text-gray-300 font-medium text-sm transition-colors cursor-pointer"
          >
            Continue as Guest
          </button>

        </div>

      </div>
    </div>
  );
}

export default App;