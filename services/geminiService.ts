import { GoogleGenAI } from "@google/genai";
import { GET_SYSTEM_INSTRUCTION } from "../constants";
import { LanguageCode, RegionCode } from "../types";

// Singleton instance (Lazy loaded)
let aiInstance: GoogleGenAI | null = null;

const getAIClient = (): GoogleGenAI | null => {
  if (aiInstance) return aiInstance;
  
  // Safe access to API Key
  // @ts-ignore
  const key = (typeof process !== 'undefined' && process.env?.API_KEY) || 
              (typeof window !== 'undefined' && (window as any).process?.env?.API_KEY);
  
  if (!key) {
    console.warn("API Key is missing. Chat features will be disabled.");
    return null;
  }

  try {
    aiInstance = new GoogleGenAI({ apiKey: key });
    return aiInstance;
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI client:", error);
    return null;
  }
};

export const sendMessageToGemini = async (
  message: string, 
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  userSettings: { language: LanguageCode; region: RegionCode }
): Promise<string> => {
  
  const ai = getAIClient();

  if (!ai) {
    return "I'm currently unable to connect to the cloud. Please check your configuration or try again later.";
  }

  try {
    // Use the 2.5 Flash model for low latency chat
    const model = 'gemini-2.5-flash';

    // Generate dynamic instruction based on user settings
    const systemInstruction = GET_SYSTEM_INSTRUCTION(userSettings.language, userSettings.region);

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, 
        maxOutputTokens: 300, 
      },
      history: history,
    });

    const response = await chat.sendMessage({ message });
    
    return response.text || "I'm listening, but I'm having trouble finding the right words. Could you rephrase that?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Unable to connect to Anya at the moment. Please check your connection.");
  }
};