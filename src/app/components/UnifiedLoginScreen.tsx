import { useState } from "react";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  Compass,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

type LoginRole = "traveler" | "guide" | "admin";

interface UnifiedLoginScreenProps {
  onNavigate: (screen: any, data?: any) => void;
  redirectScreen?: any;
  redirectData?: any;
}

export default function UnifiedLoginScreen({
  onNavigate,
}: UnifiedLoginScreenProps) {
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState<LoginRole | null>(null);
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

    const result = await login(email.trim(), password, selectedRole ?? undefined);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || "Login failed. Please check your credentials.");
    }
    // On success, App.tsx useEffect handles navigation automatically
  };

  const roleCards: { role: LoginRole; label: string; desc: string; icon: React.ReactNode; color: string; bg: string; border: string }[] = [
    {
      role: "traveler",
      label: "Traveler",
      desc: "Explore Kerala with a local guide",
      icon: <MapPin className="w-6 h-6" />,
      color: "text-[#0ea472]",
      bg: "bg-[#f0faf6]",
      border: "border-[#0ea472]",
    },
    {
      role: "guide",
      label: "Guide",
      desc: "Manage bookings and your profile",
      icon: <Compass className="w-6 h-6" />,
      color: "text-[#f59e0b]",
      bg: "bg-amber-50",
      border: "border-amber-400",
    },
    {
      role: "admin",
      label: "Admin",
      desc: "Platform management dashboard",
      icon: <ShieldCheck className="w-6 h-6" />,
      color: "text-[#6366f1]",
      bg: "bg-indigo-50",
      border: "border-indigo-400",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => {
              if (selectedRole) {
                setSelectedRole(null);
                setError("");
                setEmail("");
                setPassword("");
              } else {
                onNavigate("landing");
              }
            }}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <span className="text-sm font-semibold text-gray-600">
            {selectedRole ? `Login as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}` : "Login"}
          </span>
          <div className="w-9 h-9" />
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-8 pb-8 max-w-sm mx-auto w-full">

        {/* ── STEP 1: Role Selector ─────────────────────────── */}
        {!selectedRole && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Fraunces, serif" }}>
                Welcome back
              </h1>
              <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                Choose how you want to log in to KuTo.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {roleCards.map(({ role, label, desc, icon, color, bg, border }) => (
                <button
                  key={role}
                  id={`login-role-${role}`}
                  onClick={() => setSelectedRole(role)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md active:scale-[0.98] ${bg} ${border}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm ${color}`}>
                    {icon}
                  </div>
                  <div>
                    <div className={`font-bold text-base ${color}`}>{label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-300 ml-auto rotate-180" />
                </button>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => onNavigate("traveler-signup")}
                className="text-sm text-gray-500 hover:text-[#0ea472] transition-colors"
              >
                New to KuTo?{" "}
                <span className="text-[#0ea472] font-semibold">Create an account</span>
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: Login Form (after role selected) ──────── */}
        {selectedRole && (
          <>
            {/* Role badge */}
            {(() => {
              const card = roleCards.find(c => c.role === selectedRole)!;
              return (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${card.bg} mb-6 self-start`}>
                  <span className={card.color}>{card.icon}</span>
                  <span className={`text-sm font-bold ${card.color}`}>{card.label}</span>
                </div>
              );
            })()}

            <h1 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "Fraunces, serif" }}>
              Sign in to your account
            </h1>
            <p className="text-gray-400 text-sm mb-6">
              Enter your registered email and password.
            </p>

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
                autoFocus
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

            {/* Submit */}
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

            {selectedRole === "traveler" && (
              <div className="mt-5 text-center">
                <button
                  onClick={() => onNavigate("traveler-signup")}
                  className="text-sm text-gray-500 hover:text-[#0ea472] transition-colors"
                >
                  Don't have an account?{" "}
                  <span className="text-[#0ea472] font-semibold">Register here</span>
                </button>
              </div>
            )}

            {selectedRole === "guide" && (
              <div className="mt-5 text-center">
                <button
                  onClick={() => onNavigate("become-guide")}
                  className="text-sm text-gray-500 hover:text-amber-600 transition-colors"
                >
                  Not a guide yet?{" "}
                  <span className="text-amber-500 font-semibold">Apply here</span>
                </button>
              </div>
            )}

            <button className="mt-3 mx-auto block text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Forgot password?
            </button>
          </>
        )}
      </div>
    </div>
  );
}
