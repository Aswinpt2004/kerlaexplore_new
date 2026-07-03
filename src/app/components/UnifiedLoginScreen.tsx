import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useAuth, type UserRole } from "../context/AuthContext";

interface UnifiedLoginScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  redirectScreen?: string | null;
  redirectData?: any;
}

export default function UnifiedLoginScreen({ onNavigate, redirectScreen, redirectData }: UnifiedLoginScreenProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!role) {
      setError("Please select a role (Traveler or Guide)");
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await login(email, password, role);

    if (result.success) {
      // Navigate to redirect targets if available, else dashboards
      if (role === "guide") {
        if (redirectScreen && redirectScreen.startsWith("guide-")) {
          onNavigate(redirectScreen, redirectData);
        } else {
          onNavigate("guide-dashboard");
        }
      } else {
        if (redirectScreen) {
          onNavigate(redirectScreen, redirectData);
        } else {
          onNavigate("traveler-dashboard");
        }
      }
    } else {
      setError(result.error || "Login failed");
      setIsLoading(false);
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setError("");
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
      <div className="flex-1 flex flex-col px-6 pt-10 max-w-sm mx-auto w-full">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Fraunces, serif" }}>
          Welcome back
        </h1>
        <p className="text-gray-600 mt-2">Select your role and log in to continue.</p>

        {/* Role Selection */}
        <div className="mt-8 mb-8">
          <label className="text-sm font-semibold text-gray-700 block mb-3">I am a:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleRoleChange("traveler")}
              className={`py-3 px-4 rounded-lg border-2 font-semibold transition-all text-center ${
                role === "traveler"
                  ? "border-[#0ea472] bg-[#f0faf6] text-[#0ea472]"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              Traveler
            </button>
            <button
              onClick={() => handleRoleChange("guide")}
              className={`py-3 px-4 rounded-lg border-2 font-semibold transition-all text-center ${
                role === "guide"
                  ? "border-[#0ea472] bg-[#f0faf6] text-[#0ea472]"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              Guide
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0ea472]"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0ea472]"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={!email || !password || !role || isLoading}
            className="w-full mt-2 bg-[#0ea472] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#0c9266] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </div>

        {/* Registration Links */}
        <div className="mt-8 space-y-3 text-center text-sm">
          {role === "traveler" && (
            <p className="text-gray-600">
              Don&apos;t have an account?{" "}
              <button onClick={() => onNavigate("traveler-signup")} className="text-[#0ea472] font-semibold hover:underline">
                Sign up here
              </button>
            </p>
          )}

          {role === "guide" && (
            <p className="text-gray-600">
              Not registered yet?{" "}
              <button onClick={() => onNavigate("become-guide")} className="text-[#0ea472] font-semibold hover:underline">
                Become a Guide
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
