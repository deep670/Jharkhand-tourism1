// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdw5-j1B_xrcfQnvoC1zwthvQCIX375io",
  authDomain: "travel-app-6ee13.firebaseapp.com",
  databaseURL: "https://travel-app-6ee13-default-rtdb.firebaseio.com",
  projectId: "travel-app-6ee13",
  storageBucket: "travel-app-6ee13.firebasestorage.app",
  messagingSenderId: "179174881641",
  appId: "1:179174881641:web:b7a31af675fdfb6e8365f8",
  measurementId: "G-L8FSLQ152R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase Authentication services
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Realtime Database
const db = getDatabase(app);

export { auth, googleProvider, db };