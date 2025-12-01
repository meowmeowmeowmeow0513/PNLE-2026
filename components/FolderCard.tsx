
import React, { useState, useRef, useEffect } from 'react';
import { UserFolder } from '../types';
import { Folder, MoreVertical, Edit2, FolderInput, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface FolderCardProps {
  folder: UserFolder;
  onNavigate: (id: string, name: string) => void;
  onRename: (id: string, currentName: string) => void;
  onMove: (id: string) => void;
  onDelete: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  isDragOver: boolean;
}

const FolderCard: React.FC<FolderCardProps> = ({ 
    folder, onNavigate, onRename, onMove, onDelete, 
    onDragOver, onDragLeave, onDrop, isDragOver 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString: string) => {
      try {
          return format(new Date(dateString), 'MMM dd, yyyy');
      } catch {
          return '';
      }
  };

  return (
    <div 
        onDoubleClick={() => onNavigate(folder.id, folder.name)}
        onDragOver={(e) => onDragOver(e, folder.id)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, folder.id)}
        className={`group bg-white dark:bg-slate-800 p-4 rounded-xl border transition-all cursor-pointer relative h-[140px] flex flex-col justify-between ${
            isDragOver 
            ? 'border-pink-500 ring-2 ring-pink-500 bg-pink-50 dark:bg-pink-900/20 scale-105 shadow-xl' 
            : 'border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-500 hover:shadow-md'
        }`}
    >
        <div className="flex justify-between items-start">
            <div style={{ color: folder.color }}>
                <Folder size={40} fill="currentColor" fillOpacity={isDragOver ? 0.4 : 0.2} />
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <MoreVertical size={16} />
            </button>
        </div>

        <div>
            <h4 className="font-semibold text-slate-800 dark:text-white truncate text-sm mb-1">{folder.name}</h4>
            <p className="text-[10px] text-slate-400">
                Created {formatDate(folder.createdAt)}
            </p>
        </div>

        {/* Menu */}
        {showMenu && (
            <div ref={menuRef} className="absolute right-2 top-8 z-20 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-600 py-1 animate-fade-in origin-top-right" onClick={e => e.stopPropagation()}>
                <button onClick={() => { setShowMenu(false); onRename(folder.id, folder.name); }} className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <Edit2 size={14} /> Rename
                </button>
                <button onClick={() => { setShowMenu(false); onMove(folder.id); }} className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <FolderInput size={14} /> Move to...
                </button>
                <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                <button onClick={() => { setShowMenu(false); onDelete(folder.id); }} className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
                    <Trash2 size={14} /> Delete
                </button>
            </div>
        )}
    </div>
  );
};
export default FolderCard;
