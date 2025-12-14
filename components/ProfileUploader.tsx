
import React, { useState, useRef } from 'react';
import { storage, auth } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../AuthContext';
import { Camera, X, Loader, Check, Image as ImageIcon, Upload } from 'lucide-react';

interface ProfileUploaderProps {
  onClose: () => void;
  onUploadSuccess: () => void;
}

const ProfileUploader: React.FC<ProfileUploaderProps> = ({ onClose, onUploadSuccess }) => {
  const { updateUserProfile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file || !auth.currentUser) return;

    setUploading(true);
    try {
      const fileRef = ref(storage, `profile_photos/${auth.currentUser.uid}`);
      await uploadBytes(fileRef, file);
      const photoURL = await getDownloadURL(fileRef);

      await updateUserProfile(auth.currentUser.displayName || '', photoURL);
      
      onUploadSuccess();
      onClose();
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end md:justify-center md:items-center">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" 
        onClick={onClose} 
      />

      {/* 
         RESPONSIVE CARD CONTAINER
         Mobile: Bottom Sheet (rounded-t-2xl, slide-up, max-h-85vh)
         Desktop: Centered Modal (rounded-2xl, zoom-in, auto height)
      */}
      <div 
        role="dialog"
        aria-modal="true"
        className="
          relative z-10 
          w-full md:w-[clamp(28rem,40vw,36rem)] 
          bg-white dark:bg-slate-900 
          rounded-t-[2rem] md:rounded-[2.5rem] 
          shadow-[0_-8px_30px_rgba(0,0,0,0.12)] md:shadow-2xl 
          border-t border-x border-slate-200 dark:border-slate-800 md:border 
          max-h-[85dvh] md:max-h-none
          flex flex-col
          overflow-hidden
          animate-slide-up-mobile md:animate-zoom-in
        "
      >
        {/* Mobile Handle (Visual Cue) */}
        <div className="md:hidden w-full flex justify-center pt-3 pb-1 shrink-0" onClick={onClose}>
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>

        {/* Header - Sticky */}
        <div className="px-6 py-4 md:p-8 md:pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shrink-0 sticky top-0 z-20">
            <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Update Photo
                </h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Personalize your reviewer profile.
                </p>
            </div>
            <button 
                onClick={onClose}
                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
                <X size={24} />
            </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto custom-scrollbar p-6 md:p-8 pt-4">
            
            {/* 
               ADAPTIVE LAYOUT 
               Mobile Portrait: Col
               Mobile Landscape: Row (Side-by-Side)
               Desktop: Col
            */}
            <div className="flex flex-col sm:landscape:flex-row md:flex-col gap-8 items-center sm:landscape:items-start md:items-center">
                
                {/* Image Drop Zone */}
                <div className="shrink-0 relative group">
                    <div 
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        className="
                            relative 
                            w-[16rem] h-[16rem] sm:landscape:w-[12rem] sm:landscape:h-[12rem] md:w-[18rem] md:h-[18rem]
                            rounded-full 
                            border-4 border-dashed border-slate-200 dark:border-slate-700 
                            hover:border-pink-500 dark:hover:border-pink-500 
                            bg-slate-50 dark:bg-slate-800/50
                            flex flex-col items-center justify-center 
                            cursor-pointer overflow-hidden 
                            transition-all duration-300
                            group-hover:shadow-xl group-hover:shadow-pink-500/10
                        "
                    >
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center p-4">
                                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                    <ImageIcon size={32} />
                                </div>
                                <span className="block text-sm font-bold text-slate-600 dark:text-slate-300">Tap to Select</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1 block">Max 5MB</span>
                            </div>
                        )}
                        
                        {/* Hover/Tap Overlay */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-3 text-white">
                                <Camera size={32} />
                            </div>
                        </div>
                    </div>
                    {/* Floating Edit Icon */}
                    <button 
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 md:bottom-4 md:right-4 p-3 bg-pink-600 hover:bg-pink-500 text-white rounded-full shadow-lg shadow-pink-600/30 transition-transform hover:scale-110 active:scale-95 border-4 border-white dark:border-slate-900"
                    >
                        <Upload size={20} />
                    </button>
                </div>

                {/* Form & Actions */}
                <div className="w-full flex flex-col justify-between h-full">
                    {/* Info Text (Hidden on small landscape to save space) */}
                    <div className="hidden sm:block mb-6 text-center sm:landscape:text-left md:text-center">
                        <h4 className="font-bold text-slate-800 dark:text-white mb-1">Make it yours</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Upload a square image for best results. <br className="hidden md:block"/>
                            This will be visible on your ID badge and leaderboard.
                        </p>
                    </div>

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                    />

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="
                                w-full py-4 px-6
                                rounded-xl 
                                bg-pink-600 hover:bg-pink-500 
                                text-white font-bold text-sm uppercase tracking-widest
                                shadow-lg shadow-pink-600/20 
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                                flex items-center justify-center gap-2
                                transition-all active:scale-[0.98]
                            "
                        >
                            {uploading ? <Loader size={20} className="animate-spin" /> : <Check size={20} />}
                            {uploading ? 'Saving...' : 'Save New Photo'}
                        </button>
                        
                        <button
                            onClick={onClose}
                            disabled={uploading}
                            className="
                                w-full py-4 px-6
                                rounded-xl 
                                bg-slate-100 dark:bg-slate-800 
                                hover:bg-slate-200 dark:hover:bg-slate-700
                                text-slate-600 dark:text-slate-300 font-bold text-sm
                                transition-colors
                            "
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up-mobile {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up-mobile {
          animation: slide-up-mobile 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default ProfileUploader;
