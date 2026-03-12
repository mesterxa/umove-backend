import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let adminApp: App;
let adminDb: Firestore | null = null; // جعلناه يقبل null لتجنب الانهيار المفاجئ
let adminAuth: Auth;

function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccountEnv) {
    try {
      // تعديل هام: تنظيف النص من أي علامات اقتباس زائدة قد يضيفها Render أو GitHub
      const cleanJson = serviceAccountEnv.trim().startsWith('"') 
        ? JSON.parse(serviceAccountEnv) 
        : serviceAccountEnv;
        
      const serviceAccount = typeof cleanJson === 'string' ? JSON.parse(cleanJson) : cleanJson;

      return initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", e);
    }
  }

  // محاولة القراءة من المتغيرات المنفصلة كخطة بديلة
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId,
    });
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
