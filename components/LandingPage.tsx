
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, Sparkles, Activity, Timer, Brain, 
  HeartPulse, ShieldCheck, Stars, MousePointer2, 
  Scroll, GraduationCap, ChevronDown, Stethoscope, 
  Calculator, ClipboardCheck, TestTube, Zap, Trophy, Crown, Cat, Dog, CheckCircle2,
  Lock, Terminal, PlayCircle, LayoutGrid
} from 'lucide-react';
import { usePerformance } from './PerformanceContext'; // Import performance context

interface LandingPageProps {
  onGetStarted: () => void;
}

// --- SPOTLIGHT CARD ---
const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);
    const { isLowPower } = usePerformance();

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current || isLowPower) return; // Disable hover calculation on low power
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setOpacity(1);
    };

    const handleMouseLeave = () => setOpacity(0);

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50 ${className}`}
        >
            {!isLowPower && (
                <div
                    className="pointer-events-none absolute -inset-px transition-opacity duration-300"
                    style={{
                        opacity,
                        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(236,72,153,0.15), transparent 40%)`,
                    }}
                />
            )}
            <div className="relative h-full">{children}</div>
        </div>
    );
};

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLowPower } = usePerformance(); // Use context to disable effects

  // Parallax / Tilt Logic - Disabled in Low Power
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || isLowPower) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    // Normalize -1 to 1
    const x = (e.clientX / width) * 2 - 1;
    const y = (e.clientY / height) * 2 - 1;
    setMousePos({ x, y });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 50);
  };

  const scrollToFeatures = () => {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div 
      onScroll={handleScroll}
      className="fixed inset-0 h-[100dvh] w-screen overflow-y-auto overflow-x-hidden bg-[#020617] text-white font-sans selection:bg-pink-500/30 scroll-smooth custom-scrollbar z-[100]"
    >
      <style>{`
        .text-glow { text-shadow: 0 0 30px rgba(236, 72, 153, 0.6); }
        .hero-title { letter-spacing: -0.05em; line-height: 0.9; }
      `}</style>

      {/* --- CINEMATIC BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[#020617]"></div>
          
          {/* Animated Orbs - Static in Low Power */}
          {!isLowPower && (
              <>
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-pink-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[100px] animate-pulse delay-2000"></div>
              </>
          )}
          
          {/* Grid & Noise */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* --- NAVBAR --- */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-white/0 
        ${scrolled ? 'bg-[#020617]/80 backdrop-blur-xl border-white/5 py-3' : 'py-6'}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={onGetStarted}>
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0 transform group-hover:rotate-12 transition-transform duration-300">
                    <span className="font-bold text-lg text-white">RN</span>
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-lg tracking-tight text-white/90 leading-none">Review</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-500 leading-none mt-1">Companion</span>
                </div>
            </div>
            <button 
                onClick={onGetStarted}
                className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 backdrop-blur-md"
            >
                Login Portal
            </button>
        </div>
      </header>

      {/* --- HERO SECTION (3D TILT) --- */}
      <section 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center text-center px-4 pt-20 pb-10 perspective-1000"
      >
        <div 
            className={`relative transform-gpu transition-transform duration-100 ease-out ${isLowPower ? '' : 'will-change-transform'}`}
            style={!isLowPower ? { 
                transform: `rotateX(${mousePos.y * -5}deg) rotateY(${mousePos.x * 5}deg)`,
            } : {}}
        >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default shadow-lg">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_#4ade80]"></div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest">PNLE 2026 Ready</span>
            </div>

            <h1 className="hero-title text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-6 text-glow select-none">
                <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500">
                    MANIFEST
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient">
                    YOUR LICENSE
                </span>
            </h1>

            <p className="text-lg md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed text-balance px-4 font-medium">
                The ultimate <span className="text-white font-bold">Intelligent Review Companion</span> for Nursing Students. <br/>
                Don't just review. <span className="text-pink-400 italic">Evolve.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 justify-center">
                <button
                    onClick={onGetStarted}
                    className="group relative px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-lg shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)] hover:shadow-[0_0_80px_-10px_rgba(255,255,255,0.6)] transition-all transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-3 overflow-hidden"
                >
                    <span className="relative z-10">ENTER PORTAL</span>
                    <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200 to-transparent skew-x-12 -translate-x-full group-hover:animate-shine opacity-50" />
                </button>
                <button
                    onClick={scrollToFeatures}
                    className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-3 backdrop-blur-md"
                >
                    EXPLORE FEATURES
                </button>
            </div>
        </div>

        {/* Floating Elements (Orbiting) - Hide in Low Power */}
        {!isLowPower && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                 <div className="absolute top-1/4 left-10 animate-float-slow opacity-20"><Brain size={64} className="text-pink-500" /></div>
                 <div className="absolute bottom-1/4 right-10 animate-float-reverse-slow opacity-20"><HeartPulse size={64} className="text-purple-500" /></div>
            </div>
        )}

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
            <ChevronDown size={32} />
        </div>
      </section>

      {/* --- THE LOOP (GAMIFICATION BREAKDOWN) --- */}
      <section className="relative z-10 py-24 px-4 border-t border-white/5 bg-black/20 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                  <h2 className="text-sm font-black text-pink-500 uppercase tracking-[0.3em] mb-4">The Neural Loop</h2>
                  <h3 className="text-4xl md:text-5xl font-black text-white">Engineered for Mastery.</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                  {/* Connector Line */}
                  <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500/50 to-transparent z-0"></div>

                  {[
                      { icon: Timer, title: "Deep Focus", desc: "Clock clinical hours with the Pomodoro Engine.", color: "text-cyan-400" },
                      { icon: Zap, title: "Earn XP", desc: "Gain experience for every task completed.", color: "text-yellow-400" },
                      { icon: Crown, title: "Rank Up", desc: "Evolve from Novice to Expert Nurse.", color: "text-purple-400" },
                      { icon: Cat, title: "Evolve Pet", desc: "Grow your companion as you study.", color: "text-pink-400" }
                  ].map((item, i) => (
                      <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                          <div className={`w-24 h-24 rounded-3xl bg-[#0B1121] border border-white/10 flex items-center justify-center shadow-2xl mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:border-white/30 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]`}>
                              <item.icon size={40} className={item.color} />
                          </div>
                          <h4 className="text-xl font-black text-white mb-2 uppercase tracking-wide">{item.title}</h4>
                          <p className="text-sm text-slate-400 leading-relaxed max-w-[200px]">{item.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* --- SLE QUEST FEATURE --- */}
      <section className="relative z-10 py-32 px-4 overflow-hidden">
          {!isLowPower && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse"></div>
          )}

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 relative">
                  <SpotlightCard className="p-2 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                      <div className="bg-[#0f172a] rounded-[2rem] p-8 border border-white/5 relative overflow-hidden">
                          {/* Mock UI */}
                          <div className="flex justify-between items-center mb-8">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-red-500/20 rounded-lg text-red-500"><HeartPulse /></div>
                                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Code Blue Active</div>
                              </div>
                              <div className="text-red-500 font-mono font-bold animate-pulse">00:02:45</div>
                          </div>
                          <div className="space-y-4">
                              <div className="h-24 bg-slate-900 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                                  {/* EKG Line */}
                                  <svg viewBox="0 0 500 100" className="w-full h-full text-red-500" preserveAspectRatio="none">
                                      <path d="M0,50 L50,50 L60,20 L70,80 L80,50 L100,50 L110,20 L120,80 L130,50 L500,50" 
                                          fill="none" stroke="currentColor" strokeWidth="2" className="animate-[dash_2s_linear_infinite]" strokeDasharray="500" strokeDashoffset="500"/>
                                  </svg>
                                  <style>{`@keyframes dash { to { stroke-dashoffset: 0; } }`}</style>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                  <div className="p-4 bg-white/5 rounded-xl text-center border border-white/5">
                                      <div className="text-[10px] text-slate-400 uppercase">Rhythm</div>
                                      <div className="font-bold text-white">VFIB</div>
                                  </div>
                                  <div className="p-4 bg-red-500 text-white rounded-xl text-center font-bold shadow-lg shadow-red-500/30 animate-pulse">
                                      SHOCK
                                  </div>
                              </div>
                          </div>
                      </div>
                  </SpotlightCard>
              </div>

              <div className="order-1 lg:order-2 text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-6 text-red-400 font-bold uppercase tracking-widest text-xs">
                      <Stars size={14} /> Signature Event
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[0.9]">
                      THE SLE <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">QUEST.</span>
                  </h2>
                  <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-lg">
                      Step into the shoes of an ER Nurse. Master ACLS algorithms and Clinical Reasoning through interactive, high-stakes simulations.
                  </p>
                  <ul className="space-y-4 mb-8">
                      {['Real-time Decisions', 'Patient Decay System', 'Pharmacology Drills'].map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                              <CheckCircle2 size={18} className="text-red-500" /> {item}
                          </li>
                      ))}
                  </ul>
                  <button onClick={onGetStarted} className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors shadow-lg shadow-red-500/10">
                      Start Simulation
                  </button>
              </div>
          </div>
      </section>

      {/* --- BENTO GRID FEATURES --- */}
      <section id="features" className="relative z-10 py-24 px-4 bg-[#020617]">
          <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20">
                  <h2 className="text-sm font-black text-blue-500 uppercase tracking-[0.3em] mb-4">The Ecosystem</h2>
                  <h3 className="text-4xl md:text-5xl font-black text-white">Everything You Need.</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                  
                  {/* Large Card: AI Instructor */}
                  <div className="md:col-span-2 group">
                      <SpotlightCard className="h-full p-8 flex flex-col justify-between">
                          <div>
                              <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-4 border border-pink-500/30">
                                  <Brain size={24} />
                              </div>
                              <h3 className="text-2xl font-bold text-white mb-2">AI Instructor</h3>
                              <p className="text-slate-400 max-w-sm">Mnemonic deep-dives and concept explanations powered by specialized AI. It breaks down complex topics into "Active Recall" bite-sized notes.</p>
                          </div>
                          {/* Typing Effect Mockup */}
                          <div className="bg-black/40 rounded-xl p-4 border border-white/5 font-mono text-xs text-green-400 mt-6">
                              <span className="text-white">$ query:</span> Explain Cushing's Triad<br/>
                              <span className="opacity-70">{`> Hypertension (Widening Pulse Pressure)`}</span><br/>
                              <span className="opacity-70">{`> Bradycardia`}</span><br/>
                              <span className="opacity-70">{`> Irregular Respirations (Cheyne-Stokes)`}<span className="animate-pulse">_</span></span>
                          </div>
                      </SpotlightCard>
                  </div>

                  {/* Tall Card: Clinical Tools */}
                  <div className="md:row-span-2 group">
                      <SpotlightCard className="h-full p-8 flex flex-col">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 border border-blue-500/30">
                              <Stethoscope size={24} />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">Clinical Tools</h3>
                          <p className="text-slate-400 mb-8">Rapid calculators and assessment scales in your pocket.</p>
                          
                          <div className="space-y-3 flex-1">
                              {['Dosage Calc', 'GCS Scale', 'APGAR', 'IV Drip Rate', 'MAP'].map((tool, i) => (
                                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                      <span className="text-sm font-bold text-slate-300">{tool}</span>
                                      <ChevronDown size={14} className="-rotate-90 text-slate-500" />
                                  </div>
                              ))}
                          </div>
                      </SpotlightCard>
                  </div>

                  {/* Regular Card: Smart Analytics */}
                  <SpotlightCard className="p-8 group hover:border-emerald-500/30">
                      <div className="relative z-10">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/30">
                              <Activity size={24} />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">Analytics</h3>
                          <p className="text-slate-400 text-sm">Visualize consistency. Track your integrity score and study vitals.</p>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-emerald-500/20 to-transparent opacity-50"></div>
                  </SpotlightCard>

                  {/* Regular Card: Focus Engine */}
                  <SpotlightCard className="p-8 group hover:border-amber-500/30">
                      <div className="relative z-10">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30">
                              <Timer size={24} />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">Focus Engine</h3>
                          <p className="text-slate-400 text-sm">Integrated Pomodoro timer with ambient sounds and task tracking.</p>
                      </div>
                  </SpotlightCard>

              </div>
          </div>
      </section>

      {/* --- EMOTIONAL CLOSER --- */}
      <section className="relative z-10 py-40 px-4 text-center border-t border-white/5">
          <div className="max-w-3xl mx-auto relative">
              <GraduationCap size={64} className="text-white mx-auto mb-8 opacity-80 animate-bounce" />
              
              <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-[0.9]">
                  "Trust the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Process."</span>
              </h2>
              <p className="text-xl text-slate-400 leading-relaxed font-medium italic mb-12 text-balance">
                  You are not just studying for an exam. You are preparing to save lives. <br className="hidden md:block"/>
                  We built this so you don't have to do it alone.
              </p>
              
              <button 
                  onClick={onGetStarted}
                  className="px-12 py-6 bg-white text-slate-900 rounded-full font-black text-xl hover:scale-110 hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] transition-all active:scale-95 duration-300"
              >
                  Begin Your Journey
              </button>
          </div>
      </section>

      <footer className="relative z-10 py-10 border-t border-white/5 text-center text-slate-600 text-sm bg-black/50 backdrop-blur-md">
          <p>&copy; 2026 Batch Crescere. All rights reserved.</p>
          <p className="mt-2 text-xs opacity-50">Built with ❤️ for Future RNs.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
