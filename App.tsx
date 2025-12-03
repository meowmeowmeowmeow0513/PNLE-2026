
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import Pomodoro from './components/Pomodoro';
import Resources from './components/Resources';
import ExamTOS from './components/ExamTOS';
import PersonalFolder from './components/PersonalFolder';
import Planner from './components/Planner';
import SignUp from './components/SignUp';
import VerifyEmail from './components/VerifyEmail';
import ForgotPassword from './components/ForgotPassword';
import GlobalYoutubePlayer from './components/GlobalYoutubePlayer'; // Enhanced Persistent Player
import { NavigationItem } from './types';
import { useAuth } from './AuthContext';
import { PomodoroProvider } from './components/PomodoroContext'; 
import { TaskProvider } from './TaskContext';
import { Loader } from 'lucide-react';

const App: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [activeItem, setActiveItem] = useState<NavigationItem>('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authView, setAuthView] = useState<'auth' | 'forgot'>('auth');

  // Theme Management
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pnle_theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
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
      default:
        return <Dashboard onNavigate={setActiveItem} />;
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] dark:bg-slate-900 transition-colors">
        <Loader className="animate-spin text-pink-500" size={48} />
      </div>
    );
  }

  // 2. Auth Wall - If no user, show Auth Page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] dark:bg-slate-900 transition-colors p-4">
        {/* Simple Header for Auth Page */}
        <div className="max-w-md mx-auto mb-8 pt-10 text-center">
             <div className="inline-flex items-center justify-center p-3 bg-pink-500 rounded-2xl shadow-lg mb-4">
                 <span className="text-white font-bold text-2xl">RN</span>
             </div>
             <h1 className="text-2xl font-bold text-slate-800 dark:text-white">PNLE Review Companion</h1>
             <p className="text-slate-500 dark:text-slate-400">Your journey to the license starts here.</p>
        </div>
        
        {authView === 'auth' ? (
            <SignUp onForgotPassword={() => setAuthView('forgot')} />
        ) : (
            <ForgotPassword onBack={() => setAuthView('auth')} />
        )}
      </div>
    );
  }

  // 3. Verification Wall - Intercept Unverified Users
  if (!currentUser.emailVerified) {
    return <VerifyEmail />;
  }

  // 4. Authenticated App Layout (Wrapped in PomodoroProvider AND TaskProvider)
  return (
    <PomodoroProvider>
      <TaskProvider>
        <div className="flex min-h-screen bg-[#F3F4F6] dark:bg-slate-900 transition-colors duration-300">
          {/* Sidebar */}
          <Sidebar 
            activeItem={activeItem} 
            onNavigate={setActiveItem}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300 relative">
            <TopBar 
              onMenuClick={() => setSidebarOpen(true)} 
              isDark={isDark}
              toggleTheme={toggleTheme}
            />
            
            <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
              <div className="max-w-7xl mx-auto h-full">
                {renderContent()}
              </div>
            </main>

            {/* 
                PERSISTENT PLAYER
                This component now handles BOTH the main video view (via overlay snapping)
                and the floating mini-player widget. It is never unmounted.
            */}
            <GlobalYoutubePlayer activeItem={activeItem} />
          </div>
        </div>
      </TaskProvider>
    </PomodoroProvider>
  );
};

export default App;
