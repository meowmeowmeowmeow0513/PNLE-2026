
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import Pomodoro from './components/Pomodoro';
import Resources from './components/Resources';
import ExamTOS from './components/ExamTOS';
import PersonalFolder from './components/PersonalFolder';
import Planner from './components/Planner';
import DecemberQuest from './components/DecemberQuest';
import SignUp from './components/SignUp';
import VerifyEmail from './components/VerifyEmail';
import ForgotPassword from './components/ForgotPassword';
import LandingPage from './components/LandingPage';
import OnboardingFlow from './components/OnboardingFlow';
import GlobalYoutubePlayer from './components/GlobalYoutubePlayer'; 
import { NavigationItem } from './types';
import { useAuth } from './AuthContext';
import { PomodoroProvider } from './components/PomodoroContext'; 
import { TaskProvider } from './TaskContext';
import { Loader, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const { currentUser, loading, onboardingStatus, logout } = useAuth();
  const [activeItem, setActiveItem] = useState<NavigationItem>('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Routing State for Unauthenticated Users
  const [publicView, setPublicView] = useState<'landing' | 'login' | 'forgot'>('landing');

  // Theme Management (Default to Dark for Nebulearn Aesthetic)
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pnle_theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return true; // Default to dark
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pnle_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pnle_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const renderContent = () => {
    switch (activeItem) {
      case 'Dashboard':
        return <Dashboard onNavigate={setActiveItem} />;
      case 'Planner':
        return <Planner />;
      case 'Pomodoro Timer':
        return <Pomodoro />;
      case 'Resource Hub':
        return <Resources />;
      case 'Exam TOS':
        return <ExamTOS />;
      case 'Personal Folder':
        return <PersonalFolder />;
      case 'December Quest':
        return <DecemberQuest />;
      default:
        return <Dashboard onNavigate={setActiveItem} />;
    }
  };

  // 1. Loading State (Global Auth)
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white gap-4 font-sans">
        <Loader className="animate-spin text-pink-500" size={48} />
        <p className="text-slate-500 text-sm font-medium">Loading Application...</p>
        <button 
          onClick={() => logout()}
          className="mt-8 text-xs text-slate-600 hover:text-slate-400 underline flex items-center gap-1 transition-colors"
        >
           <LogOut size={12} /> Stuck? Emergency Sign Out
        </button>
      </div>
    );
  }

  // 2. Auth Wall
  if (!currentUser) {
    if (publicView === 'landing') return <LandingPage onGetStarted={() => setPublicView('login')} />;
    if (publicView === 'login') return <SignUp onForgotPassword={() => setPublicView('forgot')} onBack={() => setPublicView('landing')} />;
    if (publicView === 'forgot') return <ForgotPassword onBack={() => setPublicView('login')} />;
  }

  // 3. Verification Wall
  if (currentUser && !currentUser.emailVerified) {
    return <VerifyEmail />;
  }

  // 4. Onboarding Wall
  if (onboardingStatus === 'pending') {
      return <OnboardingFlow />;
  }
  
  if (onboardingStatus !== 'completed') {
     return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] gap-4 font-sans">
        <Loader className="animate-spin text-pink-500" size={48} />
        <p className="text-slate-400 text-sm">Preparing Dashboard...</p>
        <button onClick={() => logout()} className="mt-8 text-xs text-slate-500 underline"><LogOut size={12} /> Cancel</button>
      </div>
    );
  }

  // 5. Authenticated App Layout (Nebulearn Structure)
  return (
    <PomodoroProvider>
      <TaskProvider>
        {/* INJECTED STYLES FOR ANIMATIONS & AURORA */}
        <style>{`
          @keyframes aurora {
            0% { transform: translate(0px, 0px) scale(1); opacity: 0.4; }
            33% { transform: translate(30px, -50px) scale(1.1); opacity: 0.6; }
            66% { transform: translate(-20px, 20px) scale(0.9); opacity: 0.4; }
            100% { transform: translate(0px, 0px) scale(1); opacity: 0.4; }
          }
          .animate-aurora {
            animation: aurora 15s infinite ease-in-out;
          }
          .animate-aurora-delayed {
            animation: aurora 20s infinite ease-in-out reverse;
          }
          
          /* Custom Keyframes for Modals */
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.2s ease-out forwards;
          }
          @keyframes zoom-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-zoom-in {
            animation: zoom-in 0.2s ease-out forwards;
          }
        `}</style>

        {/* GLOBAL FONT ENFORCEMENT */}
        <div className={`relative flex h-screen font-sans selection:bg-pink-500/30 overflow-hidden transition-colors duration-500 text-slate-900 dark:text-white`}>
          
          {/* --- COSMIC VOID BACKGROUND SYSTEM --- */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
             {/* Dark Mode: Nebula Gradient + Noise + AURORA BLOBS */}
             <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617] transition-opacity duration-700 ease-in-out ${isDark ? 'opacity-100' : 'opacity-0'}`}>
                {/* Aurora Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] animate-aurora"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-900/10 rounded-full blur-[120px] animate-aurora-delayed"></div>
                
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
             </div>
             {/* Light Mode: Clean Flat */}
             <div className={`absolute inset-0 bg-[#f8fafc] transition-opacity duration-700 ease-in-out ${isDark ? 'opacity-0' : 'opacity-100'}`}></div>
          </div>
          
          {/* Sidebar (Fixed Width, z-20 to sit above background) */}
          <div className="relative z-20 h-full">
            <Sidebar 
              activeItem={activeItem} 
              onNavigate={setActiveItem}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          </div>

          {/* Main Content (Flex Column, z-10) */}
          <div className="flex-1 flex flex-col h-screen relative min-w-0 z-10">
            {/* Sticky Header */}
            <TopBar 
              title={activeItem}
              onMenuClick={() => setSidebarOpen(true)} 
              isDark={isDark}
              toggleTheme={toggleTheme}
            />
            
            {/* Scrollable Content Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth custom-scrollbar relative">
              <div className="max-w-7xl mx-auto pb-20">
                {renderContent()}
              </div>
            </main>

            {/* Floating Player (Fixed Z-Index) */}
            <GlobalYoutubePlayer activeItem={activeItem} />
          </div>

        </div>
      </TaskProvider>
    </PomodoroProvider>
  );
};

export default App;