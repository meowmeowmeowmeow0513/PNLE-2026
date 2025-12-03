import React, { useState, useRef, useEffect } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../AuthContext';
import { Camera, X, Loader, Check, User, Mail, Trash2, AlertTriangle, Save } from 'lucide-react';

interface ProfileSettingsProps {
  onClose: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose }) => {
  const { currentUser, updateUserProfile, deleteUserAccount } = useAuth();
  
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [photoPreview, setPhotoPreview] = useState<string | null>(currentUser?.photoURL || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setPhotoFile(selectedFile);
      setPhotoPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    setMessage(null);

    try {
      let photoURL = currentUser.photoURL;

      // 1. Upload new photo if selected
      if (photoFile) {
        const fileRef = ref(storage, `profile_photos/${currentUser.uid}`);
        await uploadBytes(fileRef, photoFile);
        photoURL = await getDownloadURL(fileRef);
      }

      // 2. Update Profile via Context (Updates Auth & Firestore)
      await updateUserProfile(displayName, photoURL);

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Close after short delay on success
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteUserAccount();
      // App.tsx will handle the redirect to login since currentUser becomes null
    } catch (error: any) {
      console.error("Delete Error", error);
      if (error.code === 'auth/requires-recent-login') {
        setMessage({ type: 'error', text: 'Security: Please Log In again before deleting your account.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to delete account.' });
      }
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Profile Settings</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8">
            {/* Status Message */}
            {message && (
                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                    message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                    {message.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
                    {message.text}
                </div>
            )}

            {/* Photo Section */}
            <div className="flex flex-col items-center gap-4">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-28 h-28 rounded-full border-4 border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center cursor-pointer hover:border-pink-400 dark:hover:border-pink-500 relative overflow-hidden group transition-all"
                >
                    {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-slate-300 dark:text-slate-600">
                            <User size={48} />
                        </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={24} className="text-white" />
                    </div>
                </div>
                <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm font-medium text-pink-500 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                >
                    Change Profile Photo
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                />
            </div>

            {/* Form Fields */}
            <form id="profile-form" onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <User size={16} className="text-slate-400" />
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                    />
                </div>

                <div className="space-y-1.5 opacity-70">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Mail size={16} className="text-slate-400" />
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={currentUser?.email || ''}
                        disabled
                        className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400 pl-1">Email cannot be changed.</p>
                </div>
            </form>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-500" />
                    Danger Zone
                </h4>
                
                {!showDeleteConfirm ? (
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 w-full"
                    >
                        <Trash2 size={16} />
                        Delete Account
                    </button>
                ) : (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50">
                        <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                            Are you sure? This will permanently delete your account, progress, and data. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading}
                                className="flex-1 py-2 px-3 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                            >
                                {deleteLoading ? 'Deleting...' : 'Yes, Delete Account'}
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleteLoading}
                                className="flex-1 py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleSave}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
                {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                {loading ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;