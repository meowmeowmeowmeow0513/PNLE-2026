import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import Pomodoro from './components/Pomodoro';
import Resources from './components/Resources';
import ExamTOS from './components/ExamTOS';
import SignUp from './components/SignUp';
import { NavigationItem } from './types';
import { AuthProvider } from './AuthContext';

const App: React.FC = () => {
  const [activeItem, setActiveItem] = useState<NavigationItem>('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Theme Management
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pnle_theme');
      // Default to light if no preference, or check system pref
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
      case 'Sign Up':
        return <SignUp />;
      default:
        return <Dashboard onNavigate={setActiveItem} />;
    }
  };

  return (
    <AuthProvider>
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
    </AuthProvider>
  );
};

export default App;
