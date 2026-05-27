import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, Image as ImageIcon, X, Paperclip, Globe, Zap, Sparkles, StopCircle, Brain } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputAreaProps {
  onSend: (text: string, images?: string[]) => void;
  isLoading: boolean;
  activeTool: string;
  useSearch: boolean;
  setUseSearch: (val: boolean) => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ 
  onSend, 
  isLoading, 
  activeTool,
  useSearch,
  setUseSearch
}) => {
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': [] },
    noClick: true
  });

  const handleSend = () => {
    if ((input.trim() || images.length > 0) && !isLoading) {
      onSend(input, images);
      setInput('');
      setImages([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Voice Recognition (Basic implementation)
  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + ' ' + transcript);
    };
    recognition.start();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div 
        {...getRootProps()}
        className={cn(
          "relative flex flex-col bg-white dark:bg-[#121212] rounded-2xl border transition-all duration-200 shadow-xl shadow-black/5",
          isDragActive ? "rainbow-border ring-4 ring-indigo-500/10" : "border-black/10 dark:border-white/10",
          isLoading && "opacity-80"
        )}
      >
        <input {...getInputProps()} />

        {/* Image Previews */}
        <AnimatePresence>
          {images.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex gap-2 p-3 border-b border-black/5 dark:border-white/5 overflow-x-auto"
            >
              {images.map((img, i) => (
                <div key={i} className="relative group flex-shrink-0">
                  <img src={img} className="w-16 h-16 rounded-lg object-cover border border-black/10 dark:border-white/10" />
                  <button 
                    onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="flex items-end gap-2 p-3">
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all text-black/40 dark:text-white/40 hover:text-indigo-500"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeTool === 'image' ? "Describe the image you want to create..." : "Ask Arda anything..."}
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 text-sm md:text-base dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 max-h-60"
          />

          <div className="flex items-center gap-1">
            <button 
              onClick={() => setUseSearch(!useSearch)}
              className={cn(
                "p-2 rounded-xl transition-all flex items-center gap-2",
                useSearch 
                  ? "bg-sky-500/10 text-sky-500" 
                  : "text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5"
              )}
              title="Search Grounding"
            >
              <Globe className="w-5 h-5" />
              {useSearch && <span className="text-[10px] font-bold uppercase tracking-wider hidden md:inline">Search On</span>}
            </button>

            <button 
              onClick={isRecording ? () => {} : startRecording}
              className={cn(
                "p-2 rounded-xl transition-all",
                isRecording 
                  ? "bg-red-500 text-white animate-pulse" 
                  : "text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 hover:text-indigo-500"
              )}
            >
              {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={handleSend}
              disabled={(!input.trim() && images.length === 0) || isLoading}
              className={cn(
                "p-2 rounded-xl transition-all shadow-lg",
                (input.trim() || images.length > 0) && !isLoading
                  ? "rainbow-bg text-white shadow-indigo-500/20"
                  : "bg-black/5 dark:bg-white/5 text-black/20 dark:text-white/20 shadow-none"
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-black/30 dark:text-white/30 font-medium uppercase tracking-widest">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3" />
          <span>Ultra Fast</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Brain className="w-3 h-3" />
          <span>Reasoning Engine</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          <span>Creative Suite</span>
        </div>
      </div>
    </div>
  );
};
