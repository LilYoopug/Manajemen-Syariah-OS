
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ToolsCatalog from './components/ToolsCatalog';
import AIGenerator from './components/AIGenerator';
import TaskManager from './components/TaskManager';
import Header from './components/Header';
import AIAssistant from './components/AIAssistant';
import DirectoryDetailModal from './components/DirectoryDetailModal';
import Settings from './components/Settings';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import AdminDashboard from './components/AdminDashboard';
import AdminUserManager from './components/AdminUserManager';
import AdminToolManager from './components/AdminToolManager';
import { HomeIcon } from './components/Icons';
import type { DirectoryItem, View } from '@/types';
import { getKpiDataForPeriod, getGoalsDataForPeriod, DIRECTORY_DATA as INITIAL_DIRECTORY } from '@/constants';
import useLocalStorage from '@/hooks/useLocalStorage';


type DateRange = '7' | '30' | 'all';

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAssistantOpen, setAssistantOpen] = useState(false);
  const [selectedDirectoryItem, setSelectedDirectoryItem] = useState<DirectoryItem | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(localStorage.getItem('theme') as 'light' | 'dark' || 'light');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  
  // Manage directory data with persistence
  const [directoryData, setDirectoryData] = useLocalStorage<DirectoryItem[]>('syariahos_directory_v2', INITIAL_DIRECTORY);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const kpiDataForAssistant = useMemo(() => 
    getKpiDataForPeriod(dateRange === 'all' ? null : parseInt(dateRange)), 
    [dateRange, isAssistantOpen]
  );
  const goalDataForAssistant = useMemo(() => 
    getGoalsDataForPeriod(dateRange === 'all' ? null : parseInt(dateRange)),
    [dateRange, isAssistantOpen]
  );

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const renderView = () => {
    switch (view) {
      case 'landing':
        return <LandingPage onEnter={() => setView('login')} />;
      case 'login':
        return <Auth type="login" setView={setView} />;
      case 'register':
        return <Auth type="register" setView={setView} />;
      case 'dashboard':
        return <Dashboard dateRange={dateRange} setDateRange={setDateRange} />;
      case 'tasks':
        return <TaskManager />;
      case 'tools':
        return <ToolsCatalog />;
      case 'generator':
        return <AIGenerator />;
      case 'settings':
        return <Settings toggleTheme={toggleTheme} theme={theme} setView={setView} />;
      case 'admin_dashboard':
        return <AdminDashboard />;
      case 'admin_users':
        return <AdminUserManager />;
      case 'admin_tools':
        return <AdminToolManager />;
      default:
        return <Dashboard dateRange={dateRange} setDateRange={setDateRange} />;
    }
  };

  const isAuthOrLanding = ['landing', 'login', 'register'].includes(view);

  if (isAuthOrLanding) {
    return (
      <div className={theme}>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
          {renderView()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans overflow-hidden">
      <Sidebar 
        view={view} 
        setView={setView} 
        isSidebarOpen={isSidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        onSelectItem={setSelectedDirectoryItem}
        directoryData={directoryData}
        setDirectoryData={setDirectoryData}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleTheme={toggleTheme} 
          theme={theme} 
          setSidebarOpen={setSidebarOpen}
          onOpenAssistant={() => setAssistantOpen(true)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
           {(view === 'dashboard' || view === 'admin_dashboard') && <WelcomeBanner isAdmin={view === 'admin_dashboard'} />}
           {renderView()}
        </main>
      </div>

      {isAssistantOpen && (
        <AIAssistant 
          onClose={() => setAssistantOpen(false)} 
          currentView={view}
          kpiData={view === 'dashboard' ? kpiDataForAssistant : undefined}
          goalData={view === 'dashboard' ? goalDataForAssistant : undefined}
        />
      )}
      {selectedDirectoryItem && (
        <DirectoryDetailModal 
          item={selectedDirectoryItem} 
          onClose={() => setSelectedDirectoryItem(null)} 
        />
      )}
    </div>
  );
};

const WelcomeBanner: React.FC<{ isAdmin?: boolean }> = ({ isAdmin }) => (
  <div className={`mb-8 p-8 rounded-2xl bg-gradient-to-r ${isAdmin ? 'from-indigo-600 to-indigo-500' : 'from-primary-600 to-secondary-500'} text-white shadow-xl border border-white/10`}>
    <div className="flex items-center space-x-5">
      <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
        <HomeIcon className="w-8 h-8"/>
      </div>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isAdmin ? 'Admin Control SyariahOS' : 'Selamat Datang di Manajemen Syariah OS'}
        </h1>
        <p className="mt-1 text-sm text-white/80 font-medium">
            {isAdmin ? 'Pusat kendali operasional, integritas sistem, dan manajemen ummat.' : 'Platform terpadu untuk wawasan, alat, dan monitoring manajemen berbasis Syariah.'}
        </p>
      </div>
    </div>
  </div>
);


export default App;
