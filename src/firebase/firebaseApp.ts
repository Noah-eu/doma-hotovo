import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim() ?? '';
const firebaseAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() ?? '';
const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() ?? '';
const firebaseStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() ?? '';
const firebaseMessagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? '';
const firebaseAppId = import.meta.env.VITE_FIREBASE_APP_ID?.trim() ?? '';

export const firebaseHouseholdId = import.meta.env.VITE_FIREBASE_HOUSEHOLD_ID?.trim() ?? '';

export const isFirebaseConfigured = Boolean(
    firebaseApiKey &&
        firebaseAuthDomain &&
        firebaseProjectId &&
        firebaseStorageBucket &&
        firebaseMessagingSenderId &&
        firebaseAppId &&
        firebaseHouseholdId,
);

const firebaseConfig = isFirebaseConfigured
    ? {
          apiKey: firebaseApiKey,
          authDomain: firebaseAuthDomain,
          projectId: firebaseProjectId,
          storageBucket: firebaseStorageBucket,
          messagingSenderId: firebaseMessagingSenderId,
          appId: firebaseAppId,
      }
    : null;

export const firebaseApp: FirebaseApp | null = firebaseConfig
    ? getApps().length > 0
        ? getApp()
        : initializeApp(firebaseConfig)
    : null;

export const firebaseAuth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
export const firestoreDb: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;
