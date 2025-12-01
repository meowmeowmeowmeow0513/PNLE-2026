
import React, { useState } from 'react';
import { X, FolderPlus, Loader, Check } from 'lucide-react';

interface FolderModalProps {
  onClose: () => void;
  onCreate: (name: string, color: string) => Promise<void>;
}

const FolderModal: React.FC<FolderModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#EC4899'); // Default pink
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
      await onCreate(name.trim(), color);
      onClose();
    } catch (error) {
      console.error("Failed to create folder", error);
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
            <FolderPlus size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">New Folder</h3>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Color Tag</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
              {loading ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FolderModal;
