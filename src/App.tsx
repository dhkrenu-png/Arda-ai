import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { InputArea } from './components/InputArea';
import { Home } from './components/Home';
import { LiveMode } from './components/LiveMode';
import { SettingsModal } from './components/SettingsModal';
import { ToolType, ChatSession, Message } from './constants';
import { chatWithArda, generateImage, generateVideo, pollVideo, textToSpeech, fetchVideoBlob, playAudio, ChatMessage } from './services/gemini';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolType>('chat');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [useSearch, setUseSearch] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const [isLiveModeOpen, setIsLiveModeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('arda_sessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) {
        setActiveSessionId(parsed[0].id);
        setActiveTool(parsed[0].tool);
        setShowHome(false);
      }
    } else {
      // Don't create session automatically, show home
      setShowHome(true);
    }

    const savedTheme = localStorage.getItem('arda_theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('arda_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('arda_theme', isDarkMode ? 'dark' : 'light');
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      tool: activeTool,
      messages: [],
      createdAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setShowHome(false);
  };

  const deleteSession = (id: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (activeSessionId === id) {
        if (filtered.length > 0) {
          setActiveSessionId(filtered[0].id);
        } else {
          setActiveSessionId(null);
        }
      }
      return filtered;
    });
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const handleSend = async (text: string, images?: string[]) => {
    if (!activeSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      type: 'text'
    };

    // Update session with user message
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        const newMessages = [...s.messages, userMessage];
        return { 
          ...s, 
          messages: newMessages,
          title: s.messages.length === 0 ? (text.slice(0, 30) || 'Image Generation') : s.title
        };
      }
      return s;
    }));

    setIsLoading(true);
    
    // Check for API key if using paid models
    if (activeTool === 'image' || activeTool === 'video') {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
        }
      }
    }

    try {
      if (activeTool === 'image') {
        const imageUrl = await generateImage(text);
        if (imageUrl) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `I've generated an image based on your prompt: "${text}"`,
            timestamp: Date.now(),
            type: 'image',
            mediaUrl: imageUrl
          };
          addAssistantMessage(assistantMessage);
        }
      } else if (activeTool === 'video') {
        const operation = await generateVideo(text);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I'm generating a video for you. This might take a minute...`,
          timestamp: Date.now(),
          type: 'video',
          isStreaming: true
        };
        addAssistantMessage(assistantMessage);

        // Polling for video
        let done = false;
        let currentOp = operation;
        while (!done) {
          await new Promise(r => setTimeout(r, 10000));
          currentOp = await pollVideo(currentOp);
          if (currentOp.done) {
            done = true;
            const videoUrl = currentOp.response?.generatedVideos?.[0]?.video?.uri;
            if (videoUrl) {
              try {
                const localUrl = await fetchVideoBlob(videoUrl);
                updateAssistantMessage(assistantMessage.id, {
                  content: `Your video is ready!`,
                  mediaUrl: localUrl,
                  isStreaming: false
                });
              } catch (err) {
                console.error("Error fetching video blob:", err);
                updateAssistantMessage(assistantMessage.id, {
                  content: `Your video was generated, but I couldn't download it. You can try viewing it here: ${videoUrl}`,
                  isStreaming: false
                });
              }
            }
          }
        }
      } else {
        // Standard Chat / Code / Research
        const chatMessages: ChatMessage[] = activeSession?.messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })) || [];
        
        // Add current images if any
        const currentParts: any[] = [{ text }];
        if (images && images.length > 0) {
          images.forEach(img => {
            const [mime, data] = img.split(';base64,');
            currentParts.push({
              inlineData: {
                mimeType: mime.split(':')[1],
                data: data
              }
            });
          });
        }
        
        chatMessages.push({ role: 'user', parts: currentParts });

        const response = await chatWithArda(chatMessages, useSearch || activeTool === 'research');
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.text || "I'm sorry, I couldn't generate a response.",
          timestamp: Date.now(),
          type: 'text'
        };
        addAssistantMessage(assistantMessage);

        // If voice mode, speak the response
        if (activeTool === 'voice' && response.text) {
          const audioData = await textToSpeech(response.text.slice(0, 200)); // Limit for speed
          if (audioData) {
            await playAudio(audioData);
          }
        }
      }
    } catch (error) {
      console.error(error);
      addAssistantMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "An error occurred while processing your request. Please try again.",
        timestamp: Date.now()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addAssistantMessage = (msg: Message) => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, messages: [...s.messages, msg] };
      }
      return s;
    }));
  };

  const updateAssistantMessage = (id: string, updates: Partial<Message>) => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: s.messages.map(m => m.id === id ? { ...m, ...updates } : m)
        };
      }
      return s;
    }));
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#0A0A0A] text-black dark:text-white overflow-hidden font-sans selection:bg-indigo-500/30">
      <Sidebar 
        activeTool={activeTool}
        setActiveTool={(tool) => {
          if (tool === 'live') {
            setIsLiveModeOpen(true);
            return;
          }
          setActiveTool(tool);
          if (activeSession && activeSession.messages.length === 0) {
            setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, tool } : s));
          } else {
            createNewSession();
          }
        }}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        setActiveSessionId={(id) => {
          setActiveSessionId(id);
          setShowHome(false);
        }}
        createNewSession={createNewSession}
        deleteSession={deleteSession}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onHomeClick={() => setShowHome(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 flex flex-col min-w-0 relative">
        <AnimatePresence mode="wait">
          {showHome ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <Home 
                onStart={createNewSession} 
                onLive={() => setIsLiveModeOpen(true)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <ChatArea 
                messages={activeSession?.messages || []} 
                isDarkMode={isDarkMode}
                activeTool={activeTool}
                setIsOpen={setIsSidebarOpen}
                onLiveClick={() => setIsLiveModeOpen(true)}
              />
              
              <div className="bg-gradient-to-t from-white dark:from-[#0A0A0A] via-white/80 dark:via-[#0A0A0A]/80 to-transparent pt-10">
                <InputArea 
                  onSend={handleSend} 
                  isLoading={isLoading} 
                  activeTool={activeTool}
                  useSearch={useSearch}
                  setUseSearch={setUseSearch}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isLiveModeOpen && (
          <LiveMode 
            isOpen={isLiveModeOpen} 
            onClose={() => setIsLiveModeOpen(false)} 
            isDarkMode={isDarkMode} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            isDarkMode={isDarkMode}
            toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onClearHistory={() => {
              setSessions([]);
              setActiveSessionId(null);
              setShowHome(true);
              setIsSettingsOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
