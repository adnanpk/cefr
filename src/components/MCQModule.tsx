import { useState, useEffect, useCallback } from 'react';
import { AppState, AppAction, ModuleType, ModuleResult, CEFRBand, MCQQuestion } from '../utils/types';
import { moduleQuestions } from '../data/questions';
import { scoreToBand, bandToNumeric, CEFR_COLORS } from '../utils/cefr';
import ListeningPlayer from './ListeningPlayer';

interface Props {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

// ── Adaptive helpers ──────────────────────────────────────────────────────────

/** Find the best starting question: first B1 (middle difficulty), fallback to middle index */
function getStartId(questions: MCQQuestion[]): number {
  const b1 = questions.find(q => q.cefrLevel === 'B1');
  return (b1 ?? questions[Math.floor(questions.length / 2)]).id;
}

/**
 * Pick the next question to serve.
 * Target = lastBand ± 1 level depending on correctness.
 * Chooses the unserved question whose CEFR difficulty is closest to the target.
 * On a tie, prefers the question whose level hasn't been seen yet.
 */
function pickNext(
  questions: MCQQuestion[],
  servedIds: Set<number>,
  wasCorrect: boolean,
  lastBand: CEFRBand
): number | null {
  const pool = questions.filter(q => !servedIds.has(q.id));
  if (!pool.length) return null;

  const lastN = bandToNumeric(lastBand);
  const targetN = Math.max(1, Math.min(6, wasCorrect ? lastN + 1 : lastN - 1));

  const servedBands = new Set(
    questions.filter(q => servedIds.has(q.id)).map(q => q.cefrLevel)
  );

  return pool.reduce((best, q) => {
    const qDist = Math.abs(bandToNumeric(q.cefrLevel) - targetN);
    const bDist = Math.abs(bandToNumeric(best.cefrLevel) - targetN);
    if (qDist !== bDist) return qDist < bDist ? q : best;
    // Tie-break: prefer a level not yet seen
    const qNew = !servedBands.has(q.cefrLevel);
    const bNew = !servedBands.has(best.cefrLevel);
    return qNew && !bNew ? q : best;
  }).id;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function MCQModule({ state, dispatch }: Props) {
  const module = state.activeModule as Exclude<ModuleType, 'speaking'>;
  const questions = moduleQuestions[module];
  const TOTAL = questions.length; // 12

  // Adaptive order state
  const [servedOrder, setServedOrder] = useState<number[]>(() => [getStartId(questions)]);
  const [currentPos, setCurrentPos] = useState(0);
  const [confirmed, setConfirmed] = useState<Record<number, boolean>>({});
  const [tabWarning, setTabWarning] = useState(false);

  const currentId   = servedOrder[currentPos];
  const current     = questions.find(q => q.id === currentId)!;
  const isLocked    = !!confirmed[currentId];
  const selectedAns = state.currentAnswers[currentId];
  const allServed   = servedOrder.length === TOTAL;

  // Passage text for reading (find contextText from first question with this passageId)
  const passageText =
    module === 'reading' && current.passageId
      ? questions.find(q => q.passageId === current.passageId && q.contextText)?.contextText
      : undefined;

  // Tab-focus integrity
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        dispatch({ type: 'INCREMENT_TAB_WARNING' });
        setTabWarning(true);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [dispatch]);

  // Queue next question when user advances past the last served one
  const queueNext = useCallback((wasCorrect: boolean, fromBand: CEFRBand) => {
    const usedSet = new Set(servedOrder);
    const nextId = pickNext(questions, usedSet, wasCorrect, fromBand);
    if (nextId !== null) {
      setServedOrder(prev => [...prev, nextId]);
    }
  }, [servedOrder, questions]);

  const handleSelect = (idx: number) => {
    if (isLocked) return;
    dispatch({ type: 'SET_ANSWER', payload: { questionId: currentId, selectedIndex: idx } });
  };

  const handleLock = () => {
    if (selectedAns === undefined) return;
    setConfirmed(prev => ({ ...prev, [currentId]: true }));
    // Pre-queue the next question immediately so the dot appears
    if (servedOrder.length <= currentPos + 1 && servedOrder.length < TOTAL) {
      const wasCorrect = selectedAns === current.correctIndex;
      queueNext(wasCorrect, current.cefrLevel);
    }
  };

  const handleNext = () => {
    if (currentPos < servedOrder.length - 1) {
      setCurrentPos(p => p + 1);
    }
  };

  const handleSubmit = () => {
    const answers = servedOrder.map(id => {
      const q = questions.find(q => q.id === id)!;
      const sel = state.currentAnswers[id] ?? -1;
      return { questionId: id, selectedIndex: sel, correct: sel === q.correctIndex };
    });
    const score = answers.filter(a => a.correct).length;
    const result: ModuleResult = {
      module,
      score,
      total: TOTAL,
      cefrBand: scoreToBand(score),
      answers,
      completedAt: new Date().toISOString(),
      adaptivePath: servedOrder.map(id => questions.find(q => q.id === id)!.cefrLevel),
    };
    dispatch({ type: 'SUBMIT_MODULE', payload: result });
  };

  const MODULE_LABELS: Record<string, string> = {
    grammar: 'Grammar', vocabulary: 'Vocabulary', reading: 'Reading', listening: 'Listening',
  };

  const isLastServed  = currentPos === servedOrder.length - 1;
  const allConfirmed  = servedOrder.every(id => confirmed[id]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* Tab warning */}
      {tabWarning && (
        <div className="mb-4 px-4 py-3 rounded-xl flex items-center justify-between"
          style={{ background: '#fff7ed', border: '1.5px solid #fed7aa' }}>
          <span className="text-orange-800 text-sm font-medium">
            ⚠️ You navigated away from the test. This has been recorded.
          </span>
          <button onClick={() => setTabWarning(false)}
            className="text-orange-600 hover:text-orange-800 text-xs font-semibold ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{MODULE_LABELS[module]} Assessment</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Question {currentPos + 1} of {TOTAL}
            <span className="ml-2 text-xs" style={{ color: '#94a3b8' }}>
              · Adaptive mode
            </span>
          </p>
        </div>
        <button onClick={() => dispatch({ type: 'GO_TO_MODULES' })}
          className="btn-secondary text-xs py-2 px-3">
          ← Back
        </button>
      </div>

      {/* Overall progress bar */}
      <div className="h-2 rounded-full mb-5" style={{ background: '#e2e8f0' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${((currentPos + 1) / TOTAL) * 100}%`,
            background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)',
          }} />
      </div>

      {/* ── Adaptive path visualiser ─────────────────────────────────────────── */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Your adaptive path
        </p>
        <div className="flex gap-1.5 flex-wrap items-center">
          {/* Served questions */}
          {servedOrder.map((qId, i) => {
            const q    = questions.find(q => q.id === qId)!;
            const ans  = state.currentAnswers[qId];
            const done = confirmed[qId];
            const ok   = done && ans === q.correctIndex;
            const bad  = done && ans !== q.correctIndex;
            const cur  = i === currentPos;

            return (
              <button key={qId} onClick={() => setCurrentPos(i)}
                title={`Q${i + 1} — ${q.cefrLevel}`}
                className="flex flex-col items-center gap-0.5 group">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: cur
                      ? '#1d4ed8'
                      : ok  ? '#10b981'
                      : bad ? '#ef4444'
                      : '#e2e8f0',
                    color: cur || ok || bad ? 'white' : '#94a3b8',
                    boxShadow: cur ? '0 0 0 3px rgba(29,78,216,0.25)' : '',
                    border: cur ? '2px solid #1d4ed8' : '2px solid transparent',
                  }}>
                  {q.cefrLevel}
                </div>
                {done && (
                  <span className="text-xs" style={{ color: ok ? '#10b981' : '#ef4444' }}>
                    {ok ? '✓' : '✗'}
                  </span>
                )}
              </button>
            );
          })}

          {/* Ghost slots for unserved questions */}
          {Array.from({ length: TOTAL - servedOrder.length }).map((_, i) => (
            <div key={`ghost-${i}`}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ border: '2px dashed #e2e8f0' }}>
              <span className="text-slate-300 text-xs">?</span>
            </div>
          ))}

          {/* Legend */}
          <div className="ml-auto flex gap-3 text-xs text-slate-400 shrink-0">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> Current
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Correct
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Incorrect
            </span>
          </div>
        </div>

        {/* Difficulty trend arrow */}
        {servedOrder.length > 1 && (() => {
          const prev = questions.find(q => q.id === servedOrder[currentPos - 1 < 0 ? 0 : currentPos - 1]);
          const curr = questions.find(q => q.id === currentId);
          if (!prev || !curr || currentPos === 0) return null;
          const delta = bandToNumeric(curr.cefrLevel) - bandToNumeric(prev.cefrLevel);
          if (delta === 0) return null;
          return (
            <p className="text-xs mt-1.5" style={{ color: CEFR_COLORS[curr.cefrLevel] }}>
              {delta > 0
                ? `↑ Difficulty increased to ${curr.cefrLevel} — great work on the last question`
                : `↓ Difficulty adjusted to ${curr.cefrLevel} — let's consolidate here`}
            </p>
          );
        })()}
      </div>

      {/* ── Question card ──────────────────────────────────────────────────── */}
      <div className="card">
        {/* CEFR badge + lock status */}
        <div className="flex items-center justify-between mb-4">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
            style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            CEFR {current.cefrLevel}
          </span>
          {isLocked && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
              style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
              ✓ Answer locked
            </span>
          )}
        </div>

        {/* Listening player */}
        {module === 'listening' && current.audioScript && (
          <ListeningPlayer
            questionId={current.id}
            script={current.audioScript}
            playCount={state.listeningPlayCounts[current.id] ?? 0}
            onPlay={() => dispatch({ type: 'INCREMENT_PLAY_COUNT', payload: current.id })}
          />
        )}

        {/* Reading passage */}
        {passageText && (
          <div className="rounded-xl p-4 mb-5 max-h-52 overflow-y-auto text-sm leading-relaxed"
            style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#374151' }}>
            <p className="font-semibold text-xs text-slate-500 mb-2 uppercase tracking-wider">
              📖 Reading Passage
            </p>
            <p>{passageText}</p>
          </div>
        )}

        {/* Question text */}
        <p className="text-base font-semibold text-slate-800 mb-5 leading-relaxed">
          {current.text}
        </p>

        {/* Answer options */}
        <div className="space-y-2.5">
          {current.options.map((opt, idx) => {
            let cls = 'answer-option';
            const isSel = selectedAns === idx;
            if (isLocked) {
              cls += ' locked';
              if (idx === current.correctIndex) cls += ' correct';
              else if (isSel) cls += ' incorrect';
            } else if (isSel) {
              cls += ' selected';
            }

            return (
              <button key={idx} className={cls} onClick={() => handleSelect(idx)}>
                <span className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold border-2 mt-0.5"
                  style={{
                    borderColor: isLocked
                      ? idx === current.correctIndex ? '#10b981' : isSel ? '#ef4444' : '#e2e8f0'
                      : isSel ? '#2563eb' : '#e2e8f0',
                    background: isLocked
                      ? idx === current.correctIndex ? '#10b981' : isSel ? '#ef4444' : 'transparent'
                      : isSel ? '#2563eb' : 'transparent',
                    color: (isLocked && (idx === current.correctIndex || isSel)) || (!isLocked && isSel)
                      ? 'white' : '#64748b',
                  }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{opt}</span>
                {isLocked && idx === current.correctIndex && <span className="ml-auto text-green-600">✓</span>}
                {isLocked && isSel && idx !== current.correctIndex && <span className="ml-auto text-red-500">✗</span>}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {isLocked && (
          <div className="mt-4 rounded-xl p-4 text-sm"
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}>
            <span className="font-semibold">Explanation: </span>
            {current.explanation}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button onClick={() => setCurrentPos(p => Math.max(0, p - 1))}
            disabled={currentPos === 0}
            className="btn-secondary text-sm py-2">
            ← Prev
          </button>

          <div className="flex gap-2">
            {!isLocked && (
              <button onClick={handleLock} disabled={selectedAns === undefined}
                className="btn-primary text-sm py-2.5 px-5">
                Lock Answer
              </button>
            )}
            {isLocked && isLastServed && !allServed && (
              /* Waiting for next question to be queued — shouldn't linger */
              <button disabled className="btn-primary text-sm py-2.5 px-5 opacity-50">
                Loading next…
              </button>
            )}
            {isLocked && !isLastServed && (
              <button onClick={handleNext} className="btn-primary text-sm py-2.5 px-6">
                Next →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Submit panel — appears when all 12 questions served & confirmed ── */}
      {allServed && allConfirmed && (
        <div className="mt-6 rounded-2xl p-6 text-center"
          style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #86efac' }}>
          <p className="text-emerald-800 font-semibold mb-1">
            ✓ All {TOTAL} questions completed
          </p>
          <p className="text-emerald-700 text-sm mb-4">
            {servedOrder.filter(id => {
              const q = questions.find(q => q.id === id)!;
              return state.currentAnswers[id] === q.correctIndex;
            }).length} / {TOTAL} correct — ready to see your results
          </p>
          <button onClick={handleSubmit}
            className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
            style={{ background: '#10b981', boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}>
            Submit {MODULE_LABELS[module]} →
          </button>
        </div>
      )}

      {/* Progress hint */}
      {!allServed && (
        <p className="text-center text-xs text-slate-400 mt-4">
          {TOTAL - servedOrder.length} question{TOTAL - servedOrder.length !== 1 ? 's' : ''} remaining
          · The next question is chosen based on your answers
        </p>
      )}
    </div>
  );
}
