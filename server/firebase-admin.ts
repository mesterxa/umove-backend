import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let adminApp: App;
let adminDb: Firestore;
let adminAuth: Auth;

function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccountEnv) {
    try {
      // تعديل ذكي: تنظيف النص وتحويله لـ JSON بشكل صحيح مهما كان تنسيقه في Render
      const parsedConfig = typeof serviceAccountEnv === 'string' 
        ? JSON.parse(serviceAccountEnv.trim()) 
        : serviceAccountEnv;

      return initializeApp({
        credential: cert(parsedConfig),
        projectId: parsedConfig.project_id || "umove-annaba",
      });
    } catch (parseError) {
      console.error("❌ Critical: Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", parseError);
    }
  }

  throw new Error("Firebase Admin credentials missing or invalid.");
}

try {
  adminApp = initializeFirebaseAdmin();
  adminDb = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);
  console.log("✅ Firebase Admin SDK initialized successfully");
} catch (error) {
  console.error("❌ Firebase Admin SDK initialization failed:", error);
}

export { adminApp, adminDb, adminAuth };
