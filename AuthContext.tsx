import React, { useContext, useState, useEffect, ReactNode } from "react";
import { auth, googleProvider, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
  User,
  UserCredential
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

interface AuthContextType {
  currentUser: User | null;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<UserCredential>;
  googleLogin: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  reloadUser: () => Promise<void>;
  updateUserProfile: (name: string, photoURL: string | null) => Promise<void>;
  deleteUserAccount: () => Promise<void>;
  loading: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to sync Auth user to Firestore
  async function syncUserToFirestore(user: User) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || null,
        createdAt: new Date().toISOString(),
      });
    }
  }

  async function signup(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create Firestore document immediately upon registration
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: "", // Initial name empty
      photoURL: null,
      createdAt: new Date().toISOString()
    });

    await sendEmailVerification(user);
  }

  async function login(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    // Ensure Firestore doc exists (syncs if missing)
    await syncUserToFirestore(result.user);
    return result;
  }

  async function googleLogin() {
    const result = await signInWithPopup(auth, googleProvider);
    // Ensure Firestore doc exists (syncs if missing)
    await syncUserToFirestore(result.user);
    return result;
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  async function resendVerificationEmail() {
    if (currentUser) {
      await sendEmailVerification(currentUser);
    }
  }

  async function reloadUser() {
    if (currentUser) {
      await currentUser.reload();
      // Force update state by creating a new object ref
      setCurrentUser({ ...currentUser });
    }
  }

  async function updateUserProfile(name: string, photoURL: string | null) {
    if (currentUser) {
      // 1. Update Firebase Auth Profile
      await updateProfile(currentUser, {
        displayName: name,
        photoURL: photoURL
      });

      // 2. Update Firestore Document
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        displayName: name,
        photoURL: photoURL
      });

      // 3. Reload local state
      await reloadUser();
    }
  }

  async function deleteUserAccount() {
    if (currentUser) {
      try {
        // 1. Delete Firestore Document
        await deleteDoc(doc(db, "users", currentUser.uid));
        
        // 2. Delete Auth User
        await deleteUser(currentUser);
      } catch (error) {
        console.error("Error deleting account:", error);
        throw error;
      }
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    googleLogin,
    logout,
    resetPassword,
    resendVerificationEmail,
    reloadUser,
    updateUserProfile,
    deleteUserAccount,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
