import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import serviceAccount from "../config/firebase-service-account.json"
  with { type: "json" };

const firebaseApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert(
          serviceAccount as Parameters<typeof cert>[0]
        ),
      })
    : getApps()[0];

export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDB = getFirestore(firebaseApp, "(default)");

export default firebaseApp;