import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDarVS2F6NWLcnY7zXwhiS9AU0q3uLZVic",
  authDomain: "partiuif-5fc94.firebaseapp.com",
  projectId: "partiuif-5fc94",
  storageBucket: "partiuif-5fc94.firebasestorage.app",
  messagingSenderId: "966097051077",
  appId: "1:966097051077:web:ad684f55321cf866e2ffac"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);