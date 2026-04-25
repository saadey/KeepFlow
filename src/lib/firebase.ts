import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { useState, useEffect } from 'react';

export let auth: any = null;
export let db: any = null;
export const googleProvider = new GoogleAuthProvider();

export async function getDb(): Promise<any> {
  if (db) return db;
  // Wait up to 2 seconds for init
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 100));
    if (db) return db;
  }
  return null;
}

async function initFirebase() {
  try {
    const configPath = '../../firebase-applet-config.json';
    // @ts-ignore
    const config = await import(/* @vite-ignore */ configPath);
    const app = initializeApp(config.default || config);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.warn("Firebase config not found. Falling back to local storage mode.");
  }
}

// Start initialization
initFirebase();

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let attempts = 0;
    
    const checkAuth = () => {
      if (auth) {
        unsubscribe = onAuthStateChanged(auth, (u) => {
          setUser(u);
          setLoading(false);
        });
      } else if (attempts < 10) {
        attempts++;
        const timer = setTimeout(checkAuth, 100);
        return () => clearTimeout(timer);
      } else {
        // Fallback to local mode after 1s
        setLoading(false);
      }
    };

    const cleanup = checkAuth();
    return () => {
      if (unsubscribe) unsubscribe();
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  const login = async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = () => auth?.signOut();

  return { user, loading, login, logout };
}
