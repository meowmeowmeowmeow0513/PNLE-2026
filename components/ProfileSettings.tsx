
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../AuthContext';
import { useGamification } from '../hooks/useGamification';
import { 
  Camera, X, Loader, Check, User, Mail, Trash2, 
  AlertTriangle, Save, Moon, Sun, Bell, 
  Volume2, Shield, KeyRound, Palette, ChevronRight
} from 'lucide-react';

interface ProfileSettingsProps {
  onClose: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

type SettingsTab = 'profile' | 'appearance' | 'account';

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose, isDark, toggleTheme }) => {
  const { currentUser, updateUserProfile, deleteUserAccount, resetPassword } = useAuth();
  const { rankData, stats } = useGamification();
  const { currentRank } = rankData;

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [photoPreview, setPhotoPreview] = useState<string | null>(currentUser?.photoURL || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setPhotoFile(selectedFile);
      setPhotoPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    setMessage(null);

    try {
      let photoURL = currentUser.photoURL;

      if (photoFile) {
        const fileRef = ref(storage, `profile_photos/${currentUser.uid}`);
        await uploadBytes(fileRef, photoFile);
        photoURL = await getDownloadURL(fileRef);
      }

      await updateUserProfile(displayName, photoURL);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
      if (!currentUser?.email) return;
      setResetLoading(true);
      try {
          await resetPassword(currentUser.email);
          setMessage({ type: 'success', text: 'Password reset email sent!' });
      } catch (error) {
          setMessage({ type: 'error', text: 'Failed to send reset email.' });
      } finally {
          setResetLoading(false);
      }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteUserAccount();
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        setMessage({ type: 'error', text: 'Please log in again to delete your account.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to delete account.' });
      }
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRankGradient = (color: string) => {
      switch(color) {
          case 'amber': return 'from-amber-400 to-orange-500';
          case 'violet': return 'from-violet-400 to-purple-600';
          case 'emerald': return 'from-emerald-400 to-teal-500';
          case 'blue': return 'from-blue-400 to-indigo-500';
          default: return 'from-slate-400 to-slate-600';
      }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative w-full h-full md:h-auto md:max-h-[85vh] md:max-w-2xl bg-white dark:bg-[#0f172a] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row md:border border-slate-200 dark:border-white/5 animate-zoom-in">
        
        {/* --- LEFT SIDEBAR (Desktop) / TOP BAR (Mobile) --- */}
        <div className="w-full md:w-64 bg-slate-50/50 dark:bg-[#0B1121]/50 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5 p-4 md:p-6 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-visible">
            
            {/* Header (Desktop Only) */}
            <div className="hidden md:block mb-6 px-2">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Settings</h2>
                <p className="text-xs text-slate-500 font-medium">Manage your account</p>
            </div>

            {/* Mobile Header (Title + Close) */}
            <div className="md:hidden flex items-center justify-between w-full mb-2">
                 <h2 className="text-lg font-black text-slate-800 dark:text-white">Settings</h2>
                 <button onClick={onClose} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300"><X size={18} /></button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex md:flex-col gap-2 w-full">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold whitespace-nowrap ${activeTab === 'profile' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-white/5'}`}
                >
                    <User size={18} /> Profile
                </button>
                <button 
                    onClick={() => setActiveTab('appearance')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold whitespace-nowrap ${activeTab === 'appearance' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-white/5'}`}
                >
                    <Palette size={18} /> Appearance
                </button>
                <button 
                    onClick={() => setActiveTab('account')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold whitespace-nowrap ${activeTab === 'account' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-white/5'}`}
                >
                    <Shield size={18} /> Account
                </button>
            </div>

            {/* Close Button (Desktop) */}
            <div className="hidden md:block mt-auto">
                <button onClick={onClose} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 transition-all text-sm font-bold">
                    <X size={18} /> Close
                </button>
            </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-white dark:bg-[#0f172a]">
            
            {/* Success/Error Message Toast */}
            {message && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300 w-full max-w-xs px-4">
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border ${
                        message.type === 'success' 
                        ? 'bg-emerald-500 text-white border-emerald-400' 
                        : 'bg-red-500 text-white border-red-400'
                    }`}>
                        {message.type === 'success' ? <Check size={16} strokeWidth={3} /> : <AlertTriangle size={16} strokeWidth={3} />}
                        <span className="text-xs font-bold flex-1">{message.text}</span>
                    </div>
                </div>
            )}

            <div className="p-6 md:p-10 space-y-8 pb-24 md:pb-10">
                
                {/* --- TAB: PROFILE --- */}
                {activeTab === 'profile' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* ID CARD HEADER */}
                        <div className="relative rounded-[2rem] overflow-hidden bg-slate-900 text-white shadow-2xl">
                            {/* Background Pattern */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${getRankGradient(currentRank?.color || 'slate')} opacity-20`}></div>
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>
                            
                            <div className="relative z-10 p-8 flex flex-col items-center">
                                {/* Photo Uploader */}
                                <div className="relative group cursor-pointer mb-4" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-24 h-24 rounded-full border-4 border-white/20 shadow-xl overflow-hidden bg-white/10 backdrop-blur-md relative">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/50"><User size={40} /></div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 right-0 p-2 bg-pink-500 rounded-full text-white shadow-lg border border-white/20 transform group-hover:scale-110 transition-transform">
                                        <Camera size={14} />
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                </div>

                                <h2 className="text-2xl font-black tracking-tight text-center">{displayName || 'Student Nurse'}</h2>
                                <p className="text-white/60 text-sm font-medium mb-6">{currentUser?.email}</p>

                                {/* Rank Stats */}
                                <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">Rank</div>
                                        <div className="text-sm font-black text-white truncate">{currentRank?.title}</div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">Level</div>
                                        <div className="text-sm font-black text-white">{(currentRank?.id || 0) + 1}</div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">XP</div>
                                        <div className="text-sm font-black text-white">{stats?.totalXP || 0}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Edit Form */}
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 pl-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={20} />
                                    <input 
                                        type="text" 
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all"
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 pl-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                                    <input 
                                        type="email" 
                                        value={currentUser?.email || ''}
                                        disabled
                                        className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-500 dark:text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 pl-1 flex items-center gap-1"><KeyRound size={10} /> Email cannot be changed.</p>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save Profile Changes
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* --- TAB: APPEARANCE --- */}
                {activeTab === 'appearance' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Theme Preferences</h3>
                            <p className="text-sm text-slate-500 mb-6">Customize your review environment.</p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => isDark && toggleTheme()}
                                    className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${!isDark ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                >
                                    <div className="w-full h-24 bg-slate-100 rounded-lg border border-slate-200 relative overflow-hidden shadow-inner">
                                        <div className="absolute top-2 left-2 w-16 h-4 bg-white rounded shadow-sm"></div>
                                        <div className="absolute top-8 left-2 w-8 h-8 bg-pink-200 rounded-full"></div>
                                    </div>
                                    <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 text-sm">
                                        <Sun size={16} className={!isDark ? 'text-pink-500' : 'text-slate-400'} /> Light Mode
                                    </div>
                                    {!isDark && <div className="absolute top-3 right-3 text-pink-500"><Check size={18} strokeWidth={3} /></div>}
                                </button>

                                <button 
                                    onClick={() => !isDark && toggleTheme()}
                                    className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${isDark ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                >
                                    <div className="w-full h-24 bg-slate-900 rounded-lg border border-slate-800 relative overflow-hidden shadow-inner">
                                        <div className="absolute top-2 left-2 w-16 h-4 bg-slate-800 rounded"></div>
                                        <div className="absolute top-8 left-2 w-8 h-8 bg-pink-900 rounded-full border border-pink-500/30"></div>
                                    </div>
                                    <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 text-sm">
                                        <Moon size={16} className={isDark ? 'text-pink-500' : 'text-slate-400'} /> Dark Mode
                                    </div>
                                    {isDark && <div className="absolute top-3 right-3 text-pink-500"><Check size={18} strokeWidth={3} /></div>}
                                </button>
                            </div>
                        </div>

                        {/* Mock Notifications */}
                        <div className="opacity-50 pointer-events-none grayscale">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Notifications</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <Bell size={20} className="text-slate-400" />
                                        <div>
                                            <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Daily Reminders</p>
                                            <p className="text-xs text-slate-500">Get notified at 8:00 AM</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-6 bg-slate-200 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div></div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <Volume2 size={20} className="text-slate-400" />
                                        <div>
                                            <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Sound Effects</p>
                                            <p className="text-xs text-slate-500">Play sounds on timer complete</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-6 bg-slate-200 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div></div>
                                </div>
                            </div>
                            <p className="text-center text-xs text-slate-400 mt-2 italic">Notification settings coming soon.</p>
                        </div>
                    </div>
                )}

                {/* --- TAB: ACCOUNT --- */}
                {activeTab === 'account' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Account Security</h3>
                            <p className="text-sm text-slate-500 mb-6">Manage your login and data.</p>

                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                                            <KeyRound size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white text-sm">Password</p>
                                            <p className="text-xs text-slate-500">Change your login password</p>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={handlePasswordReset}
                                    disabled={resetLoading}
                                    className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    {resetLoading ? <Loader size={16} className="animate-spin" /> : <Mail size={16} />}
                                    Send Reset Link to Email
                                </button>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200 dark:border-slate-700/50">
                            <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <AlertTriangle size={16} /> Danger Zone
                            </h3>
                            
                            {!showDeleteConfirm ? (
                                <button 
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl group hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white dark:bg-red-900/30 rounded-lg text-red-500">
                                            <Trash2 size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-red-600 dark:text-red-400 text-sm">Delete Account</p>
                                            <p className="text-xs text-red-400/80">Permanently remove all data</p>
                                        </div>
                                    </div>
                                    <div className="text-red-400 group-hover:translate-x-1 transition-transform"><ChevronRight size={18} /></div>
                                </button>
                            ) : (
                                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-5 animate-in zoom-in-95">
                                    <p className="font-bold text-red-700 dark:text-red-300 text-sm mb-2">Are you absolutely sure?</p>
                                    <p className="text-xs text-red-600/80 dark:text-red-400/80 mb-4 leading-relaxed">
                                        This action cannot be undone. This will permanently delete your account, streaks, XP, and notes.
                                    </p>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={handleDeleteAccount}
                                            disabled={deleteLoading}
                                            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {deleteLoading ? <Loader size={16} className="animate-spin" /> : 'Yes, Delete Everything'}
                                        </button>
                                        <button 
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="flex-1 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProfileSettings;
