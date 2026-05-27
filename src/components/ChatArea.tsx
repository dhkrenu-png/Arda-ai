import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageItem } from './MessageItem';
import { Message, ToolType, TOOLS } from '../constants';
import { Bot, Sparkles, Zap, Brain, Lightbulb, ChevronRight, Menu } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatAreaProps {
  messages: Message[];
  isDarkMode: boolean;
  activeTool: ToolType;
  setIsOpen: (val: boolean) => void;
  onLiveClick: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, isDarkMode, activeTool, setIsOpen, onLiveClick }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentTool = TOOLS.find(t => t.id === activeTool);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg lg:hidden"
          >
            <Menu className="w-5 h-5 dark:text-white" />
          </button>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-sm",
              currentTool?.gradient
            )}>
              {currentTool && <currentTool.icon className="w-4 h-4 text-white" />}
            </div>
            <div>
              <h2 className="text-sm font-bold dark:text-white tracking-tight">{currentTool?.name}</h2>
              <p className="text-[10px] text-black/40 dark:text-white/40 font-medium uppercase tracking-widest">{currentTool?.description}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onLiveClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all group"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Go Live</span>
          </button>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider">System Online</span>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Zap className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">v3.1 Pro</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-hide"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-3xl rainbow-bg flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-8"
            >
              <Bot className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight dark:text-white mb-4">
              I am <span className="rainbow-text">Arda</span>
            </h1>
            <p className="text-black/40 dark:text-white/40 text-lg mb-12">
              The world's most powerful AI assistant. How can I help you today?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {[
                { icon: Brain, title: "Advanced Reasoning", desc: "Complex problem solving & logic" },
                { icon: Sparkles, title: "Creative Suite", desc: "Image & video generation" },
                { icon: Zap, title: "Ultra Fast", desc: "Real-time responses & search" },
                { icon: Lightbulb, title: "Expert Knowledge", desc: "Tutoring, business & coding" }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] text-left hover:border-indigo-500/50 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-black shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-5 h-5 text-indigo-500" />
                  </div>
                  <h3 className="font-bold text-sm dark:text-white mb-1">{feature.title}</h3>
                  <p className="text-xs text-black/40 dark:text-white/40">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full">
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} isDarkMode={isDarkMode} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
