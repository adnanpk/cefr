import { AppState, AppAction } from './types';

export const initialState: AppState = {
  view: 'onboarding',
  candidate: null,
  activeModule: null,
  currentAnswers: {},
  listeningPlayCounts: {},
  results: {},
  tabWarnings: 0,
  emailSent: false,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CANDIDATE':
      return { ...state, candidate: action.payload, view: 'modules' };

    case 'START_MODULE':
      return {
        ...state,
        activeModule: action.payload,
        view: 'module',
        currentAnswers: {},
      };

    case 'SET_ANSWER':
      return {
        ...state,
        currentAnswers: {
          ...state.currentAnswers,
          [action.payload.questionId]: action.payload.selectedIndex,
        },
      };

    case 'INCREMENT_PLAY_COUNT':
      return {
        ...state,
        listeningPlayCounts: {
          ...state.listeningPlayCounts,
          [action.payload]: (state.listeningPlayCounts[action.payload] ?? 0) + 1,
        },
      };

    case 'SUBMIT_MODULE':
      return {
        ...state,
        results: { ...state.results, [action.payload.module]: action.payload },
        view: 'summary',
        activeModule: action.payload.module,
      };

    case 'SUBMIT_SPEAKING':
      return {
        ...state,
        results: { ...state.results, speaking: action.payload },
        view: 'summary',
        activeModule: 'speaking',
      };

    case 'GO_TO_MODULES':
      return { ...state, view: 'modules', activeModule: null };

    case 'GO_TO_SUMMARY':
      return { ...state, view: 'summary' };

    case 'GO_TO_DASHBOARD':
      return { ...state, view: 'dashboard' };

    case 'INCREMENT_TAB_WARNING':
      return { ...state, tabWarnings: state.tabWarnings + 1 };

    case 'SET_EMAIL_SENT':
      return { ...state, emailSent: true };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}
