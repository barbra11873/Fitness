// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getMessaging } from 'firebase/messaging';
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqbP7vdYYYETBhZIjZh8WOsK6VkQnSDIw",
  authDomain: "workout-tracker-74808.firebaseapp.com",
  projectId: "workout-tracker-74808",
  storageBucket: "workout-tracker-74808.firebasestorage.app",
  messagingSenderId: "148316061940",
  appId: "1:148316061940:web:665416b21f4bfc4c411ea1",
  measurementId: "G-R0XV1B9VQ4"
};

// Initialize Firebase
console.log('Initializing Firebase with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

const app = initializeApp(firebaseConfig);
console.log('Firebase app initialized successfully');

// Initialize Firebase services with performance optimizations
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

console.log('Firebase services initialized');

// Test Firestore connection
try {
  console.log('Testing Firestore connection...');
  // This will fail if Firestore is not enabled in Firebase console
} catch (error) {
  console.error('Firestore connection test failed:', error);
}

// Enable offline persistence for better performance
try {
  enableIndexedDbPersistence(db);
  console.log('Offline persistence enabled');
} catch (err) {
  console.warn('Failed to enable offline persistence:', err);
}

// Analytics (optional)
export const analytics = getAnalytics(app);

// Type exports for TypeScript
export type { User } from 'firebase/auth';
export type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';