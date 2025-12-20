
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../AuthContext';
import { useGamification } from '../hooks/useGamification';
import { useTheme } from '../ThemeContext';
import {
    Camera, X, Loader, Check, User, Mail, Trash2,
    AlertTriangle, Save, Moon, Sun,
    Shield, KeyRound, Palette, ChevronRight,
    RefreshCw, Crown, Move, Eye, Bell, PlayCircle
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
    
    // Notification State
    const [pushEnabled, setPushEnabled] = useState(false);

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Check Notification Permission on Mount
    useEffect(() => {
        if ('Notification' in window) {
            setPushEnabled(Notification.permission === 'granted');
        }
    }, []);

    // lock body scroll
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev || 'unset'; };
    }, []);

    // optional: ESC closes modal
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

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

    const toggleNotifications = async () => {
        if (!('Notification' in window)) {
            setMessage({ type: 'error', text: 'Notifications not supported on this device.' });
            return;
        }

        if (pushEnabled) {
            setPushEnabled(false);
        } else {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setPushEnabled(true);
                new Notification("System Online", {
                    body: "Notifications are now active for Crecere.",
                    icon: "/vite.svg"
                });
            } else {
                setMessage({ type: 'error', text: 'Permission denied. Check browser settings.' });
            }
        }
    };

    const handleResetIntro = () => {
        // Clears the flag for the new v4 intro
        localStorage.removeItem('has_seen_ascension_v4');
        setMessage({ type: 'success', text: 'Intro reset. Visit Personal Folder to view.' });
    };

    const getRankGradient = (color: string) => {
        switch (color) {
            case 'amber': return 'from-amber-400 to-orange-500';
            case 'violet': return 'from-violet-400 to-purple-600';
            case 'emerald': return 'from-emerald-400 to-teal-500';
            case 'blue': return 'from-blue-400 to-indigo-500';
            default: return 'from-slate-400 to-slate-600';
        }
    };

    const presetColors = ['#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

    const isLargeText = fontSize === 'large' || fontSize === 'extra-large';
    const adaptiveGridClass = isLargeText ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3';

    return createPortal(
        <div className="fixed inset-0 z-[9999] grid place-items-center p-0 sm:p-4 md:p-6 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                className="
                  relative z-10
                  w-full
                  h-[100dvh] sm:h-auto
                  max-h-[92dvh]
                  sm:w-[min(96vw,theme(maxWidth.5xl))]
                  bg-white dark:bg-[#0f172a]
                  sm:rounded-[2rem]
                  shadow-2xl
                  overflow-hidden
                  border border-slate-200 dark:border-white/5
                  flex flex-col
                  animate-zoom-in
                "
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Profile Settings"
            >
                {/* Sticky Mobile Header */}
                <div className="sm:hidden landscape:hidden sticky top-0 z-30 flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] shrink-0">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Settings</h2>
                    <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 min-h-0 flex flex-col md:flex-row landscape:flex-row overflow-hidden">
                    {/* Nav */}
                    <div className="
                      w-full md:w-72 landscape:w-64
                      shrink-0
                      bg-slate-50/80 dark:bg-[#0B1121]/80
                      border-b md:border-b-0 md:border-r landscape:border-b-0 landscape:border-r border-slate-200 dark:border-white/5
                      backdrop-blur-md
                      px-2 py-2 md:p-6 landscape:p-4
                    ">
                        {/* Desktop Header */}
                        <div className="hidden md:block landscape:block mb-6 px-2">
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Settings</h2>
                            <p className="text-xs text-slate-500 font-medium mt-1">Manage your account preferences</p>
                        </div>

                        <div className="flex md:flex-col landscape:flex-col gap-2 overflow-x-auto md:overflow-visible landscape:overflow-visible no-scrollbar pb-2 md:pb-0 landscape:pb-0">
                            <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-4 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl transition-all text-xs md:text-sm font-bold whitespace-nowrap flex-shrink-0 ${activeTab === 'profile' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20 ring-1 ring-pink-400' : 'text-slate-500 hover:bg-white dark:hover:bg-white/5 hover:text-slate-700 dark:text-slate-400'}`}>
                                <User size={18} /> Profile
                            </button>
                            <button onClick={() => setActiveTab('appearance')} className={`flex items-center gap-3 px-4 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl transition-all text-xs md:text-sm font-bold whitespace-nowrap flex-shrink-0 ${activeTab === 'appearance' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20 ring-1 ring-pink-400' : 'text-slate-500 hover:bg-white dark:hover:bg-white/5 hover:text-slate-700 dark:text-slate-400'}`}>
                                <Palette size={18} /> Appearance
                            </button>
                            <button onClick={() => setActiveTab('account')} className={`flex items-center gap-3 px-4 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl transition-all text-xs md:text-sm font-bold whitespace-nowrap flex-shrink-0 ${activeTab === 'account' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20 ring-1 ring-pink-400' : 'text-slate-500 hover:bg-white dark:hover:bg-white/5 hover:text-slate-700 dark:text-slate-400'}`}>
                                <Shield size={18} /> Account
                            </button>
                        </div>

                        <div className="hidden md:block landscape:block mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
                            <button onClick={onClose} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 transition-all text-sm font-bold">
                                <X size={18} /> Close Panel
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0 min-h-0 relative bg-white dark:bg-[#0f172a] overflow-hidden flex flex-col">
                        {message && (
                            <div className="pointer-events-none absolute top-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto z-50">
                                <div className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${message.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-red-500 text-white border-red-400'}`}>
                                    {message.type === 'success' ? <Check size={18} strokeWidth={3} /> : <AlertTriangle size={18} strokeWidth={3} />}
                                    <span className="text-sm font-bold">{message.text}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-5 sm:p-8 md:p-10 space-y-8 pb-28 md:pb-10">
                                {/* PROFILE TAB */}
                                {activeTab === 'profile' && (
                                    <div className="space-y-8">
                                        <div className="relative rounded-3xl md:rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors duration-300 group">
                                            <div className={`absolute inset-0 bg-gradient-to-br ${getRankGradient(currentRank?.color || 'slate')} opacity-5 dark:opacity-20`} />
                                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 dark:opacity-30 mix-blend-overlay pointer-events-none" />
                                            <div className="relative z-10 p-6 sm:p-7 md:p-8 flex flex-col items-center">
                                                <div className="relative group cursor-pointer mb-4" onClick={() => fileInputRef.current?.click()}>
                                                    <div className="w-24 h-24 sm:w-26 sm:h-26 md:w-28 md:h-28 rounded-full border-[6px] border-white dark:border-slate-800 shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative ring-1 ring-slate-200 dark:ring-slate-700">
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
                                                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-bold mb-6 md:mb-8 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 max-w-full truncate">
                                                    {currentUser?.email}
                                                </p>
                                                <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-sm">
                                                    <div className="bg-slate-50 dark:bg-white/5 backdrop-blur-md rounded-2xl p-2 md:p-3 text-center border border-slate-200 dark:border-white/10 shadow-sm">
                                                        <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Rank</div>
                                                        <div className="text-xs md:text-sm font-black text-slate-800 dark:text-white leading-snug break-words whitespace-normal">{currentRank?.title}</div>
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
                                                    <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={25} className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all text-sm md:text-base" placeholder="Enter your name" />
                                                    <div className="absolute right-4 top-3.5 text-[10px] font-bold text-slate-400">{displayName.length}/25</div>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <button type="submit" disabled={loading} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                                                    {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                                                    Save Profile Changes
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* APPEARANCE TAB */}
                                {activeTab === 'appearance' && (
                                    <div className="space-y-10">
                                        <div>
                                            <div className="flex items-start sm:items-center justify-between gap-3 mb-2 flex-col sm:flex-row">
                                                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">Display Mode</h3>
                                                <button onClick={resetTheme} className="text-xs font-bold text-pink-500 hover:text-pink-600 flex items-center gap-1 bg-pink-50 dark:bg-pink-500/10 px-3 py-1 rounded-full"><RefreshCw size={12} /> Reset</button>
                                            </div>
                                            <p className="text-sm text-slate-500 mb-6">Choose your environment.</p>
                                            <div className={`grid gap-4 ${adaptiveGridClass}`}>
                                                {['light', 'dark', 'crescere'].map((mode) => (
                                                    <button key={mode} onClick={() => setThemeMode(mode as any)} className={`relative p-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group overflow-hidden ${themeMode === mode ? mode === 'crescere' ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-500/20' : 'border-pink-500 bg-pink-50/50 dark:bg-pink-900/10 ring-2 ring-pink-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                                        <div className={`w-full rounded-xl border flex items-center justify-center relative shadow-sm overflow-hidden ${isLargeText ? 'h-20' : 'aspect-video'} ${mode === 'light' ? 'bg-white border-slate-200' : mode === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-[#fff1f2] border-rose-100'}`}>
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

                                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2"><Eye size={20} className="text-slate-400" /> Reading Comfort</h3>
                                            <p className="text-sm text-slate-500 mb-6">Customize text legibility and motion.</p>
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Text Size</label>
                                                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto no-scrollbar">
                                                        {['small', 'normal', 'large', 'extra-large'].map((size) => (
                                                            <button key={size} onClick={() => setFontSize(size as any)} className={`min-w-[88px] sm:min-w-0 flex-1 py-2 rounded-lg text-xs font-bold transition-all ${fontSize === size ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Ag <span className="block text-[9px] mt-0.5 opacity-60 uppercase">{size === 'extra-large' ? 'XL' : size}</span></button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Font Style</label>
                                                    <div className={`grid gap-3 ${adaptiveGridClass}`}>
                                                        <button onClick={() => setFontFamily('sans')} className={`p-3 rounded-xl border text-sm font-sans transition-all ${fontFamily === 'sans' ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 ring-1 ring-pink-500' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}><span className="block font-bold mb-1">Sans</span><span className="text-xs opacity-70">Modern</span></button>
                                                        <button onClick={() => setFontFamily('serif')} className={`p-3 rounded-xl border text-sm font-serif transition-all ${fontFamily === 'serif' ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 ring-1 ring-pink-500' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}><span className="block font-bold mb-1">Serif</span><span className="text-xs opacity-70">Classic</span></button>
                                                        <button onClick={() => setFontFamily('mono')} className={`p-3 rounded-xl border text-sm font-mono transition-all ${fontFamily === 'mono' ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 ring-1 ring-pink-500' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}><span className="block font-bold mb-1">Mono</span><span className="text-xs opacity-70">Code</span></button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"><Move size={20} /></div>
                                                        <div className="min-w-0"><span className="block font-bold text-slate-900 dark:text-white text-sm">Reduce Motion</span><span className="text-xs text-slate-500">Disable animations</span></div>
                                                    </div>
                                                    <button onClick={() => setReduceMotion(!reduceMotion)} className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${reduceMotion ? 'bg-pink-500' : 'bg-slate-300 dark:bg-slate-600'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${reduceMotion ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-1">Theme Color</h3>
                                            <p className="text-sm text-slate-500 mb-6">Choose your primary accent color.</p>
                                            <div className="space-y-6">
                                                <div className="flex flex-wrap gap-4 justify-start">
                                                    {presetColors.map((color) => (
                                                        <button key={color} onClick={() => setAccentColor(color)} className={`w-10 h-10 md:w-12 md:h-12 rounded-full transition-all flex items-center justify-center shadow-sm hover:scale-110 ${accentColor.toLowerCase() === color.toLowerCase() ? 'ring-4 ring-offset-2 ring-slate-200 dark:ring-slate-700 dark:ring-offset-slate-900 scale-110' : 'ring-1 ring-black/5 dark:ring-white/10'}`} style={{ backgroundColor: color }}>
                                                            {accentColor.toLowerCase() === color.toLowerCase() && <Check size={20} className="text-white drop-shadow-md" strokeWidth={3} />}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="relative group">
                                                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                                                        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg flex-shrink-0 ring-2 ring-slate-100 dark:ring-slate-800">
                                                            <div className="absolute inset-0" style={{ backgroundColor: accentColor }} />
                                                            <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="absolute inset-0 w-[200%] h-[200%] p-0 -top-1/2 -left-1/2 cursor-pointer opacity-0" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <label className="text-sm font-bold text-slate-900 dark:text-white block mb-1">Custom Hex</label>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-mono text-xs bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-500 uppercase">{accentColor}</span>
                                                                <span className="text-[10px] text-slate-400">Tap circle to edit</span>
                                                            </div>
                                                        </div>
                                                        <Palette size={20} className="text-slate-300 shrink-0" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ACCOUNT TAB */}
                                {activeTab === 'account' && (
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-1">Account Security</h3>
                                            <p className="text-sm text-slate-500 mb-6">Manage your login and data.</p>
                                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4">
                                                <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl"><KeyRound size={20} /></div>
                                                        <div><p className="font-bold text-slate-800 dark:text-white text-sm">Password</p><p className="text-xs text-slate-500">Change your login password</p></div>
                                                    </div>
                                                </div>
                                                <button onClick={handlePasswordReset} disabled={resetLoading} className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                                                    {resetLoading ? <Loader size={16} className="animate-spin" /> : <Mail size={16} />} Send Reset Link to Email
                                                </button>
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm mt-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl"><Bell size={20} /></div>
                                                        <div><p className="font-bold text-slate-800 dark:text-white text-sm">Push Notifications</p><p className="text-xs text-slate-500">Alerts for streaks & study reminders</p></div>
                                                    </div>
                                                    <button onClick={toggleNotifications} className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${pushEnabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${pushEnabled ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-6 border-t border-slate-200 dark:border-slate-700/50">
                                            <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2"><AlertTriangle size={16} /> Danger Zone</h3>
                                            {!showDeleteConfirm ? (
                                                <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-between gap-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl group hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                                                    <div className="flex items-center gap-3 min-w-0"><div className="p-2 bg-white dark:bg-red-900/30 rounded-lg text-red-500"><Trash2 size={20} /></div><div className="text-left min-w-0"><p className="font-bold text-red-600 dark:text-red-400 text-sm">Delete Account</p><p className="text-xs text-red-400/80 truncate">Permanently remove all data</p></div></div>
                                                    <div className="text-red-400 group-hover:translate-x-1 transition-transform shrink-0"><ChevronRight size={18} /></div>
                                                </button>
                                            ) : (
                                                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-5">
                                                    <p className="font-bold text-red-700 dark:text-red-300 text-sm mb-2">Are you absolutely sure?</p>
                                                    <p className="text-xs text-red-600/80 dark:text-red-400/80 mb-4 leading-relaxed">This action cannot be undone. This will permanently delete your account, streaks, XP, and notes.</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <button onClick={handleDeleteAccount} disabled={deleteLoading} className="py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2">{deleteLoading ? <Loader size={16} className="animate-spin" /> : 'Yes, Delete Everything'}</button>
                                                        <button onClick={() => setShowDeleteConfirm(false)} className="py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-[#0f172a] to-transparent" />
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProfileSettings;
