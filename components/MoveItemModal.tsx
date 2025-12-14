
import React, { useState } from 'react';
import { X, Folder, Check, Home } from 'lucide-react';
import { UserFolder } from '../types';

interface FolderWithPath extends UserFolder {
    path?: string;
}

interface MoveItemModalProps {
  onClose: () => void;
  onMove: (targetFolderId: string | null) => Promise<void>;
  folders: FolderWithPath[];
  currentFolderId: string | null;
  itemToMove: { id: string; type: 'file' | 'folder' } | null;
}

const MoveItemModal: React.FC<MoveItemModalProps> = ({ onClose, onMove, folders, currentFolderId, itemToMove }) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(currentFolderId);
  const [loading, setLoading] = useState(false);

  const handleMove = async () => {
    if (selectedFolderId === currentFolderId) return; // No change
    setLoading(true);
    await onMove(selectedFolderId);
    setLoading(false);
    onClose();
  };

  // Helper to check if a folder is a descendant of the moved folder to prevent loops
  const isInvalidDestination = (targetId: string | null) => {
    if (!itemToMove || itemToMove.type !== 'folder') return false; 
    
    // Cannot move a folder into itself
    if (targetId === itemToMove.id) return true;
    
    // Cannot move a folder into its children
    if (targetId) {
       let current = folders.find(f => f.id === targetId);
       while (current) {
          if (current.parentId === itemToMove.id || current.id === itemToMove.id) return true;
          current = folders.find(f => f.id === current?.parentId);
       }
    }
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in safe-area-bottom">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm relative border border-slate-100 dark:border-slate-700 flex flex-col max-h-[85vh] overflow-hidden">
        
        <div className="p-6 pb-2 shrink-0 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Move to...</h3>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
            >
              <X size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 mb-2">
            {/* Root Option */}
            <button
                onClick={() => setSelectedFolderId(null)}
                disabled={isInvalidDestination(null)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 rounded-xl transition-colors mb-1 ${
                    selectedFolderId === null 
                    ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 font-bold shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                } ${isInvalidDestination(null) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <Home size={18} />
                <span>Home (Root)</span>
                {selectedFolderId === null && <Check size={16} className="ml-auto" />}
            </button>

            {/* Folder List */}
            {folders.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-sm italic">
                    No other folders available.
                </div>
            )}

            {folders.map(folder => {
                const disabled = isInvalidDestination(folder.id);
                return (
                    <button
                        key={folder.id}
                        onClick={() => !disabled && setSelectedFolderId(folder.id)}
                        disabled={disabled}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 rounded-xl transition-colors mb-1 ${
                            selectedFolderId === folder.id 
                            ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 font-bold shadow-sm' 
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                        <Folder size={18} style={{ color: folder.color }} fill="currentColor" fillOpacity={0.2} className="flex-shrink-0" />
                        <span className="truncate text-sm">{folder.path || folder.name}</span>
                        {selectedFolderId === folder.id && <Check size={16} className="ml-auto flex-shrink-0" />}
                    </button>
                );
            })}
        </div>

        <div className="p-6 pt-2 border-t border-slate-100 dark:border-slate-700/50 shrink-0 flex gap-3 bg-white dark:bg-slate-800">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={loading || selectedFolderId === currentFolderId || isInvalidDestination(selectedFolderId)}
            className="flex-1 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {loading ? 'Moving...' : 'Move Here'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveItemModal;
