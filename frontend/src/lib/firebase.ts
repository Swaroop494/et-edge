import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAE3fvNricHRmtKqdN44gFrv3K-2n33jQ0",
  authDomain: "et-edge-live.firebaseapp.com",
  projectId: "et-edge-live",
  storageBucket: "et-edge-live.firebasestorage.app",
  messagingSenderId: "249074067977",
  appId: "1:249074067977:web:72459017235009878526d8"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
export { app };