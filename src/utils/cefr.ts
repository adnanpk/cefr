import { CEFRBand } from './types';

export const CEFR_BANDS: CEFRBand[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const CEFR_DESCRIPTIONS: Record<CEFRBand, string> = {
  A1: 'Beginner — Can understand and use familiar everyday expressions and basic phrases.',
  A2: 'Elementary — Can communicate in simple, routine tasks on familiar topics.',
  B1: 'Intermediate — Can deal with most situations encountered while travelling.',
  B2: 'Upper-Intermediate — Can interact fluently with native speakers without strain.',
  C1: 'Advanced — Can express ideas fluently and spontaneously with precision.',
  C2: 'Mastery — Can understand virtually everything heard or read with ease.',
};

export const CEFR_COLORS: Record<CEFRBand, string> = {
  A1: '#dc2626',
  A2: '#ea580c',
  B1: '#ca8a04',
  B2: '#65a30d',
  C1: '#059669',
  C2: '#0d9488',
};

export const CEFR_LIGHT_COLORS: Record<CEFRBand, string> = {
  A1: '#fef2f2',
  A2: '#fff7ed',
  B1: '#fefce8',
  B2: '#f7fee7',
  C1: '#ecfdf5',
  C2: '#f0fdfa',
};

export const CEFR_TEXT_CLASSES: Record<CEFRBand, string> = {
  A1: 'text-red-700 bg-red-50 border-red-300',
  A2: 'text-orange-700 bg-orange-50 border-orange-300',
  B1: 'text-yellow-700 bg-yellow-50 border-yellow-300',
  B2: 'text-lime-700 bg-lime-50 border-lime-300',
  C1: 'text-emerald-700 bg-emerald-50 border-emerald-300',
  C2: 'text-teal-700 bg-teal-50 border-teal-300',
};

// ─── Adaptive feedback (Layer 2) ─────────────────────────────────────────────
export interface AdaptiveFeedback {
  summary: string;
  strengths: string[];
  workOn: string[];
  toReachNext: string | null; // null at C2
  resources: string[];
}

export const ADAPTIVE_FEEDBACK: Record<CEFRBand, AdaptiveFeedback> = {
  A1: {
    summary: 'You are at the Beginner (A1) level. You can understand and produce very basic expressions about familiar everyday topics.',
    strengths: [
      'Recognition of core vocabulary for everyday objects and actions',
      'Ability to follow very simple, slowly delivered speech',
    ],
    workOn: [
      'All forms of the verb "to be" and "to have" in present tense',
      'Basic articles (a, an, the) and their use with nouns',
      'Simple present tense for daily routines',
      'Numbers, colours, family members, and common adjectives',
    ],
    toReachNext: 'To reach A2: master simple past tense, learn to form basic questions and negatives, and expand vocabulary to ~1,000 high-frequency words.',
    resources: [
      'Duolingo / Babbel (Beginner track)',
      'Cambridge English: Starters coursebook',
      'BBC Learning English — "The Flatmates" series',
      'Oxford Bookworms Library: Starter level graded readers',
    ],
  },
  A2: {
    summary: 'You are at the Elementary (A2) level. You can communicate in simple, routine tasks on familiar topics.',
    strengths: [
      'Solid grasp of basic present and past tense forms',
      'Everyday vocabulary for shopping, travel, and social situations',
      'Can follow short, simple written and spoken texts',
    ],
    workOn: [
      'Past simple vs. past continuous distinctions',
      'First conditional sentences (If + present … will)',
      'Comparative and superlative adjectives',
      'Connecting ideas with "because", "so", "but", "although"',
    ],
    toReachNext: 'To reach B1: study present perfect (have + past participle), practise reading short news articles, and build topic vocabulary for work, travel, and current events.',
    resources: [
      'Headway Elementary / Pre-Intermediate (Oxford)',
      'British Council LearnEnglish — A2 section',
      'Oxford Bookworms Library: Level 1–2',
      'BBC Learning English — "6 Minute English" (slower episodes)',
    ],
  },
  B1: {
    summary: 'You are at the Intermediate (B1) level. You can handle most everyday situations in an English-speaking environment.',
    strengths: [
      'Reliable use of common tenses in familiar contexts',
      'Can understand the main points of clear speech on everyday matters',
      'Can write simple connected text on familiar topics',
    ],
    workOn: [
      'Present perfect vs. simple past — form and when to use each',
      'Second conditional (If + past … would) for hypothetical situations',
      'Passive voice in present and past tenses',
      'Modal verbs for deduction (must, might, can\'t)',
    ],
    toReachNext: 'To reach B2: study reported speech, all passive constructions, and phrasal verbs; read quality newspapers and watch authentic English TV without subtitles.',
    resources: [
      'Headway Intermediate (Oxford) or English File Intermediate',
      'Cambridge PET / B1 Preliminary preparation materials',
      'BBC News Learning English — intermediate podcasts',
      'Oxford Bookworms Library: Level 3–4',
    ],
  },
  B2: {
    summary: 'You are at the Upper-Intermediate (B2) level. You can interact with a degree of fluency on a wide range of topics.',
    strengths: [
      'Good control of a broad grammatical repertoire',
      'Can understand extended speech and complex texts on familiar subjects',
      'Effective use of cohesive devices to link ideas',
    ],
    workOn: [
      'Third conditional and mixed conditionals for nuanced hypotheticals',
      'Cleft sentences ("It was X that…") for emphasis',
      'Advanced reporting verbs (acknowledge, concede, maintain)',
      'Academic register and hedging language ("tends to", "appears to")',
    ],
    toReachNext: 'To reach C1: study inversions, nominalisations, and complex subordination; read The Guardian, The Economist, or quality academic essays; write argued essays on abstract topics.',
    resources: [
      'Cambridge FCE / B2 First preparation materials',
      'The Guardian / BBC News (authentic journalism)',
      'Oxford Bookworms Library: Level 5–6',
      'English File Upper-Intermediate (Oxford)',
    ],
  },
  C1: {
    summary: 'You are at the Advanced (C1) level. You can express yourself fluently and spontaneously without obvious searching for expressions.',
    strengths: [
      'Wide grammatical range with good control of complex structures',
      'Sophisticated vocabulary including idiomatic and formal expressions',
      'Can follow extended, complex discourse and implicit meaning',
    ],
    workOn: [
      'Mandative subjunctive in formal and academic writing',
      'Fronting and inversion for rhetorical effect',
      'Precision in collocations and idiomatic expressions',
      'Register shifting between formal, academic, and informal contexts',
    ],
    toReachNext: 'To reach C2: focus on archaic and literary registers, stylistic precision, and the ability to summarise complex argumentation with complete naturalness.',
    resources: [
      'Cambridge CAE / C1 Advanced preparation materials',
      'The Economist, London Review of Books, or The Atlantic',
      'Academic journals in your specialist field',
      'Classic English literature (Orwell, Fitzgerald, Austen)',
    ],
  },
  C2: {
    summary: 'You are at the Mastery (C2) level — the highest CEFR band. You can understand virtually everything with ease and express yourself precisely in complex situations.',
    strengths: [
      'Complete grammatical accuracy across all structures and registers',
      'Vast vocabulary range including specialised, idiomatic, and archaic terms',
      'Can appreciate subtle stylistic effects including irony and implicit meaning',
    ],
    workOn: [
      'Expanding domain-specific vocabulary in your professional field',
      'Stylistic refinement in high-stakes writing (academic, legal, literary)',
      'Keeping pace with evolving neologisms and contemporary usage',
    ],
    toReachNext: null,
    resources: [
      'Academic journals and conference papers in your discipline',
      'Advanced English style guides (Fowler\'s Modern English Usage)',
      'Literary fiction and critical essays in English',
      'Engage regularly in professional or academic discourse with native speakers',
    ],
  },
};

// Map raw score (0–12) to CEFR band
// 2 questions per level → each level threshold spans 2 points
export function scoreToBand(score: number): CEFRBand {
  if (score <= 2)  return 'A1';
  if (score <= 4)  return 'A2';
  if (score <= 6)  return 'B1';
  if (score <= 8)  return 'B2';
  if (score <= 10) return 'C1';
  return 'C2';
}

// Convert band to a 1–6 numeric for averaging
export function bandToNumeric(band: CEFRBand): number {
  return CEFR_BANDS.indexOf(band) + 1;
}

// Convert numeric average back to band
export function numericToBand(n: number): CEFRBand {
  const i = Math.max(0, Math.min(5, Math.round(n) - 1));
  return CEFR_BANDS[i];
}

export function calculateOverallBand(bands: CEFRBand[]): CEFRBand {
  if (!bands.length) return 'A1';
  const avg = bands.reduce((s, b) => s + bandToNumeric(b), 0) / bands.length;
  return numericToBand(avg);
}
