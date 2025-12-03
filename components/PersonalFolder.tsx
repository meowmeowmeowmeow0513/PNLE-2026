
import React, { useState, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { useFileManager } from '../hooks/useFileManager';
import FilePreviewModal from './FilePreviewModal';
import FolderModal from './FolderModal';
import MoveItemModal from './MoveItemModal';
import FileCard from './FileCard';
import FolderCard from './FolderCard';
import { 
  Folder, Upload, FileText, X, Loader, FolderPlus, Home, ChevronRight
} from 'lucide-react';
import { UserFile, UserFolder } from '../types';

const PersonalFolder: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    sortedFolders, sortedFiles, allFolders, breadcrumbs, currentFolderId,
    navigateToFolder, navigateUp, createFolder, updateFolder, uploadFile, moveItem, renameItem, deleteFile, deleteFolder,
    uploading, loading, sortBy, setSortBy 
  } = useFileManager(currentUser?.uid);
  
  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  
  // Folder Edit State
  const [folderToEdit, setFolderToEdit] = useState<UserFolder | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userNote, setUserNote] = useState('');
  const [previewFile, setPreviewFile] = useState<UserFile | null>(null);
  
  // Item Action States
  const [itemToMove, setItemToMove] = useState<{id: string, type: 'file' | 'folder'} | null>(null);

  // Drag and Drop State (Generic)
  const [draggedItem, setDraggedItem] = useState<{ id: string, type: 'file' | 'folder', folderId: string | null } | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      await uploadFile(selectedFile, userNote);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setUserNote('');
    } catch (error) {
      alert("Failed to upload file. Please try again.");
    }
  };

  const handleRenameFile = async (id: string, currentName: string) => {
      const newName = prompt(`Rename file:`, currentName);
      if (newName && newName !== currentName) {
          await renameItem(id, newName, 'file');
      }
  };

  const handleMoveClick = (id: string, type: 'file' | 'folder') => {
      setItemToMove({ id, type });
      setIsMoveModalOpen(true);
  };

  const executeMove = async (targetFolderId: string | null) => {
      if (itemToMove) {
          await moveItem(itemToMove.id, targetFolderId, itemToMove.type);
      }
  };

  // --- Drag & Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, item: { id: string, type: 'file' | 'folder', folderId: string | null }) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Don't highlight if dragging over itself or parent (already there)
    if (draggedItem) {
        if (draggedItem.id === folderId) return; // Can't drop on self
        if (draggedItem.folderId === folderId) return; // Already here
    }

    if (folderId !== dragOverFolderId) {
        setDragOverFolderId(folderId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverFolderId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    setDragOverFolderId(null);

    if (!draggedItem) return;

    // 1. Basic Validation: Don't move to same location or into self
    if (draggedItem.folderId === targetFolderId) return;
    if (draggedItem.id === targetFolderId) return;

    // 2. Folder-Specific Validation: No dropping into self or descendants (loops)
    if (draggedItem.type === 'folder') {
        // Check descendants by tracing up from targetFolderId
        let current = allFolders.find(f => f.id === targetFolderId);
        let loopDetected = false;
        
        while (current) {
            if (current.id === draggedItem.id) {
                loopDetected = true;
                break;
            }
            // Move up
            current = allFolders.find(f => f.id === current?.parentId);
        }

        if (loopDetected) {
            alert("Cannot move a folder into its own subfolder.");
            setDraggedItem(null);
            return;
        }
    }

    try {
        await moveItem(draggedItem.id, targetFolderId, draggedItem.type);
    } catch (error) {
        console.error("Failed to move item", error);
    }
    setDraggedItem(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      
      {/* 1. Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">File Explorer</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Manage your reviewers and notes.</p>
        </div>
        <div className="flex gap-3">
            <button
                onClick={() => { setFolderToEdit(null); setIsFolderModalOpen(true); }}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all"
            >
                <FolderPlus size={18} className="text-pink-500" />
                New Folder
            </button>
            <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-pink-500/20 transition-all active:scale-95"
            >
                <Upload size={18} />
                Upload File
            </button>
        </div>
      </div>

      {/* 2. Navigation Bar (Breadcrumbs & Sort) */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-between shadow-sm">
        
        {/* Droppable Breadcrumbs */}
        <div className="flex items-center overflow-x-auto px-2 py-1 scrollbar-hide">
             {breadcrumbs.map((crumb, index) => {
                 const isTarget = dragOverFolderId === crumb.id && draggedItem?.folderId !== crumb.id && draggedItem?.id !== crumb.id;
                 return (
                    <div key={index} className="flex items-center text-sm">
                        {index > 0 && <ChevronRight size={14} className="text-slate-400 mx-1" />}
                        <button 
                            onClick={() => navigateUp(crumb.id)}
                            onDragOver={(e) => handleDragOver(e, crumb.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, crumb.id)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all whitespace-nowrap ${
                                isTarget ? 'bg-pink-100 dark:bg-pink-900/40 ring-2 ring-pink-500' : ''
                            } ${
                                index === breadcrumbs.length - 1 
                                ? 'font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-700' 
                                : 'text-slate-500 hover:text-pink-500 hover:bg-pink-50 dark:text-slate-400 dark:hover:bg-slate-700'
                            }`}
                        >
                            {index === 0 && <Home size={14} />}
                            {crumb.name}
                        </button>
                    </div>
                 );
             })}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-3">
             <span className="text-xs font-medium text-slate-400 hidden sm:block">Sort by:</span>
             <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
                className="text-xs bg-transparent text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer"
             >
                 <option value="date">Date</option>
                 <option value="name">Name</option>
             </select>
        </div>
      </div>

      {/* 3. Main Content Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader className="animate-spin text-pink-500" size={40} />
        </div>
      ) : (sortedFolders.length === 0 && sortedFiles.length === 0) ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-6 transition-colors min-h-[400px] justify-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-500">
            <Folder size={40} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-white">This folder is empty</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Create a folder or upload files to get started.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
            
            {/* Folders Section (Draggable & Droppable) */}
            {sortedFolders.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 pl-1">Folders</h3>
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
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onDragStart={(e, f) => handleDragStart(e, { id: f.id, type: 'folder', folderId: f.parentId })}
                                isDragOver={dragOverFolderId === folder.id}
                           />
                        ))}
                    </div>
                </div>
            )}

            {/* Files Section (Draggable) */}
            {sortedFiles.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 pl-1">Files</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                    {sortedFiles.map((file) => (
                        <FileCard 
                            key={file.id} 
                            file={file} 
                            onPreview={(f) => setPreviewFile(f)}
                            onDelete={deleteFile}
                            onRename={(id, name) => handleRenameFile(id, name)}
                            onMove={(id) => handleMoveClick(id, 'file')}
                            onDragStart={(e, f) => handleDragStart(e, { id: f.id, type: 'file', folderId: f.folderId || null })}
                        />
                    ))}
                    </div>
                </div>
            )}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 relative border border-slate-100 dark:border-slate-700">
            <button 
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Upload File</h3>

            <form onSubmit={handleUploadSubmit} className="space-y-5">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  selectedFile 
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-500/10' 
                    : 'border-slate-300 dark:border-slate-600 hover:border-pink-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {selectedFile ? (
                  <>
                    <FileText size={40} className="text-pink-500 mb-3" />
                    <p className="text-sm font-bold text-slate-800 dark:text-white text-center break-all px-4">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="text-slate-400 mb-3" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Click to select file</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Note (Optional)</label>
                <textarea
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  rows={2}
                  className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? <Loader size={18} className="animate-spin" /> : <Upload size={18} />}
                {uploading ? 'Uploading...' : 'Save File'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New/Edit Folder Modal */}
      {isFolderModalOpen && (
        <FolderModal 
            onClose={() => { setIsFolderModalOpen(false); setFolderToEdit(null); }} 
            onSave={async (name, color) => {
                if (folderToEdit) {
                    await updateFolder(folderToEdit.id, name, color);
                } else {
                    await createFolder(name, color);
                }
            }}
            initialData={folderToEdit ? { name: folderToEdit.name, color: folderToEdit.color } : undefined}
        />
      )}

      {/* Move Item Modal */}
      {isMoveModalOpen && (
        <MoveItemModal 
            onClose={() => setIsMoveModalOpen(false)} 
            onMove={executeMove}
            folders={allFolders}
            currentFolderId={currentFolderId}
            itemToMove={itemToMove}
        />
      )}

      {/* File Preview */}
      {previewFile && (
        <FilePreviewModal 
          fileUrl={previewFile.downloadUrl}
          fileType={previewFile.fileType}
          fileName={previewFile.fileName}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
};

export default PersonalFolder;
