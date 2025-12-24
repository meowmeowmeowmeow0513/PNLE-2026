
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { UserPlus, LogIn, Mail, Lock, ArrowRight, AlertCircle, ArrowLeft, BookOpen, Sparkles } from 'lucide-react';

interface SignUpProps {
  onForgotPassword: () => void;
  onBack: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onForgotPassword, onBack }) => {
  const { signup, login, googleLogin } = useAuth();
  
  const [isLogin, setIsLogin] = useState(false); // Toggle between Login and Signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.endsWith('@gmail.com')) {
      setError('Only @gmail.com email addresses are allowed.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(cleanEmail, password);
      } else {
        await signup(cleanEmail, password);
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
      setLoading(false); 
    } 
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await googleLogin();
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in was cancelled.');
      } else {
        setError(err.message || 'An unknown error occurred with Google Sign-In.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-screen overflow-y-auto bg-[#020617] flex flex-col items-center justify-center p-4 font-sans text-white selection:bg-pink-500/30 z-[100]">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      <div className="min-h-full w-full flex flex-col items-center justify-center py-12 relative z-10">
        {/* --- HEADER --- */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20 mx-auto mb-4 transform rotate-3 hover:rotate-6 transition-transform">
             <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">PNLE Review Companion</h1>
          <p className="text-slate-400 text-sm">Your journey to the license starts here.</p>
        </div>

        {/* --- CARD --- */}
        <div className="w-full max-w-[420px] bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-500">
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-500/20 text-pink-500">
                {isLogin ? <LogIn size={28} /> : <UserPlus size={28} />}
              </div>
              <h2 className="text-xl font-bold text-white">
                {isLogin ? 'Welcome Back' : 'Join Batch Crescere'}
              </h2>
              <p className="text-slate-400 mt-2 text-xs font-medium">
                {isLogin ? 'Sign in to continue your review.' : 'Create your account to track your progress.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2 break-words text-left">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 ml-1 uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-pink-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-white/10 rounded-xl bg-black/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all text-sm"
                    placeholder="student@gmail.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 ml-1 uppercase tracking-wider">Password</label>
                  {isLogin && (
                      <button 
                          type="button"
                          onClick={onForgotPassword}
                          className="text-xs font-bold text-pink-500 hover:text-pink-400 transition-colors"
                      >
                          Forgot?
                      </button>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-pink-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-white/10 rounded-xl bg-black/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all text-sm"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-500/25 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                   <span className="flex items-center gap-2">Processing...</span>
                ) : (isLogin ? 'Log In' : 'Sign Up to Review')}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="px-2 bg-[#0d1321] text-slate-500 rounded">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              <span>Sign in with Google</span>
            </button>

            <div className="mt-6 text-center">
               <p className="text-xs text-slate-400">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button 
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError(null);
                    }}
                    className="font-bold text-pink-500 hover:text-pink-400 transition-colors ml-1"
                  >
                      {isLogin ? 'Sign Up' : 'Log In'}
                  </button>
               </p>
            </div>
        </div>

        {/* --- FOOTER LINK --- */}
        <div className="mt-8">
          <button 
              onClick={onBack} 
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors"
          >
              <ArrowLeft size={16} />
              Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
