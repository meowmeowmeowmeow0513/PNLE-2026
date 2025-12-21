
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Video, FileText, Layers, Folder, Plus, Search, Star, Book, Sparkles, ArrowRight, Globe, X, Link as LinkIcon, Send, Check, Loader2, AlertCircle, Library, PlayCircle, GraduationCap, LayoutGrid, Lock, KeyRound } from 'lucide-react';
import { ResourceLink } from '../types';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';

// Extended interface for internal use
interface EnhancedResource extends ResourceLink {
  tags: string[];
  featured?: boolean;
  color: string;
}

interface ResourcesProps {
    isSidebarExpanded?: boolean;
}

const Resources: React.FC<ResourcesProps> = ({ isSidebarExpanded = true }) => {
  const { currentUser } = useAuth();
  const { themeMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isWebsitesModalOpen, setIsWebsitesModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Request Form State
  const [requestForm, setRequestForm] = useState({ title: '', url: '', type: 'Website' });
  const [requestStatus, setRequestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Password State
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const isCrescere = themeMode === 'crescere';
  
  // Protected Link Data
  const DRIVE_URL = 'https://drive.google.com/drive/folders/1pRgtdnEXRKk5eA8YLTp8wohQRIRVUxZ9?usp=sharing';
  const ACCESS_PASSWORD = 'TATAKUERMCRESCERE';

  const resources: EnhancedResource[] = [
    {
      id: '1',
      title: 'Google Drive Repository',
      description: 'The master vault. Access previous batch reviewers, PDFs, transes, and shared class folders.',
      url: '#protected-drive', // Changed to trigger modal
      iconName: 'drive',
      tags: ['ESSENTIAL', 'ARCHIVE'],
      featured: true,
      color: 'blue'
    },
    {
      id: '2',
      title: 'Video Lectures',
      description: 'High-yield lectures and rationalization videos on YouTube.',
      url: 'https://youtube.com',
      iconName: 'video',
      tags: ['VISUAL', 'LECTURES'],
      color: 'red'
    },
    {
      id: '3',
      title: 'Nurseslabs',
      description: 'Nursing care plans, practice quizzes, and study guides.',
      url: 'https://nurseslabs.com',
      iconName: 'file',
      tags: ['CARE PLANS', 'QUIZ'],
      color: 'emerald'
    },
    {
      id: '4',
      title: 'RNPedia',
      description: 'Comprehensive nursing notes, drug studies, and practice exams.',
      url: 'https://rnpedia.com',
      iconName: 'book',
      tags: ['NOTES', 'DRUGS', 'EXAMS'],
      color: 'orange'
    },
    {
      id: '5',
      title: 'AnkiWeb Decks',
      description: 'Shared flashcard decks for spaced repetition review.',
      url: 'https://ankiweb.net',
      iconName: 'layers',
      tags: ['FLASHCARDS', 'RECALL'],
      color: 'violet'
    },
    {
      id: '6',
      title: 'Verified Portals',
      description: 'Credible sources: Simple Nursing, RegisteredNurseRN, and more.',
      url: '#websites', // Trigger for modal
      iconName: 'globe',
      tags: ['PORTAL', 'EXTERNAL'],
      color: 'cyan'
    }
  ];

  const trustedWebsites = [
    { name: 'Simple Nursing PH', url: 'https://simplenursing.ph/', desc: 'Visual learning simplified for Filipino students.' },
    { name: 'RegisteredNurseRN', url: 'https://www.registerednursern.com/', desc: 'Lectures, skills videos, and NCLEX practice quizzes.' },
    { name: 'Level Up RN', url: 'https://www.leveluprn.com/', desc: 'Flashcards and concise review videos.' },
    { name: 'Khan Academy Medicine', url: 'https://www.khanacademy.org/science/health-and-medicine', desc: 'In-depth physiology and pathophysiology.' }
  ];

  const getIcon = (name: string, className?: string) => {
    switch (name) {
      case 'drive': return <Folder className={className} />;
      case 'video': return <PlayCircle className={className} />;
      case 'file': return <LayoutGrid className={className} />;
      case 'book': return <Book className={className} />;
      case 'layers': return <Layers className={className} />;
      case 'globe': return <Globe className={className} />;
      default: return <ExternalLink className={className} />;
    }
  };

  // --- NEW: ADVANCED THEME ENGINE ---
  const getResourceVisuals = (color: string) => {
      if (isCrescere) {
          switch(color) {
              case 'red': return {
                  bg: 'bg-gradient-to-br from-white to-rose-50 border-rose-200 shadow-sm',
                  iconBg: 'bg-rose-500 text-white shadow-rose-500/30',
                  text: 'text-slate-900',
                  subtext: 'text-slate-500',
                  hoverBorder: 'hover:border-rose-400',
                  blob: 'bg-rose-500/10'
              };
              case 'emerald': return {
                  bg: 'bg-gradient-to-br from-white to-emerald-50 border-emerald-200 shadow-sm',
                  iconBg: 'bg-emerald-500 text-white shadow-emerald-500/30',
                  text: 'text-slate-900',
                  subtext: 'text-slate-500',
                  hoverBorder: 'hover:border-emerald-400',
                  blob: 'bg-emerald-500/10'
              };
              case 'orange': return {
                  bg: 'bg-gradient-to-br from-white to-amber-50 border-amber-200 shadow-sm',
                  iconBg: 'bg-amber-500 text-white shadow-amber-500/30',
                  text: 'text-slate-900',
                  subtext: 'text-slate-500',
                  hoverBorder: 'hover:border-amber-400',
                  blob: 'bg-amber-500/10'
              };
              case 'blue': return {
                  bg: 'bg-gradient-to-br from-white to-blue-50 border-blue-200 shadow-sm',
                  iconBg: 'bg-blue-500 text-white shadow-blue-500/30',
                  text: 'text-slate-900',
                  subtext: 'text-slate-500',
                  hoverBorder: 'hover:border-blue-400',
                  blob: 'bg-blue-500/10'
              };
              case 'violet': return {
                  bg: 'bg-gradient-to-br from-white to-violet-50 border-violet-200 shadow-sm',
                  iconBg: 'bg-violet-500 text-white shadow-violet-500/30',
                  text: 'text-slate-900',
                  subtext: 'text-slate-500',
                  hoverBorder: 'hover:border-violet-400',
                  blob: 'bg-violet-500/10'
              };
              case 'cyan': return {
                  bg: 'bg-gradient-to-br from-white to-cyan-50 border-cyan-200 shadow-sm',
                  iconBg: 'bg-cyan-500 text-white shadow-cyan-500/30',
                  text: 'text-slate-900',
                  subtext: 'text-slate-500',
                  hoverBorder: 'hover:border-cyan-400',
                  blob: 'bg-cyan-500/10'
              };
              default: return {
                  bg: 'bg-white/80 border-slate-200 shadow-sm',
                  iconBg: 'bg-slate-500 text-white',
                  text: 'text-slate-900',
                  subtext: 'text-slate-500',
                  hoverBorder: 'hover:border-slate-300',
                  blob: 'bg-slate-500/10'
              };
          }
      }

      // 2. STANDARD (Light/Dark)
      switch(color) {
          case 'red': return {
              bg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
              iconBg: 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400',
              text: 'text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400',
              subtext: 'text-slate-500 dark:text-slate-400',
              hoverBorder: 'hover:border-red-300 dark:hover:border-red-500/50',
              blob: 'bg-red-500/5'
          };
          case 'emerald': return {
              bg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
              iconBg: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
              text: 'text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
              subtext: 'text-slate-500 dark:text-slate-400',
              hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-500/50',
              blob: 'bg-emerald-500/5'
          };
          case 'orange': return {
              bg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
              iconBg: 'bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400',
              text: 'text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400',
              subtext: 'text-slate-500 dark:text-slate-400',
              hoverBorder: 'hover:border-orange-300 dark:hover:border-orange-500/50',
              blob: 'bg-orange-500/5'
          };
          case 'violet': return {
              bg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
              iconBg: 'bg-violet-50 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400',
              text: 'text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400',
              subtext: 'text-slate-500 dark:text-slate-400',
              hoverBorder: 'hover:border-violet-300 dark:hover:border-violet-500/50',
              blob: 'bg-violet-500/5'
          };
          case 'cyan': return {
              bg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
              iconBg: 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',
              text: 'text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400',
              subtext: 'text-slate-500 dark:text-slate-400',
              hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-500/50',
              blob: 'bg-cyan-500/5'
          };
          case 'blue': return {
              bg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
              iconBg: 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
              text: 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400',
              subtext: 'text-slate-500 dark:text-slate-400',
              hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-500/50',
              blob: 'bg-blue-500/5'
          };
          default: return {
              bg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
              iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
              text: 'text-slate-900 dark:text-white',
              subtext: 'text-slate-500 dark:text-slate-400',
              hoverBorder: 'hover:border-slate-300',
              blob: 'bg-slate-500/5'
          };
      }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.title.trim() || !requestForm.url.trim()) return;

    setRequestStatus('loading');
    setErrorMessage('');
    
    try {
        if (!currentUser) {
            throw new Error("You must be logged in to submit requests.");
        }

        const userRequestsRef = collection(db, 'users', currentUser.uid, 'resource_requests');

        await addDoc(userRequestsRef, {
            title: requestForm.title,
            url: requestForm.url,
            type: requestForm.type,
            requestedBy: currentUser.email || 'Anonymous',
            userId: currentUser.uid,
            createdAt: new Date().toISOString(),
            status: 'pending'
        });

        setRequestStatus('success');
        setTimeout(() => {
            setIsRequestModalOpen(false);
            setRequestStatus('idle');
            setRequestForm({ title: '', url: '', type: 'Website' });
        }, 1500);

    } catch (error: any) {
        console.error("Error submitting resource request:", error);
        setRequestStatus('error');
        setErrorMessage(error.message || "Failed to send request.");
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ACCESS_PASSWORD) {
        window.open(DRIVE_URL, '_blank');
        setIsPasswordModalOpen(false);
        setPasswordInput('');
        setPasswordError(false);
    } else {
        setPasswordError(true);
    }
  };

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const featuredResource = resources.find(r => r.featured);
  const otherResources = filteredResources.filter(r => !r.featured);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-fade-in font-sans">
      
      {/* --- HERO HEADER SECTION --- */}
      <div className={`relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 border shadow-xl dark:shadow-2xl transition-all duration-500 group ${isCrescere ? 'bg-white/80 border-white/60 backdrop-blur-3xl' : 'bg-white dark:bg-[#0B1121] border-slate-200 dark:border-white/5'}`}>
          
          {/* Dynamic Backgrounds */}
          <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none opacity-70 dark:opacity-100 ${isCrescere ? 'bg-rose-200/40' : 'bg-purple-100 dark:bg-purple-500/10'}`}></div>
          <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none opacity-70 dark:opacity-100 ${isCrescere ? 'bg-amber-200/40' : 'bg-pink-100 dark:bg-pink-500/10'}`}></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
              <div className="max-w-2xl">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest mb-4 ${isCrescere ? 'bg-white/80 border-white/60 text-slate-600' : 'bg-slate-100 dark:bg-white/10 border-slate-200 dark:border-white/20 text-slate-500 dark:text-slate-300'}`}>
                      <Library size={12} className={isCrescere ? 'text-rose-500' : 'text-purple-500 dark:text-purple-400'} />
                      Knowledge Base
                  </div>
                  <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.9] mb-4 ${isCrescere ? 'text-slate-900' : 'text-slate-900 dark:text-white'}`}>
                      Resource <br/> <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isCrescere ? 'from-rose-500 to-amber-500' : 'from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400'}`}>Hub</span>
                  </h1>
                  <p className={`text-base md:text-lg font-medium leading-relaxed max-w-xl ${isCrescere ? 'text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
                      Curated high-yield materials, tools, and links for your review journey. Everything you need in one place.
                  </p>
              </div>

              {/* Enhanced Search Input */}
              <div className="relative group w-full lg:w-96">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search size={20} className={`transition-colors ${isCrescere ? 'text-slate-400 group-focus-within:text-rose-600' : 'text-slate-400 group-focus-within:text-purple-500'}`} />
                  </div>
                  <input 
                      type="text" 
                      placeholder="Search resources..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-12 pr-10 py-4 border rounded-2xl placeholder-opacity-50 focus:outline-none focus:ring-4 transition-all font-medium shadow-sm text-base ${isCrescere ? 'bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-rose-400 focus:ring-rose-500/10' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-white/10 focus:border-purple-500/50 focus:ring-purple-500/10'}`}
                  />
                  {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                      >
                          <X size={18} />
                      </button>
                  )}
              </div>
          </div>
      </div>

      {/* --- FEATURED HERO CARD (Google Drive) --- */}
      {featuredResource && !searchQuery && (
        <a 
          href={featuredResource.url}
          target={featuredResource.url.startsWith('#') ? undefined : "_blank"}
          rel="noopener noreferrer"
          onClick={(e) => {
             if (featuredResource.url === '#protected-drive') {
                 e.preventDefault();
                 setIsPasswordModalOpen(true);
             }
          }}
          className="relative group block w-full rounded-[2.5rem] overflow-hidden shadow-2xl transition-all hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.3)] hover:-translate-y-1 duration-500 transform-gpu will-change-transform"
        >
          {/* Dynamic Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute -right-20 -top-20 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] group-hover:bg-white/20 transition-colors duration-700 pointer-events-none"></div>
          
          <div className="relative z-10 p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
            <div className="flex flex-col sm:flex-row items-start gap-6 md:gap-8 w-full">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-inner border border-white/20 text-white shrink-0 group-hover:scale-110 transition-transform duration-500">
                {getIcon(featuredResource.iconName, "w-10 h-10 sm:w-12 sm:h-12")}
              </div>
              <div className="w-full min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-sm whitespace-nowrap">
                    <Star size={10} fill="currentColor" /> Featured
                  </span>
                  {featuredResource.tags.map(tag => (
                    <span key={tag} className="bg-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 uppercase tracking-widest whitespace-nowrap">
                      {tag}
                    </span>
                  ))}
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 uppercase tracking-widest flex items-center gap-1 whitespace-nowrap">
                      <Lock size={10} /> Protected
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 tracking-tight break-words leading-tight">{featuredResource.title}</h3>
                <p className="text-blue-100 text-sm sm:text-base md:text-lg max-w-2xl font-medium leading-relaxed break-words">
                  {featuredResource.description}
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0 mt-2 md:mt-0">
              <span className="w-full md:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-blue-600 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl transition-all group-hover:scale-105 active:scale-95 text-sm sm:text-base whitespace-nowrap">
                Access Vault <ArrowRight size={20} />
              </span>
            </div>
          </div>
        </a>
      )}

      {/* --- RESOURCE GRID (Aesthetic Cards) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {otherResources.map((resource) => {
            const visuals = getResourceVisuals(resource.color);
            return (
                <a
                    key={resource.id}
                    href={resource.url}
                    target={resource.url.startsWith('#') ? undefined : "_blank"}
                    rel={resource.url.startsWith('#') ? undefined : "noopener noreferrer"}
                    onClick={(e) => {
                        if (resource.url === '#websites') {
                            e.preventDefault();
                            setIsWebsitesModalOpen(true);
                        } else if (resource.url === '#protected-drive') {
                            e.preventDefault();
                            setIsPasswordModalOpen(true);
                        }
                    }}
                    className={`group relative flex flex-col justify-between p-6 sm:p-8 rounded-[2.5rem] border shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden transform-gpu will-change-transform min-h-[320px] h-auto ${visuals.bg} ${visuals.hoverBorder}`}
                >
                    {/* Abstract Blob Background */}
                    <div className={`absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${visuals.blob}`}></div>

                    <div className="relative z-10 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-sm border border-white/10 ${visuals.iconBg}`}>
                                {getIcon(resource.iconName, "w-8 h-8")}
                            </div>
                            <div className={`p-3 rounded-full transition-colors ${isCrescere ? 'bg-white/80 text-slate-400 group-hover:text-rose-600' : 'bg-slate-50 dark:bg-white/5 text-slate-300 group-hover:text-pink-500 dark:group-hover:text-pink-400'}`}>
                                <ExternalLink size={20} />
                            </div>
                        </div>

                        <h3 className={`text-2xl font-black leading-tight mb-3 transition-colors break-words ${visuals.text}`}>
                            {resource.title}
                        </h3>
                        <p className={`text-sm font-medium leading-relaxed break-words ${visuals.subtext}`}>
                            {resource.description}
                        </p>
                    </div>

                    <div className={`relative z-10 mt-8 pt-6 border-t flex flex-wrap gap-2 ${isCrescere ? 'border-slate-200' : 'border-slate-100 dark:border-slate-700/50'}`}>
                        {resource.tags.map(tag => (
                            <span key={tag} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider border ${isCrescere ? 'bg-white/80 border-slate-200 text-slate-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700'}`}>
                                {tag}
                            </span>
                        ))}
                    </div>
                </a>
            );
        })}

        {/* Add New Placeholder (Styled to match) */}
        <button 
          onClick={() => setIsRequestModalOpen(true)}
          className={`group relative rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center p-8 gap-4 transition-all duration-300 min-h-[320px] h-auto ${isCrescere ? 'border-rose-200 bg-rose-50/50 hover:bg-rose-100/50 hover:border-rose-400' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-pink-300 dark:hover:border-pink-500/50 hover:bg-pink-50/50 dark:hover:bg-pink-500/5'}`}
        >
          <div className={`w-16 h-16 rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg ${isCrescere ? 'bg-white text-rose-400 group-hover:text-rose-600' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:text-pink-500'}`}>
            <Plus size={32} />
          </div>
          <div className="text-center">
            <h4 className={`font-bold text-base transition-colors ${isCrescere ? 'text-rose-900 group-hover:text-rose-600' : 'text-slate-600 dark:text-slate-300 group-hover:text-pink-600 dark:group-hover:text-pink-400'}`}>Request Resource</h4>
            <p className={`text-xs mt-1 font-medium ${isCrescere ? 'text-slate-500' : 'text-slate-400'}`}>Suggest a link to be added</p>
          </div>
        </button>
      </div>

      {/* --- CREDIBLE WEBSITES MODAL --- */}
      {isWebsitesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsWebsitesModalOpen(false)}>
          <div 
            className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-white/5 flex flex-col max-h-[85vh] animate-zoom-in overflow-hidden relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B1121]/50 flex justify-between items-center relative shrink-0">
                {/* Modal Header Background */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                
                <div className="flex items-center gap-4 relative z-10 min-w-0 pr-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                        <Globe size={24} className="md:w-7 md:h-7" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">Verified Portals</h3>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">Credible sources for extra practice.</p>
                    </div>
                </div>
                <button onClick={() => setIsWebsitesModalOpen(false)} className="relative z-10 p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors shrink-0">
                    <X size={20} />
                </button>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-[#0f172a]">
                <div className="grid grid-cols-1 gap-4">
                    {trustedWebsites.map((site, i) => (
                        <a 
                            key={i} 
                            href={site.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-start sm:items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] hover:border-cyan-400 dark:hover:border-cyan-600 hover:shadow-lg dark:hover:shadow-cyan-900/20 transition-all group h-auto"
                        >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-500 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/30 transition-colors shrink-0 mt-1 sm:mt-0">
                                <LinkIcon size={18} className="sm:w-5 sm:h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base sm:text-lg text-slate-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-center gap-2 flex-wrap">
                                    {site.name}
                                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium break-words leading-relaxed">{site.desc}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* --- REQUEST RESOURCE MODAL --- */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] shadow-2xl w-full max-w-lg p-6 md:p-8 relative border border-slate-200 dark:border-white/5 animate-zoom-in overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Background Texture */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <button 
              onClick={() => setIsRequestModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="mb-6 md:mb-8 relative z-10">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-pink-50 dark:bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500 mb-4 shadow-sm border border-pink-100 dark:border-pink-500/20">
                    <Send size={28} className="md:w-8 md:h-8" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Request a Resource</h3>
                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-2 font-medium">Found something useful? Let us add it to the hub.</p>
            </div>

            {requestStatus === 'success' ? (
                <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-800 flex-1">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                        <Check size={40} />
                    </div>
                    <h4 className="font-bold text-xl text-slate-900 dark:text-white">Request Sent!</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Thanks for contributing to the batch.</p>
                </div>
            ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-5 relative z-10 overflow-y-auto custom-scrollbar flex-1 pb-2">
                    {/* Error Message */}
                    {requestStatus === 'error' && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 dark:text-red-400 font-bold">{errorMessage}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Resource Title</label>
                        <input 
                            type="text" 
                            required
                            placeholder="e.g. Awesome Anatomy Quiz"
                            value={requestForm.title}
                            onChange={(e) => setRequestForm({...requestForm, title: e.target.value})}
                            className="w-full p-4 bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all placeholder:font-normal text-sm md:text-base"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Link / URL</label>
                        <input 
                            type="url" 
                            required
                            placeholder="https://..."
                            value={requestForm.url}
                            onChange={(e) => setRequestForm({...requestForm, url: e.target.value})}
                            className="w-full p-4 bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all placeholder:font-normal text-sm md:text-base"
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={requestStatus === 'loading'}
                        className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold text-base md:text-lg shadow-xl shadow-pink-500/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 active:scale-[0.98]"
                    >
                        {requestStatus === 'loading' ? (
                            <>
                                <Loader2 size={20} className="animate-spin" /> Sending...
                            </>
                        ) : (
                            'Submit Request'
                        )}
                    </button>
                </form>
            )}
          </div>
        </div>
      )}

      {/* --- PASSWORD MODAL --- */}
      {isPasswordModalOpen && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setIsPasswordModalOpen(false)} />
            
            {/* Modal Container with Dynamic Centering Logic */}
            <div className="relative z-10 w-full max-w-sm flex items-center justify-center animate-zoom-in p-4 landscape:p-2">
                <div className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] w-full p-8 landscape:p-6 shadow-2xl border border-slate-200 dark:border-white/10 relative overflow-hidden max-h-[85vh] overflow-y-auto custom-scrollbar">
                    {/* Background FX */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>

                    <div className="flex flex-col items-center text-center mb-6 relative z-10">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4 text-blue-500 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-500/30">
                            <Lock size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Restricted Access</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">This repository is locked for Batch Crescere only.</p>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4 relative z-10">
                        <div className="relative group">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input 
                                type="password" 
                                placeholder="Enter batch password..."
                                value={passwordInput}
                                onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                                className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-white font-bold outline-none transition-all placeholder:font-normal focus:ring-4 ${
                                    passwordError 
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' 
                                    : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/10'
                                }`}
                                autoFocus
                            />
                        </div>
                        
                        {passwordError && (
                            <p className="text-xs font-bold text-red-500 text-center animate-shake">
                                Incorrect password. Try again.
                            </p>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button 
                                type="button" 
                                onClick={() => setIsPasswordModalOpen(false)}
                                className="flex-1 py-3.5 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="flex-[2] py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-sm uppercase tracking-wider"
                            >
                                Unlock
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Resources;
