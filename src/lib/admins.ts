import { getDb } from "./db";

export type AdminRole = "superadmin" | "admin";

export type AdminRecord = {
  email: string;
  role: AdminRole;
  addedAt: string;
  addedBy: string;
};

const ADMINS_COLLECTION = "admins";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// The one email that's always a superadmin, regardless of what's in
// Firestore — a bootstrap fallback so a Firestore mistake (or an empty
// collection on first run) can never lock everyone out of the panel.
function bootstrapSuperadminEmail(): string | null {
  const email = process.env.SUPERADMIN_EMAIL;
  return email ? normalizeEmail(email) : null;
}

function bootstrapRecord(email: string): AdminRecord {
  return { email, role: "superadmin", addedAt: new Date(0).toISOString(), addedBy: "bootstrap" };
}

export async function getAdminRecord(email: string | undefined | null): Promise<AdminRecord | null> {
  if (!email) return null;
  const id = normalizeEmail(email);
  const bootstrap = bootstrapSuperadminEmail();

  const db = getDb();
  const doc = await db.collection(ADMINS_COLLECTION).doc(id).get();
  if (doc.exists) {
    const data = doc.data()!;
    // The bootstrap email is always a superadmin even if its Firestore
    // record was somehow edited down to a plain admin.
    if (id === bootstrap) return { ...bootstrapRecord(id), ...data, role: "superadmin" };
    return data as AdminRecord;
  }

  if (id === bootstrap) return bootstrapRecord(id);
  return null;
}

export async function isEmailAllowed(email: string | undefined | null): Promise<boolean> {
  return (await getAdminRecord(email)) !== null;
}

export async function listAdmins(): Promise<AdminRecord[]> {
  const db = getDb();
  const snapshot = await db.collection(ADMINS_COLLECTION).orderBy("addedAt", "asc").get();
  const records = snapshot.docs.map((doc) => doc.data() as AdminRecord);

  const bootstrap = bootstrapSuperadminEmail();
  if (bootstrap && !records.some((r) => r.email === bootstrap)) {
    records.unshift(bootstrapRecord(bootstrap));
  }
  // The bootstrap email always displays as superadmin, even if its stored
  // record disagrees.
  return records.map((r) => (r.email === bootstrap ? { ...r, role: "superadmin" } : r));
}

export async function addAdmin(email: string, addedBy: string): Promise<AdminRecord> {
  const id = normalizeEmail(email);
  const db = getDb();
  const record: AdminRecord = {
    email: id,
    role: "admin",
    addedAt: new Date().toISOString(),
    addedBy: normalizeEmail(addedBy),
  };
  // set() (not create()) so re-adding someone who was previously removed
  // just works, rather than erroring on an existing-but-deleted doc id.
  await db.collection(ADMINS_COLLECTION).doc(id).set(record);
  return record;
}

export async function removeAdmin(email: string): Promise<void> {
  const id = normalizeEmail(email);
  if (id === bootstrapSuperadminEmail()) {
    throw new Error("The super admin can't be removed.");
  }
  const db = getDb();
  await db.collection(ADMINS_COLLECTION).doc(id).delete();
}
