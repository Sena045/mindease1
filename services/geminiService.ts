import { GoogleGenAI } from "@google/genai";
import { GET_SYSTEM_INSTRUCTION } from "../constants";
import { LanguageCode, RegionCode } from "../types";

// Lazy initialization variable
// This ensures we don't try to access API_KEY or create the client until needed
let aiClient: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
  if (!aiClient) {
    // Access env var lazily. 
    // Vite config defines 'process.env.API_KEY' as a string replacement.
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      throw new Error("API_KEY_MISSING");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const sendMessageToGemini = async (
  message: string, 
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  userSettings: { language: LanguageCode; region: RegionCode }
): Promise<string> => {
  
  try {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash';
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
    return response.text || "I'm listening, but I'm having trouble finding the right words.";
    
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error.message === "API_KEY_MISSING") {
       console.warn("API Key is missing. Chat features disabled.");
       return "System: API Key is missing. Please configure VITE_API_KEY in your .env file.";
    }

    return "I'm having a little trouble connecting right now. Please check your internet connection.";
  }
};