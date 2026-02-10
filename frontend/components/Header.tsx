
import React from 'react';
import { SunIcon, MoonIcon, MenuIcon, ChatBubbleLeftRightIcon, DashboardIcon } from './Icons';

interface HeaderProps {
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  setSidebarOpen: (isOpen: boolean) => void;
  onOpenAssistant: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleTheme, theme, setSidebarOpen, onOpenAssistant }) => {
  return (
    <header className="flex-shrink-0 bg-white dark:bg-gray-800 shadow-md z-20">
      <div className="flex items-center justify-between p-4 h-16">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          
          {/* Logo & Brand - Mobile */}
          <div className="flex items-center ml-2 lg:hidden">
            <div className="p-1 bg-primary-600 rounded mr-2">
                <DashboardIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white truncate">SyariahOS</span>
          </div>

          {/* Title - Desktop */}
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 ml-4 lg:ml-0 hidden lg:block">
            Manajemen Syariah OS
          </h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={onOpenAssistant}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
            aria-label="Open AI Assistant"
          >
            <ChatBubbleLeftRightIcon className="h-6 w-6" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
          </button>
          <div className="relative pl-2 sm:pl-0">
            <button className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition">
              <img
                className="h-8 w-8 rounded-full object-cover"
                src="https://picsum.photos/100"
                alt="User"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
