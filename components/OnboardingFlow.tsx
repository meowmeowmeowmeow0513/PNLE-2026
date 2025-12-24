
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ArrowRight, Trophy, ShieldCheck, Sparkles, User, Loader2, CheckCircle, Heart, Scroll } from 'lucide-react';
import { sendDiscordNotification } from '../utils/discordWebhook';

const OnboardingFlow: React.FC = () => {
  const { currentUser, reloadUser, completeOnboarding, updateUserProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(currentUser?.displayName || '');
  const [goal, setGoal] = useState<'top' | 'pass' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Exit Animation State
  const [isExiting, setIsExiting] = useState(false);

  const totalSteps = 5;

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
    // Scroll to top on step change for mobile
    window.scrollTo(0, 0);
  };

  const handleFinish = async () => {
    if (!currentUser) return;
    setLoading(true);
    
    try {
      await updateUserProfile(name, currentUser.photoURL);

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        goal: goal,
        hasCompletedOnboarding: true,
        onboardingCompletedAt: new Date().toISOString()
      });

      // Send Discord Notification
      sendDiscordNotification(
        "New Recruit Joined",
        `**${name}** has initialized their system.\nGoal: ${goal === 'top' ? 'Topnotcher' : 'Board Passer'}`,
        'stats',
        'success'
      );

      setIsExiting(true);
      
      setTimeout(async () => {
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
    <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-700 w-full px-4">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-pink-500 to-rose-600 rounded-[1.5rem] md:rounded-[2rem] mx-auto mb-6 md:mb-8 shadow-[0_0_50px_-10px_rgba(236,72,153,0.6)] flex items-center justify-center transform rotate-3 ring-4 ring-white/10">
        <span className="text-3xl md:text-4xl font-bold text-white">RN</span>
      </div>
      <h1 className="text-3xl md:text-6xl font-black text-white mb-4 md:mb-6 tracking-tight leading-tight">
        Welcome to your <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Sanctuary.</span>
      </h1>
      <p className="text-slate-400 text-base md:text-lg mb-8 md:mb-12 max-w-md mx-auto leading-relaxed">
        This isn't just an app. It's your companion for the most important battle of your career.
      </p>
      <button 
        onClick={handleNext}
        className="px-10 py-4 md:px-12 md:py-5 bg-white text-slate-900 rounded-full font-bold text-base md:text-lg hover:bg-slate-200 transition-all flex items-center gap-2 mx-auto shadow-2xl hover:scale-105 active:scale-95 group"
      >
        Initialize System <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );

  const renderStep2_Identity = () => (
    <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-right-8 duration-500 px-4">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">Identity Verification</h2>
      <p className="text-slate-400 text-center mb-8 md:mb-10 text-sm md:text-base">What should we call you, Future RN?</p>
      
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
                placeholder="Enter Name or Callsign"
                className="w-full bg-transparent border-none text-white text-lg md:text-xl placeholder:text-slate-600 focus:ring-0 focus:outline-none py-3 font-medium"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            />
        </div>
      </div>
      
      {error && <p className="text-red-500 text-sm mt-3 text-center font-bold">{error}</p>}

      <button 
        onClick={handleNext}
        disabled={!name.trim()}
        className="w-full mt-8 py-4 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-pink-900/20"
      >
        Confirm Identity
      </button>
    </div>
  );

  const renderStep3_Goal = () => (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500 px-4 py-4">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">Set Your Intention</h2>
      <p className="text-slate-400 text-center mb-8 md:mb-10 text-sm md:text-base">This calibrates your daily motivation engine.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Card 1: Topnotcher */}
          <div 
            onClick={() => setGoal('top')}
            className={`cursor-pointer group relative p-6 md:p-8 rounded-2xl md:rounded-3xl border transition-all duration-300 ${
                goal === 'top' 
                ? 'bg-gradient-to-b from-purple-900/50 to-slate-900 border-purple-500 ring-1 ring-purple-500/50 scale-[1.02] md:scale-105 shadow-2xl' 
                : 'bg-slate-900/50 border-white/5 hover:border-purple-500/50 hover:bg-slate-800/50'
            }`}
          >
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 transition-colors ${
                goal === 'top' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/40' : 'bg-slate-800 text-slate-400 group-hover:text-purple-400'
            }`}>
                <Trophy size={28} />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">Top the Board</h3>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">I'm aiming for the Top 10. I want intense focus, strict tracking, and advanced metrics. Pressure makes diamonds.</p>
          </div>

          {/* Card 2: Pass */}
          <div 
            onClick={() => setGoal('pass')}
            className={`cursor-pointer group relative p-6 md:p-8 rounded-2xl md:rounded-3xl border transition-all duration-300 ${
                goal === 'pass' 
                ? 'bg-gradient-to-b from-emerald-900/50 to-slate-900 border-emerald-500 ring-1 ring-emerald-500/50 scale-[1.02] md:scale-105 shadow-2xl' 
                : 'bg-slate-900/50 border-white/5 hover:border-emerald-500/50 hover:bg-slate-800/50'
            }`}
          >
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 transition-colors ${
                goal === 'pass' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' : 'bg-slate-800 text-slate-400 group-hover:text-emerald-400'
            }`}>
                <ShieldCheck size={28} />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">Pass with Confidence</h3>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">I want a balanced, sustainable study routine. Consistent progress, mental clarity, and peace of mind.</p>
          </div>
      </div>

      {error && <p className="text-red-500 text-sm font-bold mt-6 text-center">{error}</p>}

      <button 
        onClick={handleNext}
        disabled={!goal}
        className="w-full mt-8 md:mt-10 py-4 bg-white text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-lg hover:scale-[1.02]"
      >
        Lock In Goal
      </button>
    </div>
  );

  const renderStep4_Manifesto = () => (
      <div className="w-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 text-center px-4">
          <Scroll size={40} className="text-amber-400 mx-auto mb-6 opacity-80" />
          <h2 className="text-2xl md:text-3xl font-black text-white mb-6 md:mb-8 uppercase tracking-widest">The Pledge</h2>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-8 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-50"></div>
              <p className="text-base md:text-xl text-slate-200 font-serif italic leading-relaxed">
                  "I promise to show up for myself, even on the hard days. <br/>
                  I am not studying to pass a test. <br/>
                  I am studying to save lives."
              </p>
              <div className="mt-6 flex justify-center">
                  <Heart size={24} className="text-pink-500 animate-pulse" fill="currentColor" />
              </div>
          </div>

          <button 
            onClick={handleNext}
            className="w-full md:w-auto px-10 py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-full font-bold transition-all shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)] hover:scale-105"
          >
            I Accept the Challenge
          </button>
      </div>
  );

  const renderStep5_Completion = () => (
    <div className="text-center animate-in zoom-in duration-500 px-4">
      <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 md:mb-8">
         {loading ? (
             <div className="absolute inset-0 border-4 border-slate-800 border-t-pink-500 rounded-full animate-spin"></div>
         ) : (
            <div className="absolute inset-0 bg-green-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-[0_0_50px_rgba(34,197,94,0.5)]">
                 <CheckCircle size={56} className="text-white md:w-16 md:h-16" />
            </div>
         )}
      </div>

      <h2 className="text-2xl md:text-4xl font-black text-white mb-4 tracking-tight">
        {loading ? "Calibrating..." : `Welcome Home, ${name}.`}
      </h2>
      <p className="text-slate-400 mb-8 max-w-sm mx-auto text-base md:text-lg">
        {loading ? "Preparing your dashboard." : "Your license awaits."}
      </p>

      {!loading && (
        <button 
            onClick={handleFinish}
            className="w-full md:w-auto px-10 py-4 md:px-12 md:py-5 bg-pink-600 hover:bg-pink-500 text-white rounded-full font-bold shadow-[0_0_40px_-5px_rgba(236,72,153,0.6)] transition-all hover:scale-105 text-base md:text-lg"
        >
            Enter Dashboard
        </button>
      )}
    </div>
  );

  return (
    <div className={`fixed inset-0 z-[100] bg-[#020617] flex flex-col font-sans selection:bg-pink-500/30 transition-opacity duration-700 ease-in-out overflow-y-auto overflow-x-hidden custom-scrollbar ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="min-h-full flex flex-col relative">
        {/* Background Ambience - Ensure it covers min-height */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[128px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[128px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>

        {/* Header / Progress - Fixed or Relative based on need, relative allows scrolling content to start below it */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 md:py-8 flex items-center justify-between shrink-0">
           <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                  <div 
                      key={s} 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                          s <= step ? 'w-6 md:w-8 bg-pink-500 shadow-lg shadow-pink-500/50' : 'w-2 bg-slate-800'
                      }`} 
                  />
              ))}
           </div>
           {step > 1 && step < 5 && (
               <button 
                  onClick={() => setStep(s => s - 1)}
                  className="text-slate-500 hover:text-white text-xs md:text-sm font-bold uppercase tracking-widest transition-colors px-2 py-1"
               >
                   Back
               </button>
           )}
        </div>

        {/* Main Content Card - Flex-1 to push footer down */}
        <main className="flex-1 flex flex-col items-center justify-center py-8 md:py-12 relative z-10">
           {step === 1 && renderStep1_Welcome()}
           {step === 2 && renderStep2_Identity()}
           {step === 3 && renderStep3_Goal()}
           {step === 4 && renderStep4_Manifesto()}
           {step === 5 && renderStep5_Completion()}
        </main>

        {/* Footer Decoration - Shrink-0 to keep it at the very bottom */}
        <footer className="relative z-10 py-6 md:py-8 text-center shrink-0">
            <p className="text-slate-600 text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2 font-black">
                <Sparkles size={12} className="text-pink-500" />
                Batch Crescere 2026
            </p>
        </footer>
      </div>
    </div>
  );
};

export default OnboardingFlow;
