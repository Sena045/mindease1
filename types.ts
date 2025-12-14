export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface MoodEntry {
  id: string;
  score: number; // 1-5
  note: string;
  date: string; // ISO string
}

export interface Resource {
  id: string;
  title: string;
  type: 'breathing' | 'journal' | 'article' | 'audio';
  description?: string;
  content?: string;
  duration?: string;
  category?: string;
  isPremium?: boolean;
}

export enum AppView {
  CHAT = 'CHAT',
  MOOD = 'MOOD',
  TOOLS = 'TOOLS',
  PREMIUM = 'PREMIUM',
  SETTINGS = 'SETTINGS',
}

export type RegionCode = 'GLOBAL' | 'IN' | 'US' | 'UK' | 'CA' | 'AU';
export type CurrencyCode = 'USD' | 'INR' | 'GBP' | 'EUR' | 'CAD' | 'AUD';
export type LanguageCode = 'en' | 'hi' | 'es' | 'fr' | 'de';

export interface UserSettings {
  region: RegionCode;
  currency: CurrencyCode;
  language: LanguageCode;
}