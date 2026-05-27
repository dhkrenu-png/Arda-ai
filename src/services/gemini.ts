import { GoogleGenAI, Modality, Type, GenerateContentResponse, ThinkingLevel } from "@google/genai";

const getApiKey = () => (process.env as any).API_KEY || process.env.GEMINI_API_KEY || "";

export const getAI = () => new GoogleGenAI({ apiKey: getApiKey() });

export type MessageRole = "user" | "model" | "system";

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface ChatMessage {
  role: MessageRole;
  parts: MessagePart[];
}

export const MODELS = {
  CHAT: "gemini-3.1-pro-preview",
  FLASH: "gemini-3-flash-preview",
  IMAGE: "gemini-3.1-flash-image-preview",
  VIDEO: "veo-3.1-fast-generate-preview",
  TTS: "gemini-2.5-flash-preview-tts",
};

export const SYSTEM_INSTRUCTION = `You are an advanced AI assistant similar to ChatGPT. 
Your name is ARDA AI.

Your abilities:
- Answer any question clearly and accurately.
- Explain complex topics in simple language.
- Help with coding, writing, education, business, and creative ideas.
- Give step-by-step guidance when solving problems.
- Be friendly, intelligent, and professional.

Rules:
1. Always give helpful, detailed, and easy-to-understand answers.
2. If the user asks something complicated, break it into simple steps.
3. Provide examples when possible.
4. If the user asks for creative work (stories, scripts, prompts, ideas), generate original high-quality content.
5. If information is unclear, ask a clarifying question.
6. Be polite and supportive in every response.

Capabilities:
- Programming help (HTML, CSS, JavaScript, Python, Node.js).
- AI prompt creation for tools like Sora, Veo, and image generators.
- YouTube growth tips and content ideas.
- Business and marketing strategies.
- Educational explanations for students.

Your goal:
Help the user solve problems, learn new things, and create amazing projects quickly.`;

export async function chatWithArda(messages: ChatMessage[], useSearch = false) {
  const ai = getAI();
  const config: any = {
    systemInstruction: SYSTEM_INSTRUCTION,
    thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
  };

  if (useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  const response = await ai.models.generateContent({
    model: MODELS.CHAT,
    contents: messages.map(m => ({
      role: m.role === "system" ? "user" : m.role, // Gemini uses user/model
      parts: m.parts
    })),
    config
  });

  return response;
}

export async function generateImage(prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "1:1") {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODELS.IMAGE,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      imageConfig: {
        aspectRatio,
        imageSize: "1K"
      }
    }
  });

  const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (imagePart?.inlineData) {
    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  }
  return null;
}

export async function generateVideo(prompt: string, aspectRatio: "16:9" | "9:16" = "16:9") {
  const ai = getAI();
  const operation = await ai.models.generateVideos({
    model: MODELS.VIDEO,
    prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio
    }
  });

  return operation;
}

export async function fetchVideoBlob(url: string) {
  const apiKey = getApiKey();
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-goog-api-key': apiKey,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch video');
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function pollVideo(operationId: any) {
  const ai = getAI();
  const operation = await ai.operations.getVideosOperation({ operation: operationId });
  return operation;
}

export async function textToSpeech(text: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODELS.TTS,
    contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
}

export async function playAudio(base64Data: string) {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const pcmData = new Int16Array(bytes.buffer);
  const float32Data = new Float32Array(pcmData.length);
  for (let i = 0; i < pcmData.length; i++) {
    float32Data[i] = pcmData[i] / 0x7FFF;
  }

  const buffer = audioContext.createBuffer(1, float32Data.length, 24000);
  buffer.getChannelData(0).set(float32Data);
  
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();
}
