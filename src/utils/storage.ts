import { AppState } from './types';
import { initialState } from './state';

const KEY = 'cefr_ars_state_v1';

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Ignore quota or security errors
  }
}

export function loadState(_initial: AppState): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...initialState, ...parsed };
  } catch {
    return initialState;
  }
}

export function clearState(): void {
  localStorage.removeItem(KEY);
}
