
import React, { useState } from 'react';
import { Activity, Heart, Zap, AlertTriangle } from 'lucide-react';

interface StreakRecoveryModalProps {
  onResuscitate: () => Promise<void>;
  onClose: () => void;
}

const StreakRecoveryModal: React.FC<StreakRecoveryModalProps> = ({ onResuscitate, onClose }) => {
  const [charging, setCharging] = useState(false);
  const [reviving, setReviving] = useState(false);

  const handleResuscitate = async () => {
    setCharging(true);
    // Simulate "Charging... Clear!" delay
    setTimeout(async () => {
        setReviving(true);
        setCharging(false);
        // Simulate shock
        setTimeout(async () => {
            await onResuscitate();
        }, 1000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-900/90 backdrop-blur-md p-4 animate-fade-in">
      <div className={`w-full max-w-md bg-slate-900 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.5)] border-2 border-red-500 overflow-hidden relative transition-transform duration-100 ${reviving ? 'scale-110' : 'scale-100'}`}>
        
        {/* ECG Line Animation */}
        <div className="absolute top-0 left-0 w-full h-24 opacity-20 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                <path d="M0,50 L50,50 L60,20 L70,80 L80,50 L100,50 L500,50" 
                      fill="none" 
                      stroke="red" 
                      strokeWidth="2" 
                      className="animate-ecg"
                />
            </svg>
        </div>

        <div className="p-8 text-center relative z-10">
            <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse border-4 border-red-500">
                <Activity size={40} className="text-red-500" />
            </div>

            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 italic">
                CODE BLUE!
            </h2>
            <p className="text-red-400 font-bold mb-6 text-lg">
                Your streak has flatlined.
            </p>
            
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8">
                <p className="text-slate-300 text-sm">
                    You missed a day and have no Duty Leaves left. However, we can attempt <span className="text-red-400 font-bold">resuscitation</span>.
                </p>
                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-400">
                    <AlertTriangle size={14} />
                    <span>Completing a quick quiz will restore your streak.</span>
                </div>
            </div>

            <button
                onClick={handleResuscitate}
                disabled={charging || reviving}
                className={`w-full py-4 rounded-xl font-black text-xl uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-3 overflow-hidden relative group
                ${charging 
                    ? 'bg-yellow-500 text-black cursor-wait' 
                    : 'bg-red-600 hover:bg-red-500 text-white hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]'
                }`}
            >
                {charging ? (
                    <>
                        <Zap size={24} className="animate-ping" /> CHARGING...
                    </>
                ) : reviving ? (
                    'SHOCK DELIVERED!'
                ) : (
                    <>
                        <Heart size={24} fill="currentColor" /> RESUSCITATE
                    </>
                )}
                
                {/* Shine Effect */}
                {!charging && !reviving && (
                    <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:animate-shine" />
                )}
            </button>

            <button 
                onClick={onClose}
                className="mt-4 text-slate-500 text-sm hover:text-slate-300 transition-colors"
            >
                Let it go (Reset Streak to 0)
            </button>
        </div>
      </div>
    </div>
  );
};

export default StreakRecoveryModal;
