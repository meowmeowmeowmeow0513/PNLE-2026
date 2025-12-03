
import React, { useState } from 'react';
import { X, FolderPlus, Loader, Check, Edit2, Palette } from 'lucide-react';

interface FolderModalProps {
  onClose: () => void;
  onSave: (name: string, color: string) => Promise<void>;
  initialData?: { name: string; color: string };
}

const FolderModal: React.FC<FolderModalProps> = ({ onClose, onSave, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [color, setColor] = useState(initialData?.color || '#EC4899'); // Default pink
  const [loading, setLoading] = useState(false);

  const colors = [
    '#EC4899', // Pink
    '#EF4444', // Red
    '#F97316', // Orange
    '#EAB308', // Yellow
    '#22C55E', // Green
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#A855F7', // Purple
    '#64748B', // Slate
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onSave(name.trim(), color);
      onClose();
    } catch (error) {
      console.error("Failed to save folder", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative border border-slate-100 dark:border-slate-700">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-pink-50 dark:bg-pink-500/10 rounded-full text-pink-500">
            {initialData ? <Edit2 size={24} /> : <FolderPlus size={24} />}
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">{initialData ? 'Edit Folder' : 'New Folder'}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Folder Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Anatomy, Pharma, Notes"
              autoFocus
              className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                Color Tag
                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-500">Pick or Custom</span>
            </label>
            <div className="grid grid-cols-5 gap-3">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${color === c ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                >
                    {color === c && <Check size={16} className="text-white drop-shadow-md" strokeWidth={3} />}
                </button>
              ))}
              
              {/* Custom Color Input Wrapper */}
              <div className={`relative w-10 h-10 rounded-full overflow-hidden transition-transform hover:scale-110 flex items-center justify-center border border-slate-200 dark:border-slate-600 ${!colors.includes(color) ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 scale-110' : ''}`} style={{ backgroundColor: !colors.includes(color) ? color : 'transparent' }}>
                 {!colors.includes(color) ? (
                     <Check size={16} className="text-white drop-shadow-md z-10 pointer-events-none" strokeWidth={3} />
                 ) : (
                     <Palette size={18} className="text-slate-400 z-10 pointer-events-none" />
                 )}
                 <input 
                    type="color" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute inset-0 w-[150%] h-[150%] p-0 -top-1/4 -left-1/4 cursor-pointer opacity-0"
                    title="Custom Color"
                 />
              </div>
            </div>
            {/* Display Selected Hex if Custom */}
            {!colors.includes(color) && (
                 <div className="text-xs text-center text-slate-400 font-mono mt-1">
                     Custom: {color}
                 </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="flex-1 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader size={18} className="animate-spin" /> : <Check size={18} />}
              {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Folder')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FolderModal;
