import React, { useState, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { useFileManager } from '../hooks/useFileManager';
import FolderModal from './FolderModal';
import MoveItemModal from './MoveItemModal';
import FolderCard from './FolderCard';
import { 
  FolderPlus, Home, ChevronRight, Plus, 
  Link as LinkIcon, Youtube, FileText, Globe, 
  StickyNote, Trash2, Edit2, ExternalLink, HardDrive, Check
} from 'lucide-react';
import { UserFile, UserFolder, ResourceType } from '../types';
import { format } from 'date-fns';

const PersonalFolder: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    sortedFolders, sortedFiles, allFolders, breadcrumbs, currentFolderId,
    navigateToFolder, navigateUp, createFolder, updateFolder, addResource, editResource, moveItem, deleteFile, deleteFolder,
    loading, sortBy, setSortBy 
  } = useFileManager(currentUser?.uid);
  
  // Modals
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  
  // Editing State
  const [folderToEdit, setFolderToEdit] = useState<UserFolder | null>(null);
  const [resourceToEdit, setResourceToEdit] = useState<UserFile | null>(null);
  
  // Drag & Drop
  const [draggedItem, setDraggedItem] = useState<{ id: string, type: 'file' | 'folder', folderId: string | null } | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [itemToMove, setItemToMove] = useState<{id: string, type: 'file' | 'folder'} | null>(null);

  // --- Handlers ---

  const handleMoveClick = (id: string, type: 'file' | 'folder') => {
      setItemToMove({ id, type });
      setIsMoveModalOpen(true);
  };

  const executeMove = async (targetFolderId: string | null) => {
      if (itemToMove) {
          await moveItem(itemToMove.id, targetFolderId, itemToMove.type);
      }
  };

  const handleDeleteResource = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (confirm("Are you sure you want to delete this resource?")) {
          await deleteFile(id);
      }
  };

  // --- Drag & Drop ---
  const handleDragStart = (e: React.DragEvent, item: { id: string, type: 'file' | 'folder', folderId: string | null }) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    if (draggedItem && draggedItem.id !== folderId && draggedItem.folderId !== folderId) {
        setDragOverFolderId(folderId);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    setDragOverFolderId(null);
    if (!draggedItem) return;
    if (draggedItem.folderId === targetFolderId || draggedItem.id === targetFolderId) return;

    try {
        await moveItem(draggedItem.id, targetFolderId, draggedItem.type);
    } catch (error) {
        console.error("Failed to move item", error);
    }
    setDraggedItem(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10 font-sans">
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Resource Hub</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Your personal library of links, notes, and reviewers.</p>
        </div>
        <div className="flex gap-3">
            <button
                onClick={() => { setFolderToEdit(null); setIsFolderModalOpen(true); }}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all"
            >
                <FolderPlus size={18} className="text-purple-500" />
                New Folder
            </button>
            <button
                onClick={() => { setResourceToEdit(null); setIsResourceModalOpen(true); }}
                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-pink-500/20 transition-all active:scale-95"
            >
                <Plus size={18} />
                Add Resource
            </button>
        </div>
      </div>

      {/* 2. Breadcrumbs & Sort */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center overflow-x-auto px-2 py-1 scrollbar-hide">
             {breadcrumbs.map((crumb, index) => {
                 const isTarget = dragOverFolderId === crumb.id;
                 return (
                    <div key={index} className="flex items-center text-sm">
                        {index > 0 && <ChevronRight size={14} className="text-slate-400 mx-1" />}
                        <button 
                            onClick={() => navigateUp(crumb.id)}
                            onDragOver={(e) => handleDragOver(e, crumb.id)}
                            onDrop={(e) => handleDrop(e, crumb.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap font-bold ${
                                isTarget ? 'bg-pink-100 dark:bg-pink-900/40 ring-2 ring-pink-500 text-pink-700' : ''
                            } ${
                                index === breadcrumbs.length - 1 
                                ? 'text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-700' 
                                : 'text-slate-500 hover:text-pink-600 hover:bg-pink-50 dark:text-slate-400 dark:hover:bg-slate-700'
                            }`}
                        >
                            {index === 0 && <Home size={14} />}
                            {crumb.name}
                        </button>
                    </div>
                 );
             })}
        </div>
        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-3">
             <span className="text-xs font-bold text-slate-400 hidden sm:block uppercase tracking-wider">Sort:</span>
             <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
                className="text-xs bg-transparent text-slate-700 dark:text-slate-300 font-bold focus:outline-none cursor-pointer"
             >
                 <option value="date">Date Added</option>
                 <option value="name">Name (A-Z)</option>
             </select>
        </div>
      </div>

      {/* 3. Content Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-slate-400 font-bold animate-pulse">Loading resources...</div>
      ) : sortedFolders.length === 0 && sortedFiles.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px] gap-6 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-slate-300 dark:text-slate-600 mb-2">
                <FolderPlus size={48} />
            </div>
            <div>
                <h3 className="text-xl font-black text-slate-700 dark:text-white">Empty Collection</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-2 max-w-xs mx-auto">
                    Start organizing your study materials. Add links to videos, drives, or create sticky notes.
                </p>
            </div>
        </div>
      ) : (
        <div className="space-y-8">
            {/* Folders */}
            {sortedFolders.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {sortedFolders.map(folder => (
                        <FolderCard 
                            key={folder.id}
                            folder={folder}
                            onNavigate={navigateToFolder}
                            onEdit={(f) => { setFolderToEdit(f); setIsFolderModalOpen(true); }}
                            onMove={(id) => handleMoveClick(id, 'folder')}
                            onDelete={deleteFolder}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onDragStart={(e, f) => handleDragStart(e, { id: f.id, type: 'folder', folderId: f.parentId })}
                            onDragLeave={() => setDragOverFolderId(null)}
                            isDragOver={dragOverFolderId === folder.id}
                        />
                    ))}
                </div>
            )}

            {/* Resources (Links & Notes) */}
            {sortedFiles.length > 0 && (
                <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 pl-1">Resources</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {sortedFiles.map(resource => (
                            <ResourceCard 
                                key={resource.id} 
                                resource={resource} 
                                onEdit={() => { setResourceToEdit(resource); setIsResourceModalOpen(true); }}
                                onDelete={(e) => handleDeleteResource(e, resource.id)}
                                onMove={() => handleMoveClick(resource.id, 'file')}
                                onDragStart={(e) => handleDragStart(e, { id: resource.id, type: 'file', folderId: resource.folderId || null })}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
      )}

      {/* Modals */}
      {isResourceModalOpen && (
          <ResourceModal 
              isOpen={isResourceModalOpen}
              onClose={() => setIsResourceModalOpen(false)}
              onSave={async (data) => {
                  if (resourceToEdit) {
                      await editResource(resourceToEdit.id, data);
                  } else {
                      await addResource(data.title, data.type, data.url, data.content, data.color);
                  }
                  setIsResourceModalOpen(false);
              }}
              initialData={resourceToEdit}
          />
      )}

      {isFolderModalOpen && (
        <FolderModal 
            onClose={() => { setIsFolderModalOpen(false); setFolderToEdit(null); }} 
            onSave={async (name, color) => {
                if (folderToEdit) await updateFolder(folderToEdit.id, name, color);
                else await createFolder(name, color);
            }}
            initialData={folderToEdit ? { name: folderToEdit.name, color: folderToEdit.color } : undefined}
        />
      )}

      {isMoveModalOpen && (
        <MoveItemModal 
            onClose={() => setIsMoveModalOpen(false)} 
            onMove={executeMove}
            folders={allFolders}
            currentFolderId={currentFolderId}
            itemToMove={itemToMove}
        />
      )}
    </div>
  );
};

// --- INTERNAL COMPONENT: Resource Card (Link vs Note) ---
const ResourceCard: React.FC<{ 
    resource: UserFile, 
    onEdit: () => void, 
    onDelete: (e: React.MouseEvent) => void,
    onMove: () => void,
    onDragStart: (e: React.DragEvent) => void
}> = ({ resource, onEdit, onDelete, onMove, onDragStart }) => {
    
    const isNote = resource.fileType === 'note';

    // --- STICKY NOTE RENDERER ---
    if (isNote) {
        const bgColors: Record<string, string> = {
            yellow: 'bg-yellow-200 text-yellow-900 border-yellow-300',
            pink: 'bg-pink-200 text-pink-900 border-pink-300',
            cyan: 'bg-cyan-200 text-cyan-900 border-cyan-300',
            green: 'bg-emerald-200 text-emerald-900 border-emerald-300',
            slate: 'bg-slate-200 text-slate-800 border-slate-300'
        };
        const theme = bgColors[resource.color || 'yellow'] || bgColors.yellow;
        const randomRotate = React.useMemo(() => Math.random() > 0.5 ? 'rotate-1' : '-rotate-1', []);

        return (
            <div 
                draggable
                onDragStart={onDragStart}
                onClick={onEdit}
                className={`aspect-square p-5 rounded-sm shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 hover:rotate-0 flex flex-col justify-between group relative ${theme} ${randomRotate} border-t-8 border-b-0 border-x-0`}
            >
                <div className="overflow-hidden">
                    <h4 className="font-black text-sm mb-2 opacity-90 uppercase tracking-wider">{resource.fileName}</h4>
                    <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap font-handwriting opacity-80 line-clamp-6">
                        {resource.userNotes}
                    </p>
                </div>
                
                <div className="flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold opacity-50">{format(new Date(resource.createdAt), 'MMM d')}</span>
                    <button onClick={onDelete} className="p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-current transition-colors">
                        <Trash2 size={14} />
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
            className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-pink-300 dark:hover:border-pink-500 transition-all cursor-pointer flex flex-col h-[160px] overflow-hidden relative"
        >
            <a 
                href={resource.downloadUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 p-5 flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-900/50 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors"
            >
                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform duration-300">
                    {getIcon()}
                </div>
                <div className="text-center w-full px-2">
                    <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate w-full">{resource.fileName}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">{new URL(resource.downloadUrl).hostname.replace('www.','')}</p>
                </div>
            </a>

            {/* Quick Actions Overlay (Bottom) */}
            <div className="absolute bottom-0 inset-x-0 p-2 flex justify-between items-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-200 border-t border-slate-100 dark:border-slate-700">
                <button onClick={onEdit} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Edit">
                    <Edit2 size={14} />
                </button>
                <div className="flex gap-1">
                    <button onClick={onMove} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Move">
                        <FolderPlus size={14} />
                    </button>
                    <button onClick={onDelete} className="p-2 text-slate-500 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
            
            {/* External Link Indicator */}
            <div className="absolute top-3 right-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ExternalLink size={14} />
            </div>
        </div>
    );
};

// --- INTERNAL COMPONENT: Resource Modal ---
const ResourceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { title: string, type: ResourceType, url: string, content: string, color: string }) => Promise<void>;
    initialData: UserFile | null;
}> = ({ isOpen, onClose, onSave, initialData }) => {
    const [activeTab, setActiveTab] = useState<'link' | 'note'>(initialData?.fileType === 'note' ? 'note' : 'link');
    const [title, setTitle] = useState(initialData?.fileName || '');
    const [url, setUrl] = useState(initialData?.downloadUrl || '');
    const [content, setContent] = useState(initialData?.userNotes || '');
    const [color, setColor] = useState(initialData?.color || 'yellow');
    const [loading, setLoading] = useState(false);

    // Auto-detect type
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 relative border border-slate-100 dark:border-slate-700 flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <Trash2 className="hidden" /> <span className="text-2xl leading-none">&times;</span>
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

                <form onSubmit={handleSubmit} className="space-y-5">
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
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 resize-none font-handwriting"
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

export default PersonalFolder;
