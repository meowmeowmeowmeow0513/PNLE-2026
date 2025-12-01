import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBL7_7u4_OPmXWUARlZWYNfA55bICdNR-k",
  authDomain: "pnle-review-companion.firebaseapp.com",
  projectId: "pnle-review-companion",
  storageBucket: "pnle-review-companion.firebasestorage.app",
  messagingSenderId: "1071728959090",
  appId: "1:1071728959090:web:7dd4e75be1118f2c1ceceb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
