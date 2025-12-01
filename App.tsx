import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import Pomodoro from './components/Pomodoro';
import Resources from './components/Resources';
import ExamTOS from './components/ExamTOS';
import SignUp from './components/SignUp';
import { NavigationItem } from './types';
import { useAuth } from './AuthContext';
import { Loader, Send } from 'lucide-react';

const App: React.FC = () => {
  const { currentUser, loading, logout } = useAuth(); // Added logout
  const [activeItem, setActiveItem] = useState<NavigationItem>('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      case 'Pomodoro Timer':
        return <Pomodoro />;
      case 'Resource Hub':
        return <Resources />;
      case 'Exam TOS':
        return <ExamTOS />;
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
        <SignUp />
      </div>
    );
  }

  // 3. Verification Wall - Intercept Unverified Users
  // Note: Google Auth users are automatically verified, so this mostly impacts Email/Password users
  if (!currentUser.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] dark:bg-slate-900 transition-colors p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-700 text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <Send size={40} />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
            Verify your email
          </h2>
          
          <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            We have sent a verification email to <br/>
            <span className="font-bold text-slate-900 dark:text-white">{currentUser.email}</span>.
            <br/><br/>
            Please check your inbox (and spam folder), click the link, and then come back here.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3.5 px-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-500/25 transition-all"
            >
              I have verified my email
            </button>
            
            <button
              onClick={() => logout()}
              className="w-full py-3.5 px-4 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 font-medium rounded-xl transition-all"
            >
              Go back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authenticated App Layout
  return (
    <div className="flex min-h-screen bg-[#F3F4F6] dark:bg-slate-900 transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar 
        activeItem={activeItem} 
        onNavigate={setActiveItem}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
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
      </div>
    </div>
  );
};

export default App;
