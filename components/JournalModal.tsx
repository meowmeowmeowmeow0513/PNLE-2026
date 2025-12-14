
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Save, Loader, Sun, Check, CloudRain, Zap, ChevronLeft, Quote } from 'lucide-react';
import { UserFile } from '../types';
import { format } from 'date-fns';

interface JournalModalProps {
    onClose: () => void;
    initialData: UserFile | null;
    onSave: (title: string, content: string, color: string) => Promise<void>;
}

const JournalModal: React.FC<JournalModalProps> = ({ onClose, initialData, onSave }) => {
    const [title, setTitle] = useState(initialData?.fileName || '');
    const [content, setContent] = useState(initialData?.userNotes || '');
    const [mood, setMood] = useState(initialData?.color || 'yellow');
    const [loading, setLoading] = useState(false);
    
    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!title.trim()) return;
        
        setLoading(true);
        try {
            await onSave(title, content, mood);
        } catch (err: any) {
            console.error(err);
            alert("Failed to save entry. Please try again.");
            setLoading(false);
        }
    };

    const moodOptions = [
        { id: 'yellow', label: 'Motivated', icon: Sun, bg: 'bg-amber-500', text: 'text-amber-500', tint: 'from-amber-500/10 to-amber-500/5' },
        { id: 'green', label: 'Focused', icon: Check, bg: 'bg-emerald-500', text: 'text-emerald-500', tint: 'from-emerald-500/10 to-emerald-500/5' },
        { id: 'blue', label: 'Tired', icon: CloudRain, bg: 'bg-blue-500', text: 'text-blue-500', tint: 'from-blue-500/10 to-blue-500/5' },
        { id: 'red', label: 'Stressed', icon: Zap, bg: 'bg-red-500', text: 'text-red-500', tint: 'from-red-500/10 to-red-500/5' },
    ];

    const currentMood = moodOptions.find(m => m.id === mood) || moodOptions[0];

    // Using Portal to ensure the modal is relative to the viewport, not the parent container.
    // This fixes issues where the modal "kisses" the sidebar or gets squashed by layout transitions.
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
            
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm transition-opacity animate-fade-in" 
                onClick={onClose} 
            />

            {/* 
               MAIN CONTAINER 
               Mobile: Full Screen (inset-0), Rounded-none
               Tablet/Desktop: Centered Card, Rounded
            */}
            <div className={`
                relative z-10 
                w-full h-[100dvh] 
                md:w-[90vw] md:max-w-3xl md:h-[85vh] 
                bg-white dark:bg-[#020617] 
                md:rounded-[2.5rem] shadow-2xl overflow-hidden 
                flex flex-col 
                animate-slide-up-mobile md:animate-zoom-in
                transition-colors duration-700 ease-in-out
                border-none md:border border-slate-200 dark:border-slate-800
            `}>
                
                {/* Dynamic Mood Tint Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${currentMood.tint} opacity-50 pointer-events-none transition-colors duration-700`}></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>

                {/* --- HEADER --- */}
                <div className="flex-none px-4 py-3 md:px-8 md:py-6 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-20 sticky top-0">
                    <button 
                        onClick={onClose} 
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors flex items-center gap-1 group"
                    >
                        <div className="p-1 rounded-full border border-slate-200 dark:border-slate-700 group-hover:bg-white dark:group-hover:bg-slate-800">
                            <ChevronLeft className="md:hidden" size={20} />
                            <X className="hidden md:block" size={20} />
                        </div>
                        <span className="md:hidden text-sm font-bold">Back</span>
                    </button>

                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            {format(new Date(), 'MMMM do, yyyy')}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <currentMood.icon size={12} className={currentMood.text} />
                            <span className={`text-xs font-black uppercase ${currentMood.text}`}>
                                {currentMood.label}
                            </span>
                        </div>
                    </div>

                    {/* Desktop Save (Hidden on Mobile) */}
                    <div className="hidden md:block">
                        <button 
                            onClick={(e) => handleSubmit(e as any)}
                            disabled={!title.trim() || loading}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg shadow-current/20 transition-all hover:scale-105 active:scale-95 ${currentMood.bg} ${!title.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Saving...' : 'Save Entry'}
                        </button>
                    </div>
                    {/* Mobile Spacer to center title visually */}
                    <div className="w-12 md:hidden"></div>
                </div>

                {/* --- CONTENT AREA (Scrollable) --- */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 relative z-10 flex flex-col">
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title of your entry..."
                        className="w-full bg-transparent border-none p-0 text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:ring-0 mb-6 leading-tight tracking-tight"
                        autoFocus
                    />
                    
                    <div className="relative flex-1 min-h-[40vh]">
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Pour your mind out..."
                            className="w-full h-full bg-transparent border-none p-0 text-lg md:text-xl leading-relaxed font-serif text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:ring-0 resize-none"
                        />
                        {!content && (
                            <div className="absolute top-0 left-0 pointer-events-none opacity-10">
                                <Quote size={64} className="text-slate-900 dark:text-white" />
                            </div>
                        )}
                    </div>
                </div>

                {/* --- MOBILE/TABLET TOOLBAR (Sticky Bottom) --- */}
                <div className="flex-none p-4 pb-6 md:pb-4 border-t border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl z-20 flex flex-col gap-4 md:hidden">
                    {/* Mood Selector Row */}
                    <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
                        {moodOptions.map(m => (
                            <button
                                key={m.id}
                                onClick={() => setMood(m.id)}
                                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                                    mood === m.id 
                                    ? 'bg-white dark:bg-slate-800 shadow-md scale-[1.02] text-slate-900 dark:text-white ring-1 ring-black/5 dark:ring-white/10' 
                                    : 'text-slate-400 dark:text-slate-500 hover:bg-white/50 dark:hover:bg-white/5'
                                }`}
                            >
                                <m.icon size={20} className={mood === m.id ? m.text : ''} />
                            </button>
                        ))}
                    </div>

                    {/* Main Action Button */}
                    <button 
                        onClick={(e) => handleSubmit(e as any)}
                        disabled={!title.trim() || loading}
                        className={`w-full py-4 rounded-2xl font-black text-base text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${currentMood.bg} ${!title.trim() ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                    >
                        {loading ? <Loader size={20} className="animate-spin" /> : <Save size={20} />}
                        Save Journal
                    </button>
                </div>

                {/* Desktop Mood Selector (Floating) */}
                <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xl z-30">
                    {moodOptions.map(m => (
                        <button
                            key={m.id}
                            onClick={() => setMood(m.id)}
                            className={`p-3 rounded-full transition-all duration-300 relative group ${
                                mood === m.id 
                                ? `${m.bg} text-white shadow-lg scale-110 mx-1` 
                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            title={m.label}
                        >
                            <m.icon size={20} />
                            {/* Tooltip */}
                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {m.label}
                            </span>
                        </button>
                    ))}
                </div>

            </div>
            
            <style>{`
                @keyframes slide-up-mobile {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up-mobile {
                    animation: slide-up-mobile 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>,
        document.body
    );
};

export default JournalModal;
