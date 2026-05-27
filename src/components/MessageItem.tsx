import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { User, Bot, Download, Play, Pause, Volume2, Image as ImageIcon, Video as VideoIcon, Code, Terminal } from 'lucide-react';
import { Message } from '../constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MessageItemProps {
  message: Message;
  isDarkMode: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isDarkMode }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full gap-4 py-8 px-4 md:px-8",
        isUser ? "bg-transparent" : "bg-black/[0.02] dark:bg-white/[0.02]"
      )}
    >
      <div className="flex-shrink-0">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm",
          isUser 
            ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400" 
            : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
        )}>
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40">
            {isUser ? 'You' : 'Arda'}
          </span>
          <span className="text-[10px] text-black/20 dark:text-white/20">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className={cn(
          "prose prose-sm max-w-none dark:prose-invert",
          "prose-headings:font-bold prose-headings:tracking-tight",
          "prose-p:leading-relaxed prose-p:text-black/80 dark:prose-p:text-white/80",
          "prose-code:bg-black/5 dark:prose-code:bg-white/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none",
          "prose-pre:bg-[#0D0D0D] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:p-4"
        )}>
          {message.content && <ReactMarkdown>{message.content}</ReactMarkdown>}
          
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-500 animate-pulse align-middle" />
          )}
        </div>

        {/* Media Content */}
        {message.mediaUrl && (
          <div className="mt-4 rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 shadow-2xl shadow-black/10">
            {message.type === 'image' && (
              <div className="relative group">
                <img 
                  src={message.mediaUrl} 
                  alt="Generated content" 
                  className="w-full h-auto object-cover max-h-[600px]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <a 
                    href={message.mediaUrl} 
                    download="arda-image.png"
                    className="p-3 bg-white rounded-full text-black hover:scale-110 transition-transform"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              </div>
            )}
            {message.type === 'video' && (
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <video 
                  src={message.mediaUrl} 
                  controls 
                  className="w-full h-full"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
