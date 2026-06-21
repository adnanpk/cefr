import { useState } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import axios from 'axios';
import { AppState, AppAction, ModuleType } from '../utils/types';
import {
  CEFR_BANDS,
  CEFR_DESCRIPTIONS,
  CEFR_COLORS,
  CEFR_TEXT_CLASSES,
  calculateOverallBand,
  bandToNumeric,
} from '../utils/cefr';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface Props {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const MODULES: { key: ModuleType; label: string; icon: string }[] = [
  { key: 'grammar', label: 'Grammar', icon: '✏️' },
  { key: 'vocabulary', label: 'Vocabulary', icon: '📚' },
  { key: 'reading', label: 'Reading', icon: '📖' },
  { key: 'listening', label: 'Listening', icon: '🎧' },
  { key: 'speaking', label: 'Speaking', icon: '🎤' },
];

function getResult(state: AppState, key: ModuleType) {
  if (key === 'speaking') return state.results.speaking;
  return state.results[key as Exclude<ModuleType, 'speaking'>];
}

export default function Dashboard({ state, dispatch }: Props) {
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'ok' | 'err' | 'unconfigured'>('idle');

  const completedModules = MODULES.filter(m => !!getResult(state, m.key));
  const bands = completedModules.map(m => getResult(state, m.key)!.cefrBand);
  const overallBand = calculateOverallBand(bands);

  // Radar data
  const radarData = {
    labels: MODULES.map(m => m.label),
    datasets: [
      {
        label: 'Your CEFR Profile',
        data: MODULES.map(m => {
          const r = getResult(state, m.key);
          return r ? bandToNumeric(r.cefrBand) : 0;
        }),
        backgroundColor: 'rgba(29, 78, 216, 0.12)',
        borderColor: 'rgba(29, 78, 216, 0.85)',
        borderWidth: 2.5,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 6,
        ticks: {
          stepSize: 1,
          font: { size: 11 },
          color: '#94a3b8',
          callback: (val: number | string) => {
            const n = typeof val === 'number' ? val : parseFloat(val);
            return n > 0 ? CEFR_BANDS[n - 1] : '';
          },
        },
        grid: { color: 'rgba(148,163,184,0.2)' },
        angleLines: { color: 'rgba(148,163,184,0.2)' },
        pointLabels: { font: { size: 13, weight: 'bold' as const }, color: '#374151' },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { raw: unknown }) => {
            const v = typeof ctx.raw === 'number' ? ctx.raw : 0;
            return ` ${v > 0 ? CEFR_BANDS[v - 1] : 'N/A'}`;
          },
        },
      },
    },
    maintainAspectRatio: true,
  };

  // Build email results payload
  const buildPayload = () => ({
    candidateData: {
      name: state.candidate?.name,
      email: state.candidate?.email,
      startedAt: state.candidate?.startedAt,
      completedAt: new Date().toISOString(),
    },
    results: {
      overall: overallBand,
      modules: MODULES.reduce((acc, m) => {
        const r = getResult(state, m.key);
        if (r) {
          const isModuleResult = 'total' in r;
          acc[m.key] = {
            band: r.cefrBand,
            score: isModuleResult ? `${(r as { score: number; total: number }).score}/${(r as { score: number; total: number }).total}` : `${r.score}/10`,
          };
        }
        return acc;
      }, {} as Record<string, { band: string; score: string }>),
      speakingTranscripts: state.results.speaking?.prompts.map(p => ({
        prompt: p.promptText,
        transcript: p.transcript,
        band: p.cefrBand,
        feedback: p.feedback,
      })),
    },
  });

  // Auto-send admin report once on completion (silent, best-effort)
  const autoSendAdmin = async () => {
    try {
      await axios.post('/api/email/admin', buildPayload());
      dispatch({ type: 'SET_EMAIL_SENT' });
    } catch {
      // Non-critical
    }
  };

  if (!state.emailSent && completedModules.length === 5) {
    autoSendAdmin();
  }

  // Manual "Email My Results" — always sends to admin (arsheikh540@gmail.com)
  const handleEmailResults = async () => {
    setSending(true);
    setSendStatus('idle');
    try {
      const res = await axios.post('/api/email/admin', buildPayload());
      if (res.data?.success === false) {
        setSendStatus('unconfigured');
      } else {
        setSendStatus('ok');
        dispatch({ type: 'SET_EMAIL_SENT' });
      }
    } catch {
      setSendStatus('err');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Page title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-1">Assessment Report</h2>
        <p className="text-slate-500 text-sm">
          {state.candidate?.name} · Completed {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Overall CEFR hero */}
      <div
        className="rounded-2xl p-8 text-center mb-8 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #0f2744 0%, #1d4ed8 100%)`,
          color: 'white',
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-10"
          style={{ background: 'white' }}
        />
        <div
          className="absolute -left-12 -bottom-12 w-56 h-56 rounded-full opacity-5"
          style={{ background: 'white' }}
        />

        <p className="text-blue-200 text-sm font-medium uppercase tracking-widest mb-3">
          Overall Cumulative CEFR Band
        </p>
        <div
          className="text-8xl font-black mb-3 relative z-10"
          style={{ color: bands.length ? CEFR_COLORS[overallBand] : '#94a3b8', textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
        >
          {bands.length ? overallBand : '—'}
        </div>
        <p className="text-blue-100 text-base max-w-md mx-auto relative z-10">
          {bands.length ? CEFR_DESCRIPTIONS[overallBand] : 'Complete more modules to see your overall band.'}
        </p>
        {bands.length > 0 && (
          <p className="text-blue-300 text-xs mt-2 relative z-10">
            Based on {completedModules.length}/5 modules completed
          </p>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Radar chart */}
        <div className="card flex flex-col">
          <h3 className="font-bold text-slate-800 mb-4">Skill Profile — Radar View</h3>
          <div className="flex-1 flex items-center justify-center" style={{ minHeight: 280 }}>
            <div style={{ width: '100%', maxWidth: 340 }}>
              <Radar data={radarData} options={radarOptions} />
            </div>
          </div>
        </div>

        {/* Per-module score bars */}
        <div className="card">
          <h3 className="font-bold text-slate-800 mb-4">Module-by-Module Scores</h3>
          <div className="space-y-5">
            {MODULES.map(m => {
              const r = getResult(state, m.key);
              const band = r?.cefrBand;
              const numeric = band ? bandToNumeric(band) : 0;
              const pct = (numeric / 6) * 100;

              return (
                <div key={m.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{m.icon}</span>
                      <span className="text-sm font-semibold text-slate-700">{m.label}</span>
                    </div>
                    {band ? (
                      <div className="flex items-center gap-2">
                        {'score' in r! && 'total' in r! && (
                          <span className="text-xs text-slate-500">
                            {(r as { score: number; total: number }).score}/{(r as { score: number; total: number }).total}
                          </span>
                        )}
                        <span
                          className="px-2 py-0.5 rounded-md text-xs font-bold"
                          style={{
                            background: `${CEFR_COLORS[band]}18`,
                            color: CEFR_COLORS[band],
                            border: `1px solid ${CEFR_COLORS[band]}44`,
                          }}
                        >
                          {band}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Not attempted</span>
                    )}
                  </div>
                  <div className="h-2.5 rounded-full" style={{ background: '#e2e8f0' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: band ? CEFR_COLORS[band] : '#e2e8f0',
                      }}
                    />
                  </div>
                  {/* CEFR scale labels */}
                  {r && (
                    <div className="flex justify-between text-xs text-slate-300 mt-0.5">
                      {CEFR_BANDS.map(b => (
                        <span key={b} className={b === band ? 'font-bold' : ''} style={{ color: b === band ? CEFR_COLORS[band!] : undefined }}>
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Speaking detail */}
      {state.results.speaking && (
        <div className="card mb-6">
          <h3 className="font-bold text-slate-800 mb-4">Speaking Transcripts & AI Feedback</h3>
          <div className="space-y-4">
            {state.results.speaking.prompts.map((p, i) => (
              <div
                key={i}
                className="rounded-xl p-4"
                style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-slate-700">Prompt {i + 1}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${CEFR_TEXT_CLASSES[p.cefrBand]}`}>
                    {p.cefrBand}
                  </span>
                </div>
                {p.transcript && (
                  <p className="text-xs text-slate-600 italic mb-2 leading-relaxed">
                    "{p.transcript.slice(0, 240)}{p.transcript.length > 240 ? '…' : ''}"
                  </p>
                )}
                <p className="text-xs text-blue-700 leading-relaxed">{p.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email section */}
      <div className="card mb-6">
        <h3 className="font-bold text-slate-800 mb-1">Email Results</h3>
        <p className="text-sm text-slate-500 mb-4">
          Send a full report — including scores, transcripts, and AI feedback — to the supervising examiner.
        </p>
        <button
          onClick={handleEmailResults}
          disabled={sending}
          className="btn-primary text-sm py-2.5 px-6"
        >
          {sending ? '⏳ Sending…' : '📧 Email My Results'}
        </button>
        {sendStatus === 'ok' && (
          <p className="mt-3 text-sm text-green-600 font-medium">✓ Results sent successfully.</p>
        )}
        {sendStatus === 'unconfigured' && (
          <p className="mt-3 text-sm text-amber-600 font-medium">
            ⚠️ Email is not configured. Add a valid <code>RESEND_API_KEY</code> to your <code>.env</code> and restart the server.
          </p>
        )}
        {sendStatus === 'err' && (
          <p className="mt-3 text-sm text-red-600">
            ✗ Could not reach the server. Make sure <code>npm run dev</code> is running.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => dispatch({ type: 'GO_TO_MODULES' })}
          className="btn-secondary flex-1"
        >
          ← Review Modules
        </button>
        <button
          onClick={() => {
            if (window.confirm('Start a new assessment? Your current results will be cleared.')) {
              dispatch({ type: 'RESET' });
            }
          }}
          className="flex-1 py-3 rounded-xl font-semibold text-sm text-slate-600 transition-all hover:bg-red-50 hover:text-red-700"
          style={{ border: '2px solid #e2e8f0' }}
        >
          🔄 Start New Assessment
        </button>
      </div>
    </div>
  );
}
