import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  GalleryVerticalEnd, 
  BarChart2, 
  Settings, 
  FileText, 
  User, 
  Moon,
  Sun,
  Menu,
  Box,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const NavItem = ({ view, icon: Icon, label, activeMatches }: { view: ViewState; icon: any; label: string; activeMatches?: ViewState[] }) => {
    const isActive = currentView === view || (activeMatches && activeMatches.includes(currentView));
    return (
      <button
        onClick={() => onChangeView(view)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
          ${isActive
            ? 'bg-neutral-800 text-white dark:bg-neutral-100 dark:text-black shadow-md' 
            : 'text-neutral-400 hover:text-white hover:bg-neutral-900 dark:text-neutral-500 dark:hover:text-black dark:hover:bg-neutral-100'
          }
        `}
      >
        <Icon size={20} strokeWidth={2} />
        {!isSidebarCollapsed && <span>{label}</span>}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-black overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarCollapsed ? 'w-20' : 'w-72'} 
          bg-black dark:bg-black border-r border-neutral-800 dark:border-neutral-800
          flex flex-col transition-all duration-300 relative z-20 flex-shrink-0`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-800">
          <div className="flex items-center gap-3 text-white overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center flex-shrink-0">
              <Box size={20} strokeWidth={3} />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-3 whitespace-nowrap">
                <span className="font-bold text-lg tracking-tight">Labeling Prompt Eval</span>
              </div>
            )}
          </div>
          {!isSidebarCollapsed && (
             <button onClick={() => setIsSidebarCollapsed(true)} className="text-neutral-500 hover:text-white">
                <PanelLeftClose size={18} />
             </button>
          )}
        </div>
        
        {isSidebarCollapsed && (
            <div className="flex justify-center py-4 border-b border-neutral-800">
                 <button onClick={() => setIsSidebarCollapsed(false)} className="text-neutral-500 hover:text-white">
                    <PanelLeftOpen size={20} />
                 </button>
            </div>
        )}

        {/* Navigation */}
        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <NavItem 
            view="projects" 
            icon={LayoutDashboard} 
            label="Projects" 
            activeMatches={['projects', 'project-evaluations', 'evaluation-detail', 'new-project-wizard', 'new-evaluation-wizard']}
          />
          <NavItem view="datasets" icon={Database} label="Datasets" />
          <NavItem view="gallery" icon={GalleryVerticalEnd} label="Evaluator Gallery" />
          <NavItem view="analytics" icon={BarChart2} label="Analytics" />
          
          <div className="pt-8 pb-2">
            {!isSidebarCollapsed && <p className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">System</p>}
            <NavItem view="settings" icon={Settings} label="Settings" />
          </div>
        </div>

        {/* Footer / User */}
        <div className="p-4 border-t border-neutral-800 space-y-4">
          <button 
            onClick={() => onChangeView('documentation')}
            className={`flex items-center gap-3 w-full p-2 rounded-lg hover:bg-neutral-900 transition-colors
                ${currentView === 'documentation' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}
            `}
          >
            <FileText size={20} />
            {!isSidebarCollapsed && <span className="text-sm font-medium">Documentation</span>}
          </button>

          <div className="flex items-center justify-between mt-2">
             <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 flex-shrink-0">
                  <User size={16} />
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-sm font-medium text-white truncate max-w-[120px]">
                    user@example.com
                  </span>
                )}
             </div>
             {!isSidebarCollapsed && (
                <button onClick={toggleTheme} className="text-neutral-500 hover:text-white">
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
             )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-neutral-50 dark:bg-black relative overflow-hidden">
         {children}
      </main>
    </div>
  );
};