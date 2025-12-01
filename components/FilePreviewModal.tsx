import React from 'react';
import { X, Download, FileText, Image as ImageIcon, File } from 'lucide-react';

interface FilePreviewModalProps {
  fileUrl: string;
  fileType: string;
  fileName: string;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ fileUrl, fileType, fileName, onClose }) => {
  const isImage = fileType.startsWith('image/');
  const isPdf = fileType === 'application/pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col relative overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 z-10 shrink-0">
          <h3 className="font-bold text-slate-800 dark:text-white truncate pr-4 flex items-center gap-2 text-lg">
            {isImage ? <ImageIcon size={20} className="text-purple-500"/> : 
             isPdf ? <FileText size={20} className="text-red-500"/> : 
             <File size={20} className="text-slate-500"/>}
            <span className="truncate">{fileName}</span>
          </h3>
          <div className="flex items-center gap-2">
            <a 
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                title="Download / Open in New Tab"
            >
                <Download size={20} />
            </a>
            <button 
                onClick={onClose}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                title="Close"
            >
                <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-black/50 flex items-center justify-center p-4">
          {isImage ? (
            <img 
              src={fileUrl} 
              alt={fileName} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-md"
            />
          ) : isPdf ? (
            <iframe 
              src={fileUrl} 
              title={fileName}
              className="w-full h-full rounded-lg shadow-sm bg-white"
            />
          ) : (
            <div className="text-center p-10 max-w-md">
              <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <File size={48} className="text-slate-400" />
              </div>
              <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Preview not available</h4>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                This file type cannot be previewed directly here. You can download it to view it on your device.
              </p>
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-pink-500/20"
              >
                <Download size={20} />
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
