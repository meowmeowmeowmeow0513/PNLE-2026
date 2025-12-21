
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
import ClinicalTools from './components/ClinicalTools';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import { NavigationItem } from './types';
import { useAuth } from './AuthContext';
import { PomodoroProvider } from './components/PomodoroContext';
import { TaskProvider } from './TaskContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Loader, LogOut } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

const AppContent: React.FC = () => {
  const { currentUser, loading, onboardingStatus, logout } = useAuth();
  const { themeMode } = useTheme();
  const [activeItem, setActiveItem] = useState<NavigationItem>('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(() => {
    return localStorage.getItem('pnle_sidebar_minimized') === 'true';
  });
  const [publicView, setPublicView] = useState<'landing' | 'login' | 'forgot'>('landing');

  useEffect(() => {
    if (currentUser) {
      const fetchPref = async () => {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.sidebarMinimized !== undefined) {
              setSidebarMinimized(data.sidebarMinimized);
              localStorage.setItem('pnle_sidebar_minimized', String(data.sidebarMinimized));
            }
          }
        } catch (e) {
          console.error('Error fetching sidebar pref', e);
        }
      };
      fetchPref();
    }
  }, [currentUser]);

  const toggleSidebarMinimize = () => {
    setSidebarMinimized(prev => {
      const next = !prev;
      localStorage.setItem('pnle_sidebar_minimized', String(next));

      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        updateDoc(docRef, { sidebarMinimized: next }).catch(err =>
          console.error('Failed to save sidebar pref', err)
        );
      }

      return next;
    });
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'Dashboard':
        return <Dashboard onNavigate={setActiveItem} isSidebarExpanded={!sidebarMinimized} />;
      case 'Planner':
        return <Planner />;
      case 'Pomodoro Timer':
        return <Pomodoro />;
      case 'Clinical Tools':
        return <ClinicalTools />;
      case 'Resource Hub':
        return <Resources isSidebarExpanded={!sidebarMinimized} />;
      case 'Exam TOS':
        return <ExamTOS />;
      case 'Personal Folder':
        return <PersonalFolder isSidebarExpanded={!sidebarMinimized} />;
      case 'December Quest':
        return <DecemberQuest />;
      default:
        return <Dashboard onNavigate={setActiveItem} isSidebarExpanded={!sidebarMinimized} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white gap-4 font-sans">
        <Loader className="animate-spin text-pink-500" size={48} />
        <p className="text-slate-500 text-sm font-medium">Initialising...</p>
      </div>
    );
  }

  if (!currentUser) {
    if (publicView === 'landing') return <LandingPage onGetStarted={() => setPublicView('login')} />;
    if (publicView === 'login')
      return <SignUp onForgotPassword={() => setPublicView('forgot')} onBack={() => setPublicView('landing')} />;
    if (publicView === 'forgot') return <ForgotPassword onBack={() => setPublicView('login')} />;
  }

  if (currentUser && !currentUser.emailVerified) {
    return <VerifyEmail />;
  }

  if (onboardingStatus === 'pending') {
    return <OnboardingFlow />;
  }

  return (
    <PomodoroProvider>
      <TaskProvider>
        <style>{`
          @keyframes aurora-luxe {
            0% { transform: translate(-20%, -20%) scale(1); opacity: 0.3; }
            50% { transform: translate(10%, 10%) scale(1.1); opacity: 0.5; }
            100% { transform: translate(-20%, -20%) scale(1); opacity: 0.3; }
          }
          @keyframes aurora-luxe-alt {
            0% { transform: translate(20%, 20%) scale(1.1); opacity: 0.2; }
            50% { transform: translate(-10%, -10%) scale(1); opacity: 0.4; }
            100% { transform: translate(20%, 20%) scale(1.1); opacity: 0.2; }
          }

          .animate-aurora-luxe { animation: aurora-luxe 20s infinite ease-in-out; }
          .animate-aurora-luxe-alt { animation: aurora-luxe-alt 25s infinite ease-in-out; }

          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
          @keyframes zoom-in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
          .animate-zoom-in { animation: zoom-in 0.3s ease-out forwards; }
        `}</style>

        <div
          className={`relative h-[100dvh] font-sans selection:bg-pink-500/30 overflow-hidden transition-colors duration-700 text-slate-900 dark:text-slate-100
          flex flex-row p-0 md:p-3 lg:p-4 gap-0 md:gap-2 lg:gap-3`}
        >
          {/* --- GLOBAL BACKGROUND SYSTEM --- */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-white dark:bg-[#020617]">
            
            {/* DARK MODE: DEEP NAVY */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${themeMode === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute inset-0 bg-[#020617]" />
              <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-600/10 rounded-full blur-[140px] animate-aurora-luxe" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[140px] animate-aurora-luxe-alt" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
            </div>

            {/* CRESCERE MODE: ROSE WATER */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${themeMode === 'crescere' ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute inset-0 bg-[#fffbfc]" />
              <div className="absolute -top-[10%] -right-[10%] w-[80%] h-[80%] bg-rose-100/40 rounded-full blur-[100px] animate-aurora-luxe" />
              <div className="absolute -bottom-[10%] -left-[10%] w-[80%] h-[80%] bg-amber-50/50 rounded-full blur-[100px] animate-aurora-luxe-alt" />
              <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5`} />
            </div>

            {/* LIGHT MODE: CRISP SLATE */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${themeMode === 'light' ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute inset-0 bg-[#f8fafc]" />
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/60 rounded-full blur-[120px] mix-blend-multiply" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-50/60 rounded-full blur-[120px] mix-blend-multiply" />
            </div>
          </div>

          <Sidebar
            activeItem={activeItem}
            onNavigate={setActiveItem}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isMinimized={sidebarMinimized}
            onToggleMinimize={toggleSidebarMinimize}
          />

          {/* CONTENT ISLAND */}
          <div className={`
            flex-1 flex flex-col h-full min-w-0 relative z-10 
            transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] 
            overflow-hidden md:rounded-[2.5rem] 
            border transition-colors
            ${themeMode === 'crescere' 
                ? 'bg-white/40 border-white/60 shadow-[0_20px_50px_-15px_rgba(244,63,94,0.1)]' 
                : themeMode === 'dark'
                    ? 'bg-slate-900/40 border-white/10 shadow-2xl backdrop-blur-3xl'
                    : 'bg-white/60 border-slate-200/50 shadow-xl backdrop-blur-2xl'
            }
          `}>
            <TopBar
              title={activeItem}
              onMenuClick={() => setSidebarOpen(true)}
              isDark={true}
              toggleTheme={() => { }}
            />

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth custom-scrollbar relative">
              <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
                {renderContent()}
              </div>
            </main>

            <GlobalYoutubePlayer activeItem={activeItem} />
            <PwaInstallPrompt />
          </div>
        </div>
      </TaskProvider>
    </PomodoroProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
