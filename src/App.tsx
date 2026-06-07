import { useReducer, useEffect } from 'react';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import ModuleSelection from './components/ModuleSelection';
import MCQModule from './components/MCQModule';
import SpeakingModule from './components/SpeakingModule';
import ModuleSummary from './components/ModuleSummary';
import Dashboard from './components/Dashboard';
import { appReducer, initialState } from './utils/state';
import { saveState, loadState } from './utils/storage';

export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState, loadState);

  // Persist to localStorage on every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const showWatermark = state.view === 'module' || state.view === 'summary' || state.view === 'dashboard';

  const renderView = () => {
    switch (state.view) {
      case 'onboarding':
        return <Onboarding dispatch={dispatch} />;
      case 'modules':
        return <ModuleSelection state={state} dispatch={dispatch} />;
      case 'module':
        if (state.activeModule === 'speaking') {
          return <SpeakingModule state={state} dispatch={dispatch} />;
        }
        return <MCQModule state={state} dispatch={dispatch} />;
      case 'summary':
        return <ModuleSummary state={state} dispatch={dispatch} />;
      case 'dashboard':
        return <Dashboard state={state} dispatch={dispatch} />;
      default:
        return <Onboarding dispatch={dispatch} />;
    }
  };

  return (
    <Layout showWatermark={showWatermark}>
      {renderView()}
    </Layout>
  );
}
