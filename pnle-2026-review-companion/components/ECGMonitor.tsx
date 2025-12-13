
import React from 'react';
import { Rhythm } from '../data/simulationData';
import { AlertTriangle } from 'lucide-react';

interface ECGMonitorProps {
    rhythm: Rhythm;
    isShocking: boolean;
    phase: string;
    viability: number;
    padsAttached: boolean;
    customHR?: number | null; 
    className?: string;
    clean?: boolean; // New prop for "Mini/Clean" mode without bezel
}

const ECGMonitor: React.FC<ECGMonitorProps> = ({ rhythm, isShocking, phase, padsAttached, customHR, className, clean }) => {
    const getPath = (r: Rhythm) => {
        if (!padsAttached) return "M0 50 L200 50"; // Flatline if no pads
        
        switch(r) {
            case 'NSR': return "M0 50 L10 50 L15 40 L20 60 L25 50 L35 50 L40 20 L45 80 L50 50 L60 50 L65 40 L70 50 L200 50";
            case 'VFIB': return "M0 50 Q10 10 20 50 T40 50 T60 50 T80 50 T100 50 T120 50 T140 50";
            case 'PEA': return "M0 50 L10 50 L15 40 L20 60 L25 50 L35 50 L40 20 L45 80 L50 50 L60 50 L65 40 L70 50 L80 50 L85 40 L90 60 L95 50 L105 50 L110 20 L115 80 L120 50 L130 50 L135 40 L140 50 L200 50"; 
            case 'VT': return "M0 50 L10 10 L20 90 L30 10 L40 90 L50 10 L60 90 L70 10 L80 90 L90 10 L100 90 L110 10 L120 90 L130 10 L140 90 L200 50"; 
            case 'ASYSTOLE': return "M0 50 Q10 50 20 51 T40 49 T60 50 T80 51 T100 49 T120 50 T140 50 T200 50"; 
            case 'TORSADES': return "M0 50 C 20 0, 40 100, 60 50 C 80 0, 100 80, 120 50 C 140 20, 160 90, 180 50 L 200 50"; 
            case 'BRADYCARDIA': return "M0 50 L30 50 L35 45 L40 55 L45 50 L60 50 L65 30 L70 70 L75 50 L150 50 L200 50"; 
            default: return "M0 50 L200 50";
        }
    };

    const color = (!padsAttached) ? '#94a3b8' : (rhythm === 'VFIB' || rhythm === 'VT' || rhythm === 'ASYSTOLE' || rhythm === 'TORSADES') ? '#ef4444' : '#10b981';
    
    const etco2 = phase === 'cpr' ? 25 : (phase === 'rosc' ? 40 : 10);
    const spo2 = phase === 'rosc' ? 98 : (phase === 'cpr' ? 85 : '--');
    const bp = phase === 'rosc' ? '110/70' : (phase === 'cpr' ? '---/---' : '---/---');

    let displayHR = '---';
    if (padsAttached) {
        if (customHR) {
            displayHR = customHR.toString();
        } else {
            switch (rhythm) {
                case 'NSR': displayHR = '72'; break;
                case 'VT': displayHR = '180'; break;
                case 'PEA': displayHR = '110'; break;
                case 'BRADYCARDIA': displayHR = '30'; break;
                case 'ASYSTOLE': displayHR = '0'; break;
                default: displayHR = '---'; 
            }
        }
    }

    const ScreenContent = () => (
        <>
            <div className="absolute inset-0 bg-black">
                {/* Brand - Only show on full monitor */}
                {!clean && (
                    <div className="absolute top-2 left-3 text-slate-500 text-[9px] md:text-[10px] font-bold z-30 tracking-widest opacity-60">
                        SUZY-PAK <span className="text-red-500">LIFEGUARD</span>
                    </div>
                )}

                {/* Grid Lines */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>
                
                <div className="flex flex-col h-full">
                    {/* ECG Trace Area */}
                    <div className="flex-[2] relative flex items-center border-b border-slate-800/50">
                        {!padsAttached && (
                            <div className="absolute inset-0 flex items-center justify-center z-40 bg-slate-300/10 dark:bg-slate-900/50 backdrop-blur-sm">
                                <div className="flex flex-col items-center gap-2 animate-pulse p-4 rounded-xl bg-black/60 border border-white/10">
                                    <AlertTriangle size={32} className="text-yellow-500" />
                                    <span className="text-xl md:text-2xl font-black tracking-widest text-red-500 font-mono">LEADS OFF</span>
                                    <span className="text-[10px] md:text-xs uppercase font-bold text-white bg-red-600 px-2 py-0.5 rounded">Attach Pads</span>
                                </div>
                            </div>
                        )}

                        {isShocking ? (
                            <div className="w-full h-full bg-white animate-flash opacity-0 z-50"></div>
                        ) : (
                            <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="w-full h-full relative z-10">
                                <path 
                                    d={getPath(rhythm)}
                                    fill="none" 
                                    stroke={color} 
                                    strokeWidth="2.5" 
                                    vectorEffect="non-scaling-stroke"
                                    className="drop-shadow-[0_0_6px_currentColor]"
                                />
                            </svg>
                        )}
                        {!isShocking && padsAttached && <div className="absolute top-0 bottom-0 w-1 bg-green-500/50 z-20 animate-scan"></div>}
                        
                        <div className="absolute top-4 right-4 md:right-6 text-right z-30 leading-none">
                            <div className={`text-4xl md:text-5xl font-bold ${!padsAttached ? 'text-slate-600' : color === '#ef4444' ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                                {displayHR}
                            </div>
                            <div className="text-[10px] text-green-700 font-bold mt-1">HR (BPM)</div>
                        </div>
                    </div>

                    {/* Vitals Area */}
                    <div className="flex-1 relative flex bg-slate-900/90 p-2 gap-2 md:gap-4 border-t border-slate-800">
                         <div className="flex-1 flex flex-col justify-center items-end border-r border-slate-800 pr-2 md:pr-4">
                             <span className="text-2xl md:text-3xl font-bold text-cyan-400">{spo2}</span>
                             <span className="text-[8px] md:text-[9px] text-cyan-700 font-bold">SPO2 %</span>
                         </div>
                         <div className="flex-1 flex flex-col justify-center items-end border-r border-slate-800 pr-2 md:pr-4">
                             <span className="text-2xl md:text-3xl font-bold text-yellow-400">{etco2}</span>
                             <span className="text-[8px] md:text-[9px] text-yellow-700 font-bold">ETCO2</span>
                         </div>
                         <div className="flex-1 flex flex-col justify-center items-end pr-2">
                             <span className="text-xl md:text-2xl font-bold text-white">{bp}</span>
                             <span className="text-[8px] md:text-[9px] text-slate-500 font-bold">NIBP mmHg</span>
                         </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes scan { 0% { left: 0%; } 100% { left: 100%; } }
                @keyframes flash { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
                .animate-scan { animation: scan 2s linear infinite; }
                .animate-flash { animation: flash 0.1s ease-in-out; }
            `}</style>
        </>
    );

    if (clean) {
        return (
            <div className={`relative overflow-hidden border border-slate-700 rounded-lg ${className || 'h-full w-full'}`}>
                <ScreenContent />
            </div>
        );
    }

    return (
        <div className={`w-full h-48 md:h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl border-[6px] border-slate-300 dark:border-slate-700 relative overflow-hidden shadow-inner group flex flex-col font-mono select-none transition-colors duration-300 ${className || ''}`}>
            {/* Monitor Glass Reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-20"></div>
            <div className="flex-1 relative flex flex-col m-[2px] rounded-lg overflow-hidden border border-slate-700">
                <ScreenContent />
            </div>
        </div>
    );
};

export default ECGMonitor;
