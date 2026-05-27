import { LucideIcon, MessageSquare, Image as ImageIcon, Video, Code, Search, Mic, Settings, BookOpen, Briefcase, Sparkles, User, Bot, Send, Plus, Trash2, Moon, Sun, Menu, X, ChevronRight, Download, Play, Pause, Volume2, Globe, Laptop, Zap, Brain, Lightbulb } from "lucide-react";

export type ToolType = "chat" | "image" | "video" | "code" | "research" | "voice" | "live" | "tutor" | "business" | "content" | "productivity";

export interface Tool {
  id: ToolType;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
  gradient: string;
}

export const TOOLS: Tool[] = [
  { id: "chat", name: "Conversation", icon: MessageSquare, description: "Natural human dialogue", color: "red", gradient: "from-red-500 to-orange-500" },
  { id: "live", name: "Live Mode", icon: Zap, description: "Real-time voice interaction", color: "orange", gradient: "from-orange-500 to-yellow-500" },
  { id: "image", name: "Image Gen", icon: ImageIcon, description: "Create stunning visuals", color: "yellow", gradient: "from-yellow-400 to-green-500" },
  { id: "video", name: "Video Gen", icon: Video, description: "Generate cinematic videos", color: "green", gradient: "from-green-500 to-blue-500" },
  { id: "code", name: "Coding", icon: Code, description: "Advanced software engineering", color: "blue", gradient: "from-blue-500 to-indigo-500" },
  { id: "research", name: "Research", icon: Search, description: "Real-time internet knowledge", color: "indigo", gradient: "from-indigo-500 to-violet-500" },
  { id: "voice", name: "Voice", icon: Mic, description: "Natural voice interaction", color: "violet", gradient: "from-violet-500 to-purple-500" },
  { id: "tutor", name: "Tutoring", icon: BookOpen, description: "Personal learning system", color: "purple", gradient: "from-purple-500 to-pink-500" },
  { id: "business", name: "Business", icon: Briefcase, description: "Marketing & strategy assistant", color: "pink", gradient: "from-pink-500 to-rose-500" },
  { id: "content", name: "Content", icon: Sparkles, description: "YouTube & social media scripts", color: "rose", gradient: "from-rose-500 to-red-500" },
  { id: "productivity", name: "Productivity", icon: Laptop, description: "Planning & reminders", color: "red", gradient: "from-red-500 to-orange-500" },
];

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  type?: "text" | "image" | "video" | "code";
  mediaUrl?: string;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  tool: ToolType;
  messages: Message[];
  createdAt: number;
}
