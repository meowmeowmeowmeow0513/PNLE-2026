
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, inMemoryPersistence } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBL7_7u4_OPmXWUARlZWYNfA55bICdNR-k",
  authDomain: "pnle-review-companion.firebaseapp.com",
  projectId: "pnle-review-companion",
  storageBucket: "pnle-review-companion.firebasestorage.app",
  messagingSenderId: "1071728959090",
  appId: "1:1071728959090:web:7dd4e75be1118f2c1ceceb"
};

// Initialize Firebase (Modular)
const app = initializeApp(firebaseConfig);

// Initialize Auth with Persistence
const auth = getAuth(app);
// Attempt to set local persistence (best for mobile/web apps)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn("Auth persistence failed, falling back to memory:", error);
  setPersistence(auth, inMemoryPersistence);
});

// Initialize Firestore with offline support
// Using initializeFirestore instead of getFirestore allows configuring settings
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

const storage = getStorage(app, "gs://pnle-review-companion.firebasestorage.app");
const googleProvider = new GoogleAuthProvider();

export { auth, db, storage, googleProvider };
export default app;
