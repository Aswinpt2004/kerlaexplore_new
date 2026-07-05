import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";

// ── Role types ────────────────────────────────────────────────────────────────
export type UserRole =
  | "traveler"
  | "guide"
  | "guide_admin"
  | "traveler_admin"
  | "super_admin"
  | null;

// ── User profile ──────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;            // Supabase auth UID
  email: string;
  role: UserRole;
  status: string;        // active | pending | approved | rejected | suspended
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

// ── Context type ──────────────────────────────────────────────────────────────
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Fetch user profile from `users` table after auth ─────────────────────────
async function fetchUserProfile(authUid: string, email: string): Promise<AuthUser | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, auth_user_id, email, full_name, phone, role, status")
      .eq("auth_user_id", authUid)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    if (!data) {
      // Profile row not yet created (trigger may not have fired yet)
      console.warn("No user profile found for auth uid:", authUid);
      return null;
    }

    const nameParts = (data.full_name || "").trim().split(" ");
    return {
      id: authUid,
      email: data.email || email,
      role: data.role as UserRole,
      status: data.status || "active",
      fullName: data.full_name || "",
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      phone: data.phone || "",
    };
  } catch (err) {
    console.error("Unexpected error fetching user profile:", err);
    return null;
  }
}

// ── AuthProvider ──────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Initialise: check existing Supabase session on mount ─────────────────
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          const profile = await fetchUserProfile(
            session.user.id,
            session.user.email || ""
          );
          if (mounted) setUser(profile);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    // ── Listen for auth state changes (login / logout / token refresh) ──────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        if (session?.user) {
          const profile = await fetchUserProfile(
            session.user.id,
            session.user.email || ""
          );
          if (mounted) {
            setUser(profile);
            setIsLoading(false);
          }
        } else {
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data.user) {
        return { success: false, error: error?.message || "Invalid credentials" };
      }

      // Profile is set by the onAuthStateChange listener above
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      return { success: false, error: message };
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
