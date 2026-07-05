import { supabase } from "./supabaseClient";

// ── Types ─────────────────────────────────────────────────────────────────────
export type TravelerAccount = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  createdAt?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function mapRow(row: any): TravelerAccount {
  return {
    id: row.id,
    firstName: row.first_name || "",
    lastName: row.last_name || "",
    email: row.email || "",
    phone: row.phone || "",
    createdAt: row.created_at,
  };
}

// ── Check if traveler email already exists ────────────────────────────────────
export async function travelerExists(email: string): Promise<boolean> {
  const { data } = await supabase
    .from("travelers")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  return !!data;
}

// ── Register a new traveler ───────────────────────────────────────────────────
export async function registerTraveler(
  traveler: TravelerAccount
): Promise<TravelerAccount> {
  const normalizedEmail = traveler.email.trim().toLowerCase();

  // Create Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: traveler.password || "defaultpass",
    options: {
      data: {
        role: "traveler",
        firstName: traveler.firstName.trim(),
        lastName: traveler.lastName.trim(),
        phone: traveler.phone.trim(),
      },
    },
  });

  if (authError) {
    console.error("Traveler Auth signUp error:", authError);
    throw new Error(authError.message);
  }

  const userId = authData?.user?.id || crypto.randomUUID();

  // Insert into travelers table (trigger also does this, but ensures full profile)
  const { error: dbError } = await supabase.from("travelers").upsert({
    id: userId,
    first_name: traveler.firstName.trim(),
    last_name: traveler.lastName.trim(),
    email: normalizedEmail,
    phone: traveler.phone.trim(),
    password: traveler.password,
  });

  if (dbError) {
    console.error("Traveler DB insert error:", dbError);
  }

  return {
    id: userId,
    firstName: traveler.firstName.trim(),
    lastName: traveler.lastName.trim(),
    email: normalizedEmail,
    phone: traveler.phone.trim(),
    createdAt: new Date().toISOString(),
  };
}

// ── Get all travelers (admin only) ────────────────────────────────────────────
export async function getTravelers(): Promise<TravelerAccount[]> {
  const { data, error } = await supabase
    .from("travelers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching travelers:", error);
    return [];
  }
  return (data || []).map(mapRow);
}

// ── Delete a traveler account ─────────────────────────────────────────────────
export async function deleteTraveler(email: string): Promise<boolean> {
  const { error } = await supabase
    .from("travelers")
    .delete()
    .eq("email", email.trim().toLowerCase());

  if (error) {
    console.error("Error deleting traveler:", error);
    return false;
  }
  return true;
}
