import { GoogleGenAI } from "@google/genai";
import { GET_SYSTEM_INSTRUCTION } from "../constants";
import { LanguageCode, RegionCode } from "../types";

// Lazy initialization var
let aiClient: GoogleGenAI | null = null;

// Helper to get or create the client safely
const getAiClient = (): GoogleGenAI => {
  if (!aiClient) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing");
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
    // Attempt to initialize client inside the function call
    // This prevents the app from crashing on white-screen load if key is missing
    const ai = getAiClient();
    
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
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error.message === "API Key is missing") {
       console.warn("API Key is missing. Chat features will be disabled.");
       return "I'm currently unable to connect to the cloud. Please check your API Key configuration.";
    }

    return "I'm having a little trouble connecting right now. Please check your internet connection and try again.";
  }
};