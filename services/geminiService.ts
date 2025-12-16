import { GoogleGenAI } from "@google/genai";
import { GET_SYSTEM_INSTRUCTION } from "../constants";
import { LanguageCode, RegionCode } from "../types";

// Declare process for TypeScript to avoid build errors if @types/node is missing
declare var process: {
  env: {
    API_KEY: string;
  };
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToGemini = async (
  message: string, 
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  userSettings: { language: LanguageCode; region: RegionCode }
): Promise<string> => {
  
  if (!process.env.API_KEY) {
    console.warn("API Key is missing. Chat features will be disabled.");
    return "I'm currently unable to connect to the cloud. Please check your configuration.";
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