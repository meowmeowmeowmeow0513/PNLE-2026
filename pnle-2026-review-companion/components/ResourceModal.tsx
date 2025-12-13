
import React, { useState } from 'react';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 relative border border-slate-100 dark:border-slate-700 flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <X size={20} />
                </button>

                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">
                    {initialData ? 'Edit Resource' : 'Add New Resource'}
                </h3>

                {!initialData && (
                    <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl mb-6">
                        <button 
                            onClick={() => setActiveTab('link')}
                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'link' ? 'bg-white dark:bg-slate-800 text-pink-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            Save Link
                        </button>
                        <button 
                            onClick={() => setActiveTab('note')}
                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'note' ? 'bg-white dark:bg-slate-800 text-yellow-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            Sticky Note
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto custom-scrollbar flex-1 px-1">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Title</label>
                        <input 
                            type="text" 
                            required 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            placeholder={activeTab === 'link' ? "e.g. Pharma Lecture" : "e.g. Reminder"}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                        />
                    </div>

                    {activeTab === 'link' ? (
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">URL</label>
                            <input 
                                type="url" 
                                required 
                                value={url} 
                                onChange={e => setUrl(e.target.value)} 
                                placeholder="https://..."
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                            />
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Content</label>
                                <textarea 
                                    required 
                                    rows={4}
                                    value={content} 
                                    onChange={e => setContent(e.target.value)} 
                                    placeholder="Type your note here..."
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 resize-none font-handwriting text-lg"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Color</label>
                                <div className="flex gap-3">
                                    {['yellow', 'pink', 'cyan', 'green'].map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-slate-500 scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: c === 'yellow' ? '#fef08a' : c === 'pink' ? '#fbcfe8' : c === 'cyan' ? '#a5f3fc' : '#a7f3d0' }}
                                        >
                                            {color === c && <Check size={16} className="text-slate-800 mx-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Saving...' : 'Save Resource'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResourceModal;
