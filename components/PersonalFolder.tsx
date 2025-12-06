
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useFileManager } from '../hooks/useFileManager';
import FolderModal from './FolderModal';
import MoveItemModal from './MoveItemModal';
import FolderCard from './FolderCard';
import { db, storage } from '../firebase';
import { doc, onSnapshot, updateDoc, collection, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  FolderPlus, Home, ChevronRight, Plus, 
  Youtube, FileText, Globe, 
  Trash2, Edit2, ExternalLink, HardDrive, Check, Search, GripVertical,
  Camera, Layout, Book, Heart, PenTool, X, Loader,
  Sparkles, GraduationCap, Feather, CloudRain, Sun, Zap, Coffee,
  Maximize2, Minimize2, Save, Calendar, ArrowRight, Smile, Frown, Meh, Activity
} from 'lucide-react';
import { UserFile, UserFolder, ResourceType } from '../types';
import { format } from 'date-fns';

// --- SUB-COMPONENT: ASCENSION INTRO (4th Year Celebration) ---
const AscensionIntro: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timer1 = setTimeout(() => setStep(1), 500);
        const timer2 = setTimeout(() => setStep(2), 3500);
        const timer3 = setTimeout(() => setStep(3), 7000);
        const timer4 = setTimeout(() => setStep(4), 10500);
        return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4); };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-[#020617] text-white flex flex-col items-center justify-center p-6 overflow-hidden font-sans select-none touch-none">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/40 via-[#020617] to-black"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            
            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="absolute bg-white rounded-full opacity-20 animate-float"
                         style={{
                             width: Math.random() * 4 + 'px',
                             height: Math.random() * 4 + 'px',
                             top: Math.random() * 100 + '%',
                             left: Math.random() * 100 + '%',
                             animationDuration: Math.random() * 10 + 10 + 's',
                             animationDelay: Math.random() * 5 + 's'
                         }}
                    />
                ))}
            </div>

            {/* Step 1: Context */}
            <div className={`relative z-10 transition-all duration-1000 transform text-center max-w-2xl px-6 ${step === 1 ? 'opacity-100 translate-y-0 scale-100' : step > 1 ? 'opacity-0 -translate-y-10 scale-95' : 'opacity-0 translate-y-10 scale-95'} ${step > 1 ? 'hidden' : 'block'}`}>
                <GraduationCap size={64} className="text-pink-500 mx-auto mb-8 animate-bounce shadow-lg shadow-pink-500/50 rounded-full p-2" />
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">4th Year.<br/>2nd Semester.</h1>
                <p className="text-lg md:text-xl text-slate-400 font-medium">You have fought through sleepless nights, endless RLEs, and comprehensive exams to get here.</p>
            </div>

            {/* Step 2: The Goal */}
            <div className={`relative z-10 transition-all duration-1000 transform text-center max-w-2xl px-6 ${step === 2 ? 'opacity-100 translate-y-0 scale-100' : step > 2 ? 'opacity-0 -translate-y-10 scale-95' : 'opacity-0 translate-y-10 scale-95'} ${step > 2 || step < 2 ? 'hidden' : 'block'}`}>
                <div className="w-32 h-20 border-4 border-amber-400 rounded-2xl mx-auto mb-8 flex items-center justify-center bg-amber-400/10 shadow-[0_0_50px_rgba(251,191,36,0.4)] backdrop-blur-md">
                    <span className="font-serif font-black text-amber-400 text-3xl tracking-widest">PRC</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">The License Awaits.</h1>
                <p className="text-lg md:text-xl text-slate-400 font-medium">Everything you do now defines your future.</p>
            </div>

            {/* Step 3: Identity */}
            <div className={`relative z-10 transition-all duration-1000 transform text-center max-w-3xl px-6 ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 leading-[0.9]">
                    <span className="text-white block">SOAR HIGH,</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient block mt-2">TATAK RAMON</span>
                </h1>
                <p className="text-slate-400 mt-8 font-bold text-lg uppercase tracking-widest">Welcome to your sanctuary.</p>
                
                <div className={`mt-16 transition-all duration-1000 ${step >= 4 ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95'}`}>
                    <button 
                        onClick={onComplete}
                        className="group relative px-12 py-5 bg-white text-slate-900 rounded-full font-black text-lg uppercase tracking-[0.2em] overflow-hidden hover:scale-105 transition-transform shadow-[0_0_60px_rgba(255,255,255,0.3)] hover:shadow-[0_0_80px_rgba(255,255,255,0.5)]"
                    >
                        <span className="relative z-10 flex items-center gap-3">Enter <ArrowRight size={20} /></span>
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                </div>
            </div>
        </div>
    );
};

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
  const [showWrapped, setShowWrapped] = useState(false);

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

  // 1. Fetch Personalization & Check Wrapped
  useEffect(() => {
      if (!currentUser) return;
      
      // Use efficient single-doc listener
      const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
          if (doc.exists()) {
              const data = doc.data();
              setPersonalization({
                  coverPhoto: data.coverPhoto || '',
                  mantra: data.mantra || "Soar High, Tatak Ramon!"
              });
              setMantraInput(data.mantra || "Soar High, Tatak Ramon!");
          }
      });

      // Check Wrapped (Using localStorage for efficiency)
      const hasSeen = localStorage.getItem('has_seen_ascension_v3'); // Bumped version
      if (!hasSeen) {
          setShowWrapped(true);
      }

      return () => unsub();
  }, [currentUser]);

  // 2. Fetch Journals (Global List)
  useEffect(() => {
      if (!currentUser) return;
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
  }, [currentUser]);

  // --- Handlers: Personalization ---
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || !e.target.files[0] || !currentUser) return;
      const file = e.target.files[0];
      
      // Validation: 5MB
      if (file.size > 5 * 1024 * 1024) {
          alert("File size must be less than 5MB");
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
          alert("Failed to upload cover. Ensure you are logged in and have internet.");
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

  const handleWrappedComplete = () => {
      localStorage.setItem('has_seen_ascension_v3', 'true');
      setShowWrapped(false);
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
    <>
    {showWrapped && <AscensionIntro onComplete={handleWrappedComplete} />}
    
    <div className="max-w-7xl mx-auto space-y-8 pb-20 font-sans animate-fade-in px-4 md:px-0">
      
      {/* 1. HERO SECTION (Cover & Mantra) */}
      <div className="relative w-full h-[320px] md:h-[400px] rounded-[2.5rem] overflow-hidden group shadow-2xl border border-slate-200 dark:border-white/10 bg-slate-900 transition-all hover:shadow-pink-500/20">
          {/* Cover Image */}
          {personalization.coverPhoto ? (
              <div className="absolute inset-0 w-full h-full">
                  <img 
                    src={personalization.coverPhoto} 
                    alt="Cover" 
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                  />
                  {/* Cinematic Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent opacity-90"></div>
              </div>
          ) : (
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-[#020617] flex items-center justify-center">
                  <div className="text-slate-600 flex flex-col items-center gap-2 group-hover:text-slate-500 transition-colors">
                      <Camera size={32} />
                      <span className="text-xs font-bold uppercase tracking-widest">Customize Sanctuary</span>
                  </div>
              </div>
          )}
          
          {/* Upload Button (Visible on Hover) */}
          <button 
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-6 right-6 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100 border border-white/10 hover:scale-110 z-20"
            title="Change Cover (Max 5MB)"
          >
              {uploadingCover ? <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"/> : <Camera size={20} />}
          </button>
          <input ref={coverInputRef} type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />

          {/* Mantra / Title Section */}
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-10">
              <div className="flex flex-col items-start gap-4">
                  {/* Badge */}
                  <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] shadow-lg">
                      Batch Crescere 2026
                  </div>

                  {isEditingMantra ? (
                      <div className="flex gap-2 w-full max-w-xl animate-in fade-in slide-in-from-bottom-2">
                          <input 
                            type="text" 
                            value={mantraInput}
                            onChange={(e) => setMantraInput(e.target.value)}
                            className="flex-1 bg-black/50 border border-white/20 rounded-2xl px-6 py-3 text-white font-black text-2xl md:text-4xl focus:outline-none focus:border-pink-500 backdrop-blur-sm"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && saveMantra()}
                          />
                          <button onClick={saveMantra} className="p-4 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl shadow-lg transition-transform hover:scale-105"><Check size={24} /></button>
                      </div>
                  ) : (
                      <div 
                        className="group/text cursor-pointer relative"
                        onClick={() => setIsEditingMantra(true)}
                      >
                          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400 tracking-tighter leading-[0.9] drop-shadow-sm group-hover/text:scale-[1.01] transition-transform duration-300">
                              {personalization.mantra || "Soar High, Tatak Ramon!"}
                          </h1>
                          <div className="absolute -right-8 top-0 opacity-0 group-hover/text:opacity-100 transition-opacity">
                              <Edit2 size={20} className="text-pink-500" />
                          </div>
                      </div>
                  )}
                  
                  <div className="h-1.5 w-32 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.5)]"></div>
              </div>
          </div>
      </div>

      {/* 2. NAVIGATION TABS (Glass Pill) */}
      <div className="flex justify-center md:justify-start">
          <div className="flex items-center gap-1 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg relative z-20">
              <button
                onClick={() => setActiveTab('desk')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeTab === 'desk' 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md transform scale-105' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                  <Layout size={18} /> My Desk
              </button>
              <button
                onClick={() => setActiveTab('journal')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeTab === 'journal' 
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 transform scale-105' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                  <Book size={18} /> Growth Journal
              </button>
          </div>
      </div>

      {/* 3. CONTENT AREA */}
      {activeTab === 'desk' ? (
          // --- DESK VIEW (File Manager) ---
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Toolbar */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-3 flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-3">
                <div className="flex items-center overflow-x-auto px-2 py-1 scrollbar-hide flex-1 gap-1">
                     <button 
                        onClick={() => navigateUp(null)}
                        onDragOver={(e) => handleDragOver(e, null)}
                        onDrop={(e) => handleDrop(e, null)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap font-bold text-sm ${
                            !currentFolderId ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white ring-2 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                     >
                        <Home size={16} /> Home
                     </button>
                     {breadcrumbs.slice(1).map((crumb) => (
                        <React.Fragment key={crumb.id}>
                            <ChevronRight size={14} className="text-slate-300 mx-1 shrink-0" />
                            <button 
                                onClick={() => navigateUp(crumb.id)}
                                onDragOver={(e) => handleDragOver(e, crumb.id)}
                                onDrop={(e) => handleDrop(e, crumb.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap font-bold text-sm ${
                                    crumb.id === currentFolderId ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white ring-2 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                            >
                                {crumb.name}
                            </button>
                        </React.Fragment>
                     ))}
                </div>

                <div className="flex items-center gap-2 px-2 w-full md:w-auto">
                     <div className="relative group flex-1 md:flex-none">
                         <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                         <input 
                            type="text" 
                            placeholder="Find resources..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-48 pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all placeholder:text-slate-400"
                         />
                     </div>
                     <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
                     <button
                        onClick={() => { setFolderToEdit(null); setIsFolderModalOpen(true); }}
                        className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                        title="New Folder"
                     >
                        <FolderPlus size={20} />
                     </button>
                     <button
                        onClick={() => { setResourceToEdit(null); setIsResourceModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl shadow-lg shadow-pink-500/20 transition-all hover:scale-105 active:scale-95 font-bold text-sm"
                        title="Add Resource"
                     >
                        <Plus size={18} /> <span className="hidden sm:inline">Add Item</span>
                     </button>
                </div>
              </div>

              {/* Grid Content */}
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-pink-500"></div>
                </div>
              ) : filteredFolders.length === 0 && deskFiles.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-12 text-center flex flex-col items-center justify-center min-h-[400px] opacity-60">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                        <Home size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 dark:text-white">Your desk is clear</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Start organizing your review materials.</p>
                </div>
              ) : (
                <div className="space-y-10">
                    {filteredFolders.length > 0 && (
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 pl-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Folders
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 pl-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span> Files & Notes
                            </h4>
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
          // --- JOURNAL VIEW (The Mental Space) ---
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-purple-50 dark:bg-purple-900/10 p-6 rounded-[2rem] border border-purple-100 dark:border-purple-500/20">
                  <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-500 text-white rounded-2xl shadow-lg shadow-purple-500/30">
                          <Feather size={24} />
                      </div>
                      <div>
                          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Growth Journal</h2>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-lg mt-1 leading-relaxed">
                              "The only person you are destined to become is the person you decide to be." Document your journey to the license.
                          </p>
                      </div>
                  </div>
                  <button 
                    onClick={() => { setJournalToEdit(null); setIsJournalModalOpen(true); }}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-wider shadow-xl hover:scale-105 transition-all active:scale-95 whitespace-nowrap"
                  >
                      <PenTool size={18} /> Write Entry
                  </button>
              </div>

              {journalLoading ? (
                  <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-purple-500"></div>
                  </div>
              ) : journalEntries.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-12 text-center flex flex-col items-center min-h-[400px] justify-center">
                      <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
                          <Heart size={40} className="text-pink-400" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white">Your Story Starts Here</h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 text-base font-medium">
                          Reflecting on your daily struggles and wins is a proven way to reduce anxiety. Start your first entry now.
                      </p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {journalEntries.map(entry => {
                          // Mood Color Mapping
                          let moodGradient = 'from-slate-500 to-slate-600';
                          let moodIcon = <Coffee size={16} />;
                          
                          if (entry.color === 'yellow') { moodGradient = 'from-amber-400 to-orange-400'; moodIcon = <Sun size={16} />; } // Happy
                          if (entry.color === 'blue') { moodGradient = 'from-blue-400 to-indigo-500'; moodIcon = <CloudRain size={16} />; } // Sad/Tired
                          if (entry.color === 'red') { moodGradient = 'from-red-400 to-pink-500'; moodIcon = <Zap size={16} />; } // Stressed
                          if (entry.color === 'green') { moodGradient = 'from-emerald-400 to-teal-500'; moodIcon = <Check size={16} />; } // Focused

                          return (
                              <div 
                                key={entry.id}
                                onClick={() => { setJournalToEdit(entry); setIsJournalModalOpen(true); }}
                                className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-[320px] hover:-translate-y-2"
                              >
                                  {/* Mood Banner */}
                                  <div className={`h-24 bg-gradient-to-br ${moodGradient} p-6 relative overflow-hidden`}>
                                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                                      <div className="relative z-10 flex justify-between items-start text-white">
                                          <div className="flex flex-col">
                                              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                                                  {format(new Date(entry.createdAt), 'MMMM dd')}
                                              </span>
                                              <span className="text-2xl font-black font-serif leading-none mt-1">
                                                  {format(new Date(entry.createdAt), 'yyyy')}
                                              </span>
                                          </div>
                                          <div className="p-2 bg-white/20 backdrop-blur-md rounded-full">
                                              {moodIcon}
                                          </div>
                                      </div>
                                  </div>
                                  
                                  <div className="p-6 flex-1 flex flex-col relative">
                                      <div className="absolute -top-6 right-6 w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg text-slate-400 group-hover:text-purple-500 transition-colors border border-slate-100 dark:border-slate-700">
                                          <Edit2 size={18} />
                                      </div>

                                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-1 mt-2">
                                          {entry.fileName}
                                      </h3>
                                      
                                      <div className="flex-1 overflow-hidden relative">
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-serif line-clamp-5 whitespace-pre-wrap">
                                            {entry.userNotes}
                                        </p>
                                        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-slate-900 to-transparent"></div>
                                      </div>
                                      
                                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity">
                                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Read Entry</span>
                                          <button 
                                            onClick={(e) => handleDeleteResource(e, entry.id)}
                                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                                          >
                                              <Trash2 size={14} />
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
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

      {/* 4. Journal Modal (Redesigned Zen Editor - Floating Sanctuary) */}
      {isJournalModalOpen && (
          <JournalModal 
              onClose={() => setIsJournalModalOpen(false)}
              initialData={journalToEdit}
              onSave={async (title, content, color) => {
                  if (journalToEdit) {
                      await editResource(journalToEdit.id, { title, content, color });
                  } else {
                      await addResource(title, 'journal', '', content, color);
                  }
                  setIsJournalModalOpen(false);
              }}
          />
      )}

    </div>
    </>
  );
};

// --- SUB-COMPONENT: JOURNAL EDITOR MODAL (Zen Mode v3.0 - Floating Sanctuary) ---
const JournalModal: React.FC<{ 
    onClose: () => void, 
    initialData: UserFile | null, 
    onSave: (title: string, content: string, color: string) => Promise<void> 
}> = ({ onClose, initialData, onSave }) => {
    const [title, setTitle] = useState(initialData?.fileName || '');
    const [content, setContent] = useState(initialData?.userNotes || '');
    const [mood, setMood] = useState(initialData?.color || 'yellow');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim()) return;
        setLoading(true);
        await onSave(title, content, mood);
        setLoading(false);
    };

    const moodOptions = [
        { id: 'yellow', label: 'Motivated', icon: Sun, color: 'bg-amber-400', glow: 'shadow-amber-500/50' },
        { id: 'green', label: 'Focused', icon: Check, color: 'bg-emerald-500', glow: 'shadow-emerald-500/50' },
        { id: 'blue', label: 'Tired', icon: CloudRain, color: 'bg-blue-500', glow: 'shadow-blue-500/50' },
        { id: 'red', label: 'Stressed', icon: Zap, color: 'bg-red-500', glow: 'shadow-red-500/50' },
    ];

    const currentMood = moodOptions.find(m => m.id === mood) || moodOptions[0];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 animate-fade-in">
            {/* Dark Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>

            {/* Floating Card */}
            <div className="relative w-full max-w-4xl h-full max-h-[800px] bg-white dark:bg-[#020617] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-zoom-in ring-1 ring-white/10">
                
                {/* Ambient Mood Light (Top Glow) */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b ${currentMood.color.replace('bg-', 'from-')}/20 to-transparent opacity-60 pointer-events-none blur-3xl transition-colors duration-1000`}></div>

                {/* --- HEADER --- */}
                <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-6 border-b border-slate-100 dark:border-slate-800/50 shrink-0 relative z-20">
                    {/* Date/Info */}
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Calendar size={12} /> {format(new Date(), 'MMMM do, yyyy')}
                        </span>
                    </div>

                    {/* Desktop Toolbar (Hidden on Mobile) */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-full">
                            {moodOptions.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setMood(m.id)}
                                    className={`p-2 rounded-full transition-all duration-300 ${
                                        mood === m.id 
                                        ? `${m.color} text-white shadow-lg ${m.glow} scale-110` 
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700'
                                    }`}
                                    title={m.label}
                                >
                                    <m.icon size={16} />
                                </button>
                            ))}
                        </div>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
                        <button 
                            onClick={handleSubmit} 
                            disabled={loading || !title.trim()}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                                !title.trim() 
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg hover:scale-105 active:scale-95'
                            }`}
                        >
                            {loading ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Entry
                        </button>
                        <button onClick={onClose} className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Mobile Close Button (Visible on Mobile) */}
                    <button onClick={onClose} className="md:hidden p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                {/* --- EDITOR BODY --- */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-6 py-4 md:px-12 md:py-8">
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Untitled Thought..."
                        className="w-full text-3xl md:text-5xl font-black text-slate-900 dark:text-white bg-transparent border-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-700 px-0 mb-6 leading-tight tracking-tight"
                        autoFocus
                    />
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Pour your mind out..."
                        className="w-full h-full min-h-[400px] resize-none text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-300 bg-transparent border-none focus:ring-0 px-0 font-serif placeholder:text-slate-300 dark:placeholder:text-slate-700 pb-20"
                    />
                </div>

                {/* --- MOBILE TOOLBAR (Sticky Bottom) --- */}
                <div className="md:hidden p-4 border-t border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-[#020617]/90 backdrop-blur-md flex justify-between items-center shrink-0 safe-area-bottom">
                    <div className="flex gap-2">
                        {moodOptions.map(m => (
                            <button
                                key={m.id}
                                onClick={() => setMood(m.id)}
                                className={`p-2 rounded-full transition-all ${
                                    mood === m.id 
                                    ? `${m.color} text-white shadow-md` 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                }`}
                            >
                                <m.icon size={18} />
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading || !title.trim()}
                        className={`p-3 rounded-full shadow-lg transition-all ${
                            !title.trim() ? 'bg-slate-200 text-slate-400' : 'bg-pink-600 text-white'
                        }`}
                    >
                        {loading ? <Loader size={20} className="animate-spin" /> : <Save size={20} />}
                    </button>
                </div>

            </div>
        </div>
    );
};

// --- SUB-COMPONENT: Resource Card (Reused & Enhanced) ---
const ResourceCard: React.FC<{ 
    resource: UserFile, 
    onEdit: () => void, 
    onDelete: (e: React.MouseEvent) => void,
    onMove: () => void,
    onDragStart: (e: React.DragEvent) => void
}> = ({ resource, onEdit, onDelete, onMove, onDragStart }) => {
    
    const isNote = resource.fileType === 'note';

    // Safe date formatting
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            return format(new Date(dateString), 'MMM d');
        } catch {
            return '';
        }
    };

    // --- STICKY NOTE RENDERER (Washi Tape Aesthetic) ---
    if (isNote) {
        const bgColors: Record<string, string> = {
            yellow: 'bg-[#fef9c3] text-yellow-900 selection:bg-yellow-500/30',
            pink: 'bg-[#fce7f3] text-pink-900 selection:bg-pink-500/30',
            cyan: 'bg-[#cffafe] text-cyan-900 selection:bg-cyan-500/30',
            green: 'bg-[#dcfce7] text-emerald-900 selection:bg-emerald-500/30',
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
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-8 bg-white/40 backdrop-blur-sm shadow-sm rotate-1 transform skew-x-12 opacity-80"></div>

                <div className="overflow-hidden flex-1">
                    <h4 className="font-black text-sm mb-2 opacity-90 uppercase tracking-wider border-b border-black/10 pb-1 truncate">{resource.fileName}</h4>
                    <p className="text-xs font-bold leading-relaxed whitespace-pre-wrap font-handwriting opacity-80 line-clamp-6 text-[13px]">
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
            className="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-pink-500/10 hover:border-pink-300 dark:hover:border-pink-500 transition-all cursor-pointer flex flex-col h-[180px] overflow-hidden relative"
        >
            <a 
                href={resource.downloadUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 p-6 flex flex-col items-center justify-center gap-4 bg-slate-50/50 dark:bg-slate-900/50 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors"
            >
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-md">
                    {getIcon()}
                </div>
                <div className="text-center w-full px-2">
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate w-full group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">{resource.fileName}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest truncate mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {new URL(resource.downloadUrl).hostname.replace('www.','')}
                    </p>
                </div>
            </a>

            {/* Quick Actions Overlay (Bottom) */}
            <div className="absolute bottom-0 inset-x-0 p-3 flex justify-between items-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-300 border-t border-slate-100 dark:border-slate-700">
                <button onClick={onEdit} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Edit">
                    <Edit2 size={16} />
                </button>
                <div className="flex gap-2">
                    <button onClick={onMove} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Move">
                        <GripVertical size={16} />
                    </button>
                    <button onClick={onDelete} className="p-2 text-slate-500 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
            
            {/* External Link Indicator */}
            <div className="absolute top-4 right-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform translate-x-2 group-hover:translate-x-0 duration-300">
                <ExternalLink size={16} />
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
