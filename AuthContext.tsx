import React, { useContext, useState, useEffect, ReactNode } from "react";
import { auth, googleProvider } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  User,
  UserCredential
} from "firebase/auth";

interface AuthContextType {
  currentUser: User | null;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<UserCredential>;
  googleLogin: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  reloadUser: () => Promise<void>;
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

  async function signup(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    // User is automatically logged in by Firebase after creation.
    // We don't need to return anything, the onAuthStateChanged will trigger.
  }

  function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function googleLogin() {
    return signInWithPopup(auth, googleProvider);
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
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
