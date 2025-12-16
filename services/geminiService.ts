import { GoogleGenAI } from "@google/genai";
import { GET_SYSTEM_INSTRUCTION } from "../constants";
import { LanguageCode, RegionCode } from "../types";

// Singleton instance
let aiClient: GoogleGenAI | null = null;

// Helper to safely get env var
const getApiKey = (): string | undefined => {
  // Vite replaces process.env.API_KEY with the define string
  if (typeof process !== 'undefined' && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  // Fallback for some vite env setups
  if (import.meta.env?.VITE_API_KEY) {
    return import.meta.env.VITE_API_KEY;
  }
  return undefined;
};

const getClient = (): GoogleGenAI => {
  if (!aiClient) {
    const key = getApiKey();
    if (!key) {
      console.warn("Gemini Service: Missing API Key. Check VITE_API_KEY or Netlify Environment Variables.");
      throw new Error("MISSING_API_KEY");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
};

export const sendMessageToGemini = async (
  message: string, 
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  userSettings: { language: LanguageCode; region: RegionCode }
): Promise<string> => {
  
  try {
    const ai = getClient();
    const modelId = 'gemini-2.5-flash';
    const systemInstruction = GET_SYSTEM_INSTRUCTION(userSettings.language, userSettings.region);

    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, 
        maxOutputTokens: 300, 
      },
      history: history,
    });

    const response = await chat.sendMessage({ message });
    return response.text || "I understand.";
    
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error.message === "MISSING_API_KEY") {
       return "Setup Error: API Key is missing. Please check your app settings.";
    }

    return "I'm having trouble connecting to my service right now. Please try again in a moment.";
  }
};