import { Resource } from "./types";

export const HELPLINES = [
  { name: "iCall (TISS)", number: "9152987821", hours: "Mon-Sat, 8 AM - 10 PM" },
  { name: "Vandrevala Foundation", number: "18602662345", hours: "24x7" },
  { name: "Kiran (Govt of India)", number: "18005990019", hours: "24x7" },
  { name: "AASRA", number: "9820466726", hours: "24x7" }
];

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
    content: 'Living alone in a big city? Here are ways to build meaningful connections.',
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

export const SYSTEM_INSTRUCTION = `
You are "Anya", a compassionate, empathetic AI mental health companion for the MindEase India platform. 
Your audience is primarily Indian urban youth and professionals.

CORE DIRECTIVES:
1. EMPATHY FIRST: Always validate feelings. Be warm, non-judgmental, and patient.
2. CULTURAL CONTEXT: Understand Indian societal pressures (career, family, marriage, exams). Use culturally relevant metaphors if appropriate, but speak primarily in English (you can understand Hinglish).
3. SAFETY & ETHICS (CRITICAL): 
   - **MANDATORY DISCLAIMER**: You are an AI, not a human. You are NOT a doctor or licensed therapist. DO NOT diagnose medical conditions or prescribe medication.
   - If a user asks for a medical diagnosis, state clearly: "I cannot provide a medical diagnosis. Please consult a qualified professional."
   - If the user expresses suicidal thoughts, self-harm, or severe distress, you MUST immediately express concern and provide these helpline numbers: iCall (9152987821) and Vandrevala Foundation (18602662345).
4. CBT TECHNIQUES: Use Cognitive Behavioral Therapy techniques like reframing negative thoughts, grounding exercises, and guided breathing when users are anxious.

TONE:
- Calm, soothing, supportive.
- Like a wise older friend or Didi.

LIMITATIONS:
- Keep responses concise (under 150 words) to suit a chat interface, unless explaining a technique.
`;

export const AFFIRMATIONS = [
  "You are stronger than you know.",
  "This feeling is temporary. You will get through this.",
  "You are allowed to take up space.",
  "One day at a time. One breath at a time.",
  "Your productivity does not define your worth.",
  "It is okay to rest.",
  "You are enough, just as you are."
];

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
    name: "Dr. Anjali Desai",
    title: "Clinical Psychologist",
    imageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    fee: 1500,
    experience: "8 years",
    languages: ["English", "Hindi", "Marathi"],
    specialization: ["Anxiety", "Depression", "CBT"],
    nextAvailable: "Tomorrow, 4 PM"
  },
  {
    id: '2',
    name: "Mr. Rohan Mehta",
    title: "Licensed Therapist",
    imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    fee: 1200,
    experience: "5 years",
    languages: ["English", "Hindi"],
    specialization: ["Stress Management", "Work-Life Balance"],
    nextAvailable: "Today, 6 PM"
  },
  {
    id: '3',
    name: "Ms. Sneha Kapoor",
    title: "Counseling Psychologist",
    imageUrl: "https://randomuser.me/api/portraits/women/68.jpg",
    fee: 1000,
    experience: "4 years",
    languages: ["English", "Punjabi"],
    specialization: ["Relationship Issues", "Self-Esteem"],
    nextAvailable: "Wed, 11 AM"
  }
];