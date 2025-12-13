import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// Initialize the client
// NOTE: In a real production app, ensure API_KEY is strictly server-side or proxied 
// to prevent exposure. For this MVP demo structure, we use process.env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToGemini = async (
  message: string, 
  history: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<string> => {
  try {
    // Use the 2.5 Flash model for low latency chat
    const model = 'gemini-2.5-flash';

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // Slightly creative but balanced
        maxOutputTokens: 300, // Keep responses concise
      },
      history: history,
    });

    const response = await chat.sendMessage({ message });
    
    // Safety fallback: if no text is returned
    return response.text || "I'm listening, but I'm having trouble finding the right words. Could you rephrase that?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Unable to connect to Anya at the moment. Please check your connection.");
  }
};