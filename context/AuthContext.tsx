import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserRole = "client" | "partner" | "admin";

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  needsTruckSetup?: boolean;
  createdAt?: unknown;
};

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    phone: string,
    role: "client" | "partner"
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const ADMIN_EMAIL = "aymenmed25071999@gmail.com";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (uid: string): Promise<UserProfile | null> => {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await fetchProfile(user.uid);
    setProfile(p);
  }, [user, fetchProfile]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const p = await fetchProfile(firebaseUser.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      phone: string,
      role: "client" | "partner"
    ) => {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
      const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const actualRole: UserRole = isAdmin ? "admin" : role;

      const userDoc: UserProfile = {
        uid: newUser.uid,
        email,
        name,
        phone,
        role: actualRole,
        needsTruckSetup: role === "partner" && !isAdmin,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", newUser.uid), userDoc);
    },
    []
  );

  const logout = useCallback(async () => {
    await signOut(auth);
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, profile, loading, login, register, logout, refreshProfile }),
    [user, profile, loading, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const ADMIN_EMAIL_CONST = ADMIN_EMAIL;
