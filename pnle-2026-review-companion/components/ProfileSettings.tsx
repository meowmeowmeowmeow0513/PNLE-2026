
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../AuthContext';
import { useGamification } from '../hooks/useGamification';
import { useTheme } from '../ThemeContext';
import { 
  Camera, X, Loader, Check, User, Mail, Trash2, 
  AlertTriangle, Save, Moon, Sun, Sparkles, 
  Shield, KeyRound, Palette, ChevronRight,
  RefreshCw, Crown, Type, Eye, Move
} from 'lucide-react';

interface ProfileSettingsProps {
  onClose: () => void;
  isDark?: boolean;
  toggleTheme?: () => void;
}

type SettingsTab = 'profile' | 'appearance' | 'account';

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose }) => {
  const { currentUser, updateUserProfile, deleteUserAccount, resetPassword } = useAuth();
  const { rankData, stats } = useGamification();
  const { 
      themeMode, setThemeMode, accentColor, setAccentColor, resetTheme,
      fontSize, setFontSize, fontFamily, setFontFamily, reduceMotion, setReduceMotion
  } = useTheme();
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

  const presetColors = [
      '#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4',
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6 animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative w-full h-full md:h-auto md:max-h-[85vh] md:max-w-4xl bg-white dark:bg-[#0f172a] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row md:border border-slate-200 dark:border-white/5 animate-zoom-in">
        
        {/* --- MOBILE HEADER --- */}
        <div className="md:hidden flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] shrink-0 z-20">
             <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h2>
             <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 transition-colors">
                <X size={20} />
             </button>
        </div>

        {/* --- SIDEBAR / NAVIGATION --- */}
        <div className="w-full md:w-72 bg-slate-50/80 dark:bg-[#0B1121]/80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5 p-2 md:p-6 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto no-scrollbar backdrop-blur-md z-10 md:static">
            
            {/* Desktop Header */}
            <div className="hidden md:block mb-6 px-2">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Settings</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Manage your account preferences</p>
            </div>

            {/* Navigation Buttons (Responsive: Horizontal on Mobile, Vertical on Desktop) */}
            <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 px-4 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl transition-all text-xs md:text-sm font-bold whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'profile' 
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20 ring-1 ring-pink-400' 
                    : 'text-slate-500 hover:bg-white dark:hover:bg-white/5 hover:text-slate-700 dark:text-slate-400'
                }`}
            >
                <User size={18} /> Profile
            </button>
            <button 
                onClick={() => setActiveTab('appearance')}
                className={`flex items-center gap-3 px-4 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl transition-all text-xs md:text-sm font-bold whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'appearance' 
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20 ring-1 ring-pink-400' 
                    : 'text-slate-500 hover:bg-white dark:hover:bg-white/5 hover:text-slate-700 dark:text-slate-400'
                }`}
            >
                <Palette size={18} /> Appearance
            </button>
            <button 
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-3 px-4 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl transition-all text-xs md:text-sm font-bold whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'account' 
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20 ring-1 ring-pink-400' 
                    : 'text-slate-500 hover:bg-white dark:hover:bg-white/5 hover:text-slate-700 dark:text-slate-400'
                }`}
            >
                <Shield size={18} /> Account
            </button>

            {/* Desktop Close Button */}
            <div className="hidden md:block mt-auto pt-4 border-t border-slate-200 dark:border-white/5">
                <button onClick={onClose} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 transition-all text-sm font-bold">
                    <X size={18} /> Close Panel
                </button>
            </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-white dark:bg-[#0f172a] h-full">
            
            {message && (
                <div className="absolute top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto z-50 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${
                        message.type === 'success' 
                        ? 'bg-emerald-500 text-white border-emerald-400' 
                        : 'bg-red-500 text-white border-red-400'
                    }`}>
                        {message.type === 'success' ? <Check size={18} strokeWidth={3} /> : <AlertTriangle size={18} strokeWidth={3} />}
                        <span className="text-sm font-bold">{message.text}</span>
                    </div>
                </div>
            )}

            <div className="p-5 md:p-10 space-y-8 pb-32 md:pb-10">
                
                {/* --- TAB: PROFILE --- */}
                {activeTab === 'profile' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="relative rounded-3xl md:rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors duration-300 group">
                            <div className={`absolute inset-0 bg-gradient-to-br ${getRankGradient(currentRank?.color || 'slate')} opacity-5 dark:opacity-20 transition-opacity`}></div>
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 dark:opacity-30 mix-blend-overlay pointer-events-none"></div>
                            
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-[80px] pointer-events-none -mr-16 -mt-16 mix-blend-overlay"></div>

                            <div className="relative z-10 p-6 md:p-8 flex flex-col items-center">
                                <div className="relative group cursor-pointer mb-4" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-[6px] border-white dark:border-slate-800 shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative ring-1 ring-slate-200 dark:ring-slate-700">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600"><User size={40} /></div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-1 right-1 p-2 bg-pink-500 rounded-full text-white shadow-lg border-2 border-white dark:border-slate-900 transform group-hover:scale-110 transition-transform">
                                        <Camera size={14} />
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                </div>

                                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-center text-slate-900 dark:text-white mb-1">
                                    {displayName || 'Student Nurse'}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-bold mb-6 md:mb-8 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                    {currentUser?.email}
                                </p>

                                <div className="grid grid-cols-3 gap-2 md:gap-3 w-full max-w-sm">
                                    <div className="bg-slate-50 dark:bg-white/5 backdrop-blur-md rounded-2xl p-2 md:p-3 text-center border border-slate-200 dark:border-white/10 shadow-sm">
                                        <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Rank</div>
                                        <div className="text-xs md:text-sm font-black text-slate-800 dark:text-white truncate">{currentRank?.title}</div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-white/5 backdrop-blur-md rounded-2xl p-2 md:p-3 text-center border border-slate-200 dark:border-white/10 shadow-sm">
                                        <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Level</div>
                                        <div className="text-xs md:text-sm font-black text-slate-800 dark:text-white">{(currentRank?.id || 0) + 1}</div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-white/5 backdrop-blur-md rounded-2xl p-2 md:p-3 text-center border border-slate-200 dark:border-white/10 shadow-sm">
                                        <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">XP</div>
                                        <div className="text-xs md:text-sm font-black text-slate-800 dark:text-white">{stats?.totalXP || 0}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSaveProfile} className="space-y-6 px-1">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 pl-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={20} />
                                    <input 
                                        type="text" 
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all text-sm md:text-base"
                                        placeholder="Enter your name"
                                    />
                                </div>
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
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Display Mode */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">Display Mode</h3>
                                <button onClick={resetTheme} className="text-xs font-bold text-pink-500 hover:text-pink-600 flex items-center gap-1 bg-pink-50 dark:bg-pink-500/10 px-3 py-1 rounded-full"><RefreshCw size={12}/> Reset</button>
                            </div>
                            <p className="text-sm text-slate-500 mb-6">Choose your environment.</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {['light', 'dark', 'crescere'].map((mode) => (
                                    <button 
                                        key={mode}
                                        onClick={() => setThemeMode(mode as any)}
                                        className={`relative p-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group overflow-hidden ${
                                            themeMode === mode
                                            ? mode === 'crescere' ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-500/20' : 'border-pink-500 bg-pink-50/50 dark:bg-pink-900/10 ring-2 ring-pink-500/20' 
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                    >
                                        <div className={`w-full aspect-video rounded-xl border flex items-center justify-center relative shadow-sm overflow-hidden ${
                                            mode === 'light' ? 'bg-white border-slate-200' : 
                                            mode === 'dark' ? 'bg-slate-900 border-slate-700' :
                                            'bg-[#fff1f2] border-rose-100'
                                        }`}>
                                            {mode === 'light' && <Sun size={24} className="text-amber-500" />}
                                            {mode === 'dark' && <Moon size={24} className="text-slate-400" />}
                                            {mode === 'crescere' && <Crown size={24} className="text-rose-500" />}
                                        </div>
                                        <div className="font-bold text-slate-700 dark:text-slate-300 text-sm pb-1 capitalize">{mode}</div>
                                        {themeMode === mode && <div className="absolute top-2 right-2 text-pink-500 bg-white rounded-full p-0.5 shadow-sm"><Check size={12} strokeWidth={4} /></div>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Reading Experience (Accessibility) */}
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                                <Eye size={20} className="text-slate-400" /> Reading Comfort
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">Customize text legibility and motion.</p>

                            <div className="space-y-6">
                                {/* Font Size */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Text Size</label>
                                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                        {['small', 'normal', 'large', 'extra-large'].map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setFontSize(size as any)}
                                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                                    fontSize === size 
                                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' 
                                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                                }`}
                                            >
                                                {size === 'small' ? 'Ag' : size === 'normal' ? 'Ag' : size === 'large' ? 'Ag' : 'Ag'}
                                                <span className="block text-[9px] mt-0.5 opacity-60 uppercase">{size === 'extra-large' ? 'XL' : size}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Font Family */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Font Style</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button 
                                            onClick={() => setFontFamily('sans')}
                                            className={`p-3 rounded-xl border text-sm font-sans transition-all ${
                                                fontFamily === 'sans' 
                                                ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 ring-1 ring-pink-500' 
                                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                            }`}
                                        >
                                            <span className="block font-bold mb-1">Sans</span>
                                            <span className="text-xs opacity-70">Modern</span>
                                        </button>
                                        <button 
                                            onClick={() => setFontFamily('serif')}
                                            className={`p-3 rounded-xl border text-sm font-serif transition-all ${
                                                fontFamily === 'serif' 
                                                ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 ring-1 ring-pink-500' 
                                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                            }`}
                                        >
                                            <span className="block font-bold mb-1">Serif</span>
                                            <span className="text-xs opacity-70">Classic</span>
                                        </button>
                                        <button 
                                            onClick={() => setFontFamily('mono')}
                                            className={`p-3 rounded-xl border text-sm font-mono transition-all ${
                                                fontFamily === 'mono' 
                                                ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 ring-1 ring-pink-500' 
                                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                            }`}
                                        >
                                            <span className="block font-bold mb-1">Mono</span>
                                            <span className="text-xs opacity-70">Code</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Reduced Motion */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                                            <Move size={20} />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-slate-900 dark:text-white text-sm">Reduce Motion</span>
                                            <span className="text-xs text-slate-500">Disable animations</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setReduceMotion(!reduceMotion)}
                                        className={`w-12 h-7 rounded-full transition-colors relative ${reduceMotion ? 'bg-pink-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${reduceMotion ? 'left-6' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Theme Color */}
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-1">Theme Color</h3>
                            <p className="text-sm text-slate-500 mb-6">Choose your primary accent color.</p>

                            <div className="space-y-6">
                                <div className="flex flex-wrap gap-4 justify-start">
                                    {presetColors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setAccentColor(color)}
                                            className={`w-10 h-10 md:w-12 md:h-12 rounded-full transition-all flex items-center justify-center shadow-sm hover:scale-110 ${
                                                accentColor.toLowerCase() === color.toLowerCase() 
                                                ? 'ring-4 ring-offset-2 ring-slate-200 dark:ring-slate-700 dark:ring-offset-slate-900 scale-110' 
                                                : 'ring-1 ring-black/5 dark:ring-white/10'
                                            }`}
                                            style={{ backgroundColor: color }}
                                        >
                                            {accentColor.toLowerCase() === color.toLowerCase() && (
                                                <Check size={20} className="text-white drop-shadow-md" strokeWidth={3} />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative group">
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                                        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg flex-shrink-0 ring-2 ring-slate-100 dark:ring-slate-800">
                                            <div className="absolute inset-0" style={{ backgroundColor: accentColor }}></div>
                                            <input 
                                                type="color" 
                                                value={accentColor}
                                                onChange={(e) => setAccentColor(e.target.value)}
                                                className="absolute inset-0 w-[200%] h-[200%] p-0 -top-1/2 -left-1/2 cursor-pointer opacity-0"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-sm font-bold text-slate-900 dark:text-white block mb-1">Custom Hex</label>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-500 uppercase">
                                                    {accentColor}
                                                </span>
                                                <span className="text-[10px] text-slate-400">Tap circle to edit</span>
                                            </div>
                                        </div>
                                        <Palette size={20} className="text-slate-300" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: ACCOUNT --- */}
                {activeTab === 'account' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-1">Account Security</h3>
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
