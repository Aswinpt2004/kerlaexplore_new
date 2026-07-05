import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";
import { findGuide, findPendingGuide } from "../lib/guidesDb";
import { findTraveler } from "../lib/travelersDb";

export type UserRole = "guide" | "traveler" | "admin" | null;

export interface AuthUser {
  email: string;
  role: UserRole;
  id?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isPending?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    role: UserRole
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to enrich user with local DB registration details if they exist
const enrichUserWithProfile = (baseUser: AuthUser): AuthUser => {
  const email = baseUser.email.toLowerCase().trim();
  if (baseUser.role === "traveler") {
    const raw = localStorage.getItem("kuto_travelers_db");
    if (raw) {
      try {
        const db = JSON.parse(raw);
        const match = db.find((t: any) => t.email.toLowerCase().trim() === email);
        if (match) {
          return {
            ...baseUser,
            firstName: match.firstName,
            lastName: match.lastName,
            phone: match.phone,
          };
        }
      } catch {}
    }
  } else if (baseUser.role === "guide") {
    const rawActive = localStorage.getItem("kuto_guides_db");
    if (rawActive) {
      try {
        const db = JSON.parse(rawActive);
        const match = db.find((g: any) => g.email.toLowerCase().trim() === email);
        if (match) {
          return {
            ...baseUser,
            firstName: match.firstName,
            lastName: match.lastName,
            phone: match.phone,
            isPending: false,
          };
        }
      } catch {}
    }

    const rawPending = localStorage.getItem("kuto_pending_guides_db");
    if (rawPending) {
      try {
        const db = JSON.parse(rawPending);
        const match = db.find((g: any) => g.email.toLowerCase().trim() === email);
        if (match) {
          return {
            ...baseUser,
            firstName: match.firstName,
            lastName: match.lastName,
            phone: match.phone,
            isPending: true,
          };
        }
      } catch {}
    }
  } else if (baseUser.role === "admin") {
    return {
      ...baseUser,
      firstName: "System",
      lastName: "Admin",
    };
  }
  return baseUser;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from Supabase on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          let role = (session.user.user_metadata?.role as UserRole) || null;
          let isPending = false;

          // Resolve active or pending state
          const { data: guide } = await supabase
            .from("guides")
            .select("id")
            .eq("id", session.user.id)
            .maybeSingle();

          if (guide) {
            role = "guide";
            isPending = false;
          } else {
            const { data: pending } = await supabase
              .from("pending_guides")
              .select("id")
              .eq("id", session.user.id)
              .maybeSingle();

            if (pending) {
              role = "guide";
              isPending = true;
            } else {
              const { data: traveler } = await supabase
                .from("travelers")
                .select("id")
                .eq("id", session.user.id)
                .maybeSingle();

              if (traveler) {
                role = "traveler";
              }
            }
          }

          if (role) {
            setUser(
              enrichUserWithProfile({
                id: session.user.id,
                email: session.user.email || "",
                role: role,
                isPending: role === "guide" ? isPending : undefined,
              })
            );
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error("Error initializing auth via Supabase:", e);
      }

      // Check local storage for mock/local user fallback
      try {
        const localUserStr = localStorage.getItem("kuto_auth_user");
        if (localUserStr) {
          setUser(JSON.parse(localUserStr));
        }
      } catch (err) {
        console.error("Error loading local auth fallback:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        let role = (session.user.user_metadata?.role as UserRole) || null;
        let isPending = false;

        const { data: guide } = await supabase
          .from("guides")
          .select("id")
          .eq("id", session.user.id)
          .maybeSingle();

        if (guide) {
          role = "guide";
          isPending = false;
        } else {
          const { data: pending } = await supabase
            .from("pending_guides")
            .select("id")
            .eq("id", session.user.id)
            .maybeSingle();

          if (pending) {
            role = "guide";
            isPending = true;
          } else {
            const { data: traveler } = await supabase
              .from("travelers")
              .select("id")
              .eq("id", session.user.id)
              .maybeSingle();

            if (traveler) {
              role = "traveler";
            }
          }
        }

        setUser(
          enrichUserWithProfile({
            id: session.user.id,
            email: session.user.email || "",
            role: role,
            isPending: role === "guide" ? isPending : undefined,
          })
        );
      } else {
        const localUserStr = localStorage.getItem("kuto_auth_user");
        if (!localUserStr) {
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const tryLocalLogin = (
    email: string,
    password: string,
    role: UserRole,
    originalError: string
  ): { success: boolean; error?: string } => {
    console.warn(
      `Supabase authentication failed (${originalError}). Falling back to local storage database.`
    );

    if (email.toLowerCase().trim() === "admin@kuto" && password === "qwerty") {
      const adminUser = enrichUserWithProfile({
        email: "admin@kuto",
        role: "admin" as UserRole,
        id: "mock-admin-id",
      });
      setUser(adminUser);
      localStorage.setItem("kuto_auth_user", JSON.stringify(adminUser));
      return { success: true };
    }

    if (role === "guide") {
      const guide = findGuide(email, password);
      if (guide) {
        const authUser = enrichUserWithProfile({
          email: guide.email,
          role: "guide" as UserRole,
          id: `mock-guide-${guide.email}`,
          isPending: false,
        });
        setUser(authUser);
        localStorage.setItem("kuto_auth_user", JSON.stringify(authUser));
        return { success: true };
      }

      const pending = findPendingGuide(email, password);
      if (pending) {
        const authUser = enrichUserWithProfile({
          email: pending.email,
          role: "guide" as UserRole,
          id: `mock-guide-${pending.email}`,
          isPending: true,
        });
        setUser(authUser);
        localStorage.setItem("kuto_auth_user", JSON.stringify(authUser));
        return { success: true };
      }
    } else if (role === "traveler") {
      const traveler = findTraveler(email, password);
      if (traveler) {
        const authUser = enrichUserWithProfile({
          email: traveler.email,
          role: "traveler" as UserRole,
          id: `mock-traveler-${traveler.email}`,
        });
        setUser(authUser);
        localStorage.setItem("kuto_auth_user", JSON.stringify(authUser));
        return { success: true };
      }
    }
    return { success: false, error: originalError || "Wrong credentials" };
  };

  const login = async (
    email: string,
    password: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    if (!email || !password) {
      return { success: false, error: "Wrong credentials" };
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Direct Admin check
    if (normalizedEmail === "admin@kuto" && password === "qwerty") {
      const adminUser = enrichUserWithProfile({
        email: "admin@kuto",
        role: "admin",
        id: "mock-admin-id",
      });
      setUser(adminUser);
      localStorage.setItem("kuto_auth_user", JSON.stringify(adminUser));
      return { success: true };
    }

    if (!role) {
      return { success: false, error: "Please select a role" };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password.trim(),
      });

      if (error) {
        return tryLocalLogin(email, password, role, error.message);
      }

      if (!data.user) {
        return tryLocalLogin(email, password, role, "Wrong credentials");
      }

      let confirmedRole = (data.user.user_metadata?.role as UserRole) || null;
      let isVerified = false;

      // Check active guides
      const { data: guide } = await supabase
        .from("guides")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (guide) {
        confirmedRole = "guide";
        isVerified = true;
      } else {
        const { data: pending } = await supabase
          .from("pending_guides")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

        if (pending) {
          confirmedRole = "guide";
          isVerified = false;
        } else {
          const { data: traveler } = await supabase
            .from("travelers")
            .select("id")
            .eq("id", data.user.id)
            .maybeSingle();

          if (traveler) {
            confirmedRole = "traveler";
          }
        }
      }

      if (!confirmedRole) {
        return tryLocalLogin(email, password, role, "Role not set for this account");
      }

      if (confirmedRole !== role) {
        return tryLocalLogin(email, password, role, `This account is not registered as a ${role}`);
      }

      setUser(
        enrichUserWithProfile({
          id: data.user.id,
          email: data.user.email || email,
          role: confirmedRole,
          isPending: confirmedRole === "guide" ? !isVerified : undefined,
        })
      );

      localStorage.removeItem("kuto_auth_user");
      return { success: true };
    } catch (err: any) {
      return tryLocalLogin(email, password, role, err.message || "An unexpected error occurred");
    }
  };

  const logout = () => {
    supabase.auth.signOut().catch(console.error);
    setUser(null);
    localStorage.removeItem("kuto_auth_user");
  };

  const switchRole = (_newRole: UserRole) => {
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
