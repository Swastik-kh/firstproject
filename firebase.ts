import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

/**
 * Safe accessor for environment variables to prevent runtime crashes
 * in environments where import.meta.env might be undefined.
 */
const safeGetEnv = (key: string, defaultValue: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key] || defaultValue;
    }
  } catch (e) {
    // Fallback to default
  }
  return defaultValue;
};

// Configuration provided by the user
const firebaseConfig = {
  apiKey: safeGetEnv("VITE_FIREBASE_API_KEY", "AIzaSyBNgp4ZKBq_sHjVC0OGwSidhzCOtoGYR4k"),
  authDomain: safeGetEnv("VITE_FIREBASE_AUTH_DOMAIN", "smart-health-dce40.firebaseapp.com"),
  databaseURL: safeGetEnv("VITE_FIREBASE_DATABASE_URL", "https://smart-health-dce40-default-rtdb.asia-southeast1.firebasedatabase.app"),
  projectId: safeGetEnv("VITE_FIREBASE_PROJECT_ID", "smart-health-dce40"),
  storageBucket: safeGetEnv("VITE_FIREBASE_STORAGE_BUCKET", "smart-health-dce40.firebasestorage.app"),
  messagingSenderId: safeGetEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "81529782106"),
  appId: safeGetEnv("VITE_FIREBASE_APP_ID", "1:81529782106:web:286029a5dc050cd0423d63"),
  measurementId: safeGetEnv("VITE_FIREBASE_MEASUREMENT_ID", "G-CSK81WMJEQ")
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);