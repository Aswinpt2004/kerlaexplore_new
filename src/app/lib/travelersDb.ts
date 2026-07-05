import seedTravelers from "../data/travelersDb.json";
import { supabase, isSupabaseConfigured } from "./supabaseClient";

export type TravelerAccount = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  createdAt?: string;
};

const STORAGE_KEY = "kuto_travelers_db";

export function readDb(): TravelerAccount[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fall through and reseed below
    }
  }
  const seeded = (seedTravelers as any[]).map(t => ({
    ...t,
    createdAt: t.createdAt || new Date().toISOString(),
  })) as TravelerAccount[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

export function findTraveler(email: string, password: string): TravelerAccount | undefined {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();
  return readDb().find(
    (t) => t.email.toLowerCase() === normalizedEmail && gPasswordCheck(t.password, normalizedPassword)
  );
}

function gPasswordCheck(p1: string | undefined, p2: string): boolean {
  if (!p1) return false;
  return p1.trim() === p2;
}

export function travelerExists(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  return readDb().some((t) => t.email.toLowerCase() === normalizedEmail);
}

export function registerTraveler(traveler: TravelerAccount): TravelerAccount {
  const db = readDb();
  const newTraveler: TravelerAccount = {
    firstName: traveler.firstName.trim(),
    lastName: traveler.lastName.trim(),
    email: traveler.email.trim().toLowerCase(),
    phone: traveler.phone.trim(),
    password: traveler.password,
    createdAt: new Date().toISOString(),
  };
  db.push(newTraveler);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  
  if (isSupabaseConfigured) {
    supabase.auth.signUp({
      email: newTraveler.email,
      password: newTraveler.password || "defaultpass",
      options: {
        data: {
          role: "traveler",
          firstName: newTraveler.firstName,
          lastName: newTraveler.lastName,
          phone: newTraveler.phone,
        }
      }
    }).catch(err => console.error("Error signing up traveler in Supabase:", err));
  }

  return newTraveler;
}

export async function getTravelers(): Promise<TravelerAccount[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("travelers")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data.map(row => ({
          id: row.id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          phone: row.phone,
          createdAt: row.created_at,
        }));
      }
    } catch (err) {
      console.error("Error getting travelers from Supabase:", err);
    }
  }
  return readDb();
}

export async function deleteTraveler(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from("travelers")
        .delete()
        .eq("email", normalizedEmail);

      if (error) {
        console.error("Error deleting traveler from Supabase:", error);
      }
    } catch (err) {
      console.error("Error deleting traveler from Supabase:", err);
    }
  }

  const db = readDb();
  const found = db.some(t => t.email.toLowerCase() === normalizedEmail);
  if (found) {
    const updated = db.filter(t => t.email.toLowerCase() !== normalizedEmail);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  return found;
}
