
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useFileManager } from '../hooks/useFileManager';
import FolderModal from './FolderModal';
import MoveItemModal from './MoveItemModal';
import FolderCard from './FolderCard';
import ResourceCard from './ResourceCard';
import ResourceModal from './ResourceModal';
import JournalModal from './JournalModal';
import { db, storage } from '../firebase';
import { doc, onSnapshot, updateDoc, collection, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  FolderPlus, Home, ChevronRight, Plus, 
  Trash2, Edit2, Layout, Book, Heart, PenTool, Search, 
  GraduationCap, ArrowRight, Sun, CloudRain, Zap, Check, Coffee, AlertTriangle, Loader2
} from 'lucide-react';
import { UserFile, UserFolder } from '../types';
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
        <div className="fixed inset-0 z-[9999] bg-[#020617] text-white flex flex-col items-center justify-center p-6 overflow-hidden font-sans select-none touch-none">
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // New Delete Modal
  
  // --- Editing/Deletion Targets ---
  const [folderToEdit, setFolderToEdit] = useState<UserFolder | null>(null);
  const [resourceToEdit, setResourceToEdit] = useState<UserFile | null>(null);
  const [journalToEdit, setJournalToEdit] = useState<UserFile | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string, type: 'file' | 'folder' } | null>(null);
  
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

      const hasSeen = localStorage.getItem('has_seen_ascension_v3');
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
          where('fileType', '==', 'journal')
      );
      
      const unsub = onSnapshot(q, (snapshot) => {
          const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserFile[];
          entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setJournalEntries(entries);
          setJournalLoading(false);
      }, (error) => {
          console.error("Journal Fetch Error:", error);
          setJournalLoading(false);
      });
      return () => unsub();
  }, [currentUser]);

  // --- Handlers: Personalization ---
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || !e.target.files[0] || !currentUser) return;
      const file = e.target.files[0];
      
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

  // --- DELETION LOGIC (Replacement for window.confirm) ---
  const handleDeleteRequest = (e: React.MouseEvent, id: string, name: string, type: 'file' | 'folder') => {
      e.stopPropagation(); // Stop bubbling immediately
      e.preventDefault();
      setItemToDelete({ id, name, type });
      setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
      if (!itemToDelete) return;
      try {
          if (itemToDelete.type === 'file') {
              await deleteFile(itemToDelete.id);
          } else {
              await deleteFolder(itemToDelete.id);
          }
      } catch (error) {
          console.error("Delete failed", error);
          alert("Could not delete item. Check console.");
      } finally {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
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
  
  const deskFiles = sortedFiles.filter(f => 
    f.fileType !== 'journal' &&
    (f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.userNotes && f.userNotes.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <>
    {showWrapped && <AscensionIntro onComplete={handleWrappedComplete} />}
    
    <div className="max-w-7xl mx-auto space-y-8 pb-32 md:pb-20 font-sans animate-fade-in px-4 md:px-0">
      
      {/* 1. HERO SECTION */}
      <div className="relative w-full h-[280px] md:h-[400px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group shadow-2xl border border-slate-200 dark:border-white/10 bg-slate-900 transition-all hover:shadow-pink-500/20">
          {personalization.coverPhoto ? (
              <div className="absolute inset-0 w-full h-full">
                  <img 
                    src={personalization.coverPhoto} 
                    alt="Cover" 
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent opacity-90"></div>
              </div>
          ) : (
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-[#020617] flex items-center justify-center">
                  <div className="text-slate-600 flex flex-col items-center gap-2 group-hover:text-slate-500 transition-colors">
                      <div className="opacity-50"><Edit2 size={32} /></div>
                      <span className="text-xs font-bold uppercase tracking-widest">Customize Sanctuary</span>
                  </div>
              </div>
          )}
          
          <button 
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-4 right-4 md:top-6 md:right-6 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all opacity-100 md:opacity-0 group-hover:opacity-100 border border-white/10 hover:scale-110 z-20"
            title="Change Cover (Max 5MB)"
          >
              {uploadingCover ? <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"/> : <Edit2 size={20} />}
          </button>
          <input ref={coverInputRef} type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />

          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
              <div className="flex flex-col items-start gap-3 md:gap-4">
                  <div className="px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] shadow-lg">
                      Batch Crescere 2026
                  </div>

                  {isEditingMantra ? (
                      <div className="flex gap-2 w-full max-w-xl animate-in fade-in slide-in-from-bottom-2">
                          <input 
                            type="text" 
                            value={mantraInput}
                            onChange={(e) => setMantraInput(e.target.value)}
                            className="flex-1 bg-black/50 border border-white/20 rounded-2xl px-4 py-2 md:px-6 md:py-3 text-white font-black text-xl md:text-4xl focus:outline-none focus:border-pink-500 backdrop-blur-sm"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && saveMantra()}
                          />
                          <button onClick={saveMantra} className="p-3 md:p-4 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl shadow-lg transition-transform hover:scale-105"><Check size={20} /></button>
                      </div>
                  ) : (
                      <div 
                        className="group/text cursor-pointer relative w-full md:w-auto"
                        onClick={() => setIsEditingMantra(true)}
                      >
                          <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400 tracking-tighter leading-[1] md:leading-[0.9] drop-shadow-sm group-hover/text:scale-[1.01] transition-transform duration-300">
                              {personalization.mantra || "Soar High, Tatak Ramon!"}
                          </h1>
                          <div className="absolute -right-6 md:-right-8 top-0 opacity-0 group-hover/text:opacity-100 transition-opacity hidden md:block">
                              <Edit2 size={20} className="text-pink-500" />
                          </div>
                      </div>
                  )}
                  
                  <div className="h-1.5 w-24 md:w-32 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.5)]"></div>
              </div>
          </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex justify-center md:justify-start sticky top-20 z-30 md:static">
          <div className="flex items-center gap-1 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg relative z-20 w-full md:w-auto">
              <button
                onClick={() => setActiveTab('desk')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 ${
                    activeTab === 'desk' 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md transform scale-[1.02]' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                  <Layout size={16} className="md:w-5 md:h-5" /> My Desk
              </button>
              <button
                onClick={() => setActiveTab('journal')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 ${
                    activeTab === 'journal' 
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 transform scale-[1.02]' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                  <Book size={16} className="md:w-5 md:h-5" /> Growth Journal
              </button>
          </div>
      </div>

      {/* 3. CONTENT AREA */}
      {activeTab === 'desk' ? (
          // --- DESK VIEW ---
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Toolbar */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-3 flex flex-col gap-3 shadow-sm">
                
                {/* Mobile Search & Add */}
                <div className="flex md:hidden gap-2">
                     <div className="relative group flex-1">
                         <Search size={16} className="absolute left-3 top-1/2 -translate-x-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                         <input 
                            type="text" 
                            placeholder="Find..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all placeholder:text-slate-400"
                         />
                     </div>
                     <button
                        onClick={() => { setResourceToEdit(null); setIsResourceModalOpen(true); }}
                        className="p-2.5 bg-pink-600 text-white rounded-xl shadow-md"
                     >
                        <Plus size={20} />
                     </button>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Breadcrumbs */}
                    <div className="flex items-center overflow-x-auto px-2 py-1 scrollbar-hide flex-1 gap-1 w-full">
                         <button 
                            onClick={() => navigateUp(null)}
                            onDragOver={(e) => handleDragOver(e, null)}
                            onDrop={(e) => handleDrop(e, null)}
                            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl transition-all whitespace-nowrap font-bold text-xs md:text-sm ${
                                !currentFolderId ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white ring-2 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                         >
                            <Home size={14} /> Home
                         </button>
                         {breadcrumbs.slice(1).map((crumb) => (
                            <React.Fragment key={crumb.id}>
                                <ChevronRight size={14} className="text-slate-300 mx-1 shrink-0" />
                                <button 
                                    onClick={() => navigateUp(crumb.id)}
                                    onDragOver={(e) => handleDragOver(e, crumb.id)}
                                    onDrop={(e) => handleDrop(e, crumb.id)}
                                    className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl transition-all whitespace-nowrap font-bold text-xs md:text-sm ${
                                        crumb.id === currentFolderId ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white ring-2 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    }`}
                                >
                                    {crumb.name}
                                </button>
                            </React.Fragment>
                         ))}
                    </div>

                    {/* Desktop Toolbar Right */}
                    <div className="hidden md:flex items-center gap-2 px-2 w-auto">
                         <div className="relative group">
                             <Search size={16} className="absolute left-3 top-1/2 -translate-x-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                             <input 
                                type="text" 
                                placeholder="Find resources..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-48 pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all placeholder:text-slate-400"
                             />
                         </div>
                         <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
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
                            title="Add Item"
                         >
                            <Plus size={18} /> Add Item
                         </button>
                    </div>
                    
                    {/* Mobile Folder Add Button */}
                    <div className="md:hidden flex justify-end px-2">
                         <button
                            onClick={() => { setFolderToEdit(null); setIsFolderModalOpen(true); }}
                            className="text-xs font-bold text-purple-500 flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg"
                         >
                            <FolderPlus size={14} /> New Folder
                         </button>
                    </div>
                </div>
              </div>

              {/* Grid Content */}
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-pink-500"></div>
                </div>
              ) : filteredFolders.length === 0 && deskFiles.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[300px] opacity-60">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                        <Home size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 dark:text-white">Your desk is clear</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-sm">Start organizing your review materials.</p>
                </div>
              ) : (
                <div className="space-y-10">
                    {filteredFolders.length > 0 && (
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 pl-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Folders
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                                {filteredFolders.map(folder => (
                                    <FolderCard 
                                        key={folder.id}
                                        folder={folder}
                                        onNavigate={navigateToFolder}
                                        onEdit={(f) => { setFolderToEdit(f); setIsFolderModalOpen(true); }}
                                        onMove={(id) => handleMoveClick(id, 'folder')}
                                        onDelete={(id) => handleDeleteRequest({ stopPropagation: () => {}, preventDefault: () => {} } as any, id, folder.name, 'folder')}
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                                {deskFiles.map(resource => (
                                    <ResourceCard 
                                        key={resource.id} 
                                        resource={resource} 
                                        onEdit={() => { setResourceToEdit(resource); setIsResourceModalOpen(true); }}
                                        onDelete={(e) => handleDeleteRequest(e, resource.id, resource.fileName, 'file')}
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
          // --- JOURNAL VIEW ---
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-purple-50 dark:bg-purple-900/10 p-6 rounded-[2rem] border border-purple-100 dark:border-purple-500/20">
                  <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-500 text-white rounded-2xl shadow-lg shadow-purple-500/30">
                          <Heart size={24} />
                      </div>
                      <div>
                          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Growth Journal</h2>
                          <p className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400 max-w-lg mt-1 leading-relaxed">
                              "The only person you are destined to become is the person you decide to be." Document your journey to the license.
                          </p>
                      </div>
                  </div>
                  <button 
                    onClick={() => { setJournalToEdit(null); setIsJournalModalOpen(true); }}
                    className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-wider shadow-xl hover:scale-105 transition-all active:scale-95 whitespace-nowrap text-xs md:text-sm"
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
                          let moodGradient = 'from-slate-500 to-slate-600';
                          let moodIcon = <Coffee size={16} />;
                          
                          if (entry.color === 'yellow') { moodGradient = 'from-amber-400 to-orange-400'; moodIcon = <Sun size={16} />; }
                          if (entry.color === 'blue') { moodGradient = 'from-blue-400 to-indigo-500'; moodIcon = <CloudRain size={16} />; }
                          if (entry.color === 'red') { moodGradient = 'from-red-400 to-pink-500'; moodIcon = <Zap size={16} />; }
                          if (entry.color === 'green') { moodGradient = 'from-emerald-400 to-teal-500'; moodIcon = <Check size={16} />; }

                          return (
                              <div 
                                key={entry.id}
                                onClick={() => { setJournalToEdit(entry); setIsJournalModalOpen(true); }}
                                className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-[320px] hover:-translate-y-2"
                              >
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
                                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-1 mt-2">
                                          {entry.fileName}
                                      </h3>
                                      
                                      <div className="flex-1 overflow-hidden relative">
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-serif line-clamp-5 whitespace-pre-wrap">
                                            {entry.userNotes}
                                        </p>
                                        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-slate-900 to-transparent"></div>
                                      </div>
                                      
                                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity">Read Entry</span>
                                          <button 
                                            onClick={(e) => handleDeleteRequest(e, entry.id, entry.fileName, 'file')}
                                            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-full transition-colors z-20 relative"
                                            title="Delete Entry"
                                          >
                                              <Trash2 size={16} />
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
      
      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && itemToDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 animate-zoom-in" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-3 mb-4 text-red-500">
                      <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-full">
                          <Trash2 size={24} />
                      </div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Confirm Deletion</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 font-medium">
                      Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{itemToDelete.name}"</span>?
                  </p>
                  <p className="text-xs text-slate-400 mb-6">
                      This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                      <button 
                          onClick={() => setIsDeleteModalOpen(false)}
                          className="flex-1 py-3 font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={confirmDelete}
                          className="flex-1 py-3 font-bold text-white bg-red-600 rounded-xl hover:bg-red-500 shadow-lg shadow-red-500/30 transition-colors"
                      >
                          Delete
                      </button>
                  </div>
              </div>
          </div>
      )}

      {isResourceModalOpen && (
          <ResourceModal 
              isOpen={isResourceModalOpen}
              onClose={() => setIsResourceModalOpen(false)}
              onSave={async (data) => {
                  try {
                      if (resourceToEdit) {
                          await editResource(resourceToEdit.id, data);
                      } else {
                          await addResource(data.title, data.type, data.url, data.content, data.color);
                      }
                      setIsResourceModalOpen(false);
                  } catch (e) {
                      console.error(e);
                      alert("Error saving resource. Please check connection.");
                  }
              }}
              initialData={resourceToEdit}
          />
      )}

      {isFolderModalOpen && (
        <FolderModal 
            onClose={() => { setIsFolderModalOpen(false); setFolderToEdit(null); }} 
            onSave={async (name, color) => {
                try {
                    if (folderToEdit) await updateFolder(folderToEdit.id, name, color);
                    else await createFolder(name, color);
                } catch(e) {
                    console.error(e);
                    alert("Error creating folder.");
                }
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

      {isJournalModalOpen && (
          <JournalModal 
              onClose={() => setIsJournalModalOpen(false)}
              initialData={journalToEdit}
              onSave={async (title, content, color) => {
                  try {
                      if (journalToEdit) {
                          await editResource(journalToEdit.id, { title, content, color });
                      } else {
                          await addResource(title, 'journal', '', content, color);
                      }
                      setIsJournalModalOpen(false);
                  } catch (e) {
                      console.error("Journal Save Error:", e);
                      throw e;
                  }
              }}
          />
      )}

    </div>
    </>
  );
};

export default PersonalFolder;
