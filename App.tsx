
import PwaInstallPrompt from './components/PwaInstallPrompt';
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
        return <Dashboard onNavigate={setActiveItem} />;
      case 'Planner':
        return <Planner />;
      case 'Pomodoro Timer':
        return <Pomodoro />;
      case 'Clinical Tools':
        return <ClinicalTools />;
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

  if (onboardingStatus !== 'completed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] gap-4 font-sans">
        <Loader className="animate-spin text-pink-500" size={48} />
        <p className="text-slate-400 text-sm">Preparing Dashboard...</p>
        <button onClick={() => logout()} className="mt-8 text-xs text-slate-500 underline">
          <LogOut size={12} /> Cancel
        </button>
      </div>
    );
  }

  return (
    <PomodoroProvider>
      <TaskProvider>
        <style>{`
          @keyframes aurora {
            0% { transform: translate(0px, 0px) scale(1); opacity: 0.4; }
            33% { transform: translate(30px, -50px) scale(1.1); opacity: 0.6; }
            66% { transform: translate(-20px, 20px) scale(0.9); opacity: 0.4; }
            100% { transform: translate(0px, 0px) scale(1); opacity: 0.4; }
          }
          @keyframes drift-1 {
            0% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(10%, 5%) rotate(5deg) scale(1.1); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }
          @keyframes drift-2 {
            0% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(-5%, 10%) rotate(-5deg) scale(1.05); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }
          @keyframes drift-3 {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(5%, -5%) scale(1.15); }
            100% { transform: translate(0, 0) scale(1); }
          }

          .animate-aurora { animation: aurora 15s infinite ease-in-out; }
          .animate-aurora-delayed { animation: aurora 20s infinite ease-in-out reverse; }

          .animate-drift-slow-1 { animation: drift-1 60s infinite ease-in-out; }
          .animate-drift-slow-2 { animation: drift-2 70s infinite ease-in-out reverse; }
          .animate-drift-slow-3 { animation: drift-3 80s infinite ease-in-out; }

          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
          @keyframes zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          .animate-zoom-in { animation: zoom-in 0.2s ease-out forwards; }
        `}</style>

        {/* 
           RESPONSIVE LAYOUT ENGINE
           Mobile: Flex-col (Sidebar is fixed overlay)
           Desktop: Flex-row (Sidebar is static flow)
           
           This ensures that when sidebar expands/collapses on desktop, 
           the Main Content area naturally resizes and recenters content via flex-1.
        */}
        <div
          className={`relative h-screen font-sans selection:bg-pink-500/30 overflow-hidden transition-colors duration-500 text-slate-900 dark:text-white
          flex flex-row`}
        >
          {/* --- GLOBAL BACKGROUND SYSTEM --- */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50 dark:bg-black">
            {/* CRESCERE */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${themeMode === 'crescere' ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute inset-0 bg-[#fff5f5]" />
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[30%] -right-[30%] w-[120vw] h-[120vw] bg-gradient-to-b from-rose-200/40 to-transparent rounded-full blur-[100px] animate-drift-slow-1 mix-blend-multiply opacity-50" />
                <div className="absolute -bottom-[30%] -left-[30%] w-[120vw] h-[120vw] bg-gradient-to-t from-amber-100/40 to-transparent rounded-full blur-[100px] animate-drift-slow-2 mix-blend-multiply opacity-50" />
                <div className="absolute top-[20%] left-[20%] w-[60vw] h-[60vw] bg-gradient-to-r from-purple-100/30 to-transparent rounded-full blur-[120px] animate-drift-slow-3 mix-blend-multiply opacity-30" />
              </div>
              <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 ${themeMode === 'crescere' ? '' : 'mix-blend-overlay'}`} />
              <div className="absolute inset-0 bg-[radial-gradient(transparent_0%,_rgba(255,241,242,0.4)_100%)]" />
            </div>

            {/* DARK */}
            <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617] transition-opacity duration-700 ease-in-out ${themeMode === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-900/10 rounded-full blur-[120px] animate-aurora" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] animate-aurora-delayed" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            </div>

            {/* LIGHT */}
            <div className={`absolute inset-0 bg-[#f8fafc] transition-opacity duration-700 ease-in-out ${themeMode === 'light' ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none mix-blend-multiply" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-50/40 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none mix-blend-multiply" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none" />
            </div>
          </div>

          {/* Sidebar - Component handles its own Fixed (mobile) vs Static (desktop) behavior */}
          <Sidebar
            activeItem={activeItem}
            onNavigate={setActiveItem}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isMinimized={sidebarMinimized}
            onToggleMinimize={toggleSidebarMinimize}
          />

          {/* Main Content Area - Flex Grow to fill remaining space */}
          <div className="flex-1 flex flex-col h-full min-w-0 relative z-10 transition-[margin,width] duration-300 ease-in-out">
            <TopBar
              title={activeItem}
              onMenuClick={() => setSidebarOpen(true)}
              isDark={true}
              toggleTheme={() => { }}
            />

            <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth custom-scrollbar relative">
              <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
                {renderContent()}
              </div>
            </main>

            <GlobalYoutubePlayer activeItem={activeItem} />
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
