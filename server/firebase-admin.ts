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
      // تعديل هام: التأكد من تحويل النص إلى JSON بشكل صحيح مهما كان تنسيقه في Render
      const serviceAccount = typeof serviceAccountEnv === 'string' 
        ? JSON.parse(serviceAccountEnv) 
        : serviceAccountEnv;

      return initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    } catch (parseError) {
      console.error("❌ Error parsing FIREBASE_SERVICE_ACCOUNT:", parseError);
    }
  }

  // كخطة بديلة إذا لم ينجح الـ JSON الكامل
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId,
    });
  }

  throw new Error("Firebase Admin credentials not found or invalid.");
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
