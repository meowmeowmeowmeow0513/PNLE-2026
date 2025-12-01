import React, { useState, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { useFileManager } from '../hooks/useFileManager';
import FilePreviewModal from './FilePreviewModal';
import { Folder, Upload, FileText, Image, File as FileIcon, Trash2, Download, Loader, Plus, X, Eye, FileCode, Film, Music } from 'lucide-react';
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

  // Helper to determine the large thumbnail icon for non-image files
  const getThumbnailIcon = (mimeType: string) => {
    if (mimeType === 'application/pdf') return <FileText size={48} className="text-red-500" strokeWidth={1.5} />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileText size={48} className="text-blue-500" strokeWidth={1.5} />;
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileText size={48} className="text-green-500" strokeWidth={1.5} />;
    if (mimeType.startsWith('video/')) return <Film size={48} className="text-pink-500" strokeWidth={1.5} />;
    if (mimeType.startsWith('audio/')) return <Music size={48} className="text-purple-500" strokeWidth={1.5} />;
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return <Folder size={48} className="text-orange-400" strokeWidth={1.5} />;
    return <FileIcon size={48} className="text-slate-400" strokeWidth={1.5} />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">Personal Resource Folder</h2>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">Secure cloud storage for your study materials.</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-pink-500/20 transition-all active:scale-95"
        >
          <Upload size={18} />
          Upload Resource
        </button>
      </div>

      {/* Main Content Area */}
      {loadingFiles ? (
        <div className="flex justify-center py-24">
          <Loader className="animate-spin text-pink-500" size={40} />
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-6 transition-colors">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-500">
            <Folder size={40} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-white">Your folder is empty</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Upload PDFs, images, or notes to get started.</p>
          </div>
          <button
             onClick={() => setIsUploadModalOpen(true)}
             className="text-pink-500 font-bold hover:text-pink-600 dark:hover:text-pink-400 text-sm bg-pink-50 dark:bg-pink-900/20 px-4 py-2 rounded-lg transition-colors"
          >
            Upload your first file
          </button>
        </div>
      ) : (
        /* Windows 11 Style Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {files.map((file) => {
            const isImage = file.fileType.startsWith('image/');

            return (
              <div 
                key={file.id}
                className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-300 overflow-hidden flex flex-col h-[260px]"
              >
                {/* Top Section: Thumbnail */}
                <div 
                  className="h-36 w-full bg-slate-100 dark:bg-slate-900/50 flex items-center justify-center overflow-hidden cursor-pointer relative"
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
                  
                  {/* Hover Overlay for Thumbnail */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-white/5 transition-colors duration-300" />
                </div>

                {/* Bottom Section: Details & Actions */}
                <div className="p-3 flex flex-col flex-1 justify-between">
                  <div className="space-y-1">
                    <h3 
                      className="font-semibold text-slate-700 dark:text-slate-200 text-sm truncate" 
                      title={file.fileName}
                    >
                      {file.fileName}
                    </h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium flex items-center gap-1">
                      {formatFileSize(file.fileSize)}
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                     <button
                        onClick={() => setPreviewFile({ url: file.downloadUrl, type: file.fileType, name: file.fileName })}
                        className="p-1.5 text-slate-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-500/20 rounded-lg transition-colors"
                        title="Preview"
                     >
                       <Eye size={16} />
                     </button>
                     
                     <a
                        href={file.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-lg transition-colors"
                        title="Download"
                     >
                       <Download size={16} />
                     </a>

                     <button
                        onClick={(e) => handleDelete(e, file.id, file.fileName)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete"
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

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 relative border border-slate-100 dark:border-slate-700">
            <button 
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Upload Resource</h3>

            <form onSubmit={handleUploadSubmit} className="space-y-5">
              {/* File Select */}
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
                    <p className="text-sm font-bold text-slate-800 dark:text-white text-center break-all px-4">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-md shadow-sm border border-slate-100 dark:border-slate-600">{formatFileSize(selectedFile.size)}</p>
                  </>
                ) : (
                  <>
                    <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-full mb-3">
                        <Upload size={24} className="text-slate-400 dark:text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Click to select file</p>
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
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
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
                className="w-full py-3.5 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
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
