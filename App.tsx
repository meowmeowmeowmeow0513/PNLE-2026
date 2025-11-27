import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import Pomodoro from './components/Pomodoro';
import Resources from './components/Resources';
import ExamTOS from './components/ExamTOS';
import { NavigationItem } from './types';

const App: React.FC = () => {
  const [activeItem, setActiveItem] = useState<NavigationItem>('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      {/* Sidebar */}
      <Sidebar 
        activeItem={activeItem} 
        onNavigate={setActiveItem}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
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