import { useState, useRef, useEffect, useCallback } from 'react';

interface Props {
  questionId: number;
  script: string;
  playCount: number;
  onPlay: () => void;
}

export default function ListeningPlayer({ questionId, script, playCount, onPlay }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [estimatedDuration, setEstimatedDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const canPlay = playCount < 2;

  // Estimate reading time: ~130 words per minute at rate 0.9
  useEffect(() => {
    const words = script.trim().split(/\s+/).length;
    setEstimatedDuration(Math.ceil((words / 130) * 60));
  }, [script]);

  const stopPlaying = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // Stop when tab is hidden so play count is preserved
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && isPlaying) stopPlaying();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [isPlaying, stopPlaying]);

  // Cleanup on unmount or question change
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [questionId]);

  const handlePlay = () => {
    if (!canPlay || isPlaying) return;

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 0.88;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const engVoice = voices.find(v => v.lang.startsWith('en') && !v.name.includes('Google'));
    if (engVoice) utterance.voice = engVoice;

    utterance.onstart = () => {
      setIsPlaying(true);
      setProgress(0);
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setProgress(Math.min(elapsed / estimatedDuration, 0.99));
      }, 200);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(1);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    window.speechSynthesis.speak(utterance);
    onPlay();
  };

  const playsLeft = 2 - playCount;

  return (
    <div
      className="rounded-xl overflow-hidden mb-5"
      style={{ background: '#0f172a', border: '1px solid #1e293b' }}
    >
      {/* TTS label */}
      <div
        className="px-4 py-2 flex items-center gap-2 text-xs font-medium"
        style={{ background: '#1e293b', color: '#94a3b8' }}
      >
        <span>🎧</span>
        <span>AUDIO TRACK — Press play to listen</span>
        <span className="ml-auto" style={{ color: playsLeft === 0 ? '#ef4444' : '#fbbf24' }}>
          {playsLeft > 0 ? `${playsLeft} play${playsLeft !== 1 ? 's' : ''} remaining` : 'Maximum plays reached'}
        </span>
      </div>

      {/* Player controls */}
      <div className="px-4 py-3 flex items-center gap-3">
        {/* Play/Stop button */}
        <button
          onClick={isPlaying ? stopPlaying : handlePlay}
          disabled={!canPlay && !isPlaying}
          className="relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all"
          style={{
            background: isPlaying ? '#ef4444' : canPlay ? '#3b82f6' : '#374151',
            cursor: canPlay || isPlaying ? 'pointer' : 'not-allowed',
            boxShadow: isPlaying ? '0 0 0 4px rgba(239,68,68,0.25)' : '',
          }}
          title={isPlaying ? 'Stop' : canPlay ? 'Play audio' : 'No plays remaining'}
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
              <rect x="2" y="1" width="4" height="12" rx="1" />
              <rect x="8" y="1" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
              <path d="M3 1.5L12 7L3 12.5V1.5Z" />
            </svg>
          )}
        </button>

        {/* Progress track */}
        <div className="flex-1 flex flex-col gap-1">
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: '#334155' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress * 100}%`,
                background: isPlaying ? '#3b82f6' : progress === 1 ? '#10b981' : '#475569',
                transition: 'width 0.2s linear',
              }}
            />
          </div>
          <div className="flex justify-between text-xs" style={{ color: '#64748b' }}>
            <span>{isPlaying ? 'Playing...' : progress === 1 ? 'Played' : 'Ready'}</span>
            <span>~{estimatedDuration}s</span>
          </div>
        </div>

        {/* Play count dots */}
        <div className="flex gap-1 shrink-0">
          {[0, 1].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: i < playCount ? '#fbbf24' : '#334155' }}
              title={`Play ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Hint when plays exhausted */}
      {playsLeft === 0 && (
        <div
          className="px-4 py-2 text-xs text-center"
          style={{ background: '#1c0a0a', color: '#ef4444', borderTop: '1px solid #331010' }}
        >
          You have used both allowed plays for this track. Answer based on what you heard.
        </div>
      )}
    </div>
  );
}
