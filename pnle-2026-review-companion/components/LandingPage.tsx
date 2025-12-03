
import React from 'react';
import { ArrowRight, Sparkles, Activity, Timer, Brain } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden flex flex-col font-sans text-white selection:bg-pink-500/30">
      
      {/* --- AURORA BACKGROUND EFFECTS --- */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[128px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Optional Grid Overlay for Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      {/* --- NAVBAR --- */}
      <header className="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
                <span className="font-bold text-lg text-white">RN</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white/90">Review Companion</span>
        </div>
        <button 
            onClick={onGetStarted}
            className="hidden sm:block px-6 py-2.5 rounded-full border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all text-sm font-medium text-slate-300"
        >
            Log In
        </button>
      </header>

      {/* --- MAIN HERO SECTION --- */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 text-center mt-[-40px]">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 backdrop-blur-sm">
            <Sparkles size={14} className="text-yellow-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Batch Crescere 2026</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-400 max-w-5xl leading-[0.95] animate-in fade-in zoom-in-95 duration-1000">
            Your Journey to the <br className="hidden md:block"/> License Starts Here.
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            The ultimate all-in-one review dashboard designed specifically for nursing students. Track progress, master mnemonics, and crush the board exam.
        </p>

        {/* CTA Button */}
        <button
            onClick={onGetStarted}
            className="group relative px-8 py-5 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(236,72,153,0.5)] hover:shadow-[0_0_80px_-20px_rgba(236,72,153,0.7)] transition-all transform hover:-translate-y-1 hover:scale-105 flex items-center gap-3 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300"
        >
            {/* Button Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:animate-shine" />
            
            <span>Join the Batch</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Feature Icons / Social Proof */}
        <div className="mt-20 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700 animate-in fade-in duration-1000 delay-500">
             <div className="flex items-center gap-3">
                <Activity size={24} className="text-pink-500" />
                <span className="text-sm font-bold text-slate-300">Smart Analytics</span>
             </div>
             <div className="w-1.5 h-1.5 bg-slate-700 rounded-full hidden md:block"></div>
             <div className="flex items-center gap-3">
                <Timer size={24} className="text-cyan-500" />
                <span className="text-sm font-bold text-slate-300">Pomodoro Focus</span>
             </div>
             <div className="w-1.5 h-1.5 bg-slate-700 rounded-full hidden md:block"></div>
             <div className="flex items-center gap-3">
                <Brain size={24} className="text-purple-500" />
                <span className="text-sm font-bold text-slate-300">AI Instructor</span>
             </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 py-8 text-center border-t border-white/5 bg-[#020617]/50 backdrop-blur-sm">
        <p className="text-slate-500 text-xs md:text-sm flex items-center justify-center gap-2">
            Made with <span className="text-pink-500 animate-pulse">❤️</span> for Future RNs
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
