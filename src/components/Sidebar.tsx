import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TOOLS, Tool, ToolType } from '../constants';
import { Menu, X, Plus, Trash2, Settings, Moon, Sun, ChevronRight, Bot, MessageSquare } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  sessions: any[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string) => void;
  createNewSession: () => void;
  deleteSession: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onHomeClick: () => void;
  onSettingsClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTool,
  setActiveTool,
  isDarkMode,
  toggleDarkMode,
  sessions,
  activeSessionId,
  setActiveSessionId,
  createNewSession,
  deleteSession,
  isOpen,
  setIsOpen,
  onHomeClick,
  onSettingsClick
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen ? 0 : -300,
          width: isOpen ? 280 : 0
        }}
        className={cn(
          "fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out",
          "bg-white dark:bg-[#0A0A0A] border-r border-black/5 dark:border-white/5",
          !isOpen && "pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={onHomeClick}
          >
            <div className="w-8 h-8 rounded-lg rainbow-bg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight dark:text-white rainbow-text">Arda</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5 dark:text-white" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-4 mb-4">
          <button
            onClick={createNewSession}
            className="w-full flex items-center gap-2 p-3 rounded-xl rainbow-bg text-white hover:opacity-90 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium text-sm">New Session</span>
          </button>
        </div>

        {/* Tools Section */}
        <div className="px-2 mb-4 overflow-y-auto flex-shrink-0 max-h-[40%] scrollbar-hide">
          <p className="px-3 mb-2 text-[10px] uppercase tracking-widest font-bold text-black/40 dark:text-white/40">Tools</p>
          <div className="space-y-1">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm group",
                  activeTool === tool.id 
                    ? "bg-black/5 dark:bg-white/5 text-black dark:text-white" 
                    : "text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center bg-gradient-to-br shadow-sm",
                  tool.gradient
                )}>
                  <tool.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">{tool.name}</p>
                </div>
                {activeTool === tool.id && <ChevronRight className="w-4 h-4 opacity-50" />}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="flex-1 px-2 overflow-y-auto scrollbar-hide border-t border-black/5 dark:border-white/5 pt-4">
          <p className="px-3 mb-2 text-[10px] uppercase tracking-widest font-bold text-black/40 dark:text-white/40">Recent</p>
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-sm",
                  activeSessionId === session.id 
                    ? "bg-black/5 dark:bg-white/5 text-black dark:text-white" 
                    : "text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5"
                )}
                onClick={() => setActiveSessionId(session.id)}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-50" />
                <span className="flex-1 truncate font-medium">{session.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/5 dark:border-white/5 space-y-2">
          <button 
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-sm text-black/60 dark:text-white/60 transition-all"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button 
            onClick={onSettingsClick}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-sm text-black/60 dark:text-white/60 transition-all"
          >
            <Settings className="w-4 h-4" />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};
