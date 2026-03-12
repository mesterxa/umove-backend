import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let adminApp: App;
let adminDb: Firestore;

function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY ?? '';
  const privateKey = rawKey.includes('\\n')
    ? rawKey.replace(/\\n/g, '\n')
    : rawKey;

  if (projectId && clientEmail && privateKey) {
    console.log("🛠️ Attempting initialization with dedicated variables...");
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    });
  }

  throw new Error("Missing Firebase variables in Render Environment.");
}

try {
  adminApp = initializeFirebaseAdmin();
  adminDb = getFirestore(adminApp);
  console.log("🚀 SUCCESS: Firebase Admin is now LIVE and CONNECTED!");
} catch (error) {
  console.error("❌ Critical: Firebase connection failed:", error);
}

export { adminDb };
