import { useState, useEffect } from 'react';
import { AppState, AppAction, ModuleType, ModuleResult } from '../utils/types';
import { moduleQuestions } from '../data/questions';
import { scoreToBand } from '../utils/cefr';
import ListeningPlayer from './ListeningPlayer';

interface Props {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export default function MCQModule({ state, dispatch }: Props) {
  const module = state.activeModule as Exclude<ModuleType, 'speaking'>;
  const questions = moduleQuestions[module];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tabWarning, setTabWarning] = useState(false);
  const [confirmed, setConfirmed] = useState<Record<number, boolean>>({});
  const [currentPassageId, setCurrentPassageId] = useState<string | undefined>(undefined);

  const current = questions[currentIndex];
  const totalQ = questions.length;

  // Track passage for reading (only show passage when it changes)
  useEffect(() => {
    if (module === 'reading') {
      const q = questions[currentIndex];
      if (q.passageId && q.passageId !== currentPassageId) {
        setCurrentPassageId(q.passageId);
      }
    }
  }, [currentIndex, module, questions, currentPassageId]);

  // Tab-focus integrity warning
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        dispatch({ type: 'INCREMENT_TAB_WARNING' });
        setTabWarning(true);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [dispatch]);

  const selectedAnswer = state.currentAnswers[current.id];
  const isLocked = confirmed[current.id] !== undefined;
  const canProceed = selectedAnswer !== undefined;

  const handleSelect = (idx: number) => {
    if (isLocked) return;
    dispatch({ type: 'SET_ANSWER', payload: { questionId: current.id, selectedIndex: idx } });
  };

  const handleConfirm = () => {
    if (!canProceed) return;
    setConfirmed(prev => ({ ...prev, [current.id]: true }));
  };

  const handleNext = () => {
    if (currentIndex < totalQ - 1) {
      setCurrentIndex(i => i + 1);
    }
  };

  const handleSubmit = () => {
    // Build answers list
    const answers = questions.map(q => ({
      questionId: q.id,
      selectedIndex: state.currentAnswers[q.id] ?? -1,
      correct: state.currentAnswers[q.id] === q.correctIndex,
    }));
    const score = answers.filter(a => a.correct).length;
    const result: ModuleResult = {
      module,
      score,
      total: totalQ,
      cefrBand: scoreToBand(score),
      answers,
      completedAt: new Date().toISOString(),
    };
    dispatch({ type: 'SUBMIT_MODULE', payload: result });
  };

  const isLastQuestion = currentIndex === totalQ - 1;
  const allAnswered = questions.every(q => state.currentAnswers[q.id] !== undefined);

  const moduleNames: Record<string, string> = {
    grammar: 'Grammar', vocabulary: 'Vocabulary', reading: 'Reading', listening: 'Listening',
  };
  const moduleName = moduleNames[module] || module;

  // Determine which passage to show for reading
  const getPassageForQuestion = () => {
    if (module !== 'reading') return null;
    // Find contextText from the first question with this passageId
    const passageQ = questions.find(q => q.passageId === current.passageId && q.contextText);
    return passageQ?.contextText ?? null;
  };

  const passageText = getPassageForQuestion();
  const showPassage = module === 'reading' && passageText;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Tab warning banner */}
      {tabWarning && (
        <div
          className="mb-4 px-4 py-3 rounded-xl flex items-center justify-between"
          style={{ background: '#fff7ed', border: '1.5px solid #fed7aa' }}
        >
          <div className="flex items-center gap-2 text-orange-800 text-sm font-medium">
            ⚠️ You navigated away from the test. This has been noted.
          </div>
          <button
            onClick={() => setTabWarning(false)}
            className="text-orange-600 hover:text-orange-800 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Module header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {moduleName} Assessment
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Question {currentIndex + 1} of {totalQ}
          </p>
        </div>
        <button
          onClick={() => dispatch({ type: 'GO_TO_MODULES' })}
          className="btn-secondary text-xs py-2 px-3"
        >
          ← Back
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full mb-6" style={{ background: '#e2e8f0' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${((currentIndex + 1) / totalQ) * 100}%`,
            background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)',
          }}
        />
      </div>

      {/* Question navigator dots */}
      <div className="flex gap-1.5 flex-wrap mb-6">
        {questions.map((q, i) => {
          const answered = state.currentAnswers[q.id] !== undefined;
          const isCurrent = i === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              className="w-7 h-7 rounded-full text-xs font-bold transition-all"
              style={{
                background: isCurrent ? '#1d4ed8' : answered ? '#bbf7d0' : '#e2e8f0',
                color: isCurrent ? 'white' : answered ? '#166534' : '#64748b',
                border: isCurrent ? '2px solid #1d4ed8' : '2px solid transparent',
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Question card */}
      <div className="card">
        {/* Level badge */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-bold"
            style={{ background: '#eff6ff', color: '#1d4ed8' }}
          >
            CEFR {current.cefrLevel}
          </span>
          {isLocked && (
            <span
              className="px-2.5 py-1 rounded-lg text-xs font-semibold"
              style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}
            >
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
        {showPassage && (
          <div
            className="rounded-xl p-4 mb-5 max-h-52 overflow-y-auto text-sm leading-relaxed"
            style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#374151' }}
          >
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
            let className = 'answer-option';
            const isSelected = selectedAnswer === idx;

            if (isLocked) {
              className += ' locked';
              if (idx === current.correctIndex) className += ' correct';
              else if (isSelected && idx !== current.correctIndex) className += ' incorrect';
              else if (isSelected) className += ' selected';
            } else if (isSelected) {
              className += ' selected';
            }

            return (
              <button
                key={idx}
                className={className}
                onClick={() => handleSelect(idx)}
              >
                <span
                  className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold border-2 mt-0.5"
                  style={{
                    borderColor: isLocked
                      ? idx === current.correctIndex
                        ? '#10b981'
                        : isSelected
                          ? '#ef4444'
                          : '#e2e8f0'
                      : isSelected
                        ? '#2563eb'
                        : '#e2e8f0',
                    background: isLocked
                      ? idx === current.correctIndex
                        ? '#10b981'
                        : isSelected
                          ? '#ef4444'
                          : 'transparent'
                      : isSelected
                        ? '#2563eb'
                        : 'transparent',
                    color: (isLocked && (idx === current.correctIndex || isSelected)) || (!isLocked && isSelected)
                      ? 'white'
                      : '#64748b',
                  }}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{opt}</span>
                {isLocked && idx === current.correctIndex && <span className="ml-auto text-green-600">✓</span>}
                {isLocked && isSelected && idx !== current.correctIndex && <span className="ml-auto text-red-500">✗</span>}
              </button>
            );
          })}
        </div>

        {/* Explanation (shown after locking) */}
        {isLocked && (
          <div
            className="mt-4 rounded-xl p-4 text-sm"
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}
          >
            <span className="font-semibold">Explanation: </span>
            {current.explanation}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="btn-secondary text-sm py-2"
          >
            ← Prev
          </button>

          <div className="flex gap-2">
            {!isLocked && (
              <button
                onClick={handleConfirm}
                disabled={!canProceed}
                className="btn-primary text-sm py-2.5 px-5"
              >
                Lock Answer
              </button>
            )}

            {isLocked && !isLastQuestion && (
              <button
                onClick={handleNext}
                className="btn-primary text-sm py-2.5 px-6"
              >
                Next →
              </button>
            )}

            {isLastQuestion && allAnswered && (
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{ background: '#10b981', color: 'white', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' }}
              >
                Submit {moduleName} →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom hint */}
      {!allAnswered && isLastQuestion && (
        <p className="text-center text-sm text-slate-500 mt-4">
          Please answer all questions before submitting.{' '}
          <button
            className="text-blue-600 underline"
            onClick={() => {
              const first = questions.findIndex(q => state.currentAnswers[q.id] === undefined);
              if (first >= 0) setCurrentIndex(first);
            }}
          >
            Go to first unanswered
          </button>
        </p>
      )}
    </div>
  );
}
