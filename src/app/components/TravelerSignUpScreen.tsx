import { useState } from "react";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { registerTraveler, travelerExists } from "../lib/travelersDb";

interface TravelerSignUpScreenProps {
  onNavigate: (screen: any, data?: any) => void;
  redirectScreen?: any;
  redirectData?: any;
}

export default function TravelerSignUpScreen({
  onNavigate,
  redirectScreen,
  redirectData,
}: TravelerSignUpScreenProps) {
  const { login } = useAuth();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  };

  const validateStep0 = () => {
    if (!form.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!form.lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    return true;
  };

  const validateStep1 = () => {
    if (!form.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!form.email.includes("@")) {
      setError("Please enter a valid email");
      return false;
    }
    if (!form.phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!form.password) {
      setError("Password is required");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (step === 0 && validateStep0()) {
      setStep(1);
    } else if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSignUp = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    setError("");

    try {
      // Check if email already exists
      const exists = await travelerExists(form.email);
      if (exists) {
        setError("Email already registered. Please login instead.");
        setIsLoading(false);
        return;
      }

      // Register traveler
      await registerTraveler({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      // Auto-login after registration — role comes from DB automatically
      const result = await login(form.email, form.password);

      if (result.success) {
        if (redirectScreen) {
          onNavigate(redirectScreen, redirectData);
        } else {
          onNavigate("traveler-dashboard");
        }
      } else {
        setError(result.error || "Registration successful but login failed");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("[v0] Signup error:", err);
      setError("An error occurred during registration");
      setIsLoading(false);
    }
  };

  const steps = [
    {
      title: "What's your name?",
      subtitle: "Help guides know who they're working with",
    },
    {
      title: "How can we reach you?",
      subtitle: "Email and phone for trip updates",
    },
    {
      title: "Create your password",
      subtitle: "Secure your KuTo account",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => (step === 0 ? onNavigate("login") : setStep((s) => s - 1))}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <span className="text-sm font-semibold text-gray-600">
            {step + 1} of {steps.length}
          </span>
          <button
            onClick={() => onNavigate("login")}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="text-gray-500 text-lg font-bold">✕</span>
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-[#0ea472] transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <h2
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            {steps[step].title}
          </h2>
          <p className="text-gray-500 text-sm mt-2">{steps[step].subtitle}</p>
        </div>

        {/* Step Content */}
        <div className="flex flex-col gap-4">
          {step === 0 && (
            <>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0ea472]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0ea472]"
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0ea472]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0ea472]"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0ea472]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none flex items-center"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">At least 6 characters</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0ea472]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none flex items-center"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex gap-3">
          {step < steps.length - 1 ? (
            <button
              onClick={handleContinue}
              className="w-full bg-[#0ea472] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#0c9266] transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSignUp}
              disabled={isLoading}
              className="w-full bg-[#0ea472] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#0c9266] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          )}
        </div>

        <div className="max-w-lg mx-auto mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => onNavigate("login")}
              className="text-[#0ea472] font-semibold hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
