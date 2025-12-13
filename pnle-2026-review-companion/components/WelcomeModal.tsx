
import React from 'react';
import { createPortal } from 'react-dom';
import { HeartPulse, ArrowRight, X, Sparkles, Star } from 'lucide-react';

interface WelcomeModalProps {
    onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white dark:bg-[#0f172a] w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden relative animate-zoom-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -ml-16 -mb-16 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row">
                    
                    {/* Left Visual Side */}
                    <div className="w-full md:w-2/5 bg-slate-100 dark:bg-black/20 p-8 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 animate-pulse"></div>
                        
                        <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl flex items-center justify-center shadow-lg shadow-pink-500/30 mb-6 rotate-3 transform transition-transform hover:rotate-6">
                            <HeartPulse size={40} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2">
                            The <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">SLE</span>
                        </h2>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/50 dark:bg-white/10 rounded-full border border-slate-200 dark:border-white/10 mt-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Live</span>
                        </div>
                    </div>

                    {/* Right Content Side */}
                    <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2 text-amber-500">
                                <Sparkles size={18} />
                                <span className="text-xs font-bold uppercase tracking-widest">Incoming Transmission</span>
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            Simulation Learning Experience
                        </h3>
                        
                        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            <p>
                                The <strong className="text-pink-500">December Edition</strong> is now online.
                            </p>
                            <p>
                                Complete daily Code Blue sims and quizzes to unlock exclusive rank badges:
                            </p>
                            <ul className="space-y-2 mt-2">
                                <li className="flex items-center gap-2">
                                    <Star size={14} className="text-emerald-400" fill="currentColor" />
                                    <span>The Vital Sign Warrior</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Star size={14} className="text-purple-400" fill="currentColor" />
                                    <span>The IV Sniper</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Star size={14} className="text-amber-400" fill="currentColor" />
                                    <span>ACLS GOAT (Max Rank)</span>
                                </li>
                            </ul>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex justify-end">
                            <button 
                                onClick={onClose}
                                className="group flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                            >
                                Enter Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default WelcomeModal;
