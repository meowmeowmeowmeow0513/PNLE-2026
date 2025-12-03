import React, { useContext, useState, useEffect, ReactNode } from "react";
import { auth, googleProvider, db } from "./firebase";
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  UserCredential
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

type OnboardingStatus = 'loading' | 'pending' | 'completed';

interface AuthContextType {
  currentUser: User | null;
  onboardingStatus: OnboardingStatus;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<UserCredential>;
  googleLogin: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  reloadUser: () => Promise<void>;
  updateUserProfile: (name: string, photoURL: string | null) => Promise<void>;
  deleteUserAccount: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  loading: boolean;
  userVersion: number; // Exposed to force re-renders if needed
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
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>('loading');
  const [userVersion, setUserVersion] = useState(0);

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
        hasCompletedOnboarding: false // Default to false
      });
      return false; // Onboarding not done
    } else {
        // Check if onboarding is done
        return userSnap.data().hasCompletedOnboarding === true;
    }
  }

  async function checkOnboardingStatus(user: User) {
      try {
          const isDone = await syncUserToFirestore(user);
          setOnboardingStatus(isDone ? 'completed' : 'pending');
      } catch (e) {
          console.error("Error checking onboarding status", e);
          setOnboardingStatus('pending'); 
      }
  }

  async function signup(email: string, password: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Create Firestore doc immediately
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: "",
      photoURL: null,
      createdAt: new Date().toISOString(),
      hasCompletedOnboarding: false
    });

    await sendEmailVerification(user);
  }

  async function login(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    // Onboarding check handled in onAuthStateChanged
    return result;
  }

  async function googleLogin() {
    const result = await signInWithPopup(auth, googleProvider);
    // Onboarding check handled in onAuthStateChanged
    return result;
  }

  function logout() {
    setOnboardingStatus('loading');
    return signOut(auth);
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  async function resendVerificationEmail() {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  }

  async function reloadUser() {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      // Force React to re-render context consumers by updating a version counter.
      // We do NOT spread the user object ({...user}) because it strips prototype methods like getIdToken, causing crashes.
      setUserVersion(prev => prev + 1);
      // Trigger a shallow update to currentUser if needed, though usually the reference is the same.
      setCurrentUser(auth.currentUser); 
      
      // Re-check onboarding in case it changed
      await checkOnboardingStatus(auth.currentUser);
    }
  }

  async function updateUserProfile(name: string, photoURL: string | null) {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photoURL
      });

      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        displayName: name,
        photoURL: photoURL
      });

      await reloadUser();
    }
  }

  async function deleteUserAccount() {
    if (auth.currentUser) {
      const user = auth.currentUser;
      try {
        await deleteDoc(doc(db, "users", user.uid));
        await user.delete();
      } catch (error) {
        console.error("Error deleting account:", error);
        throw error;
      }
    }
  }

  async function completeOnboarding() {
      setOnboardingStatus('completed');
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
          await checkOnboardingStatus(user);
      } else {
          setOnboardingStatus('loading');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Construct the value object. Including userVersion ensures this object is new
  // whenever reloadUser is called, forcing consumers to re-render.
  const value = {
    currentUser,
    onboardingStatus,
    signup,
    login,
    googleLogin,
    logout,
    resetPassword,
    resendVerificationEmail,
    reloadUser,
    updateUserProfile,
    deleteUserAccount,
    completeOnboarding,
    loading,
    userVersion
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};