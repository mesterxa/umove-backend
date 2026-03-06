import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyBoTN26ZkMIDGnmlHU-qY_egHHuwJs9tIQ",
  authDomain: "umove-annaba.firebaseapp.com",
  projectId: "umove-annaba",
  storageBucket: "umove-annaba.firebasestorage.app",
  messagingSenderId: "771075643005",
  appId: "1:771075643005:web:ffdb5f08a27f0190dac314",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

function createAuth() {
  try {
    if (Platform.OS === "web") {
      return getAuth(app);
    }
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}

export const auth = createAuth();
export const db = getFirestore(app);
export default app;
