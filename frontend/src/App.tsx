import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import ToolsCatalog from '@/components/dashboard/ToolsCatalog';
import AIGenerator from '@/components/ai/AIGenerator';
import TaskManager from '@/components/dashboard/TaskManager';
import Header from '@/components/layout/Header';
import AIAssistant from '@/components/ai/AIAssistant';
import DirectoryDetailModal from '@/components/dashboard/DirectoryDetailModal';
import Settings from '@/components/pages/Settings';
import LandingPage from '@/components/pages/LandingPage';
import Auth from '@/components/auth/Auth';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminUserManager from '@/components/admin/AdminUserManager';
import AdminToolManager from '@/components/admin/AdminToolManager';
import { HomeIcon } from '@/components/common/Icons';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { directoryApi } from '@/lib/api-directory';
import type { DirectoryItem, View } from '@/types';


type DateRange = '7' | '30' | 'all';

// Loading spinner component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400 font-medium">Loading SyariahOS...</p>
    </div>
  </div>
);

// Main app content (requires auth context)
const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [view, setView] = useState<View>('landing');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAssistantOpen, setAssistantOpen] = useState(false);
  const [selectedDirectoryItem, setSelectedDirectoryItem] = useState<DirectoryItem | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Sync with user theme from backend, fallback to localStorage
    if (user?.theme) return user.theme;
    return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
  });
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const initialAuthCheckDone = useRef(false);

  // Directory data from API
  const [directoryData, setDirectoryData] = useState<DirectoryItem[]>([]);
  const [isDirectoryLoading, setIsDirectoryLoading] = useState(false);

  // Fetch directory data from API
  const fetchDirectoryData = useCallback(async () => {
    try {
      setIsDirectoryLoading(true);
      const data = await directoryApi.getAll();
      setDirectoryData(data);
    } catch (error) {
      console.error('Failed to fetch directory data:', error);
    } finally {
      setIsDirectoryLoading(false);
    }
  }, []);

  // Fetch directory data when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role !== 'admin') {
      fetchDirectoryData();
    }
  }, [isAuthenticated, user?.role, fetchDirectoryData]);

  // Sync theme with user preferences
  useEffect(() => {
    if (user?.theme && user.theme !== theme) {
      setTheme(user.theme);
    }
  }, [user?.theme]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // Handle authentication state changes - only redirect on initial auth check
  useEffect(() => {
    // Wait for initial auth check to complete
    if (isLoading) return;

    // Mark that initial auth check is done
    if (!initialAuthCheckDone.current) {
      initialAuthCheckDone.current = true;
      if (isAuthenticated && user) {
        // User is logged in - redirect to appropriate dashboard
        const defaultView = user.role === 'admin' ? 'admin_dashboard' : 'dashboard';
        setView(prev => {
          if (['landing', 'login', 'register'].includes(prev)) {
            return defaultView;
          }
          return prev;
        });
      }
      // If not authenticated, keep current view (landing by default)
      return;
    }

    // After initial check, handle auth changes
    if (isAuthenticated && user) {
      const defaultView = user.role === 'admin' ? 'admin_dashboard' : 'dashboard';
      setView(prev => {
        if (['landing', 'login', 'register'].includes(prev)) {
          return defaultView;
        }
        return prev;
      });
    }
  }, [isAuthenticated, isLoading, user]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = async () => {
    await logout();
    setView('landing');
  };

  // Show loading screen ONLY during initial auth check
  if (isLoading && !initialAuthCheckDone.current) {
    return <LoadingScreen />;
  }

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
        return <Settings toggleTheme={toggleTheme} theme={theme} setView={setView} onLogout={handleLogout} />;
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
    <div className={`${theme} flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans overflow-hidden`}>
      <Sidebar
        view={view}
        setView={setView}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onSelectItem={setSelectedDirectoryItem}
        directoryData={directoryData}
        setDirectoryData={setDirectoryData}
        isDirectoryLoading={isDirectoryLoading}
        onRefreshDirectory={fetchDirectoryData}
        userRole={user?.role}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          toggleTheme={toggleTheme}
          theme={theme}
          setSidebarOpen={setSidebarOpen}
          onOpenAssistant={() => setAssistantOpen(true)}
          user={user}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
           {(view === 'dashboard' || view === 'admin_dashboard') && (
             <WelcomeBanner isAdmin={view === 'admin_dashboard'} userName={user?.name} />
           )}
           {renderView()}
        </main>
      </div>

      {isAssistantOpen && (
        <AIAssistant
          onClose={() => setAssistantOpen(false)}
          currentView={view}
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

const WelcomeBanner: React.FC<{ isAdmin?: boolean; userName?: string }> = ({ isAdmin, userName }) => (
  <div className={`mb-8 p-8 rounded-2xl bg-gradient-to-r ${isAdmin ? 'from-indigo-600 to-indigo-500' : 'from-primary-600 to-secondary-500'} text-white shadow-xl border border-white/10`}>
    <div className="flex items-center space-x-5">
      <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
        <HomeIcon className="w-8 h-8"/>
      </div>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isAdmin ? 'Admin Control SyariahOS' : `Selamat Datang${userName ? `, ${userName}` : ''}`}
        </h1>
        <p className="mt-1 text-sm text-white/80 font-medium">
            {isAdmin ? 'Pusat kendali operasional, integritas sistem, dan manajemen ummat.' : 'Platform terpadu untuk wawasan, alat, dan monitoring manajemen berbasis Syariah.'}
        </p>
      </div>
    </div>
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// App wrapper with AuthProvider
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
