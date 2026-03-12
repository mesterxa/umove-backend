import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let adminApp: App;
let adminDb: Firestore;

function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // معالجة حاسمة لضمان قراءة المفتاح الخاص بشكل سليم في بيئة Render
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

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
