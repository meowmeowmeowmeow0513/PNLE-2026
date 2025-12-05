
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useFileManager } from '../hooks/useFileManager';
import FolderModal from './FolderModal';
import MoveItemModal from './MoveItemModal';
import FolderCard from './FolderCard';
import { db, storage } from '../firebase';
import { doc, onSnapshot, updateDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  FolderPlus, Home, ChevronRight, Plus, 
  Youtube, FileText, Globe, 
  Trash2, Edit2, ExternalLink, HardDrive, Check, Search, GripVertical,
  Camera, Layout, Book, Heart, PenTool, Calendar, Quote
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
  
  // --- Personalization State ---
  const [personalization, setPersonalization] = useState<{ coverPhoto?: string; mantra?: string }>({});
  const [isEditingMantra, setIsEditingMantra] = useState(false);
  const [mantraInput, setMantraInput] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // --- View State ---
  const [activeTab, setActiveTab] = useState<'desk' | 'journal'>('desk');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Modal States ---
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  
  // --- Editing State ---
  const [folderToEdit, setFolderToEdit] = useState<UserFolder | null>(null);
  const [resourceToEdit, setResourceToEdit] = useState<UserFile | null>(null);
  const [journalToEdit, setJournalToEdit] = useState<UserFile | null>(null);
  
  // --- Drag & Drop ---
  const [draggedItem, setDraggedItem] = useState<{ id: string, type: 'file' | 'folder', folderId: string | null } | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [itemToMove, setItemToMove] = useState<{id: string, type: 'file' | 'folder'} | null>(null);

  // --- Journal Data (Fetched Separately) ---
  const [journalEntries, setJournalEntries] = useState<UserFile[]>([]);
  const [journalLoading, setJournalLoading] = useState(false);

  // 1. Fetch Personalization
  useEffect(() => {
      if (!currentUser) return;
      const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
          if (doc.exists()) {
              const data = doc.data();
              setPersonalization({
                  coverPhoto: data.coverPhoto || '',
                  mantra: data.mantra || "My Growth Journey"
              });
              setMantraInput(data.mantra || "My Growth Journey");
          }
      });
      return () => unsub();
  }, [currentUser]);

  // 2. Fetch Journals (Global List)
  useEffect(() => {
      if (!currentUser || activeTab !== 'journal') return;
      setJournalLoading(true);
      const q = query(
          collection(db, 'users', currentUser.uid, 'files'),
          where('fileType', '==', 'journal'),
          orderBy('createdAt', 'desc')
      );
      
      const unsub = onSnapshot(q, (snapshot) => {
          const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserFile[];
          setJournalEntries(entries);
          setJournalLoading(false);
      });
      return () => unsub();
  }, [currentUser, activeTab]);

  // --- Handlers: Personalization ---
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || !e.target.files[0] || !currentUser) return;
      const file = e.target.files[0];
      
      if (file.size > 2 * 1024 * 1024) {
          alert("File size must be less than 2MB");
          return;
      }

      setUploadingCover(true);
      try {
          const storageRef = ref(storage, `covers/${currentUser.uid}_${Date.now()}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          await updateDoc(doc(db, 'users', currentUser.uid), { coverPhoto: url });
      } catch (err) {
          console.error("Cover upload failed", err);
          alert("Failed to upload cover photo.");
      } finally {
          setUploadingCover(false);
      }
  };

  const saveMantra = async () => {
      if (!currentUser) return;
      try {
          await updateDoc(doc(db, 'users', currentUser.uid), { mantra: mantraInput });
          setIsEditingMantra(false);
      } catch (err) {
          console.error("Mantra save failed", err);
      }
  };

  // --- Handlers: File Manager ---
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
      if (confirm("Are you sure you want to delete this?")) {
          await deleteFile(id);
      }
  };

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

  // --- Filtering ---
  const filteredFolders = sortedFolders.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filter out journals from Desk view
  const deskFiles = sortedFiles.filter(f => 
    f.fileType !== 'journal' &&
    (f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.userNotes && f.userNotes.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 font-sans animate-fade-in">
      
      {/* 1. HERO SECTION (Cover & Mantra) */}
      <div className="relative w-full h-[280px] rounded-[2.5rem] overflow-hidden group shadow-2xl border border-slate-200 dark:border-white/10 bg-slate-900">
          {/* Cover Image */}
          {personalization.coverPhoto ? (
              <img 
                src={personalization.coverPhoto} 
                alt="Cover" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
          ) : (
              <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-center">
                  <div className="text-slate-600 flex flex-col items-center gap-2">
                      <Camera size={32} />
                      <span className="text-xs font-bold uppercase tracking-widest">Upload Cover Photo</span>
                  </div>
              </div>
          )}
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          {/* Upload Button */}
          <button 
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-6 right-6 p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100 border border-white/10"
            title="Change Cover (Max 2MB)"
          >
              {uploadingCover ? <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"/> : <Camera size={20} />}
          </button>
          <input ref={coverInputRef} type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />

          {/* Mantra / Title Section */}
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-10">
              {isEditingMantra ? (
                  <div className="flex gap-2 max-w-xl">
                      <input 
                        type="text" 
                        value={mantraInput}
                        onChange={(e) => setMantraInput(e.target.value)}
                        className="flex-1 bg-black/50 border border-white/20 rounded-xl px-4 py-2 text-white font-bold text-2xl md:text-4xl focus:outline-none focus:border-pink-500 backdrop-blur-sm"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && saveMantra()}
                      />
                      <button onClick={saveMantra} className="p-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl"><Check size={20} /></button>
                  </div>
              ) : (
                  <div 
                    className="group/text cursor-pointer inline-block"
                    onClick={() => setIsEditingMantra(true)}
                  >
                      <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight flex items-end gap-3 drop-shadow-lg">
                          {personalization.mantra || "My Growth Journey"}
                          <Edit2 size={20} className="text-white/50 opacity-0 group-hover/text:opacity-100 mb-1.5 transition-opacity" />
                      </h1>
                      <div className="h-1.5 w-24 bg-pink-500 rounded-full mt-3 shadow-[0_0_10px_#ec4899]"></div>
                  </div>
              )}
          </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0f172a] p-1.5 rounded-2xl w-fit border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('desk')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'desk' 
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
              <Layout size={18} /> My Desk
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'journal' 
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
              <Book size={18} /> Growth Journal
          </button>
      </div>

      {/* 3. CONTENT AREA */}
      {activeTab === 'desk' ? (
          // --- DESK VIEW (File Manager) ---
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Toolbar */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-2 flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-2">
                <div className="flex items-center overflow-x-auto px-2 py-1 scrollbar-hide flex-1">
                     <button 
                        onClick={() => navigateUp(null)}
                        onDragOver={(e) => handleDragOver(e, null)}
                        onDrop={(e) => handleDrop(e, null)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap font-bold text-sm ${
                            !currentFolderId ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                     >
                        <Home size={16} /> Home
                     </button>
                     {breadcrumbs.slice(1).map((crumb) => (
                        <React.Fragment key={crumb.id}>
                            <ChevronRight size={14} className="text-slate-300 mx-1" />
                            <button 
                                onClick={() => navigateUp(crumb.id)}
                                onDragOver={(e) => handleDragOver(e, crumb.id)}
                                onDrop={(e) => handleDrop(e, crumb.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap font-bold text-sm ${
                                    crumb.id === currentFolderId ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                }`}
                            >
                                {crumb.name}
                            </button>
                        </React.Fragment>
                     ))}
                </div>

                <div className="flex items-center gap-2 px-2">
                     <div className="relative group">
                         <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                         <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-40 pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-transparent focus:border-pink-500/50 focus:bg-white dark:focus:bg-black rounded-lg text-xs font-medium focus:outline-none transition-all"
                         />
                     </div>
                     <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                     <button
                        onClick={() => { setFolderToEdit(null); setIsFolderModalOpen(true); }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-purple-500 transition-colors"
                        title="New Folder"
                     >
                        <FolderPlus size={18} />
                     </button>
                     <button
                        onClick={() => { setResourceToEdit(null); setIsResourceModalOpen(true); }}
                        className="p-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg shadow-lg shadow-pink-500/20 transition-all"
                        title="Add Resource"
                     >
                        <Plus size={18} />
                     </button>
                </div>
              </div>

              {/* Grid Content */}
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                </div>
              ) : filteredFolders.length === 0 && deskFiles.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] opacity-60">
                    <Home size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">This folder is empty.</p>
                </div>
              ) : (
                <div className="space-y-8">
                    {filteredFolders.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">Folders</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {filteredFolders.map(folder => (
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
                        </div>
                    )}

                    {deskFiles.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">Files & Notes</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                                {deskFiles.map(resource => (
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
          </div>
      ) : (
          // --- JOURNAL VIEW (Integrated App) ---
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                  <div>
                      <h2 className="text-2xl font-black text-slate-800 dark:text-white">Growth Journal</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Document your journey, reflections, and learnings.</p>
                  </div>
                  <button 
                    onClick={() => { setJournalToEdit(null); setIsJournalModalOpen(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 transition-all active:scale-95"
                  >
                      <PenTool size={18} /> New Entry
                  </button>
              </div>

              {journalLoading ? (
                  <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
              ) : journalEntries.length === 0 ? (
                  <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
                      <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                          <Heart size={32} className="text-pink-400" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-700 dark:text-white">Start Your Journal</h3>
                      <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm">Writing down your thoughts improves retention and reduces stress. Create your first entry today.</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {journalEntries.map(entry => (
                          <div 
                            key={entry.id}
                            onClick={() => { setJournalToEdit(entry); setIsJournalModalOpen(true); }}
                            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl transition-all group relative overflow-hidden"
                          >
                              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-500 to-pink-500"></div>
                              <div className="flex justify-between items-start mb-4">
                                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                      <Calendar size={12} />
                                      {format(new Date(entry.createdAt), 'MMM dd, yyyy')}
                                  </div>
                                  <button 
                                    onClick={(e) => handleDeleteResource(e, entry.id)}
                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                      <Trash2 size={14} />
                                  </button>
                              </div>
                              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 line-clamp-1 group-hover:text-purple-500 transition-colors">
                                  {entry.fileName}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed whitespace-pre-wrap font-medium">
                                  {entry.userNotes}
                              </p>
                              
                              {/* Footer Read More */}
                              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                                  <span className="text-xs text-slate-400 italic">Read more...</span>
                                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 group-hover:text-purple-500 transition-colors">
                                      <Edit2 size={14} />
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}

      {/* MODALS */}
      
      {/* 1. Resource Modal (Stickies/Links) */}
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

      {/* 2. Folder Modal */}
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

      {/* 3. Move Modal */}
      {isMoveModalOpen && (
        <MoveItemModal 
            onClose={() => setIsMoveModalOpen(false)} 
            onMove={executeMove}
            folders={allFolders}
            currentFolderId={currentFolderId}
            itemToMove={itemToMove}
        />
      )}

      {/* 4. Journal Modal (Integrated App) */}
      {isJournalModalOpen && (
          <JournalModal 
              onClose={() => setIsJournalModalOpen(false)}
              initialData={journalToEdit}
              onSave={async (title, content) => {
                  if (journalToEdit) {
                      await editResource(journalToEdit.id, { title: title, content: content });
                  } else {
                      // Add as Global Journal Resource (no folderId needed, but can inherit current if we want)
                      // We will store it with fileType = 'journal'
                      await addResource(title, 'journal', '', content);
                  }
                  setIsJournalModalOpen(false);
              }}
          />
      )}

    </div>
  );
};

// --- SUB-COMPONENT: JOURNAL EDITOR MODAL ---
const JournalModal: React.FC<{ onClose: () => void, initialData: UserFile | null, onSave: (title: string, content: string) => Promise<void> }> = ({ onClose, initialData, onSave }) => {
    const [title, setTitle] = useState(initialData?.fileName || '');
    const [content, setContent] = useState(initialData?.userNotes || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        setLoading(true);
        await onSave(title, content);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-zoom-in">
            <div className="bg-white dark:bg-[#0f172a] w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border border-slate-200 dark:border-slate-800">
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                            <Book size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                            {initialData ? 'Edit Entry' : 'New Journal Entry'}
                        </h3>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                            Cancel
                        </button>
                        <button 
                            onClick={handleSubmit} 
                            disabled={loading || !title.trim()}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Entry'}
                        </button>
                    </div>
                </div>

                {/* Editor Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title your thoughts..."
                        className="w-full text-3xl md:text-4xl font-black text-slate-800 dark:text-white bg-transparent border-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-700 mb-6 px-0"
                        autoFocus
                    />
                    
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start writing..."
                        className="w-full h-full min-h-[400px] resize-none text-lg leading-relaxed text-slate-600 dark:text-slate-300 bg-transparent border-none focus:ring-0 px-0 font-medium"
                    />
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: Resource Card (Reused) ---
const ResourceCard: React.FC<{ 
    resource: UserFile, 
    onEdit: () => void, 
    onDelete: (e: React.MouseEvent) => void,
    onMove: () => void,
    onDragStart: (e: React.DragEvent) => void
}> = ({ resource, onEdit, onDelete, onMove, onDragStart }) => {
    
    const isNote = resource.fileType === 'note';

    // Safe date formatting to prevent crashes
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            return format(new Date(dateString), 'MMM d');
        } catch {
            return '';
        }
    };

    // --- STICKY NOTE RENDERER (Enhanced "Washi Tape" Look) ---
    if (isNote) {
        const bgColors: Record<string, string> = {
            yellow: 'bg-[#fef9c3] text-yellow-900',
            pink: 'bg-[#fce7f3] text-pink-900',
            cyan: 'bg-[#cffafe] text-cyan-900',
            green: 'bg-[#dcfce7] text-emerald-900',
            slate: 'bg-slate-200 text-slate-800'
        };
        const theme = bgColors[resource.color || 'yellow'] || bgColors.yellow;
        const randomRotate = React.useMemo(() => ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2'][Math.floor(Math.random() * 4)], []);

        return (
            <div 
                draggable
                onDragStart={onDragStart}
                onClick={onEdit}
                className={`aspect-square p-6 pt-8 rounded-sm shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 hover:rotate-0 flex flex-col justify-between group relative ${theme} ${randomRotate}`}
            >
                {/* Washi Tape Visual */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-8 bg-white/40 backdrop-blur-sm shadow-sm rotate-1 transform skew-x-12 opacity-80"></div>

                <div className="overflow-hidden flex-1">
                    <h4 className="font-black text-sm mb-2 opacity-90 uppercase tracking-wider border-b border-black/10 pb-1">{resource.fileName}</h4>
                    <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap font-handwriting opacity-80 line-clamp-6 text-lg">
                        {resource.userNotes}
                    </p>
                </div>
                
                <div className="flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                    <span className="text-[10px] font-bold opacity-50">{formatDate(resource.createdAt)}</span>
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
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        {new URL(resource.downloadUrl).hostname.replace('www.','')}
                    </p>
                </div>
            </a>

            {/* Quick Actions Overlay (Bottom) */}
            <div className="absolute bottom-0 inset-x-0 p-2 flex justify-between items-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-200 border-t border-slate-100 dark:border-slate-700">
                <button onClick={onEdit} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Edit">
                    <Edit2 size={14} />
                </button>
                <div className="flex gap-1">
                    <button onClick={onMove} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Move">
                        <GripVertical size={14} />
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

// --- SUB-COMPONENT: Resource Modal (Reused) ---
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

export default PersonalFolder;
