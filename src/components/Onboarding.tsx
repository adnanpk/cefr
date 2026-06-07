import { useState, FormEvent } from 'react';
import { AppAction } from '../utils/types';

interface Props {
  dispatch: React.Dispatch<AppAction>;
}

export default function Onboarding({ dispatch }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name to begin.');
      return;
    }
    setError('');
    dispatch({
      type: 'SET_CANDIDATE',
      payload: {
        name: name.trim(),
        email: email.trim(),
        startedAt: new Date().toISOString(),
      },
    });
  };

  const modules = [
    { icon: '✏️', label: 'Grammar', desc: '10 questions' },
    { icon: '📚', label: 'Vocabulary', desc: '10 questions' },
    { icon: '📖', label: 'Reading', desc: '10 questions' },
    { icon: '🎧', label: 'Listening', desc: '10 audio questions' },
    { icon: '🎤', label: 'Speaking', desc: '2 recorded prompts' },
  ];

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center px-4 py-10">
      {/* Hero section */}
      <div className="max-w-2xl w-full text-center mb-10">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
          style={{ background: '#eff6ff', color: '#1d4ed8' }}
        >
          <span>🎓</span> Official CEFR Assessment Platform
        </div>
        <h2 className="text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
          English Proficiency
          <span className="block" style={{ color: '#1d4ed8' }}>Assessment Suite</span>
        </h2>
        <p className="text-slate-500 text-lg leading-relaxed max-w-xl mx-auto">
          Evaluate your English across five core skills and receive an official CEFR band rating — from beginner <strong>A1</strong> to mastery <strong>C2</strong>.
        </p>
      </div>

      {/* Module preview chips */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {modules.map(m => (
          <div
            key={m.label}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ background: 'white', border: '1.5px solid #e2e8f0', color: '#475569' }}
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
            <span className="text-xs text-slate-400">· {m.desc}</span>
          </div>
        ))}
      </div>

      {/* Registration card */}
      <div
        className="w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
        style={{ background: 'white', border: '1px solid #e2e8f0' }}
      >
        {/* Card header */}
        <div
          className="px-7 py-5"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)' }}
        >
          <h3 className="text-white font-bold text-lg">Begin Your Assessment</h3>
          <p className="text-blue-200 text-sm mt-0.5">
            Enter your details to start. Your progress is automatically saved.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold mb-1.5"
              style={{ color: '#374151' }}
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sarah Al-Rashidi"
              className="w-full px-4 py-3 rounded-xl text-slate-800 text-sm transition-all outline-none"
              style={{
                border: error ? '2px solid #ef4444' : '2px solid #e2e8f0',
                background: '#f8fafc',
              }}
              onFocus={e => {
                if (!error) e.target.style.border = '2px solid #2563eb';
              }}
              onBlur={e => {
                if (!error) e.target.style.border = '2px solid #e2e8f0';
              }}
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold mb-1.5"
              style={{ color: '#374151' }}
            >
              Email Address
              <span className="text-slate-400 font-normal text-xs ml-1">(optional — to receive your results)</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl text-slate-800 text-sm transition-all outline-none"
              style={{ border: '2px solid #e2e8f0', background: '#f8fafc' }}
              onFocus={e => { e.target.style.border = '2px solid #2563eb'; }}
              onBlur={e => { e.target.style.border = '2px solid #e2e8f0'; }}
            />
          </div>

          {/* Notices */}
          <div
            className="rounded-xl p-4 text-sm space-y-1.5"
            style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}
          >
            <p className="font-semibold text-sky-800">Before you begin:</p>
            <ul className="text-sky-700 space-y-1">
              <li>📌 Complete all 5 modules for your overall CEFR band</li>
              <li>🎧 Use headphones for the Listening section</li>
              <li>🎤 Enable microphone access for Speaking</li>
              <li>💾 Progress is saved automatically — refresh is safe</li>
            </ul>
          </div>

          <button type="submit" className="btn-primary w-full py-3.5 text-base">
            Start Assessment →
          </button>
        </form>
      </div>

      <p className="mt-6 text-xs text-slate-400 text-center max-w-sm">
        Your assessment data is processed securely. Results are reported to the supervising examiner upon completion.
      </p>
    </div>
  );
}
