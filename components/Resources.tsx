
import React, { useState } from 'react';
import { ExternalLink, Video, FileText, Layers, Folder, Plus, Search, Star, Book, Sparkles, ArrowRight, Globe, X, Link as LinkIcon, Send, Check, Loader2, AlertCircle } from 'lucide-react';
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
      id: '6', // Replaced Saunders
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
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in relative">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            Resource Hub <Sparkles className="text-pink-500 animate-pulse" size={24} />
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium max-w-md">
            Curated high-yield materials, tools, and links for your review journey.
          </p>
        </div>

        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pink-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Featured Hero Card */}
      {featuredResource && !searchQuery && (
        <a 
          href={featuredResource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative group block w-full rounded-[2rem] overflow-hidden shadow-2xl transition-transform hover:scale-[1.01] duration-500"
        >
          {/* Dynamic Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors duration-700"></div>
          
          <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/20 text-white shrink-0">
                {getIcon(featuredResource.iconName, "w-10 h-10")}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> Featured
                  </span>
                  {featuredResource.tags.map(tag => (
                    <span key={tag} className="bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/10 uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-3xl font-black text-white mb-2 tracking-tight">{featuredResource.title}</h3>
                <p className="text-blue-100 text-sm md:text-base max-w-xl font-medium leading-relaxed">
                  {featuredResource.description}
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <button className="w-full md:w-auto px-8 py-4 bg-white text-blue-600 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl transition-transform group-hover:translate-x-1">
                Access Drive <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </a>
      )}

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {otherResources.map((resource) => (
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
            className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50 hover:border-pink-200 dark:hover:border-pink-500/30 shadow-sm hover:shadow-xl hover:shadow-pink-500/5 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3.5 rounded-xl transition-colors ${
                resource.color === 'red' ? 'bg-red-50 dark:bg-red-500/10 text-red-500' :
                resource.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' :
                resource.color === 'orange' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-500' :
                resource.color === 'purple' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-500' :
                resource.color === 'cyan' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' :
                'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
              }`}>
                {getIcon(resource.iconName, "w-6 h-6")}
              </div>
              <ExternalLink size={16} className="text-slate-300 group-hover:text-pink-400 transition-colors" />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2 leading-tight group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors">
                {resource.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">
                {resource.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-50 dark:border-slate-700 flex flex-wrap gap-2">
              {resource.tags.map(tag => (
                <span key={tag} className="text-[10px] font-bold bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 px-2 py-1 rounded border border-slate-100 dark:border-slate-600 uppercase tracking-wider">
                  #{tag}
                </span>
              ))}
            </div>
          </a>
        ))}

        {/* Add New Placeholder */}
        <button 
          onClick={() => setIsRequestModalOpen(true)}
          className="group relative rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center p-8 gap-4 hover:border-pink-300 dark:hover:border-pink-500/50 hover:bg-pink-50/50 dark:hover:bg-pink-500/5 transition-all duration-300 min-h-[220px]"
        >
          <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Plus size={24} className="text-slate-400 dark:text-slate-500 group-hover:text-pink-500 transition-colors" />
          </div>
          <div className="text-center">
            <h4 className="font-bold text-slate-600 dark:text-slate-300 text-sm group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">Request Resource</h4>
            <p className="text-xs text-slate-400 mt-1">Suggest a link to be added</p>
          </div>
        </button>
      </div>

      {/* --- CREDIBLE WEBSITES MODAL --- */}
      {isWebsitesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsWebsitesModalOpen(false)}>
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[80vh] animate-zoom-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-xl">
                        <Globe size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Credible Nursing Websites</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verified sources for extra reading and practice</p>
                    </div>
                </div>
                <button onClick={() => setIsWebsitesModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 gap-3">
                    {trustedWebsites.map((site, i) => (
                        <a 
                            key={i} 
                            href={site.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-lg hover:shadow-cyan-500/5 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-cyan-500 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/20 transition-colors">
                                <LinkIcon size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                                    {site.name}
                                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{site.desc}</p>
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 relative border border-slate-200 dark:border-slate-700 animate-zoom-in">
            <button 
              onClick={() => setIsRequestModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
                <div className="w-12 h-12 bg-pink-50 dark:bg-pink-500/10 rounded-full flex items-center justify-center text-pink-500 mb-4">
                    <Send size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Request a Resource</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Found something useful? Let us add it to the hub.</p>
            </div>

            {requestStatus === 'success' ? (
                <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                        <Check size={32} />
                    </div>
                    <h4 className="font-bold text-lg text-slate-800 dark:text-white">Request Sent!</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Thanks for contributing to the batch.</p>
                </div>
            ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                    {/* Error Message */}
                    {requestStatus === 'error' && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
                            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errorMessage}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Resource Title</label>
                        <input 
                            type="text" 
                            required
                            placeholder="e.g. Awesome Anatomy Quiz"
                            value={requestForm.title}
                            onChange={(e) => setRequestForm({...requestForm, title: e.target.value})}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Link / URL</label>
                        <input 
                            type="url" 
                            required
                            placeholder="https://..."
                            value={requestForm.url}
                            onChange={(e) => setRequestForm({...requestForm, url: e.target.value})}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={requestStatus === 'loading'}
                        className="w-full py-3.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
                    >
                        {requestStatus === 'loading' ? (
                            <>
                                <Loader2 size={18} className="animate-spin" /> Sending...
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
