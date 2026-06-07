import { AppState, AppAction, ModuleType } from '../utils/types';
import { CEFR_TEXT_CLASSES } from '../utils/cefr';

interface Props {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const MODULE_META: {
  type: ModuleType;
  label: string;
  icon: string;
  desc: string;
  detail: string;
  color: string;
}[] = [
  {
    type: 'grammar',
    label: 'Grammar',
    icon: '✏️',
    desc: '12 Multiple Choice · Adaptive',
    detail: 'Tense usage, conditionals, passive voice, subjunctive & more',
    color: '#3b82f6',
  },
  {
    type: 'vocabulary',
    label: 'Vocabulary',
    icon: '📚',
    desc: '12 Multiple Choice · Adaptive',
    detail: 'Everyday words to advanced academic & specialised lexis',
    color: '#8b5cf6',
  },
  {
    type: 'reading',
    label: 'Reading',
    icon: '📖',
    desc: '12 Comprehension · Adaptive',
    detail: 'Three authentic passages from A2 to C2 level',
    color: '#10b981',
  },
  {
    type: 'listening',
    label: 'Listening',
    icon: '🎧',
    desc: '12 Audio Questions · Adaptive',
    detail: 'Hear each track (max 2 plays) and answer comprehension questions',
    color: '#f59e0b',
  },
  {
    type: 'speaking',
    label: 'Speaking',
    icon: '🎤',
    desc: '2 Recorded Prompts',
    detail: 'Record verbal responses to open-ended prompts. AI-graded by CEFR descriptors',
    color: '#ef4444',
  },
];

function getModuleResult(state: AppState, type: ModuleType) {
  if (type === 'speaking') return state.results.speaking;
  return state.results[type as Exclude<ModuleType, 'speaking'>];
}

export default function ModuleSelection({ state, dispatch }: Props) {
  const completedCount = Object.keys(state.results).length;
  const allDone = completedCount === 5;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Welcome bar */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome, <span style={{ color: '#1d4ed8' }}>{state.candidate?.name}</span>
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Complete all five modules to receive your cumulative CEFR band.
          </p>
        </div>
        {/* Progress pill */}
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-xl shrink-0"
          style={{ background: 'white', border: '1.5px solid #e2e8f0' }}
        >
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: i < completedCount ? '#10b981' : '#e2e8f0',
                  transition: 'background 0.3s',
                }}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-slate-700">
            {completedCount}/5 complete
          </span>
        </div>
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULE_META.map(mod => {
          const result = getModuleResult(state, mod.type);
          const done = !!result;

          return (
            <div
              key={mod.type}
              className="card flex flex-col gap-4 transition-all duration-200 hover:shadow-md"
              style={{ borderTop: `4px solid ${done ? '#10b981' : mod.color}` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `${mod.color}18` }}
                  >
                    {mod.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{mod.label}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{mod.desc}</p>
                  </div>
                </div>
                {done && result && (
                  <div
                    className={`cefr-badge text-sm ${CEFR_TEXT_CLASSES[result.cefrBand]}`}
                  >
                    {result.cefrBand}
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-slate-500 leading-relaxed flex-1">
                {mod.detail}
              </p>

              {/* Score bar if done */}
              {done && result && 'score' in result && 'total' in result && (
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Score</span>
                    <span className="font-semibold">{(result as { score: number; total: number }).score}/{(result as { score: number; total: number }).total}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: '#e2e8f0' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${((result as { score: number; total: number }).score / (result as { score: number; total: number }).total) * 100}%`,
                        background: '#10b981',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={() => dispatch({ type: 'START_MODULE', payload: mod.type })}
                className={done ? 'btn-secondary text-sm py-2' : 'btn-primary text-sm py-2.5'}
                style={done ? { color: '#10b981', borderColor: '#a7f3d0' } : {}}
              >
                {done ? '✓ Review Results' : 'Start Module →'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Dashboard button */}
      {allDone && (
        <div
          className="mt-6 rounded-2xl p-6 text-center"
          style={{ background: 'linear-gradient(135deg, #1e3a5f, #1d4ed8)', color: 'white' }}
        >
          <p className="text-blue-100 text-sm mb-2">All modules complete!</p>
          <h3 className="text-xl font-bold mb-4">View Your Full CEFR Report</h3>
          <button
            onClick={() => dispatch({ type: 'GO_TO_DASHBOARD' })}
            className="px-8 py-3 rounded-xl font-bold text-blue-900 transition-all hover:scale-105"
            style={{ background: '#fbbf24' }}
          >
            📊 Open Dashboard
          </button>
        </div>
      )}

      {!allDone && completedCount > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => dispatch({ type: 'GO_TO_DASHBOARD' })}
            className="btn-secondary text-sm"
          >
            📊 View Partial Dashboard ({completedCount}/5 modules)
          </button>
        </div>
      )}
    </div>
  );
}
