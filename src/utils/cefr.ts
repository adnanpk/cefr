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

// Map raw score (0–10) to CEFR band
export function scoreToBand(score: number): CEFRBand {
  if (score <= 1) return 'A1';
  if (score <= 3) return 'A2';
  if (score <= 5) return 'B1';
  if (score <= 7) return 'B2';
  if (score <= 9) return 'C1';
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
