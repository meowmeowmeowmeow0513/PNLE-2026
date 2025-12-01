import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { UserPlus, LogIn, Mail, Lock, ArrowRight, AlertCircle, CheckCircle, Send } from 'lucide-react';

const SignUp: React.FC = () => {
  const { signup, login, googleLogin, verifyEmail, logout } = useAuth();
  
  const [isLogin, setIsLogin] = useState(false); // Toggle between Login and Signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Verification State
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmailTarget, setVerificationEmailTarget] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Domain Validation Check
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.endsWith('@gmail.com')) {
      setError('Only @gmail.com email addresses are allowed.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        const userCredential = await login(cleanEmail, password);
        
        // Check if email is verified
        if (!userCredential.user.emailVerified) {
           await logout(); // Prevent access
           setError('Please verify your email address before logging in.');
           setLoading(false);
           return;
        }
        
        // If verified, code execution ends here, App.tsx handles the state change via AuthContext
      } else {
        // --- SIGN UP FLOW ---
        const userCredential = await signup(cleanEmail, password);
        
        // Send Verification Email
        await verifyEmail(userCredential.user);
        
        // Important: Sign them out immediately so they don't access Dashboard
        await logout();
        
        setVerificationEmailTarget(cleanEmail);
        setVerificationSent(true);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(`Failed to ${isLogin ? 'log in' : 'sign up'}: ${err.message}`);
      }
    } finally {
      if (!verificationSent) {
        setLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await googleLogin();
      // Google accounts are verified by definition, so no check needed
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in was cancelled.');
      } else {
        setError(err.message || 'An unknown error occurred with Google Sign-In.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- VERIFICATION SUCCESS SCREEN ---
  if (verificationSent) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-700 text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
              <Send size={40} />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
              Verify your email
            </h2>
            
            <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              We have sent you a verification email to <br/>
              <span className="font-bold text-slate-900 dark:text-white">{verificationEmailTarget}</span>.
              <br/><br/>
              Please verify it and log in to start your review.
            </p>
            
            <button
              onClick={() => {
                setVerificationSent(false);
                setIsLogin(true); // Switch form to login mode
                setLoading(false);
                setPassword(''); // Clear password for security
              }}
              className="w-full py-3.5 px-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-500/25 transition-all transform active:scale-[0.98]"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- STANDARD AUTH FORM ---
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-pink-50 dark:bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-500 dark:text-pink-400">
              {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              {isLogin ? 'Welcome Back' : 'Join Batch Crescere'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              {isLogin ? 'Sign in to continue your review.' : 'Create your account to track your progress.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-3 rounded-lg text-sm flex items-center gap-2 break-words text-left">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                  placeholder="student@gmail.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-500/25 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                 <span className="flex items-center gap-2">Processing...</span>
              ) : (isLogin ? 'Log In' : 'Sign Up to Review')}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-medium rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            <span>Sign in with Google</span>
          </button>

          <div className="mt-8 text-center">
             <p className="text-sm text-slate-600 dark:text-slate-400">
                {isLogin ? "Don't have an account yet?" : "Already have an account?"}{' '}
                <button 
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                  }}
                  className="font-bold text-pink-500 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                >
                    {isLogin ? 'Sign Up' : 'Log In'}
                </button>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
