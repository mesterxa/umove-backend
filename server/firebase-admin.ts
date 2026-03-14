import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

process.env.FIRESTORE_PREFER_REST = "1";

let adminApp: App | undefined;
let adminDb: Firestore | undefined;

function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) return getApps()[0];

  // ── Priority 1: FIREBASE_SERVICE_ACCOUNT JSON (most reliable) ──────────
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountJson) {
    try {
      // Fix: Replit stores the JSON with a corrupted line-break in the private_key
      // field: backslash+space instead of \n. Restore it before parsing.
      const cleaned = serviceAccountJson.replace(/\\ /g, "\\n");
      const serviceAccount = JSON.parse(cleaned);
      console.log("🛠️ Initializing Firebase with FIREBASE_SERVICE_ACCOUNT JSON...");
      return initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id });
    } catch (err) {
      console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", err);
    }
  }

  // ── Priority 2: Individual env vars ────────────────────────────────────
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY ?? "";

  // Normalize: convert literal \n sequences and space-separated lines to real newlines
  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  } else if (!privateKey.includes("\n")) {
    // Key body stored with spaces — reconstruct PEM line breaks
    const header = "-----BEGIN PRIVATE KEY-----";
    const footer = "-----END PRIVATE KEY-----";
    const inner = privateKey.replace(header, "").replace(footer, "").trim().replace(/\s+/g, "");
    const lines = inner.match(/.{1,64}/g) ?? [];
    privateKey = [header, ...lines, footer].join("\n") + "\n";
  }

  if (projectId && clientEmail && privateKey) {
    console.log("🛠️ Initializing Firebase with individual env vars...");
    return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
  }

  throw new Error("No valid Firebase credentials found. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY.");
}

try {
  adminApp = initializeFirebaseAdmin();
  adminDb = getFirestore(adminApp);
  console.log("🚀 Firebase Admin connected successfully.");
} catch (error) {
  console.error("❌ Firebase Admin init failed:", error);
}

export { adminDb };
export const firebaseConnected = Boolean(adminDb);
