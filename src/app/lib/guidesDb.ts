import seedGuides from "../data/guidesDb.json";

export type GuideAccount = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

const STORAGE_KEY = "guidego_guides_db";

function readDb(): GuideAccount[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fall through and reseed below
    }
  }
  const seeded = seedGuides as GuideAccount[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function writeDb(guides: GuideAccount[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(guides));
}

export function findGuide(email: string, password: string): GuideAccount | undefined {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();
  return readDb().find(g => g.email.toLowerCase() === normalizedEmail && g.password === normalizedPassword);
}

export function guideExists(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  return readDb().some(g => g.email.toLowerCase() === normalizedEmail);
}

export function registerGuide(guide: GuideAccount): GuideAccount {
  const normalizedGuide: GuideAccount = {
    firstName: guide.firstName.trim(),
    lastName: guide.lastName.trim(),
    email: guide.email.trim().toLowerCase(),
    phone: guide.phone.trim(),
    password: guide.password.trim(),
  };
  writeDb([...readDb(), normalizedGuide]);
  return normalizedGuide;
}
