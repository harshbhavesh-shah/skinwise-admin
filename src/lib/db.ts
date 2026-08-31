import { getFirestore } from "firebase-admin/firestore";
import { ensureFirebaseAdmin } from "./firebase-admin";

export function getDb() {
  ensureFirebaseAdmin();
  return getFirestore();
}
