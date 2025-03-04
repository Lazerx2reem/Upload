import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import 'firebase/database';
import { getDatabase, ref, set } from "firebase/database";
import "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDFzFFsmdqwLUoEaPSTcTp77Dd7TGdOO1U",
  authDomain: "ratemymanager-8e003.firebaseapp.com",
  projectId: "ratemymanager-8e003",
  storageBucket: "ratemymanager-8e003.firebasestorage.app",
  messagingSenderId: "901655084349",
  appId: "1:901655084349:web:1ead99f81dc3a465f21954",
  measurementId: "G-QD7WX8106P"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, db };
// Export Firebase Realtime Database
export const database = getDatabase(app);

export {signOut};
