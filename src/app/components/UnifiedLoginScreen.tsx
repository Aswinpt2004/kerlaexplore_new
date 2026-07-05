import { useState } from "react";
import { ChevronLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface UnifiedLoginScreenProps {
  onNavigate: (screen: any, data?: any) => void;
  redirectScreen?: any;
  redirectData?: any;
}

export default function UnifiedLoginScreen({
  onNavigate,
}: UnifiedLoginScreenProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!password)     { setError("Please enter your password."); return; }

    setIsLoading(true);
    setError("");

    const result = await login(email.trim(), password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || "Login failed. Please check your credentials.");
    }
    // Navigation is handled by AppContent via the user state change
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => onNavigate("landing")}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <span className="text-sm font-semibold text-gray-600">Login</span>
          <div className="w-9 h-9" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pt-10 pb-8 max-w-sm mx-auto w-full">
        <div className="mb-8">
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Welcome back
          </h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            Sign in to continue. Your role will be loaded automatically.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="you@example.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea472]/30 focus:border-[#0ea472] transition-all"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Enter your password"
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea472]/30 focus:border-[#0ea472] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          id="login-submit-btn"
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-[#0ea472] hover:bg-[#0c9266] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Login"
          )}
        </button>

        {/* Footer links */}
        <div className="mt-6 flex flex-col items-center gap-4">
          <button
            onClick={() => onNavigate("traveler-signup")}
            className="text-sm text-gray-600 hover:text-[#0ea472] font-medium transition-colors"
          >
            Don't have an account?{" "}
            <span className="text-[#0ea472] font-semibold">Create one</span>
          </button>
          <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
}
