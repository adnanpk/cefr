import { useState, useRef, useEffect } from 'react';
import { AppState, AppAction, SpeakingResult, SpeakingPromptResult } from '../utils/types';
import { speakingPrompts } from '../data/questions';
import axios from 'axios';

interface Props {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'done';

interface PromptSession {
  transcript: string;
  audioBlob: Blob | null;
  state: RecordingState;
  result: SpeakingPromptResult | null;
  duration: number;
  error: string;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEventInit extends EventInit {
  resultIndex?: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function SpeakingModule({ state, dispatch }: Props) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [sessions, setSessions] = useState<PromptSession[]>(
    speakingPrompts.map(() => ({
      transcript: '',
      audioBlob: null,
      state: 'idle',
      result: null,
      duration: 0,
      error: '',
    }))
  );
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const prompt = speakingPrompts[promptIndex];
  const session = sessions[promptIndex];

  const updateSession = (idx: number, patch: Partial<PromptSession>) => {
    setSessions(prev => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startRecording = async () => {
    chunksRef.current = [];
    setRecordingSeconds(0);
    updateSession(promptIndex, { transcript: '', error: '', state: 'recording' });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(500);
    } catch {
      // Fallback: no mic, record transcript only via text
      updateSession(promptIndex, { error: 'Microphone not available. You can type your response below.', state: 'idle' });
      return;
    }

    // Timer
    timerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);

    // Speech recognition
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      let finalTranscript = '';
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalTranscript += t + ' ';
          else interim += t;
        }
        updateSession(promptIndex, { transcript: finalTranscript + interim });
      };
      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recognitionRef.current?.stop();

    const mr = mediaRecorderRef.current;
    if (!mr) {
      gradeTranscript(promptIndex, sessions[promptIndex].transcript, null);
      return;
    }

    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      mr.stream.getTracks().forEach(t => t.stop());
      updateSession(promptIndex, { audioBlob: blob, duration: recordingSeconds });
      gradeTranscript(promptIndex, sessions[promptIndex].transcript, blob);
    };

    mr.stop();
  };

  const gradeTranscript = async (idx: number, transcript: string, _blob: Blob | null) => {
    updateSession(idx, { state: 'processing' });
    const pr = speakingPrompts[idx];

    try {
      const formData = new FormData();
      formData.append('transcript', transcript || '[No speech detected — user attempted to speak]');
      formData.append('prompt', pr.text);
      formData.append('promptTitle', pr.title);

      const res = await axios.post('/api/speaking/grade', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      const data = res.data as SpeakingPromptResult & { band?: string; cefrBand?: string };
      const result: SpeakingPromptResult = {
        promptText: pr.text,
        transcript: transcript,
        cefrBand: (data.cefrBand || data.band || 'B1') as SpeakingPromptResult['cefrBand'],
        score: data.score ?? 5,
        feedback: data.feedback ?? 'Assessment complete.',
        breakdown: data.breakdown ?? {
          grammar: 'See overall feedback.',
          vocabulary: 'See overall feedback.',
          coherence: 'See overall feedback.',
          taskAchievement: 'See overall feedback.',
        },
      };

      updateSession(idx, { result, state: 'done' });
    } catch (err) {
      // Graceful fallback if server is unavailable
      const fallbackResult: SpeakingPromptResult = {
        promptText: pr.text,
        transcript: transcript,
        cefrBand: 'B1',
        score: 5,
        feedback: 'Your response was recorded. AI grading is unavailable — please check your server configuration.',
        breakdown: {
          grammar: 'Simulated score.',
          vocabulary: 'Simulated score.',
          coherence: 'Simulated score.',
          taskAchievement: 'Simulated score.',
        },
      };
      updateSession(idx, { result: fallbackResult, state: 'done', error: 'Server unreachable. Showing placeholder result.' });
    }
  };

  const handleManualTranscript = (text: string) => {
    updateSession(promptIndex, { transcript: text });
  };

  const handleSubmitManual = () => {
    gradeTranscript(promptIndex, sessions[promptIndex].transcript, null);
    updateSession(promptIndex, { state: 'processing' });
  };

  const handleFinalSubmit = () => {
    const completedSessions = sessions.filter(s => s.result !== null);
    if (completedSessions.length === 0) return;

    const bands = completedSessions.map(s => s.result!.cefrBand);
    const avgScore = completedSessions.reduce((sum, s) => sum + (s.result?.score ?? 5), 0) / completedSessions.length;
    const bandMap: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
    const avgBandNum = bands.reduce((s, b) => s + (bandMap[b] || 3), 0) / bands.length;
    const bandLabels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const overallBand = bandLabels[Math.max(0, Math.min(5, Math.round(avgBandNum) - 1))] as SpeakingResult['cefrBand'];

    const result: SpeakingResult = {
      module: 'speaking',
      prompts: completedSessions.map(s => s.result!),
      cefrBand: overallBand,
      score: Math.round(avgScore),
      completedAt: new Date().toISOString(),
    };

    dispatch({ type: 'SUBMIT_SPEAKING', payload: result });
  };

  const allDone = sessions.every(s => s.result !== null);
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Speaking Assessment</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Prompt {promptIndex + 1} of {speakingPrompts.length}
          </p>
        </div>
        <button onClick={() => dispatch({ type: 'GO_TO_MODULES' })} className="btn-secondary text-xs py-2 px-3">
          ← Back
        </button>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-6">
        {speakingPrompts.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setPromptIndex(i)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: i === promptIndex ? '#1d4ed8' : sessions[i].result ? '#d1fae5' : '#f1f5f9',
              color: i === promptIndex ? 'white' : sessions[i].result ? '#065f46' : '#64748b',
              border: `2px solid ${i === promptIndex ? '#1d4ed8' : sessions[i].result ? '#6ee7b7' : '#e2e8f0'}`,
            }}
          >
            {sessions[i].result ? '✓ ' : ''}{p.title}
          </button>
        ))}
      </div>

      {/* Prompt card */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="px-3 py-1 rounded-lg text-xs font-bold"
            style={{ background: '#fef3c7', color: '#92400e' }}
          >
            🎤 Speaking Prompt {promptIndex + 1}
          </span>
        </div>

        <p className="text-base font-medium text-slate-800 leading-relaxed mb-4">
          {prompt.text}
        </p>

        <div
          className="rounded-xl p-3 text-sm"
          style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}
        >
          <span className="font-semibold">Guidance: </span>{prompt.guidance}
        </div>
      </div>

      {/* Recording interface */}
      <div className="card">
        {session.state === 'idle' && (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">🎤</div>
            <p className="text-slate-600 mb-6 text-sm">
              Click <strong>Start Recording</strong> when you are ready to speak.<br />
              Your response will be transcribed and graded by AI.
            </p>
            {session.error && (
              <div className="mb-4 p-3 rounded-xl text-sm text-orange-700" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                {session.error}
                <div className="mt-3">
                  <textarea
                    className="w-full rounded-lg p-3 text-sm text-slate-800 outline-none resize-none"
                    style={{ border: '2px solid #e2e8f0', minHeight: '80px' }}
                    placeholder="Type your response here..."
                    value={session.transcript}
                    onChange={e => handleManualTranscript(e.target.value)}
                  />
                  <button
                    onClick={handleSubmitManual}
                    disabled={!session.transcript.trim()}
                    className="btn-primary mt-2 text-sm py-2 px-5"
                  >
                    Submit Written Response
                  </button>
                </div>
              </div>
            )}
            {!session.error && (
              <button onClick={startRecording} className="btn-primary px-8 py-3.5">
                🔴 Start Recording
              </button>
            )}
          </div>
        )}

        {session.state === 'recording' && (
          <div className="text-center py-4">
            {/* Pulse indicator */}
            <div className="flex items-center justify-center mb-5">
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl"
                  style={{ background: '#ef4444', animation: 'none' }}
                >
                  🎙️
                </div>
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'rgba(239,68,68,0.3)',
                    animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
                  }}
                />
              </div>
            </div>
            <p className="font-bold text-red-600 text-lg mb-1">Recording…</p>
            <p className="text-slate-500 text-sm mb-2">{fmt(recordingSeconds)}</p>

            {/* Live transcript */}
            {session.transcript && (
              <div
                className="text-left rounded-xl p-4 mb-4 text-sm text-slate-700 max-h-32 overflow-y-auto"
                style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
              >
                <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Live transcript</p>
                <p className="leading-relaxed">{session.transcript}<span className="animate-pulse">|</span></p>
              </div>
            )}

            <button
              onClick={stopRecording}
              className="px-8 py-3.5 rounded-xl font-bold text-white transition-all hover:scale-105"
              style={{ background: '#ef4444', boxShadow: '0 4px 14px rgba(239,68,68,0.4)' }}
            >
              ⬛ Stop Recording
            </button>
          </div>
        )}

        {session.state === 'processing' && (
          <div className="text-center py-10">
            <div className="text-4xl mb-4 animate-spin">⚙️</div>
            <p className="font-semibold text-slate-700 mb-1">Analysing your response…</p>
            <p className="text-slate-500 text-sm">Claude AI is evaluating your speaking against CEFR descriptors</p>
          </div>
        )}

        {session.state === 'done' && session.result && (
          <div>
            {/* Band result */}
            <div
              className="flex items-center gap-4 p-4 rounded-xl mb-4"
              style={{ background: '#f0fdf4', border: '1.5px solid #86efac' }}
            >
              <div
                className="cefr-badge text-emerald-700 bg-emerald-100 border-emerald-400 w-14 h-14 text-xl shrink-0"
              >
                {session.result.cefrBand}
              </div>
              <div>
                <p className="font-bold text-emerald-800">Speaking Band: {session.result.cefrBand}</p>
                <p className="text-sm text-emerald-700 mt-0.5">Score: {session.result.score}/10</p>
              </div>
            </div>

            {/* Transcript */}
            {session.result.transcript && (
              <div className="rounded-xl p-4 mb-4" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Your response (transcript)</p>
                <p className="text-sm text-slate-700 leading-relaxed italic">"{session.result.transcript}"</p>
              </div>
            )}

            {/* Feedback */}
            <div className="rounded-xl p-4 mb-4" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wider">Overall Feedback</p>
              <p className="text-sm text-blue-800 leading-relaxed">{session.result.feedback}</p>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(session.result.breakdown).map(([key, val]) => (
                <div key={key} className="rounded-xl p-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <p className="text-xs font-bold text-slate-500 capitalize mb-1">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">{val}</p>
                </div>
              ))}
            </div>

            {/* Re-record option */}
            {session.error && (
              <p className="text-xs text-orange-600 mt-3 text-center">{session.error}</p>
            )}

            <div className="mt-4 flex justify-center">
              <button
                onClick={() => updateSession(promptIndex, { state: 'idle', transcript: '', result: null, error: '' })}
                className="btn-secondary text-xs py-2 px-4"
              >
                ↺ Re-record this prompt
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigate between prompts */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPromptIndex(i => Math.max(0, i - 1))}
          disabled={promptIndex === 0}
          className="btn-secondary text-sm py-2"
        >
          ← Prompt 1
        </button>
        {promptIndex < speakingPrompts.length - 1 ? (
          <button
            onClick={() => setPromptIndex(i => i + 1)}
            className="btn-primary text-sm py-2.5 px-5"
          >
            Prompt 2 →
          </button>
        ) : (
          <button
            onClick={handleFinalSubmit}
            disabled={!allDone}
            className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{
              background: allDone ? '#10b981' : '#94a3b8',
              color: 'white',
              cursor: allDone ? 'pointer' : 'not-allowed',
            }}
          >
            Submit Speaking →
          </button>
        )}
      </div>

      {!allDone && (
        <p className="text-center text-xs text-slate-400 mt-3">
          Complete both prompts to submit the Speaking module.
        </p>
      )}
    </div>
  );
}
