// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfVNdUUbEf9Wrr94JpPc6dzi21zPCU0o8",
  authDomain: "study-b1542.firebaseapp.com",
  projectId: "study-b1542",
  storageBucket: "study-b1542.firebasestorage.app",
  messagingSenderId: "194281418262",
  appId: "1:194281418262:web:ca607d4de64474b1a18f37"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
