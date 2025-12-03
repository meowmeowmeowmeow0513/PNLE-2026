
import React, { useState, useRef, useEffect } from 'react';
import { UserFile } from '../types';
import { FileText, Image, File as FileIcon, Film, Music, MoreVertical, Download, Trash2, FolderInput, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

interface FileCardProps {
  file: UserFile;
  onPreview: (file: UserFile) => void;
  onDelete: (id: string, name: string) => void;
  onMove: (id: string) => void;
  onRename: (id: string, currentName: string) => void;
  onDragStart: (e: React.DragEvent, file: UserFile) => void;
}

const FileCard: React.FC<FileCardProps> = ({ file, onPreview, onDelete, onMove, onRename, onDragStart }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (isoString: string) => {
    try {
        return format(new Date(isoString), 'MMM dd, yyyy');
    } catch {
        return '';
    }
  };

  const getThumbnail = (type: string) => {
    if (type.startsWith('image/')) return <img src={file.downloadUrl} alt={file.fileName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />;
    if (type === 'application/pdf') return <FileText size={48} className="text-red-500" />;
    if (type.includes('word') || type.includes('document')) return <FileText size={48} className="text-blue-500" />;
    if (type.includes('sheet') || type.includes('excel')) return <FileText size={48} className="text-green-500" />;
    if (type.startsWith('video/')) return <Film size={48} className="text-pink-500" />;
    if (type.startsWith('audio/')) return <Music size={48} className="text-purple-500" />;
    return <FileIcon size={48} className="text-slate-400" />;
  };

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, file)}
      className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-300 overflow-hidden flex flex-col h-[240px] cursor-pointer"
      onClick={() => onPreview(file)}
    >
      {/* Thumbnail Area */}
      <div className="h-32 w-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center overflow-hidden relative">
         <div className="transform transition-transform duration-300 group-hover:scale-110 flex items-center justify-center w-full h-full">
            {getThumbnail(file.fileType)}
         </div>
      </div>

      {/* Details Area */}
      <div className="p-3 flex flex-col flex-1 justify-between relative">
        <div>
           <div className="flex justify-between items-start gap-2">
               <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm truncate w-full" title={file.fileName}>
                 {file.fileName}
               </h3>
               
               {/* 3-Dot Menu Trigger */}
               <button 
                 onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                 className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
               >
                 <MoreVertical size={16} />
               </button>
           </div>
           
           <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mt-1">
              <span>{formatDate(file.createdAt)}</span>
              <span>•</span>
              <span className="text-slate-500 dark:text-slate-300 font-semibold">{formatFileSize(file.fileSize)}</span>
           </div>
        </div>

        {/* Dropdown Menu */}
        {showMenu && (
          <div ref={menuRef} className="absolute right-2 bottom-8 z-20 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-600 py-1 animate-fade-in origin-bottom-right" onClick={(e) => e.stopPropagation()}>
            <button 
                onClick={() => { setShowMenu(false); onRename(file.id, file.fileName); }}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
                <Edit2 size={14} /> Rename
            </button>
            <button 
                onClick={() => { setShowMenu(false); onMove(file.id); }}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
                <FolderInput size={14} /> Move to...
            </button>
            <a 
                href={file.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowMenu(false)}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
                <Download size={14} /> Download
            </a>
            <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
            <button 
                onClick={() => { setShowMenu(false); onDelete(file.id, file.fileName); }}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
            >
                <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileCard;
