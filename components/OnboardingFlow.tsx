import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ArrowRight, Trophy, ShieldCheck, Sparkles, User, Loader2, CheckCircle } from 'lucide-react';

const OnboardingFlow: React.FC = () => {
  const { currentUser, reloadUser, completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(currentUser?.displayName || '');
  const [goal, setGoal] = useState<'top' | 'pass' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Exit Animation State
  const [isExiting, setIsExiting] = useState(false);

  const totalSteps = 4;

  const handleNext = () => {
    setError('');
    if (step === 2 && !name.trim()) {
      setError("Please enter your name/nickname.");
      return;
    }
    if (step === 3 && !goal) {
      setError("Please select a goal.");
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleFinish = async () => {
    if (!currentUser) return;
    setLoading(true);
    
    try {
      // 1. Update Firebase Auth Profile (Display Name) using Modular SDK
      await updateProfile(currentUser, {
        displayName: name
      });

      // 2. Update Firestore Document
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: name,
        goal: goal,
        hasCompletedOnboarding: true,
        onboardingCompletedAt: new Date().toISOString()
      });

      // 3. Trigger Exit Animation
      setIsExiting(true);
      
      // Wait for fade out (800ms) before switching state
      setTimeout(async () => {
          // 4. Update Context State & Reload
          await completeOnboarding(); 
          await reloadUser();
      }, 800);
      
    } catch (err) {
      console.error("Onboarding Error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
      setIsExiting(false);
    }
  };

  // --- RENDER HELPERS ---

  const renderStep1_Welcome = () => (
    <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl mx-auto mb-8 shadow-[0_0_40px_-10px_rgba(236,72,153,0.6)] flex items-center justify-center transform rotate-3">
        <span className="text-3xl font-bold text-white">RN</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
        Welcome to your <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Review Companion</span>
      </h1>
      <p className="text-slate-400 text-lg mb-12 max-w-md mx-auto leading-relaxed">
        We've built this workspace to help you focus, organize, and dominate the Nursing Board Exam.
      </p>
      <button 
        onClick={handleNext}
        className="px-10 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-slate-200 transition-all flex items-center gap-2 mx-auto shadow-xl hover:scale-105 active:scale-95"
      >
        Let's Get Started <ArrowRight size={20} />
      </button>
    </div>
  );

  const renderStep2_Identity = () => (
    <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
      <h2 className="text-3xl font-bold text-white mb-2 text-center">First things first.</h2>
      <p className="text-slate-400 text-center mb-10">What should we call you, Future RN?</p>
      
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-slate-900 ring-1 ring-white/10 rounded-2xl p-2 flex items-center">
            <div className="p-3 text-slate-500">
                <User size={24} />
            </div>
            <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-transparent border-none text-white text-xl placeholder:text-slate-600 focus:ring-0 focus:outline-none py-3 font-medium"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            />
        </div>
      </div>
      
      {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}

      <button 
        onClick={handleNext}
        disabled={!name.trim()}
        className="w-full mt-8 py-4 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-pink-900/20"
      >
        Continue
      </button>
    </div>
  );

  const renderStep3_Goal = () => (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
      <h2 className="text-3xl font-bold text-white mb-2 text-center">Set your intention.</h2>
      <p className="text-slate-400 text-center mb-10">This helps us tailor your daily motivation.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Topnotcher */}
          <div 
            onClick={() => setGoal('top')}
            className={`cursor-pointer group relative p-6 rounded-2xl border transition-all duration-300 ${
                goal === 'top' 
                ? 'bg-gradient-to-b from-purple-900/50 to-slate-900 border-purple-500 ring-1 ring-purple-500/50' 
                : 'bg-slate-900/50 border-white/5 hover:border-purple-500/50 hover:bg-slate-800/50'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                goal === 'top' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-purple-400'
            }`}>
                <Trophy size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Top the Board</h3>
            <p className="text-slate-400 text-sm leading-relaxed">I'm aiming for the Top 10. I want intense focus, strict tracking, and advanced metrics.</p>
          </div>

          {/* Card 2: Pass */}
          <div 
            onClick={() => setGoal('pass')}
            className={`cursor-pointer group relative p-6 rounded-2xl border transition-all duration-300 ${
                goal === 'pass' 
                ? 'bg-gradient-to-b from-emerald-900/50 to-slate-900 border-emerald-500 ring-1 ring-emerald-500/50' 
                : 'bg-slate-900/50 border-white/5 hover:border-emerald-500/50 hover:bg-slate-800/50'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                goal === 'pass' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-emerald-400'
            }`}>
                <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pass with Confidence</h3>
            <p className="text-slate-400 text-sm leading-relaxed">I want a balanced study routine, consistent progress, and peace of mind.</p>
          </div>
      </div>

      {error && <p className="text-red-500 text-sm mt-6 text-center">{error}</p>}

      <button 
        onClick={handleNext}
        disabled={!goal}
        className="w-full mt-10 py-4 bg-white text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-lg hover:scale-[1.02]"
      >
        Confirm Goal
      </button>
    </div>
  );

  const renderStep4_Completion = () => (
    <div className="text-center animate-in zoom-in duration-500">
      <div className="relative w-32 h-32 mx-auto mb-8">
         {loading ? (
             <div className="absolute inset-0 border-4 border-slate-800 border-t-pink-500 rounded-full animate-spin"></div>
         ) : (
            <div className="absolute inset-0 bg-green-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                 <CheckCircle size={64} className="text-white" />
            </div>
         )}
      </div>

      <h2 className="text-3xl font-bold text-white mb-4">
        {loading ? "Setting up your dashboard..." : `You're all set, ${name}!`}
      </h2>
      <p className="text-slate-400 mb-8 max-w-sm mx-auto">
        {loading ? "We are personalizing your experience." : "Your journey to becoming a Registered Nurse officially begins now."}
      </p>

      {!loading && (
        <button 
            onClick={handleFinish}
            className="px-12 py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-full font-bold shadow-[0_0_30px_-5px_rgba(236,72,153,0.5)] transition-all hover:scale-105"
        >
            Enter Dashboard
        </button>
      )}
    </div>
  );

  return (
    <div className={`fixed inset-0 z-[100] bg-[#020617] flex flex-col font-sans selection:bg-pink-500/30 transition-opacity duration-700 ease-in-out ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[128px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      {/* Header / Progress */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
         <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
                <div 
                    key={s} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                        s <= step ? 'w-8 bg-pink-500' : 'w-2 bg-slate-800'
                    }`} 
                />
            ))}
         </div>
         {step > 1 && step < 4 && (
             <button 
                onClick={() => setStep(s => s - 1)}
                className="text-slate-500 hover:text-white text-sm font-medium transition-colors"
             >
                 Back
             </button>
         )}
      </div>

      {/* Main Content Card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
         {step === 1 && renderStep1_Welcome()}
         {step === 2 && renderStep2_Identity()}
         {step === 3 && renderStep3_Goal()}
         {step === 4 && renderStep4_Completion()}
      </main>

      {/* Footer Decoration */}
      <footer className="relative z-10 py-6 text-center">
          <p className="text-slate-600 text-xs uppercase tracking-widest flex items-center justify-center gap-2">
              <Sparkles size={12} className="text-pink-500" />
              Batch Crescere 2026
          </p>
      </footer>
    </div>
  );
};

export default OnboardingFlow;