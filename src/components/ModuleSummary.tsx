import { AppState, AppAction, ModuleType, ModuleResult, SpeakingResult } from '../utils/types';
import {
  CEFR_DESCRIPTIONS, CEFR_TEXT_CLASSES, CEFR_COLORS, CEFR_BANDS,
  ADAPTIVE_FEEDBACK,
} from '../utils/cefr';
import { moduleQuestions, speakingPrompts } from '../data/questions';

interface Props {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const MODULE_LABELS: Record<ModuleType, string> = {
  grammar: 'Grammar', vocabulary: 'Vocabulary',
  reading: 'Reading', listening: 'Listening', speaking: 'Speaking',
};

// ── Layer 2: Adaptive feedback panel ─────────────────────────────────────────
function AdaptiveFeedbackPanel({ result }: { result: ModuleResult | SpeakingResult }) {
  const fb = ADAPTIVE_FEEDBACK[result.cefrBand];
  const nextIdx = CEFR_BANDS.indexOf(result.cefrBand) + 1;
  const nextBand = nextIdx < CEFR_BANDS.length ? CEFR_BANDS[nextIdx] : null;

  return (
    <div className="card mb-6" style={{ borderLeft: `4px solid ${CEFR_COLORS[result.cefrBand]}` }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
          style={{ background: CEFR_COLORS[result.cefrBand] }}>
          {result.cefrBand}
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Personalised Learning Recommendations</h3>
          <p className="text-xs text-slate-500 mt-0.5">{fb.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Strengths */}
        <div className="rounded-xl p-4" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
            ✓ What you're doing well
          </p>
          <ul className="space-y-1.5">
            {fb.strengths.map((s, i) => (
              <li key={i} className="text-sm text-emerald-800 flex gap-2">
                <span className="shrink-0 mt-0.5">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Work on */}
        <div className="rounded-xl p-4" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
          <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-2">
            ↗ Priority areas to practise
          </p>
          <ul className="space-y-1.5">
            {fb.workOn.map((w, i) => (
              <li key={i} className="text-sm text-orange-800 flex gap-2">
                <span className="shrink-0 mt-0.5">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next level roadmap */}
      {fb.toReachNext && nextBand && (
        <div className="rounded-xl p-4 mb-4"
          style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1.5">
            🎯 Roadmap to {nextBand}
          </p>
          <p className="text-sm text-blue-800 leading-relaxed">{fb.toReachNext}</p>
        </div>
      )}

      {result.cefrBand === 'C2' && (
        <div className="rounded-xl p-4 mb-4"
          style={{ background: '#f0fdfa', border: '1px solid #99f6e4' }}>
          <p className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-1.5">
            🏆 C2 — Mastery Level
          </p>
          <p className="text-sm text-teal-800">
            You have reached the highest CEFR band. Focus on maintaining your level through sustained engagement with authentic, high-register English content.
          </p>
        </div>
      )}

      {/* Recommended resources */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          📚 Recommended resources
        </p>
        <div className="flex flex-wrap gap-2">
          {fb.resources.map((r, i) => (
            <span key={i} className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}>
              {r}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Adaptive path visualiser (shown in summary) ───────────────────────────────
function AdaptivePathDisplay({ path }: { path: string[] }) {
  return (
    <div className="card mb-6">
      <h3 className="font-bold text-slate-800 mb-1">Your Adaptive Question Path</h3>
      <p className="text-xs text-slate-500 mb-4">
        The algorithm started at B1 and branched up on correct answers, down on incorrect ones.
        This shows exactly how the difficulty adjusted for your level.
      </p>
      <div className="flex flex-wrap gap-2 items-center">
        {path.map((band, i) => (
          <div key={i} className="flex items-center gap-2">
            {/* Arrow between steps */}
            {i > 0 && (
              <span className="text-slate-300 text-sm">→</span>
            )}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: CEFR_COLORS[band as keyof typeof CEFR_COLORS] }}>
                {band}
              </div>
              <span className="text-xs text-slate-400 mt-0.5">Q{i + 1}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Explain the branching */}
      <div className="mt-4 flex gap-6 text-xs text-slate-500">
        <span>
          <strong>Start:</strong> {path[0]} (B1 entry point)
        </span>
        <span>
          <strong>Highest reached:</strong>{' '}
          {path.reduce((hi, b) =>
            ['A1','A2','B1','B2','C1','C2'].indexOf(b) > ['A1','A2','B1','B2','C1','C2'].indexOf(hi) ? b : hi
          )}
        </span>
        <span>
          <strong>Final band:</strong> {path[path.length - 1]}
        </span>
      </div>
    </div>
  );
}

// ── Speaking summary ──────────────────────────────────────────────────────────
function SpeakingSummary({ state, dispatch, allDone }: {
  state: AppState; dispatch: React.Dispatch<AppAction>; allDone: boolean
}) {
  const result = state.results.speaking as SpeakingResult;
  if (!result) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Speaking Results</h2>
        <p className="text-slate-500 text-sm">AI-powered CEFR evaluation complete</p>
      </div>

      {/* Overall band hero */}
      <div className="rounded-2xl p-6 text-center mb-6"
        style={{
          background: `linear-gradient(135deg, ${CEFR_COLORS[result.cefrBand]}22, ${CEFR_COLORS[result.cefrBand]}08)`,
          border: `2px solid ${CEFR_COLORS[result.cefrBand]}44`,
        }}>
        <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wider">
          Overall Speaking Band
        </p>
        <div className="text-6xl font-black mb-3" style={{ color: CEFR_COLORS[result.cefrBand] }}>
          {result.cefrBand}
        </div>
        <p className="text-slate-600 text-sm max-w-sm mx-auto">
          {CEFR_DESCRIPTIONS[result.cefrBand]}
        </p>
      </div>

      {/* Per-prompt results */}
      {result.prompts.map((prompt, i) => (
        <div key={i} className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800">
              Prompt {i + 1}: {speakingPrompts[i]?.title}
            </h3>
            <div className={`cefr-badge text-sm ${CEFR_TEXT_CLASSES[prompt.cefrBand]}`}>
              {prompt.cefrBand}
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-3 italic">"{speakingPrompts[i]?.text}"</p>
          {prompt.transcript && (
            <div className="rounded-xl p-3 mb-3 text-sm"
              style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
              <p className="text-xs font-semibold text-slate-400 mb-1 uppercase">Transcript</p>
              <p className="text-slate-700 leading-relaxed italic">"{prompt.transcript}"</p>
            </div>
          )}
          <div className="rounded-xl p-3 mb-3 text-sm"
            style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <p className="text-xs font-semibold text-blue-600 mb-1 uppercase">Feedback</p>
            <p className="text-blue-800 leading-relaxed">{prompt.feedback}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(prompt.breakdown).map(([key, val]) => (
              <div key={key} className="rounded-lg p-3"
                style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <p className="text-xs font-bold text-slate-400 capitalize mb-0.5">
                  {key.replace(/([A-Z])/g, ' $1')}
                </p>
                <p className="text-xs text-slate-600">{val}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Layer 2 adaptive feedback */}
      <AdaptiveFeedbackPanel result={result} />

      <NavigationButtons state={state} dispatch={dispatch} allDone={allDone} />
    </div>
  );
}

// ── MCQ module summary ────────────────────────────────────────────────────────
export default function ModuleSummary({ state, dispatch }: Props) {
  const module   = state.activeModule!;
  const allDone  = Object.keys(state.results).length === 5;

  if (module === 'speaking') {
    return <SpeakingSummary state={state} dispatch={dispatch} allDone={allDone} />;
  }

  const result    = state.results[module as Exclude<ModuleType, 'speaking'>] as ModuleResult;
  if (!result) return null;

  const questions = moduleQuestions[module];
  const correct   = result.answers.filter(a => a.correct).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          {MODULE_LABELS[module]} Results
        </h2>
        <p className="text-slate-500 text-sm">
          Completed {new Date(result.completedAt).toLocaleString()}
        </p>
      </div>

      {/* Score + band hero */}
      <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 mb-6 text-center sm:text-left"
        style={{
          background: `linear-gradient(135deg, ${CEFR_COLORS[result.cefrBand]}20, ${CEFR_COLORS[result.cefrBand]}08)`,
          border: `2px solid ${CEFR_COLORS[result.cefrBand]}44`,
        }}>
        <div className="flex flex-col items-center">
          <div className="text-5xl font-black mb-1" style={{ color: CEFR_COLORS[result.cefrBand] }}>
            {result.cefrBand}
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CEFR Band</p>
        </div>

        <div className="w-px h-16 hidden sm:block"
          style={{ background: `${CEFR_COLORS[result.cefrBand]}40` }} />

        <div className="flex flex-col items-center sm:items-start">
          <div className="text-3xl font-black text-slate-800">
            {result.score}
            <span className="text-xl text-slate-400">/{result.total}</span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{correct} correct answers</p>
          <div className="h-2 rounded-full mt-2 w-48" style={{ background: '#e2e8f0' }}>
            <div className="h-full rounded-full"
              style={{
                width: `${(result.score / result.total) * 100}%`,
                background: CEFR_COLORS[result.cefrBand],
              }} />
          </div>
        </div>

        <div className="sm:ml-auto text-center sm:text-right">
          <p className="text-sm text-slate-600 max-w-xs">
            {CEFR_DESCRIPTIONS[result.cefrBand]}
          </p>
        </div>
      </div>

      {/* Adaptive path visualiser */}
      {result.adaptivePath && result.adaptivePath.length > 0 && (
        <AdaptivePathDisplay path={result.adaptivePath} />
      )}

      {/* ── Layer 2: Personalised recommendations ── */}
      <AdaptiveFeedbackPanel result={result} />

      {/* Question-by-question breakdown */}
      <div className="card overflow-hidden p-0 mb-6">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <h3 className="font-bold text-slate-800">Question-by-Question Breakdown</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Shown in adaptive order — the sequence the algorithm served them
          </p>
        </div>
        <div className="divide-y" style={{ borderColor: '#f8fafc' }}>
          {result.answers.map((ans, i) => {
            const q = questions.find(q => q.id === ans.questionId);
            if (!q) return null;
            return (
              <div key={q.id} className="px-5 py-3 flex items-start gap-3"
                style={{ background: ans.correct ? '#f0fdf4' : '#fef2f2' }}>
                <span className="w-6 h-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold"
                  style={{ background: ans.correct ? '#10b981' : '#ef4444', color: 'white' }}>
                  {ans.correct ? '✓' : '✗'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-slate-500">Q{i + 1}</span>
                    <span className="px-1.5 py-0.5 rounded text-xs font-bold"
                      style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                      {q.cefrLevel}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mb-1 line-clamp-2">{q.text}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs">
                    <span className={ans.correct ? 'text-green-700' : 'text-red-600'}>
                      Your answer:{' '}
                      <strong>
                        {ans.selectedIndex >= 0 ? q.options[ans.selectedIndex] : 'Not answered'}
                      </strong>
                    </span>
                    {!ans.correct && (
                      <span className="text-green-700">
                        Correct: <strong>{q.options[q.correctIndex]}</strong>
                      </span>
                    )}
                  </div>
                  {!ans.correct && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <NavigationButtons state={state} dispatch={dispatch} allDone={allDone} />
    </div>
  );
}

function NavigationButtons({
  state, dispatch, allDone,
}: {
  state: AppState; dispatch: React.Dispatch<AppAction>; allDone: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button onClick={() => dispatch({ type: 'GO_TO_MODULES' })} className="btn-secondary flex-1">
        ← Back to Modules
      </button>
      {allDone ? (
        <button onClick={() => dispatch({ type: 'GO_TO_DASHBOARD' })}
          className="btn-primary flex-1"
          style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
          📊 View Full Dashboard →
        </button>
      ) : (
        <button onClick={() => dispatch({ type: 'GO_TO_MODULES' })} className="btn-primary flex-1">
          Continue Assessment →
        </button>
      )}
    </div>
  );
}
