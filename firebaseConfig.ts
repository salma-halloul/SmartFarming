import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyDrKrr-4Sea9gfXJrdcSYWKnKK49ILFWCY",
  authDomain: "smartfarm-df9ed.firebaseapp.com",
  projectId: "smartfarm-df9ed",
  storageBucket: "smartfarm-df9ed.firebasestorage.app",
  messagingSenderId: "80386433528",
  appId: "1:80386433528:web:e5dfebbed38da5365a360d",
  measurementId: "G-B6E88LKLM2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialiser Firestore
const db = getFirestore(app);

export { db };