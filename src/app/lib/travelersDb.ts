import seedTravelers from "../data/travelersDb.json";

export type TravelerAccount = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

const STORAGE_KEY = "kuto_travelers_db";

function readDb(): TravelerAccount[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fall through and reseed below
    }
  }
  const seeded = seedTravelers as TravelerAccount[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

export function findTraveler(email: string, password: string): TravelerAccount | undefined {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();
  return readDb().find(t => t.email.toLowerCase() === normalizedEmail && t.password === normalizedPassword);
}

export function travelerExists(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  return readDb().some(t => t.email.toLowerCase() === normalizedEmail);
}

export function registerTraveler(traveler: TravelerAccount): TravelerAccount {
  const db = readDb();
  const newTraveler: TravelerAccount = {
    firstName: traveler.firstName.trim(),
    lastName: traveler.lastName.trim(),
    email: traveler.email.trim().toLowerCase(),
    phone: traveler.phone.trim(),
    password: traveler.password,
  };
  db.push(newTraveler);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  return newTraveler;
}
