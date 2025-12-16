// Ambient type declaration for @google/genai
// This resolves the TS2307 error during the build process
declare module '@google/genai' {
  export class GoogleGenAI {
    constructor(config: { apiKey: string });
    chats: any;
    models: any;
    [key: string]: any;
  }
}