
import React, { useState } from 'react';
import { X, Calendar, Save, Loader, Sun, Check, CloudRain, Zap } from 'lucide-react';
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
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!title.trim()) return;
        
        setError(null);
        setLoading(true);
        try {
            await onSave(title, content, mood);
        } catch (err: any) {
            setError(err.message || "Failed to save entry. Try again.");
            setLoading(false);
        }
    };

    const moodOptions = [
        { id: 'yellow', label: 'Motivated', icon: Sun, color: 'bg-amber-400', glow: 'shadow-amber-500/50' },
        { id: 'green', label: 'Focused', icon: Check, color: 'bg-emerald-500', glow: 'shadow-emerald-500/50' },
        { id: 'blue', label: 'Tired', icon: CloudRain, color: 'bg-blue-500', glow: 'shadow-blue-500/50' },
        { id: 'red', label: 'Stressed', icon: Zap, color: 'bg-red-500', glow: 'shadow-red-500/50' },
    ];

    const currentMood = moodOptions.find(m => m.id === mood) || moodOptions[0];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 animate-fade-in safe-area-bottom bg-slate-900/80 backdrop-blur-md">
            
            {/* Overlay click to close */}
            <div className="absolute inset-0" onClick={onClose}></div>

            {/* Floating Card - Optimized Height for Tablet/Mobile */}
            <div className="relative w-full md:max-w-4xl bg-white dark:bg-[#020617] md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-zoom-in ring-1 ring-white/10 h-[100dvh] md:h-[85vh] my-auto max-h-[900px]">
                
                {/* Ambient Mood Light (Top Glow) */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b ${currentMood.color.replace('bg-', 'from-')}/20 to-transparent opacity-60 pointer-events-none blur-3xl transition-colors duration-1000`}></div>

                {/* --- HEADER --- */}
                <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-6 border-b border-slate-100 dark:border-slate-800/50 shrink-0 relative z-20">
                    {/* Date/Info */}
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Calendar size={12} /> {format(new Date(), 'MMMM do, yyyy')}
                        </span>
                        {error && <span className="text-xs text-red-500 font-bold mt-1 animate-pulse">{error}</span>}
                    </div>

                    {/* Desktop Toolbar */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-full">
                            {moodOptions.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setMood(m.id)}
                                    className={`p-2 rounded-full transition-all duration-300 ${
                                        mood === m.id 
                                        ? `${m.color} text-white shadow-lg ${m.glow} scale-110` 
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700'
                                    }`}
                                    title={m.label}
                                >
                                    <m.icon size={16} />
                                </button>
                            ))}
                        </div>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
                        <button 
                            onClick={(e) => handleSubmit(e as any)} 
                            disabled={loading || !title.trim()}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                                !title.trim() 
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg hover:scale-105 active:scale-95'
                            }`}
                        >
                            {loading ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Entry
                        </button>
                        <button onClick={onClose} className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="md:hidden p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                {/* --- EDITOR BODY --- */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-6 py-4 md:px-12 md:py-8">
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Untitled Thought..."
                        className="w-full text-3xl md:text-5xl font-black text-slate-900 dark:text-white bg-transparent border-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-700 px-0 mb-6 leading-tight tracking-tight"
                        autoFocus
                    />
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Pour your mind out..."
                        className="w-full h-full min-h-[400px] resize-none text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-300 bg-transparent border-none focus:ring-0 px-0 font-serif placeholder:text-slate-300 dark:placeholder:text-slate-700 pb-24"
                    />
                </div>

                {/* --- MOBILE TOOLBAR (Sticky Bottom) --- */}
                <div className="md:hidden p-4 border-t border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-[#020617]/90 backdrop-blur-md flex justify-between items-center shrink-0 safe-area-bottom pb-6">
                    <div className="flex gap-2">
                        {moodOptions.map(m => (
                            <button
                                key={m.id}
                                onClick={() => setMood(m.id)}
                                className={`p-2 rounded-full transition-all ${
                                    mood === m.id 
                                    ? `${m.color} text-white shadow-md` 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                }`}
                            >
                                <m.icon size={18} />
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={(e) => handleSubmit(e as any)}
                        disabled={loading || !title.trim()}
                        className={`p-3 rounded-full shadow-lg transition-all ${
                            !title.trim() ? 'bg-slate-200 text-slate-400' : 'bg-pink-600 text-white'
                        }`}
                    >
                        {loading ? <Loader size={20} className="animate-spin" /> : <Save size={20} />}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default JournalModal;
