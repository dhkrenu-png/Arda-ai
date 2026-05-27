import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Moon, Sun, Monitor, Shield, Zap, Bell, User, Globe, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onClearHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  toggleDarkMode,
  onClearHistory
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold dark:text-white tracking-tight">Settings</h2>
            <p className="text-sm text-black/40 dark:text-white/40 font-medium">Manage your Arda experience</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
          {/* Appearance */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Monitor className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Appearance</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => !isDarkMode && toggleDarkMode()}
                className={cn(
                  "flex flex-col items-center gap-4 p-6 rounded-3xl border transition-all",
                  isDarkMode 
                    ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-500" 
                    : "bg-black/5 dark:bg-white/5 border-transparent text-black/40 dark:text-white/40 hover:bg-black/10 dark:hover:bg-white/10"
                )}
              >
                <Moon className="w-8 h-8" />
                <span className="font-bold">Dark Mode</span>
              </button>
              <button
                onClick={() => isDarkMode && toggleDarkMode()}
                className={cn(
                  "flex flex-col items-center gap-4 p-6 rounded-3xl border transition-all",
                  !isDarkMode 
                    ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-500" 
                    : "bg-black/5 dark:bg-white/5 border-transparent text-black/40 dark:text-white/40 hover:bg-black/10 dark:hover:bg-white/10"
                )}
              >
                <Sun className="w-8 h-8" />
                <span className="font-bold">Light Mode</span>
              </button>
            </div>
          </section>

          {/* Account & Privacy */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Account & Privacy</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 rounded-3xl bg-black/5 dark:bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-bold dark:text-white">Clear History</p>
                    <p className="text-xs text-black/40 dark:text-white/40">Delete all your conversations</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (confirm("Are you sure you want to clear all history?")) {
                      onClearHistory();
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm hover:bg-red-500/20 transition-all"
                >
                  Clear All
                </button>
              </div>
            </div>
          </section>

          {/* System Info */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-black/40 dark:text-white/40">System</h3>
            </div>
            <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-black/60 dark:text-white/60 font-medium">Model Version</span>
                <span className="font-bold dark:text-white">Arda v3.1 Pro</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-black/60 dark:text-white/60 font-medium">Latency</span>
                <span className="font-bold text-emerald-500">Optimized</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-black/60 dark:text-white/60 font-medium">Neural Link</span>
                <span className="font-bold text-indigo-500">Encrypted</span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-black/5 dark:border-white/5 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-2xl rainbow-bg text-white font-bold hover:scale-105 transition-all"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
