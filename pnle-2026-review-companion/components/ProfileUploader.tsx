import React, { useState, useRef } from 'react';
import { storage, auth } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { Camera, X, Loader, Check } from 'lucide-react';

interface ProfileUploaderProps {
  onClose: () => void;
  onUploadSuccess: () => void;
}

const ProfileUploader: React.FC<ProfileUploaderProps> = ({ onClose, onUploadSuccess }) => {
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

      await updateProfile(auth.currentUser, { photoURL });
      
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-fade-in border border-slate-100 dark:border-slate-700">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Update Profile Photo</h3>

        <div className="flex flex-col items-center gap-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-32 rounded-full border-4 border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-pink-400 dark:hover:border-pink-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all relative overflow-hidden group"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-slate-400 flex flex-col items-center gap-2">
                <Camera size={32} />
                <span className="text-xs font-medium">Click to upload</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Camera size={24} className="text-white" />
            </div>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />

          <div className="flex gap-3 w-full">
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {uploading ? <Loader size={18} className="animate-spin" /> : <Check size={18} />}
              {uploading ? 'Saving...' : 'Save Photo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileUploader;