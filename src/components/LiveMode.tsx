import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, Volume2, VolumeX, Bot, Zap, Sparkles, AlertCircle } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

interface LiveModeProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const LiveMode: React.FC<LiveModeProps> = ({ isOpen, onClose, isDarkMode }) => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueue = useRef<Int16Array[]>([]);
  const isPlaying = useRef(false);

  const startLiveSession = async () => {
    try {
      setStatus('connecting');
      setErrorMessage('');

      // Check for API key selection if needed for this model
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
          // Proceed assuming success as per guidance
        }
      }

      const apiKey = (process.env as any).API_KEY || process.env.GEMINI_API_KEY || "";
      const ai = new GoogleGenAI({ apiKey });
      
      // Setup Audio Context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are Arda AI in Live Mode. You are having a real-time voice conversation. Be concise, friendly, and helpful. Respond naturally and briefly.",
        },
        callbacks: {
          onopen: () => {
            console.log("Live session opened");
            setStatus('active');
            setIsActive(true);
            startMic();
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts[0]?.inlineData) {
              const base64Data = message.serverContent.modelTurn.parts[0].inlineData.data;
              const binaryString = atob(base64Data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const pcmData = new Int16Array(bytes.buffer);
              audioQueue.current.push(pcmData);
              if (!isPlaying.current) {
                playNextInQueue();
              }
            }
            
            if (message.serverContent?.interrupted) {
              console.log("Model interrupted");
              audioQueue.current = [];
              isPlaying.current = false;
            }
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setStatus('error');
            setErrorMessage(err.message || "An error occurred with the Live API.");
            if (err.message?.includes("Requested entity was not found")) {
              // Reset key selection if it failed
              if ((window as any).aistudio) (window as any).aistudio.openSelectKey();
            }
          },
          onclose: () => {
            console.log("Live session closed");
            stopLiveSession();
          }
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (error: any) {
      console.error("Failed to start live session:", error);
      setStatus('error');
      setErrorMessage(error.message || "Failed to initialize Live Mode.");
    }
  };

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const source = audioContextRef.current!.createMediaStreamSource(stream);
      const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMuted || !sessionRef.current) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        // Convert to Base64 safely
        let binary = '';
        const bytes = new Uint8Array(pcmData.buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binary);

        sessionRef.current.sendRealtimeInput({
          media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      };

      source.connect(processor);
      processor.connect(audioContextRef.current!.destination);
    } catch (error: any) {
      console.error("Mic error:", error);
      setStatus('error');
      setErrorMessage("Microphone access denied or failed.");
    }
  };

  const playNextInQueue = async () => {
    if (audioQueue.current.length === 0 || !audioContextRef.current) {
      isPlaying.current = false;
      return;
    }

    isPlaying.current = true;
    const pcmData = audioQueue.current.shift()!;
    const float32Data = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      float32Data[i] = pcmData[i] / 0x7FFF;
    }

    const buffer = audioContextRef.current.createBuffer(1, float32Data.length, 16000);
    buffer.getChannelData(0).set(float32Data);
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => playNextInQueue();
    source.start();
  };

  const stopLiveSession = () => {
    setIsActive(false);
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e) {}
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch(e) {}
      audioContextRef.current = null;
    }
    audioQueue.current = [];
    isPlaying.current = false;
    if (status !== 'error') setStatus('idle');
  };

  useEffect(() => {
    if (isOpen && status === 'idle') {
      startLiveSession();
    }
    return () => {
      stopLiveSession();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-2xl"
    >
      <div className="relative w-full max-w-2xl aspect-square md:aspect-video bg-[#0A0A0A] rounded-[3rem] border border-white/10 overflow-hidden flex flex-col items-center justify-center text-center p-8 shadow-2xl">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all text-white/60 hover:text-white z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Status Indicator */}
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            status === 'active' ? "bg-emerald-500" : status === 'connecting' ? "bg-amber-500" : "bg-red-500"
          )} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            {status === 'active' ? 'Neural Link Active' : status === 'connecting' ? 'Establishing Link...' : 'Link Severed'}
          </span>
        </div>

        {/* Main Visualizer */}
        <div className="relative mb-12">
          <motion.div
            animate={{ 
              scale: isActive ? [1, 1.3, 1] : 1,
              rotate: isActive ? [0, 180, 360] : 0
            }}
            transition={{ 
              scale: { repeat: Infinity, duration: 3 },
              rotate: { repeat: Infinity, duration: 15, ease: "linear" }
            }}
            className="w-40 h-40 md:w-56 md:h-56 rounded-full rainbow-bg opacity-20 blur-3xl absolute inset-0"
          />
          <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full rainbow-border flex items-center justify-center bg-[#0A0A0A] shadow-2xl">
            {status === 'error' ? (
              <AlertCircle className="w-20 h-20 md:w-28 h-28 text-red-500" />
            ) : (
              <Bot className={cn(
                "w-20 h-20 md:w-28 h-28 transition-all duration-500",
                isActive ? "text-white scale-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" : "text-white/20"
              )} />
            )}
          </div>
        </div>

        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
          {status === 'active' ? 'Arda is Listening' : status === 'error' ? 'Connection Failed' : 'Connecting to Arda'}
        </h2>
        
        <p className="text-white/40 text-lg max-w-md mb-12">
          {status === 'active' 
            ? "Speak naturally. Arda will respond in real-time." 
            : status === 'error'
            ? errorMessage || "Something went wrong. Please check your microphone and try again."
            : "Initializing neural pathways for real-time interaction..."}
        </p>

        {status === 'error' ? (
          <button 
            onClick={() => { setStatus('idle'); startLiveSession(); }}
            className="px-8 py-4 rounded-2xl rainbow-bg text-white font-bold hover:scale-105 transition-all"
          >
            Retry Connection
          </button>
        ) : (
          /* Controls */
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all",
                isMuted ? "bg-red-500 text-white" : "bg-white/5 text-white hover:bg-white/10"
              )}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            
            <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10">
              <Volume2 className="w-4 h-4 text-white/40" />
              <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ width: isActive ? ['20%', '80%', '40%', '90%', '30%'] : '0%' }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="h-full rainbow-bg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/20">
            <Zap className="w-3 h-3" />
            <span>Low Latency</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/20">
            <Sparkles className="w-3 h-3" />
            <span>Multimodal Live</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
