
import React from 'react';
import { Trash2, Edit2, ExternalLink, Globe, Youtube, HardDrive, FileText, GripVertical } from 'lucide-react';
import { UserFile } from '../types';
import { format } from 'date-fns';

interface ResourceCardProps {
    resource: UserFile;
    onEdit: () => void;
    onDelete: (e: React.MouseEvent) => void;
    onMove: () => void;
    onDragStart: (e: React.DragEvent) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onEdit, onDelete, onMove, onDragStart }) => {
    
    const isNote = resource.fileType === 'note';

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            return format(new Date(dateString), 'MMM d');
        } catch {
            return '';
        }
    };

    // --- STICKY NOTE RENDERER (Updated: No Handwriting, Responsive) ---
    if (isNote) {
        const bgColors: Record<string, string> = {
            yellow: 'bg-[#fef9c3] text-yellow-900 selection:bg-yellow-500/30',
            pink: 'bg-[#fce7f3] text-pink-900 selection:bg-pink-500/30',
            cyan: 'bg-[#cffafe] text-cyan-900 selection:bg-cyan-500/30',
            green: 'bg-[#dcfce7] text-emerald-900 selection:bg-emerald-500/30',
            slate: 'bg-slate-200 text-slate-800'
        };
        const theme = bgColors[resource.color || 'yellow'] || bgColors.yellow;
        const randomRotate = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2'][resource.fileName.length % 4];

        return (
            <div 
                draggable
                onDragStart={onDragStart}
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className={`min-h-[220px] h-auto w-full p-6 pt-8 rounded-sm shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 hover:rotate-0 flex flex-col justify-between group relative ${theme} ${randomRotate}`}
            >
                {/* Washi Tape Visual */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-8 bg-white/40 backdrop-blur-sm shadow-sm rotate-1 transform skew-x-12 opacity-80 pointer-events-none"></div>

                <div className="flex-1 overflow-hidden">
                    <h4 className="font-black text-sm mb-3 opacity-90 uppercase tracking-wider border-b border-black/10 pb-1 break-words leading-snug">{resource.fileName}</h4>
                    {/* Replaced font-handwriting with font-sans/font-medium for better readability */}
                    <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap opacity-90 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {resource.userNotes}
                    </div>
                </div>
                
                {/* Footer Actions - Visible on mobile, hover on desktop */}
                <div className="flex justify-between items-end opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity mt-4 pt-2 border-t border-black/5 relative z-30">
                    <span className="text-[10px] font-bold opacity-50">{formatDate(resource.createdAt)}</span>
                    <button 
                        onClick={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation(); 
                            onDelete(e); 
                        }} 
                        className="p-2 rounded-full bg-black/5 hover:bg-red-500 hover:text-white text-current transition-colors active:scale-95 touch-manipulation"
                        title="Delete Note"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        );
    }

    // --- LINK CARD RENDERER ---
    const getIcon = () => {
        if (resource.fileType === 'youtube') return <Youtube size={28} className="text-red-500" />;
        if (resource.fileType === 'drive') return <HardDrive size={28} className="text-blue-500" />;
        if (resource.fileType === 'notion') return <FileText size={28} className="text-slate-800 dark:text-white" />;
        return <Globe size={28} className="text-cyan-500" />;
    };

    return (
        <div 
            draggable
            onDragStart={onDragStart}
            className="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-pink-500/10 hover:border-pink-300 dark:hover:border-pink-500 transition-all cursor-pointer flex flex-col min-h-[180px] overflow-hidden relative"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
        >
            <div 
                className="flex-1 p-6 flex flex-col items-center justify-center gap-4 bg-slate-50/50 dark:bg-slate-900/50 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors"
            >
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-md">
                    {getIcon()}
                </div>
                <div className="text-center w-full px-2">
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm break-words leading-tight w-full group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">{resource.fileName}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest truncate mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {resource.downloadUrl ? new URL(resource.downloadUrl).hostname.replace('www.','') : 'Link'}
                    </p>
                </div>
            </div>

            {/* Quick Actions Overlay (Bottom) - Always visible on mobile, slide-up on desktop */}
            <div className="absolute bottom-0 inset-x-0 p-2 flex justify-between items-center bg-white/95 dark:bg-slate-800/95 backdrop-blur-md md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 border-t border-slate-100 dark:border-slate-700 z-30">
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(); }} 
                    className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-95" 
                    title="Edit"
                >
                    <Edit2 size={18} />
                </button>
                <div className="flex gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onMove(); }} 
                        className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-95" 
                        title="Move"
                    >
                        <GripVertical size={18} />
                    </button>
                    <a 
                        href={resource.downloadUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-slate-500 hover:text-blue-500 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors active:scale-95"
                        title="Open Link"
                    >
                        <ExternalLink size={18} />
                    </a>
                    <button 
                        onClick={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation(); 
                            onDelete(e); 
                        }} 
                        className="p-2 text-slate-500 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors active:scale-95" 
                        title="Delete"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResourceCard;
