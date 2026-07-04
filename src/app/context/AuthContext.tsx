import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from Supabase on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Check role in user_metadata first
          let role = session.user.user_metadata?.role as UserRole || null;
          
          if (!role) {
            // Check guides table
            const { data: guide } = await supabase
              .from("guides")
              .select("id")
              .eq("id", session.user.id)
              .maybeSingle();

            if (guide) {
              role = "guide";
            } else {
              // Check travelers table
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
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              role: role,
            });
          }
        }
      } catch (e) {
        console.error("Error initializing auth:", e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        let role = session.user.user_metadata?.role as UserRole || null;
        if (!role) {
          const { data: guide } = await supabase
            .from("guides")
            .select("id")
            .eq("id", session.user.id)
            .maybeSingle();
          if (guide) {
            role = "guide";
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
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          role: role,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    password: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    if (!email || !password) {
      return { success: false, error: "Wrong credentials" };
    }

    if (!role) {
      return { success: false, error: "Please select a role" };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: "Wrong credentials" };
      }

      // Verify the role by checking metadata or querying tables
      let confirmedRole = data.user.user_metadata?.role as UserRole || null;

      if (!confirmedRole) {
        // Query database tables to find the role
        const { data: guide } = await supabase
          .from("guides")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

        if (guide) {
          confirmedRole = "guide";
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
        return { success: false, error: "Role not set for this account" };
      }

      if (confirmedRole !== role) {
        return { success: false, error: `This account is not registered as a ${role}` };
      }

      setUser({
        id: data.user.id,
        email: data.user.email || email,
        role: confirmedRole,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "An unexpected error occurred" };
    }
  };

  const logout = () => {
    supabase.auth.signOut().catch(console.error);
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
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
