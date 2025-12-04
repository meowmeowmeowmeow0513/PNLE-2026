
import React, { useState } from 'react';
import { ExternalLink, Video, FileText, Layers, Folder, Plus, Search, Star, Book, Sparkles, ArrowRight, Globe, X, Link as LinkIcon, Send, Check, Loader2, AlertCircle, Library } from 'lucide-react';
import { ResourceLink } from '../types';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

// Extended interface for internal use
interface EnhancedResource extends ResourceLink {
  tags: string[];
  featured?: boolean;
  color: string;
}

const Resources: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isWebsitesModalOpen, setIsWebsitesModalOpen] = useState(false);

  // Request Form State
  const [requestForm, setRequestForm] = useState({ title: '', url: '', type: 'Website' });
  const [requestStatus, setRequestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const resources: EnhancedResource[] = [
    {
      id: '1',
      title: 'Google Drive Repository',
      description: 'The master vault. Access previous batch reviewers, PDFs, transes, and shared class folders.',
      url: 'https://drive.google.com/drive/folders/1pRgtdnEXRKk5eA8YLTp8wohQRIRVUxZ9?usp=sharing',
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
      tags: ['FLASHCARDS', 'ACTIVE RECALL'],
      color: 'slate'
    },
    {
      id: '6',
      title: 'Credible Websites',
      description: 'Verified portals: Simple Nursing, RegisteredNurseRN, and more.',
      url: '#websites', // Trigger for modal
      iconName: 'globe',
      tags: ['PORTAL', 'VERIFIED'],
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
      case 'video': return <Video className={className} />;
      case 'file': return <FileText className={className} />;
      case 'book': return <Book className={className} />;
      case 'layers': return <Layers className={className} />;
      case 'globe': return <Globe className={className} />;
      default: return <ExternalLink className={className} />;
    }
  };

  const getCardTheme = (color: string) => {
      switch(color) {
          case 'red': return 'text-red-500 bg-red-50 dark:bg-red-500/20';
          case 'emerald': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/20';
          case 'orange': return 'text-orange-500 bg-orange-50 dark:bg-orange-500/20';
          case 'blue': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/20';
          case 'cyan': return 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/20';
          default: return 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800';
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

        // Write to user's subcollection to bypass root-level security restrictions
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
        
        // Reset form after delay
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

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const featuredResource = resources.find(r => r.featured);
  const otherResources = filteredResources.filter(r => !r.featured);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in font-sans">
      
      {/* --- HERO HEADER SECTION --- */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#0B1121] p-8 md:p-12 border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl transition-colors duration-500 group">
          
          {/* Dynamic Backgrounds */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-100 dark:bg-purple-500/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none opacity-70 dark:opacity-100"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-100 dark:bg-pink-500/10 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none opacity-70 dark:opacity-100"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
              <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest mb-4 text-slate-500 dark:text-slate-300">
                      <Library size={12} className="text-purple-500 dark:text-purple-400" />
                      Knowledge Base
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.9] mb-4 text-slate-900 dark:text-white">
                      Resource <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400">Hub</span>
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg font-medium leading-relaxed max-w-xl">
                      Curated high-yield materials, tools, and links for your review journey. Everything you need in one place.
                  </p>
              </div>

              {/* Enhanced Search Input */}
              <div className="relative group w-full lg:w-96">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search size={20} className="text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                  </div>
                  <input 
                      type="text" 
                      placeholder="Search resources (e.g. 'Anatomy')..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium shadow-sm text-base"
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

      {/* --- FEATURED HERO CARD --- */}
      {featuredResource && !searchQuery && (
        <a 
          href={featuredResource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative group block w-full rounded-[2.5rem] overflow-hidden shadow-2xl transition-all hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.3)] hover:-translate-y-1 duration-500"
        >
          {/* Dynamic Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute -right-20 -top-20 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] group-hover:bg-white/20 transition-colors duration-700 pointer-events-none"></div>
          
          <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-inner border border-white/20 text-white shrink-0 group-hover:scale-110 transition-transform duration-500">
                {getIcon(featuredResource.iconName, "w-12 h-12")}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-sm">
                    <Star size={10} fill="currentColor" /> Featured
                  </span>
                  {featuredResource.tags.map(tag => (
                    <span key={tag} className="bg-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 uppercase tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">{featuredResource.title}</h3>
                <p className="text-blue-100 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
                  {featuredResource.description}
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <span className="w-full md:w-auto px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl transition-all group-hover:scale-105 active:scale-95">
                Access Drive <ArrowRight size={20} />
              </span>
            </div>
          </div>
        </a>
      )}

      {/* --- RESOURCE GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {otherResources.map((resource) => {
            const themeClasses = getCardTheme(resource.color);
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
                    }
                    }}
                    className="group relative flex flex-col justify-between p-8 rounded-[2.5rem] bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 hover:border-pink-500/30 dark:hover:border-pink-500/30 hover:shadow-2xl dark:hover:shadow-black/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                    {/* Hover Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-sm ${themeClasses}`}>
                                {getIcon(resource.iconName, "w-8 h-8")}
                            </div>
                            <div className="p-3 rounded-full bg-slate-50 dark:bg-white/5 text-slate-300 group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors">
                                <ExternalLink size={20} />
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 dark:group-hover:from-white dark:group-hover:to-slate-300 transition-all">
                            {resource.title}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                            {resource.description}
                        </p>
                    </div>

                    <div className="relative z-10 mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap gap-2">
                        {resource.tags.map(tag => (
                            <span key={tag} className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-lg uppercase tracking-wider border border-slate-100 dark:border-slate-700">
                                {tag}
                            </span>
                        ))}
                    </div>
                </a>
            );
        })}

        {/* Add New Placeholder */}
        <button 
          onClick={() => setIsRequestModalOpen(true)}
          className="group relative rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center p-8 gap-4 hover:border-pink-300 dark:hover:border-pink-500/50 hover:bg-pink-50/50 dark:hover:bg-pink-500/5 transition-all duration-300 min-h-[300px]"
        >
          <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg">
            <Plus size={32} className="text-slate-400 dark:text-slate-500 group-hover:text-pink-500 transition-colors" />
          </div>
          <div className="text-center">
            <h4 className="font-bold text-slate-600 dark:text-slate-300 text-base group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">Request Resource</h4>
            <p className="text-xs text-slate-400 mt-1 font-medium">Suggest a link to be added</p>
          </div>
        </button>
      </div>

      {/* --- CREDIBLE WEBSITES MODAL --- */}
      {isWebsitesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in" onClick={() => setIsWebsitesModalOpen(false)}>
          <div 
            className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-white/5 flex flex-col max-h-[85vh] animate-zoom-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B1121]/50 flex justify-between items-center relative overflow-hidden">
                {/* Modal Header Background */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center shadow-sm">
                        <Globe size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Verified Portals</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Credible sources for extra practice.</p>
                    </div>
                </div>
                <button onClick={() => setIsWebsitesModalOpen(false)} className="relative z-10 p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors">
                    <X size={24} />
                </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-[#0f172a]">
                <div className="grid grid-cols-1 gap-4">
                    {trustedWebsites.map((site, i) => (
                        <a 
                            key={i} 
                            href={site.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-5 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] hover:border-cyan-400 dark:hover:border-cyan-600 hover:shadow-lg dark:hover:shadow-cyan-900/20 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-500 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/30 transition-colors">
                                <LinkIcon size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                                    {site.name}
                                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{site.desc}</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 relative border border-slate-200 dark:border-white/5 animate-zoom-in overflow-hidden">
            
            {/* Background Texture */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <button 
              onClick={() => setIsRequestModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="mb-8 relative z-10">
                <div className="w-16 h-16 bg-pink-50 dark:bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500 mb-4 shadow-sm border border-pink-100 dark:border-pink-500/20">
                    <Send size={32} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Request a Resource</h3>
                <p className="text-base text-slate-500 dark:text-slate-400 mt-2 font-medium">Found something useful? Let us add it to the hub.</p>
            </div>

            {requestStatus === 'success' ? (
                <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-800">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                        <Check size={40} />
                    </div>
                    <h4 className="font-bold text-xl text-slate-900 dark:text-white">Request Sent!</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Thanks for contributing to the batch.</p>
                </div>
            ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-5 relative z-10">
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
                            className="w-full p-4 bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all placeholder:font-normal"
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
                            className="w-full p-4 bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all placeholder:font-normal"
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={requestStatus === 'loading'}
                        className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-pink-500/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 active:scale-[0.98]"
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

    </div>
  );
};

export default Resources;
