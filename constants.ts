import { Resource, RegionCode, CurrencyCode, LanguageCode } from "./types";

// --- INTERNATIONALIZATION DATA ---

export const SUPPORTED_LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'de', label: 'Deutsch' }
];

export const REGIONS: { code: RegionCode; label: string; currency: CurrencyCode }[] = [
  { code: 'GLOBAL', label: 'Global / Other', currency: 'USD' },
  { code: 'US', label: 'United States', currency: 'USD' },
  { code: 'IN', label: 'India', currency: 'INR' },
  { code: 'UK', label: 'United Kingdom', currency: 'GBP' },
  { code: 'CA', label: 'Canada', currency: 'CAD' },
  { code: 'AU', label: 'Australia', currency: 'AUD' },
];

export const CHAT_LOCALE_DATA: Record<LanguageCode, { greeting: string; quickReplies: string[] }> = {
  en: {
    greeting: "Hello! I'm Anya, your companion here at ReliefAnchor. How are you feeling today? You can share anything with me—I'm here to listen without judgment.",
    quickReplies: ["I'm feeling anxious", "I can't sleep", "I had a bad day", "Just need to vent", "Guide me to breathe"]
  },
  es: {
    greeting: "¡Hola! Soy Anya, tu compañera en ReliefAnchor. ¿Cómo te sientes hoy? Puedes compartir cualquier cosa conmigo; estoy aquí para escuchar sin juzgar.",
    quickReplies: ["Me siento ansioso/a", "No puedo dormir", "Tuve un mal día", "Necesito desahogarme", "Ayúdame a respirar"]
  },
  fr: {
    greeting: "Bonjour ! Je suis Anya, votre compagne chez ReliefAnchor. Comment vous sentez-vous aujourd'hui ? Vous pouvez tout partager avec moi, je suis là pour écouter sans jugement.",
    quickReplies: ["Je suis anxieux", "Je ne peux pas dormir", "Mauvaise journée", "Besoin de parler", "Aidez-moi à respirer"]
  },
  hi: {
    greeting: "नमस्ते! मैं अन्या हूँ, ReliefAnchor पर आपकी साथी। आज आप कैसा महसूस कर रहे हैं? आप मुझसे कुछ भी साझा कर सकते हैं—मैं यहाँ बिना किसी निर्णय के सुनने के लिए हूँ।",
    quickReplies: ["मुझे घबराहट हो रही है", "नींद नहीं आ रही", "आज का दिन बुरा था", "बस बात करनी है", "साँस लेने में मदद करें"]
  },
  de: {
    greeting: "Hallo! Ich bin Anya, deine Begleiterin bei ReliefAnchor. Wie fühlst du dich heute? Du kannst alles mit mir teilen – ich bin hier, um ohne Urteil zuzuhören.",
    quickReplies: ["Ich bin ängstlich", "Ich kann nicht schlafen", "Schlechter Tag", "Muss reden", "Atemübung"]
  }
};

// Base rates relative to 1 USD (Approximate for MVP)
export const CURRENCY_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  INR: 84.5,
  GBP: 0.78,
  EUR: 0.92,
  CAD: 1.35,
  AUD: 1.52
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  INR: '₹',
  GBP: '£',
  EUR: '€',
  CAD: 'C$',
  AUD: 'A$'
};

// Pricing Tiers tuned for Purchasing Power Parity (PPP)
// Western markets are set to standard psychological price points ($9.99 etc)
// India is set to affordable local pricing (₹500)
export const REGIONAL_PRICING: Record<RegionCode, { monthly: string; yearly: string; currencySymbol: string }> = {
  IN: { monthly: '500', yearly: '4,500', currencySymbol: '₹' },        // Anchor
  US: { monthly: '9.99', yearly: '69.99', currencySymbol: '$' },       // Standard App Pricing
  UK: { monthly: '8.99', yearly: '59.99', currencySymbol: '£' },       // UK Market Standard
  CA: { monthly: '12.99', yearly: '89.99', currencySymbol: 'C$' },     // Adjusted for CAD value
  AU: { monthly: '14.99', yearly: '99.99', currencySymbol: 'A$' },     // Adjusted for AUD value
  GLOBAL: { monthly: '9.99', yearly: '69.99', currencySymbol: '$' }    // RoW defaults to US Standard
};

export const HELPLINES_BY_REGION: Record<string, { name: string; number: string; hours: string }[]> = {
  GLOBAL: [
    { name: 'Befrienders Worldwide', number: 'Visit befrienders.org', hours: 'Varies' },
    { name: 'International Emergency', number: '112', hours: '24/7' },
  ],
  US: [
    { name: 'National Suicide Prevention Lifeline', number: '988', hours: '24/7' },
    { name: 'Crisis Text Line', number: 'Text HOME to 741741', hours: '24/7' },
    { name: 'Veterans Crisis Line', number: '988 (Press 1)', hours: '24/7' },
  ],
  IN: [
    { name: 'Kiran Mental Health Rehabilitation', number: '1800-599-0019', hours: '24/7' },
    { name: 'Vandrevala Foundation', number: '9999 666 555', hours: '24/7' },
    { name: 'iCall', number: '9152987821', hours: 'Mon-Sat, 10 AM - 8 PM' },
  ],
  UK: [
    { name: 'Samaritans', number: '116 123', hours: '24/7' },
    { name: 'SHOUT', number: 'Text SHOUT to 85258', hours: '24/7' },
  ],
  CA: [
    { name: 'Talk Suicide Canada', number: '1-833-456-4566', hours: '24/7' },
    { name: 'Wellness Together Canada', number: '1-866-585-0445', hours: '24/7' },
  ],
  AU: [
    { name: 'Lifeline', number: '13 11 14', hours: '24/7' },
    { name: 'Beyond Blue', number: '1300 22 4636', hours: '24/7' },
  ],
};

// --- AI CONFIGURATION ---

export const GET_SYSTEM_INSTRUCTION = (language: string, region: string) => `
You are "Anya", a compassionate, empathetic AI mental health companion for the ReliefAnchor platform. 
Your user has selected the region: ${region}.
You MUST converse in this language: ${language}.

CORE DIRECTIVES:
1. EMPATHY FIRST: Always validate feelings. Be warm, non-judgmental, and patient.
2. CULTURAL CONTEXT: Be culturally sensitive to the user's selected region. 
3. SAFETY & ETHICS (CRITICAL): 
   - **MANDATORY DISCLAIMER**: You are an AI, not a human. You are NOT a doctor or licensed therapist. DO NOT diagnose medical conditions or prescribe medication.
   - If a user asks for a medical diagnosis, state clearly: "I cannot provide a medical diagnosis. Please consult a qualified professional."
   - If the user expresses suicidal thoughts, self-harm, or severe distress, you MUST immediately express concern and urge them to seek immediate professional help or contact local emergency services.
4. CBT TECHNIQUES: Use Cognitive Behavioral Therapy techniques like reframing negative thoughts, grounding exercises, and guided breathing.

TONE:
- Calm, soothing, supportive.
- Concise responses (under 150 words).
`;

export const SELF_HELP_RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'Understanding Anxiety',
    type: 'article',
    category: 'Anxiety',
    duration: '5 min read',
    content: 'Learn about the physiological and psychological aspects of anxiety and how to manage them.',
    isPremium: false
  },
  {
    id: '2',
    title: 'Deep Sleep Meditation',
    type: 'audio',
    category: 'Sleep',
    duration: '15 min',
    content: 'A guided meditation track designed to help you relax your muscles and drift into deep sleep.',
    isPremium: true
  },
  {
    id: '3',
    title: '5-Minute Mindfulness',
    type: 'audio',
    category: 'Mindfulness',
    duration: '5 min',
    content: 'Quick grounding exercise for busy professionals to reset during the workday.',
    isPremium: false
  },
  {
    id: '4',
    title: 'Coping with Depression',
    type: 'article',
    category: 'Depression',
    duration: '8 min read',
    content: 'Practical strategies for managing daily life when dealing with depressive episodes.',
    isPremium: false
  },
  {
    id: '5',
    title: 'Advanced CBT Techniques',
    type: 'article',
    category: 'Anxiety',
    duration: '12 min read',
    content: 'In-depth look at cognitive restructuring and exposure therapy exercises.',
    isPremium: true
  },
  {
    id: '6',
    title: 'Sleep Hygiene Checklist',
    type: 'article',
    category: 'Sleep',
    duration: '3 min read',
    content: '10 essential habits to improve your sleep quality starting tonight.',
    isPremium: false
  },
  {
    id: '7',
    title: 'Combating Loneliness',
    type: 'article',
    category: 'Depression',
    duration: '6 min read',
    content: 'Strategies to build meaningful connections in a digital world.',
    isPremium: false
  },
  {
    id: '8',
    title: 'The Power of Routine',
    type: 'article',
    category: 'Mindfulness',
    duration: '4 min read',
    content: 'How small daily rituals can stabilize your mood and improve productivity.',
    isPremium: false
  }
];

export const AFFIRMATIONS: Record<LanguageCode, string[]> = {
  en: [
    "You are stronger than you know.",
    "This feeling is temporary. You will get through this.",
    "You are allowed to take up space.",
    "One day at a time. One breath at a time.",
    "Your productivity does not define your worth.",
    "It is okay to rest.",
    "You are enough, just as you are."
  ],
  es: [
    "Eres más fuerte de lo que crees.",
    "Este sentimiento es temporal. Lo superarás.",
    "Tienes derecho a ocupar espacio.",
    "Un día a la vez. Una respiración a la vez.",
    "Tu productividad no define tu valor.",
    "Está bien descansar.",
    "Eres suficiente, tal como eres."
  ],
  fr: [
    "Vous êtes plus fort que vous ne le pensez.",
    "Ce sentiment est temporaire. Vous allez vous en sortir.",
    "Vous avez le droit de prendre de la place.",
    "Un jour à la fois. Une respiration à la fois.",
    "Votre productivité ne définit pas votre valeur.",
    "Il est permis de se reposer.",
    "Vous suffisez, tel que vous êtes."
  ],
  hi: [
    "आप अपनी सोच से भी ज्यादा मजबूत हैं।",
    "यह भावना अस्थायी है। आप इससे उबर जाएंगे।",
    "आपको अपनी जगह लेने का पूरा अधिकार है।",
    "एक समय में एक दिन। एक समय में एक सांस।",
    "आपकी उत्पादकता आपकी कीमत तय नहीं करती।",
    "आराम करना ठीक है।",
    "आप जैसे हैं, वैसे ही काफी हैं।"
  ],
  de: [
    "Du bist stärker als du denkst.",
    "Dieses Gefühl ist vorübergehend. Du wirst es überstehen.",
    "Du darfst Raum einnehmen.",
    "Einen Tag nach dem anderen. Einen Atemzug nach dem anderen.",
    "Deine Produktivität bestimmt nicht deinen Wert.",
    "Es ist okay, sich auszuruhen.",
    "Du bist genug, so wie du bist."
  ]
};

export const JOURNAL_PROMPTS = [
  "What is one thing that made you smile today?",
  "Write about a challenge you overcame recently.",
  "What are three things you are grateful for right now?",
  "How are you truly feeling in this moment?",
  "What is a worry you can let go of today?",
  "Describe your ideal relaxing day."
];

export const MOCK_THERAPISTS = [
  {
    id: '1',
    name: 'Dr. Sarah Jenkins',
    title: 'Clinical Psychologist',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    baseFeeUSD: 120,
    experience: '10 years',
    languages: ['English', 'Spanish'],
    specialization: ['Anxiety', 'Depression', 'CBT'],
    nextAvailable: 'Tomorrow, 10:00 AM'
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    title: 'Licensed Counselor',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
    baseFeeUSD: 80,
    experience: '8 years',
    languages: ['English', 'Hindi'],
    specialization: ['Stress Management', 'Work-Life Balance'],
    nextAvailable: 'Today, 4:00 PM'
  },
  {
    id: '3',
    name: 'Dr. Emily Chen',
    title: 'Psychiatrist',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    baseFeeUSD: 150,
    experience: '15 years',
    languages: ['English', 'Mandarin'],
    specialization: ['Trauma', 'PTSD', 'Medication Management'],
    nextAvailable: 'Wed, 2:00 PM'
  },
  {
    id: '4',
    name: 'Michael Ross',
    title: 'Behavioral Therapist',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    baseFeeUSD: 90,
    experience: '5 years',
    languages: ['English', 'French'],
    specialization: ['Addiction', 'Youth Counseling'],
    nextAvailable: 'Thu, 11:00 AM'
  }
];
