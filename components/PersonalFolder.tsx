
import React, { useState, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { useFileManager } from '../hooks/useFileManager';
import FilePreviewModal from './FilePreviewModal';
import FolderModal from './FolderModal';
import { 
  Folder, Upload, FileText, Image, File as FileIcon, Trash2, Download, 
  Loader, Plus, X, Eye, Film, Music, ChevronRight, Home, Grid, FolderPlus, ArrowUp
} from 'lucide-react';
import { format } from 'date-fns';
import { UserFile } from '../types';

const PersonalFolder: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    sortedFolders, sortedFiles, breadcrumbs, 
    navigateToFolder, navigateUp, createFolder, uploadFile, moveFile, deleteFile, deleteFolder,
    uploading, loading, sortBy, setSortBy 
  } = useFileManager(currentUser?.uid);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userNote, setUserNote] = useState('');
  const [previewFile, setPreviewFile] = useState<{url: string, type: string, name: string} | null>(null);
  
  // Drag and Drop State
  const [draggedFile, setDraggedFile] = useState<UserFile | null>(null);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (isoString: string) => {
      try {
          return format(new Date(isoString), 'MMM dd, yyyy');
      } catch (e) {
          return '';
      }
  };

  // Icon Helper
  const getThumbnailIcon = (mimeType: string) => {
    if (mimeType === 'application/pdf') return <FileText size={48} className="text-red-500" strokeWidth={1.5} />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileText size={48} className="text-blue-500" strokeWidth={1.5} />;
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileText size={48} className="text-green-500" strokeWidth={1.5} />;
    if (mimeType.startsWith('video/')) return <Film size={48} className="text-pink-500" strokeWidth={1.5} />;
    if (mimeType.startsWith('audio/')) return <Music size={48} className="text-purple-500" strokeWidth={1.5} />;
    return <FileIcon size={48} className="text-slate-400" strokeWidth={1.5} />;
  };

  // --- Drag & Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, file: UserFile) => {
    setDraggedFile(file);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent ghost image or simple styling
    e.dataTransfer.setData('text/plain', file.id); 
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
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

    if (draggedFile && draggedFile.folderId !== targetFolderId) {
        try {
            await moveFile(draggedFile.id, targetFolderId);
        } catch (error) {
            console.error("Failed to move file", error);
        }
    }
    setDraggedFile(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      
      {/* 1. Top Bar: Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">File Explorer</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Manage your reviewers and notes.</p>
        </div>
        <div className="flex gap-3">
            <button
                onClick={() => setIsFolderModalOpen(true)}
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
        
        {/* Breadcrumbs (Droppable targets for moving up) */}
        <div className="flex items-center overflow-x-auto px-2 py-1 scrollbar-hide">
             {breadcrumbs.map((crumb, index) => {
                 const isTarget = dragOverFolderId === crumb.id && draggedFile?.folderId !== crumb.id;
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
            
            {/* Folders Section */}
            {sortedFolders.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 pl-1">Folders</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {sortedFolders.map(folder => {
                            const isTarget = dragOverFolderId === folder.id;
                            return (
                                <div 
                                    key={folder.id}
                                    onDoubleClick={() => navigateToFolder(folder.id, folder.name)}
                                    onDragOver={(e) => handleDragOver(e, folder.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, folder.id)}
                                    className={`group bg-white dark:bg-slate-800 p-4 rounded-xl border transition-all cursor-pointer relative ${
                                        isTarget 
                                        ? 'border-pink-500 ring-2 ring-pink-500 bg-pink-50 dark:bg-pink-900/20 scale-105 shadow-xl' 
                                        : 'border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-500 hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div style={{ color: folder.color }}>
                                            <Folder size={32} fill="currentColor" fillOpacity={isTarget ? 0.4 : 0.2} />
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }}
                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <h4 className="font-semibold text-slate-800 dark:text-white truncate text-sm mb-1">{folder.name}</h4>
                                    <p className="text-[10px] text-slate-400">
                                        Created {formatDate(folder.createdAt)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Files Section */}
            {sortedFiles.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 pl-1">Files</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                    {sortedFiles.map((file) => {
                        const isImage = file.fileType.startsWith('image/');
                        const isDragging = draggedFile?.id === file.id;

                        return (
                        <div 
                            key={file.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, file)}
                            className={`group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-300 overflow-hidden flex flex-col h-[240px] ${
                                isDragging ? 'opacity-50 scale-95 border-dashed border-pink-400' : ''
                            }`}
                        >
                            {/* Thumbnail */}
                            <div 
                                className="h-32 w-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center overflow-hidden cursor-pointer relative"
                                onClick={() => setPreviewFile({ url: file.downloadUrl, type: file.fileType, name: file.fileName })}
                            >
                            {isImage ? (
                                <img 
                                src={file.downloadUrl} 
                                alt={file.fileName} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="transform transition-transform duration-300 group-hover:scale-110">
                                {getThumbnailIcon(file.fileType)}
                                </div>
                            )}
                            </div>

                            {/* Details */}
                            <div className="p-3 flex flex-col flex-1 justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm truncate" title={file.fileName}>
                                        {file.fileName}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                        <span>{formatDate(file.createdAt)}</span>
                                        <span>•</span>
                                        <span>{formatFileSize(file.fileSize)}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-1 pt-2">
                                    <a
                                        href={file.downloadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-lg transition-colors"
                                        title="Download"
                                    >
                                        <Download size={14} />
                                    </a>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm('Delete this file?')) deleteFile(file.id, file.fileName);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                    </div>
                </div>
            )}
        </div>
      )}

      {/* Modals */}
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
                    <FileIcon size={40} className="text-pink-500 mb-3" />
                    <p className="text-sm font-bold text-slate-800 dark:text-white text-center break-all px-4">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{formatFileSize(selectedFile.size)}</p>
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

      {isFolderModalOpen && (
        <FolderModal 
            onClose={() => setIsFolderModalOpen(false)} 
            onCreate={createFolder} 
        />
      )}

      {previewFile && (
        <FilePreviewModal 
          fileUrl={previewFile.url}
          fileType={previewFile.type}
          fileName={previewFile.name}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
};

export default PersonalFolder;
