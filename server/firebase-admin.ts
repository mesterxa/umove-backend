import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import crypto from "crypto";

process.env.FIRESTORE_PREFER_REST = "1";

let adminApp: App;
let adminDb: Firestore;

function normalizePrivateKey(raw: string): string {
  let pem = raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw;

  // Reconstruct proper PEM if newlines were lost (e.g. stored with spaces)
  const headerMatch = pem.match(/-----BEGIN ([A-Z ]+)-----/);
  const footerMatch = pem.match(/-----END ([A-Z ]+)-----/);

  if (headerMatch && footerMatch) {
    const header = `-----BEGIN ${headerMatch[1]}-----`;
    const footer = `-----END ${footerMatch[1]}-----`;
    const inner = pem
      .replace(header, '')
      .replace(footer, '')
      .replace(/\s+/g, ''); // strip all whitespace from base64 body

    const lines = inner.match(/.{1,64}/g) ?? [];
    pem = [header, ...lines, footer].join('\n') + '\n';
  }

  try {
    const keyObj = crypto.createPrivateKey({ key: pem, format: 'pem' });
    return keyObj.export({ type: 'pkcs8', format: 'pem' }) as string;
  } catch {
    return pem;
  }
}

function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY ?? '');

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
