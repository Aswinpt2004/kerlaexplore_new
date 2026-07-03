import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { findGuide, guideExists } from "../lib/guidesDb";
import { findTraveler, travelerExists } from "../lib/travelersDb";

export type UserRole = "guide" | "traveler" | null;

export interface AuthUser {
  email: string;
  role: UserRole;
  id?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "kuto_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    // Validate inputs
    if (!email || !password) {
      return { success: false, error: "Wrong credentials" };
    }

    if (!role) {
      return { success: false, error: "Please select a role" };
    }

    if (role === "guide") {
      const guide = findGuide(email, password);
      if (guide) {
        const newUser: AuthUser = { email, role: "guide" };
        setUser(newUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        return { success: true };
      } else {
        // Show "Wrong credentials" if data doesn't exist in db
        return { success: false, error: "Wrong credentials" };
      }
    } else if (role === "traveler") {
      const traveler = findTraveler(email, password);
      if (traveler) {
        const newUser: AuthUser = { email, role: "traveler" };
        setUser(newUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        return { success: true };
      } else {
        // Show "Wrong credentials" if data doesn't exist in db
        return { success: false, error: "Wrong credentials" };
      }
    }

    return { success: false, error: "Wrong credentials" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchRole = (newRole: UserRole) => {
    // Logout when switching roles
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        switchRole,
        isAuthenticated: user !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
