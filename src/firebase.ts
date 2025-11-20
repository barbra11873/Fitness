// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics (optional)
export const analytics = getAnalytics(app);

// Type exports for TypeScript
export type { User } from 'firebase/auth';
export type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';