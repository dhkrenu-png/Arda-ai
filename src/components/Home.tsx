import React from 'react';
import { motion } from 'motion/react';
import { Bot, Zap, Sparkles, Brain, Lightbulb, ChevronRight, Globe, Code, Mic, Video, Image as ImageIcon, Briefcase, BookOpen, Laptop, User } from 'lucide-react';
import { TOOLS } from '../constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HomeProps {
  onStart: () => void;
  onLive: () => void;
}

export const Home: React.FC<HomeProps> = ({ onStart, onLive }) => {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-white dark:bg-[#0A0A0A]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-32 text-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] rainbow-bg flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-12 relative"
        >
          <Bot className="w-12 h-12 md:w-16 md:h-16 text-white" />
          <div className="absolute -inset-4 rainbow-bg opacity-20 blur-2xl rounded-full animate-pulse" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-6xl md:text-8xl font-bold tracking-tighter dark:text-white mb-6"
        >
          Meet <span className="rainbow-text">Arda</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-xl md:text-2xl text-black/60 dark:text-white/60 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          The world's most powerful AI assistant. Smarter, faster, and more capable than ever before.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={onStart}
            className="px-8 py-4 rounded-2xl rainbow-bg text-white font-bold text-lg shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all flex items-center gap-2"
          >
            Start Conversing <ChevronRight className="w-5 h-5" />
          </button>
          <button 
            onClick={onLive}
            className="px-8 py-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 font-bold text-lg hover:bg-red-500/20 transition-all flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Go Live Mode
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16"
        >
          {[
            { label: "Processing Speed", value: "Sub-100ms" },
            { label: "Knowledge Base", value: "Real-time" },
            { label: "Reasoning Level", value: "Expert+" },
            { label: "Capabilities", value: "All-in-one" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl md:text-3xl font-bold dark:text-white mb-1">{stat.value}</p>
              <p className="text-xs uppercase tracking-widest font-bold text-black/40 dark:text-white/40">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-32 bg-black/[0.02] dark:bg-white/[0.02] border-y border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight dark:text-white mb-4">One Platform. Infinite Possibilities.</h2>
            <p className="text-black/40 dark:text-white/40 text-lg">Everything you need to learn, create, and build.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOOLS.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group p-8 rounded-3xl bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 hover:border-indigo-500/50 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-indigo-500/5"
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3",
                  tool.gradient
                )}>
                  <tool.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold dark:text-white mb-2">{tool.name}</h3>
                <p className="text-black/60 dark:text-white/60 leading-relaxed mb-6">{tool.description}</p>
                <div className="flex items-center text-indigo-500 font-bold text-sm">
                  Explore Tool <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Capabilities */}
      <section className="px-4 py-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-6">
              <Brain className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Reasoning Engine</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight dark:text-white mb-8 leading-tight">
              Smarter than your average <span className="rainbow-text">Intelligence.</span>
            </h2>
            <p className="text-lg text-black/60 dark:text-white/60 mb-10 leading-relaxed">
              Arda isn't just a chatbot. It's a sophisticated reasoning engine capable of solving complex architectural problems, debugging multi-threaded applications, and explaining quantum physics to a five-year-old.
            </p>
            <ul className="space-y-4">
              {[
                "Advanced mathematical problem solving",
                "Deep code analysis and refactoring",
                "Strategic business planning",
                "Personalized learning paths"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-black/80 dark:text-white/80 font-medium">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-[3rem] rainbow-bg opacity-10 absolute -inset-10 blur-3xl" />
            <div className="relative p-8 rounded-[3rem] bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 shadow-2xl">
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-4 h-4 text-black/40 dark:text-white/40" />
                    <span className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40">User</span>
                  </div>
                  <p className="text-sm dark:text-white">Explain the concept of recursion using a pizza analogy.</p>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Bot className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">Arda</span>
                  </div>
                  <p className="text-sm dark:text-white leading-relaxed">
                    Imagine you're eating a giant pizza. To finish it, you take a bite. After that bite, you're still faced with the same problem: eating a pizza, just a slightly smaller one. You keep repeating the "take a bite" action until the pizza is gone (your base case).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-20 border-t border-black/5 dark:border-white/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl rainbow-bg flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight dark:text-white rainbow-text">Arda</span>
        </div>
        <p className="text-black/40 dark:text-white/40 text-sm mb-8">© 2026 Arda AI. All rights reserved.</p>
        <div className="flex items-center justify-center gap-6">
          <a href="#" className="text-sm font-bold text-black/60 dark:text-white/60 hover:text-indigo-500 transition-colors">Privacy</a>
          <a href="#" className="text-sm font-bold text-black/60 dark:text-white/60 hover:text-indigo-500 transition-colors">Terms</a>
          <a href="#" className="text-sm font-bold text-black/60 dark:text-white/60 hover:text-indigo-500 transition-colors">Twitter</a>
          <a href="#" className="text-sm font-bold text-black/60 dark:text-white/60 hover:text-indigo-500 transition-colors">Discord</a>
        </div>
      </footer>
    </div>
  );
};
