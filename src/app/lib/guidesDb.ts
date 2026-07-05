import { supabase } from "./supabaseClient";

// ── Types ─────────────────────────────────────────────────────────────────────
export type GuideStatus = "pending" | "approved" | "rejected" | "suspended";

export type GuideAccount = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  yearsExperience?: string;
  biography?: string;
  specializations?: string[];
  languages?: string[];
  pricePerDay?: number;
  availability?: string;
  serviceAreas?: string[];
  status?: GuideStatus;
  createdAt?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function mapRow(row: any): GuideAccount {
  return {
    id: row.id,
    firstName: row.first_name || "",
    lastName: row.last_name || "",
    email: row.email || "",
    phone: row.phone || "",
    password: row.password,
    yearsExperience: row.years_experience,
    biography: row.biography,
    specializations: row.specializations || [],
    languages: row.languages || [],
    pricePerDay: row.price_per_day ? parseFloat(row.price_per_day) : 0,
    availability: row.availability,
    serviceAreas: row.service_areas || [],
    status: row.status as GuideStatus,
    createdAt: row.created_at,
  };
}

// ── Check if guide email already exists ──────────────────────────────────────
export async function guideExists(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const { data } = await supabase
    .from("guides")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();
  return !!data;
}

// ── Register a new guide with status = pending ────────────────────────────────
export async function registerGuide(guide: GuideAccount): Promise<GuideAccount> {
  const newGuide: GuideAccount = {
    ...guide,
    email: guide.email.trim().toLowerCase(),
    specializations: guide.specializations || [],
    languages: guide.languages || [],
    serviceAreas: guide.serviceAreas || [],
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  // Create Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: newGuide.email,
    password: newGuide.password || "defaultpass",
    options: {
      data: {
        role: "guide",
        firstName: newGuide.firstName,
        lastName: newGuide.lastName,
        phone: newGuide.phone,
      },
    },
  });

  if (authError) {
    console.error("Guide Auth signUp error:", authError);
    throw new Error(authError.message);
  }

  const userId = authData?.user?.id || crypto.randomUUID();
  newGuide.id = userId;

  // Insert into guides table (trigger also does this, but ensure full profile)
  const { error: dbError } = await supabase.from("guides").upsert({
    id: userId,
    first_name: newGuide.firstName,
    last_name: newGuide.lastName,
    email: newGuide.email,
    phone: newGuide.phone,
    password: newGuide.password,
    years_experience: newGuide.yearsExperience,
    biography: newGuide.biography,
    specializations: newGuide.specializations,
    languages: newGuide.languages,
    price_per_day: newGuide.pricePerDay,
    availability: newGuide.availability,
    service_areas: newGuide.serviceAreas,
    status: "pending",
  });

  if (dbError) {
    console.error("Guide DB insert error:", dbError);
  }

  return newGuide;
}

// ── Get all pending guide applications ───────────────────────────────────────
export async function getPendingGuides(): Promise<GuideAccount[]> {
  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending guides:", error);
    return [];
  }
  return (data || []).map(mapRow);
}

// ── Get all approved guides (visible in marketplace) ─────────────────────────
export async function getVerifiedGuides(): Promise<GuideAccount[]> {
  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching approved guides:", error);
    return [];
  }
  return (data || []).map(mapRow);
}

// ── Get all guides (for admin dashboards) ────────────────────────────────────
export async function getAllGuides(): Promise<GuideAccount[]> {
  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all guides:", error);
    return [];
  }
  return (data || []).map(mapRow);
}

// ── Approve a pending guide (status → approved) ───────────────────────────────
export async function verifyGuide(email: string): Promise<boolean> {
  const { error } = await supabase
    .from("guides")
    .update({ status: "approved" })
    .eq("email", email.trim().toLowerCase());

  if (error) {
    console.error("Error approving guide:", error);
    return false;
  }
  return true;
}

// ── Reject a pending guide (status → rejected) ────────────────────────────────
export async function rejectPendingGuide(email: string): Promise<boolean> {
  const { error } = await supabase
    .from("guides")
    .update({ status: "rejected" })
    .eq("email", email.trim().toLowerCase());

  if (error) {
    console.error("Error rejecting guide:", error);
    return false;
  }
  return true;
}

// ── Revoke a guide approval (status → pending) ────────────────────────────────
export async function revokeGuide(email: string): Promise<boolean> {
  const { error } = await supabase
    .from("guides")
    .update({ status: "pending" })
    .eq("email", email.trim().toLowerCase());

  if (error) {
    console.error("Error revoking guide approval:", error);
    return false;
  }
  return true;
}
