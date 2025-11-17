import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyBzlUI0OnvIJsgOBn0s9zBTpp8RR52jjPQ",
  authDomain: "tiendakp.firebaseapp.com",
  projectId: "tiendakp",
  storageBucket: "tiendakp.firebasestorage.app",
  messagingSenderId: "356543767030",
  appId: "1:356543767030:web:7fefdf7771aceb2ea467d7"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const db = getFirestore(app); // ✅ ¡Esto es necesario!
export { auth, db };