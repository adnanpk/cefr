export type CEFRBand = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type ModuleType = 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'speaking';
export type View = 'onboarding' | 'modules' | 'module' | 'summary' | 'dashboard';

export interface Candidate {
  name: string;
  email: string;
  startedAt: string;
}

export interface MCQQuestion {
  id: number;
  text: string;
  contextText?: string;   // Passage text shown above the question (reading/listening)
  audioScript?: string;   // TTS script for listening player
  passageId?: string;     // Groups questions under same reading passage
  options: string[];
  correctIndex: number;
  explanation: string;
  cefrLevel: CEFRBand;
}

export interface SpeakingPrompt {
  id: number;
  title: string;
  text: string;
  guidance: string;
}

export interface QuestionAnswer {
  questionId: number;
  selectedIndex: number;
  correct: boolean;
}

export interface ModuleResult {
  module: Exclude<ModuleType, 'speaking'>;
  score: number;
  total: number;
  cefrBand: CEFRBand;
  answers: QuestionAnswer[];
  completedAt: string;
}

export interface SpeakingPromptResult {
  promptText: string;
  transcript: string;
  cefrBand: CEFRBand;
  score: number;
  feedback: string;
  breakdown: {
    grammar: string;
    vocabulary: string;
    coherence: string;
    taskAchievement: string;
  };
}

export interface SpeakingResult {
  module: 'speaking';
  prompts: SpeakingPromptResult[];
  cefrBand: CEFRBand;
  score: number;
  completedAt: string;
}

export type AnyResult = ModuleResult | SpeakingResult;

export interface AppState {
  view: View;
  candidate: Candidate | null;
  activeModule: ModuleType | null;
  currentAnswers: Record<number, number>;
  listeningPlayCounts: Record<number, number>;
  results: {
    grammar?: ModuleResult;
    vocabulary?: ModuleResult;
    reading?: ModuleResult;
    listening?: ModuleResult;
    speaking?: SpeakingResult;
  };
  tabWarnings: number;
  emailSent: boolean;
}

export type AppAction =
  | { type: 'SET_CANDIDATE'; payload: Candidate }
  | { type: 'START_MODULE'; payload: ModuleType }
  | { type: 'SET_ANSWER'; payload: { questionId: number; selectedIndex: number } }
  | { type: 'SUBMIT_MODULE'; payload: ModuleResult }
  | { type: 'SUBMIT_SPEAKING'; payload: SpeakingResult }
  | { type: 'INCREMENT_PLAY_COUNT'; payload: number }
  | { type: 'GO_TO_MODULES' }
  | { type: 'GO_TO_SUMMARY' }
  | { type: 'GO_TO_DASHBOARD' }
  | { type: 'INCREMENT_TAB_WARNING' }
  | { type: 'SET_EMAIL_SENT' }
  | { type: 'RESET' };
