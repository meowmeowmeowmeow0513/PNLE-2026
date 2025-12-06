
import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Sparkles, Activity, Timer, Brain, 
  HeartPulse, ShieldCheck, Stars, MousePointer2, 
  Scroll, GraduationCap, ChevronDown
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-pink-500/30 overflow-x-hidden">
      
      {/* --- FIXED BACKGROUNDS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-pink-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* --- NAVBAR --- */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#020617]/80 backdrop-blur-md border-b border-white/5 py-4' : 'py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
                    <span className="font-bold text-lg text-white">RN</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-white/90 hidden sm:block">Review Companion</span>
            </div>
            <button 
                onClick={onGetStarted}
                className="px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-all hover:scale-105 active:scale-95"
            >
                Student Portal
            </button>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 backdrop-blur-sm">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Batch Crescere 2026</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500 leading-[0.9] max-w-6xl animate-in zoom-in-95 duration-1000">
            More Than Just <br /> A Reviewer.
        </h1>

        <p className="text-lg md:text-2xl text-slate-400 mb-10 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Your all-in-one digital sanctuary. Track stats, simulate codes, and master the board exam with the power of AI and gamification.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <button
                onClick={onGetStarted}
                className="group relative px-10 py-5 bg-pink-600 hover:bg-pink-500 text-white rounded-full font-bold text-lg shadow-[0_0_40px_-10px_rgba(236,72,153,0.5)] hover:shadow-[0_0_80px_-20px_rgba(236,72,153,0.7)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:animate-shine" />
                <span>Enter Dashboard</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-3"
            >
                Explore Features <ChevronDown size={20} className="animate-bounce" />
            </button>
        </div>

      </section>

      {/* --- DECEMBER QUEST TEASER --- */}
      <section className="relative z-10 py-32 px-4 border-t border-white/5 bg-gradient-to-b from-[#020617] to-purple-900/20">
          <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="order-2 lg:order-1 relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                      <div className="relative bg-slate-950 border border-white/10 rounded-3xl p-8 overflow-hidden">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px]"></div>
                          
                          {/* Mini Sim UI Representation */}
                          <div className="flex flex-col gap-4 opacity-80 group-hover:opacity-100 transition-opacity">
                              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                  <div className="flex items-center gap-3">
                                      <div className="p-2 bg-red-500/20 text-red-500 rounded-lg"><HeartPulse size={24} /></div>
                                      <div>
                                          <h4 className="font-bold text-white">ACLS Simulator</h4>
                                          <p className="text-xs text-slate-400">Real-time Cardiac Arrest Scenarios</p>
                                      </div>
                                  </div>
                                  <span className="text-xs font-mono text-green-400 animate-pulse">● LIVE</span>
                              </div>
                              <div className="h-32 bg-slate-900 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                  <svg viewBox="0 0 200 50" className="w-full h-full text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">
                                      <path d="M0 25 L10 25 L15 10 L20 40 L25 25 L35 25 L40 5 L45 45 L50 25 L200 25" fill="none" stroke="currentColor" strokeWidth="2" />
                                  </svg>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                  <div className="p-3 bg-white/5 rounded-xl text-center">
                                      <div className="text-xs text-slate-400 uppercase">Rhythm</div>
                                      <div className="font-bold text-white">VFIB</div>
                                  </div>
                                  <div className="p-3 bg-white/5 rounded-xl text-center">
                                      <div className="text-xs text-slate-400 uppercase">Action</div>
                                      <div className="font-bold text-red-400">SHOCK</div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="order-1 lg:order-2">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6 text-purple-300 font-bold uppercase tracking-widest text-xs">
                          <Stars size={14} /> Seasonal Event
                      </div>
                      <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                          The December <br/>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Quest is Live.</span>
                      </h2>
                      <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                          Step into the shoes of an ER Nurse. Master ACLS algorithms and Clinical Reasoning through interactive, high-stakes simulations. Earn XP, unlock ranks, and build muscle memory.
                      </p>
                      <button onClick={onGetStarted} className="flex items-center gap-3 text-white font-bold hover:text-pink-400 transition-colors group">
                          Start Simulation <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                  </div>
              </div>
          </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="relative z-10 py-32 px-4">
          <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20">
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Everything You Need.</h2>
                  <p className="text-slate-400 text-lg">A complete ecosystem for your review journey.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <FeatureCard 
                      icon={<Brain size={32} className="text-pink-500" />}
                      title="AI Instructor"
                      desc="Mnemonic deep-dives and concept explanations powered by specialized AI."
                  />
                  <FeatureCard 
                      icon={<Timer size={32} className="text-cyan-500" />}
                      title="Focus Engine"
                      desc="Integrated Pomodoro timer with ambient sounds, task tracking, and study pets."
                  />
                  <FeatureCard 
                      icon={<Activity size={32} className="text-emerald-500" />}
                      title="Smart Analytics"
                      desc="Visualize your consistency with streak tracking and study vitals EKG."
                  />
                  <FeatureCard 
                      icon={<Scroll size={32} className="text-amber-500" />}
                      title="Interactive TOS"
                      desc="The official 2026 Exam Blueprint, digitized and trackable."
                  />
                  <FeatureCard 
                      icon={<ShieldCheck size={32} className="text-purple-500" />}
                      title="Career Ladder"
                      desc="Gamified progression system based on Benner's Novice to Expert theory."
                  />
                  <FeatureCard 
                      icon={<MousePointer2 size={32} className="text-blue-500" />}
                      title="Resource Hub"
                      desc="Curated library of links, PDFs, and tools from the batch."
                  />
              </div>
          </div>
      </section>

      {/* --- EMOTIONAL CLOSER --- */}
      <section className="relative z-10 py-32 px-4 text-center">
          <div className="max-w-3xl mx-auto">
              <GraduationCap size={64} className="text-white mx-auto mb-8 opacity-80" />
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
                  "Trust the process."
              </h2>
              <p className="text-xl text-slate-400 leading-relaxed font-medium italic mb-12">
                  You are not just studying for an exam. You are preparing to save lives. <br/>
                  We built this so you don't have to do it alone.
              </p>
              <button 
                  onClick={onGetStarted}
                  className="px-12 py-5 bg-white text-slate-900 rounded-full font-black text-lg hover:bg-slate-200 transition-colors shadow-2xl"
              >
                  Begin Your Journey
              </button>
          </div>
      </section>

      <footer className="relative z-10 py-10 border-t border-white/5 text-center text-slate-600 text-sm">
          <p>&copy; 2026 Batch Crescere. All rights reserved.</p>
          <p className="mt-2 text-xs">Built with ❤️ for Future RNs.</p>
      </footer>

    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
        <div className="mb-6 p-4 bg-black/20 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
);

export default LandingPage;
