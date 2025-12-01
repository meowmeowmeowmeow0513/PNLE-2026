import React, { useState, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { useFileManager } from '../hooks/useFileManager';
import FilePreviewModal from './FilePreviewModal';
import { Folder, Upload, FileText, Image, File as FileIcon, Trash2, Download, Loader, Plus, X, Eye } from 'lucide-react';
import { format } from 'date-fns';

const PersonalFolder: React.FC = () => {
  const { currentUser } = useAuth();
  const { files, uploadFile, deleteFile, uploading, loadingFiles } = useFileManager(currentUser?.uid);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userNote, setUserNote] = useState('');
  
  // State for Preview Modal
  const [previewFile, setPreviewFile] = useState<{url: string, type: string, name: string} | null>(null);
  
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

  const handleDelete = async (e: React.MouseEvent, fileId: string, fileName: string) => {
    e.stopPropagation(); // Prevent opening preview when clicking delete
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      await deleteFile(fileId, fileName);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image size={24} className="text-purple-500" />;
    if (mimeType === 'application/pdf') return <FileText size={24} className="text-red-500" />;
    return <FileIcon size={24} className="text-slate-500" />;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">Personal Resource Folder</h2>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">Secure cloud storage for your study materials.</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-pink-500/20 transition-all"
        >
          <Upload size={18} />
          Upload Resource
        </button>
      </div>

      {/* File List */}
      {loadingFiles ? (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin text-pink-500" size={32} />
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center gap-4 transition-colors">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Folder size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-white">Your folder is empty</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Upload PDFs, images, or notes to keep them handy.</p>
          </div>
          <button
             onClick={() => setIsUploadModalOpen(true)}
             className="text-pink-500 font-medium hover:text-pink-600 dark:hover:text-pink-400 text-sm"
          >
            Upload your first file
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => (
            <div 
              key={file.id} 
              onClick={() => setPreviewFile({ url: file.downloadUrl, type: file.fileType, name: file.fileName })}
              className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-pink-200 dark:hover:border-pink-800/50 transition-all group flex flex-col justify-between cursor-pointer"
            >
              
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  {getFileIcon(file.fileType)}
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => setPreviewFile({ url: file.downloadUrl, type: file.fileType, name: file.fileName })}
                    className="p-1.5 text-slate-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-md transition-colors md:hidden"
                    title="Preview"
                  >
                    <Eye size={16} />
                  </button>
                  <a 
                    href={file.downloadUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    title="Download/Open New Tab"
                  >
                    <Download size={16} />
                  </a>
                  <button 
                    onClick={(e) => handleDelete(e, file.id, file.fileName)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 dark:text-white truncate mb-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors" title={file.fileName}>
                  {file.fileName}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                  <span>{formatFileSize(file.fileSize)}</span>
                  <span>•</span>
                  <span>{format(new Date(file.createdAt), 'MMM d, yyyy')}</span>
                </div>
                
                {file.userNotes && (
                  <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-3">
                      "{file.userNotes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Upload Resource</h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* File Select */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  selectedFile 
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/10' 
                    : 'border-slate-300 dark:border-slate-600 hover:border-pink-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {selectedFile ? (
                  <>
                    <FileIcon size={32} className="text-pink-500 mb-2" />
                    <p className="text-sm font-medium text-slate-800 dark:text-white text-center break-all">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{formatFileSize(selectedFile.size)}</p>
                  </>
                ) : (
                  <>
                    <Upload size={32} className="text-slate-400 mb-2" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Click to select file</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, Images, Word Docs</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />
              </div>

              {/* Notes Input */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                  Add a note (optional)
                </label>
                <textarea
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="What is this file about?"
                  rows={3}
                  className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all resize-none text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {uploading ? <Loader size={18} className="animate-spin" /> : <Upload size={18} />}
                {uploading ? 'Uploading...' : 'Save File'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
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
