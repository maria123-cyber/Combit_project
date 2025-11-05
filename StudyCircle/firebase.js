// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCfVNdUUbEf9Wrr94JpPc6dzi21zPCU0o8",
  authDomain: "study-b1542.firebaseapp.com",
  projectId: "study-b1542",
  storageBucket: "study-b1542.appspot.com",
  messagingSenderId: "194281418262",
  appId: "1:194281418262:web:ca607d4de64474b1a18f37"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
