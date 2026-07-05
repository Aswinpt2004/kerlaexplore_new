import seedGuides from "../data/guidesDb.json";
import { supabase, isSupabaseConfigured } from "./supabaseClient";

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
  createdAt?: string;
};

const STORAGE_KEY = "kuto_guides_db";
const PENDING_STORAGE_KEY = "kuto_pending_guides_db";

// Helper to read verified guides from localStorage
export function readLocalVerified(): GuideAccount[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback
    }
  }
  const seeded = (seedGuides as any[]).map(g => ({
    ...g,
    yearsExperience: g.yearsExperience || "3-5",
    biography: g.biography || "Experienced local guide ready to show you the beauty of Kerala.",
    specializations: g.specializations || ["Backwater Tours", "Local Cuisine"],
    languages: g.languages || ["English", "Malayalam"],
    pricePerDay: g.pricePerDay || 1500,
    availability: g.availability || "Flexible",
    serviceAreas: g.serviceAreas || ["Kochi", "Alleppey"],
  })) as GuideAccount[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

// Helper to write verified guides to localStorage
export function writeLocalVerified(guides: GuideAccount[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(guides));
}

// Helper to read pending guides from localStorage
export function readLocalPending(): GuideAccount[] {
  const raw = localStorage.getItem(PENDING_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback
    }
  }
  return [];
}

// Helper to write pending guides to localStorage
export function writeLocalPending(guides: GuideAccount[]) {
  localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(guides));
}

// Find verified guide locally (used by mock login fallback)
export function findGuide(email: string, password: string): GuideAccount | undefined {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();
  return readLocalVerified().find(
    (g) => g.email.toLowerCase() === normalizedEmail && g.password === normalizedPassword
  );
}

// Find pending guide locally (used by mock login fallback)
export function findPendingGuide(email: string, password: string): GuideAccount | undefined {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();
  return readLocalPending().find(
    (g) => g.email.toLowerCase() === normalizedEmail && g.password === normalizedPassword
  );
}

// Check if guide exists in active or pending records
export async function guideExists(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  
  if (isSupabaseConfigured) {
    try {
      const { data: active } = await supabase
        .from("guides")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();
      if (active) return true;

      const { data: pending } = await supabase
        .from("pending_guides")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();
      if (pending) return true;
    } catch (err) {
      console.error("Error checking guide existence in Supabase:", err);
    }
  }

  // Local storage check fallback/offline
  const inActiveLocal = readLocalVerified().some(g => g.email.toLowerCase() === normalizedEmail);
  const inPendingLocal = readLocalPending().some(g => g.email.toLowerCase() === normalizedEmail);
  return inActiveLocal || inPendingLocal;
}

// Legacy registration fallback (sync version for compatibility)
export function registerGuide(guide: GuideAccount): GuideAccount {
  const pending = readLocalPending();
  const newGuide: GuideAccount = {
    ...guide,
    email: guide.email.trim().toLowerCase(),
    specializations: guide.specializations || [],
    languages: guide.languages || [],
    serviceAreas: guide.serviceAreas || [],
    createdAt: new Date().toISOString(),
  };
  writeLocalPending([...pending, newGuide]);
  return newGuide;
}

// Register a pending guide (stores in pending table)
export async function registerPendingGuide(guide: GuideAccount): Promise<GuideAccount> {
  const newGuide: GuideAccount = {
    ...guide,
    email: guide.email.trim().toLowerCase(),
    specializations: guide.specializations || [],
    languages: guide.languages || [],
    serviceAreas: guide.serviceAreas || [],
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      // First try to sign up via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newGuide.email,
        password: newGuide.password || "defaultpass",
        options: {
          data: {
            role: "guide",
            firstName: newGuide.firstName,
            lastName: newGuide.lastName,
            phone: newGuide.phone,
          }
        }
      });

      if (authError) {
        console.error("Supabase Auth signUp error:", authError);
      }

      const userId = authData?.user?.id || crypto.randomUUID();
      newGuide.id = userId;

      // Insert into pending_guides table
      const { error: dbError } = await supabase.from("pending_guides").insert({
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
      });

      if (dbError) {
        console.error("Supabase db insert into pending_guides error:", dbError);
      }
    } catch (err) {
      console.error("Failed to register pending guide in Supabase:", err);
    }
  }

  // Always write to local storage as fallback/redundancy
  const pending = readLocalPending();
  if (!pending.some(g => g.email.toLowerCase() === newGuide.email)) {
    writeLocalPending([...pending, newGuide]);
  }
  return newGuide;
}

// Fetch all pending guides
export async function getPendingGuides(): Promise<GuideAccount[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("pending_guides")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map(row => ({
          id: row.id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          phone: row.phone,
          password: row.password,
          yearsExperience: row.years_experience,
          biography: row.biography,
          specializations: row.specializations || [],
          languages: row.languages || [],
          pricePerDay: parseFloat(row.price_per_day) || 0,
          availability: row.availability,
          serviceAreas: row.service_areas || [],
          createdAt: row.created_at,
        }));
      }
    } catch (err) {
      console.error("Error fetching pending guides from Supabase:", err);
    }
  }
  return readLocalPending();
}

// Fetch all verified guides
export async function getVerifiedGuides(): Promise<GuideAccount[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("guides")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map(row => ({
          id: row.id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          phone: row.phone,
          password: row.password,
          yearsExperience: row.years_experience,
          biography: row.biography,
          specializations: row.specializations || [],
          languages: row.languages || [],
          pricePerDay: parseFloat(row.price_per_day) || 0,
          availability: row.availability,
          serviceAreas: row.service_areas || [],
          createdAt: row.created_at,
        }));
      }
    } catch (err) {
      console.error("Error fetching verified guides from Supabase:", err);
    }
  }
  return readLocalVerified();
}

// Verify a guide (Approve)
export async function verifyGuide(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  let candidate: GuideAccount | undefined;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("pending_guides")
        .select("*")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (!error && data) {
        candidate = {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          yearsExperience: data.years_experience,
          biography: data.biography,
          specializations: data.specializations || [],
          languages: data.languages || [],
          pricePerDay: parseFloat(data.price_per_day) || 0,
          availability: data.availability,
          serviceAreas: data.service_areas || [],
          createdAt: data.created_at,
        };

        // Insert into active guides
        const { error: insertErr } = await supabase.from("guides").insert({
          id: candidate.id,
          first_name: candidate.firstName,
          last_name: candidate.lastName,
          email: candidate.email,
          phone: candidate.phone,
          password: candidate.password,
          years_experience: candidate.yearsExperience,
          biography: candidate.biography,
          specializations: candidate.specializations,
          languages: candidate.languages,
          price_per_day: candidate.pricePerDay,
          availability: candidate.availability,
          service_areas: candidate.serviceAreas,
        });

        if (insertErr) {
          console.error("Error moving candidate to guides table:", insertErr);
        } else {
          // Delete from pending table
          await supabase.from("pending_guides").delete().eq("email", normalizedEmail);
        }
      }
    } catch (err) {
      console.error("Error verifying guide in Supabase:", err);
    }
  }

  // Fallback / update local storage
  const pendingList = readLocalPending();
  const localCandidate = pendingList.find(g => g.email.toLowerCase() === normalizedEmail);
  
  if (localCandidate) {
    candidate = localCandidate;
    
    // Add to verified list
    const verifiedList = readLocalVerified();
    if (!verifiedList.some(g => g.email.toLowerCase() === normalizedEmail)) {
      writeLocalVerified([...verifiedList, localCandidate]);
    }
    
    // Remove from pending list
    writeLocalPending(pendingList.filter(g => g.email.toLowerCase() !== normalizedEmail));
  }

  return candidate !== undefined;
}

// Reject a pending guide (removes details)
export async function rejectPendingGuide(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured) {
    try {
      await supabase.from("pending_guides").delete().eq("email", normalizedEmail);
    } catch (err) {
      console.error("Error rejecting guide in Supabase:", err);
    }
  }

  const pendingList = readLocalPending();
  const found = pendingList.some(g => g.email.toLowerCase() === normalizedEmail);
  if (found) {
    writeLocalPending(pendingList.filter(g => g.email.toLowerCase() !== normalizedEmail));
  }
  return found;
}
