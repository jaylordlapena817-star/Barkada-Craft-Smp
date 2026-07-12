import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDTJFiY42avRGMqtKrZB7gPhWL-ASTRh3w",
  authDomain: "mybot-d79df.firebaseapp.com",
  projectId: "mybot-d79df",
  storageBucket: "mybot-d79df.firebasestorage.app",
  messagingSenderId: "215753443154",
  appId: "1:215753443154:web:af883fb18af1d499a15c8b"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);
