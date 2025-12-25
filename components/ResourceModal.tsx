
import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { UserFile, ResourceType } from '../types';

interface ResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { title: string, type: ResourceType, url: string, content: string, color: string }) => Promise<void>;
    initialData: UserFile | null;
}

const ResourceModal: React.FC<ResourceModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [activeTab, setActiveTab] = useState<'link' | 'note'>(initialData?.fileType === 'note' ? 'note' : 'link');
    const [title, setTitle] = useState(initialData?.fileName || '');
    const [url, setUrl] = useState(initialData?.downloadUrl || '');
    const [content, setContent] = useState(initialData?.userNotes || '');
    const [color, setColor] = useState(initialData?.color || 'yellow');
    const [loading, setLoading] = useState(false);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    // Auto-detect type based on URL
    const getLinkType = (urlStr: string): ResourceType => {
        const lower = urlStr.toLowerCase();
        if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
        if (lower.includes('drive.google.com')) return 'drive';
        if (lower.includes('notion.so')) return 'notion';
        return 'link';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                title,
                type: activeTab === 'note' ? 'note' : getLinkType(url),
                url: activeTab === 'note' ? '' : url,
                content: activeTab === 'note' ? content : '',
                color
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4">
            {/* Backdrop - Opacity Only (Blur removed) */}
            <div 
                className="absolute inset-0 bg-slate-900/60 transition-opacity animate-fade-in" 
                onClick={onClose} 
            />

            {/* 
               Modal Container 
               Mobile: Bottom Sheet (Rounded Top Only, Slide Up)
               Landscape Mobile / Desktop: Centered Card (Fully Rounded, Zoom In)
            */}
            <div className="
                relative z-10 
                w-full sm:w-full sm:max-w-lg 
                bg-white dark:bg-slate-900 
                rounded-t-[2rem] sm:rounded-[2rem] 
                shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 
                flex flex-col 
                max-h-[90dvh] sm:max-h-[85vh] 
                animate-slide-up-mobile sm:animate-zoom-in 
                overflow-hidden
            ">
                
                {/* Header (Sticky) */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">
                        {initialData ? 'Edit Resource' : 'Add New Resource'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 -mr-2">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs (Sticky below header) */}
                {!initialData && (
                    <div className="px-6 pt-4 shrink-0">
                        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
                            <button 
                                onClick={() => setActiveTab('link')}
                                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'link' ? 'bg-white dark:bg-slate-900 text-pink-600 shadow-sm' : 'text-slate-500'}`}
                            >
                                Save Link
                            </button>
                            <button 
                                onClick={() => setActiveTab('note')}
                                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'note' ? 'bg-white dark:bg-slate-900 text-yellow-600 shadow-sm' : 'text-slate-500'}`}
                            >
                                Sticky Note
                            </button>
                        </div>
                    </div>
                )}

                {/* Content Body (Scrollable) */}
                <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar flex-1 p-6 space-y-6">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Title</label>
                        <input 
                            type="text" 
                            required 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            placeholder={activeTab === 'link' ? "e.g. Pharma Lecture" : "e.g. Reminder"}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all text-base"
                        />
                    </div>

                    {activeTab === 'link' ? (
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">URL</label>
                            <input 
                                type="url" 
                                required 
                                value={url} 
                                onChange={e => setUrl(e.target.value)} 
                                placeholder="https://..."
                                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all"
                            />
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Content</label>
                                <textarea 
                                    required 
                                    value={content} 
                                    onChange={e => setContent(e.target.value)} 
                                    placeholder="Type your note here..."
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 transition-all resize-y min-h-[150px] leading-relaxed"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Color</label>
                                <div className="flex gap-4">
                                    {['yellow', 'pink', 'cyan', 'green', 'slate'].map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${color === c ? 'border-slate-500 scale-110 shadow-md' : 'border-transparent'}`}
                                            style={{ backgroundColor: c === 'yellow' ? '#fef08a' : c === 'pink' ? '#fbcfe8' : c === 'cyan' ? '#a5f3fc' : c === 'green' ? '#a7f3d0' : '#e2e8f0' }}
                                        >
                                            {color === c && <Check size={18} className="text-slate-900" strokeWidth={3} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </form>

                {/* Footer (Sticky) */}
                <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-[2rem] shrink-0 safe-area-bottom">
                    <button 
                        onClick={(e) => handleSubmit(e as any)}
                        disabled={loading}
                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50 hover:shadow-xl"
                    >
                        {loading ? 'Saving...' : 'Save Resource'}
                    </button>
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
        </div>
    );
};

export default ResourceModal;
