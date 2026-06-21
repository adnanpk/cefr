import { useState, FormEvent } from 'react';
import { AppAction } from '../utils/types';

interface Props {
  dispatch: React.Dispatch<AppAction>;
}

const KSA_GREEN = '#006C35';
const GOLD      = '#C5A028';

// ── Inline flag SVGs ──────────────────────────────────────────────────────────

function UKFlag() {
  return (
    <svg viewBox="0 0 60 40" width="54" height="36" xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: 5, border: '1px solid rgba(0,0,0,0.12)', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', display: 'block' }}>
      <rect width="60" height="40" fill="#012169"/>
      {/* White saltire */}
      <line x1="0" y1="0" x2="60" y2="40" stroke="white" strokeWidth="9"/>
      <line x1="60" y1="0" x2="0" y2="40" stroke="white" strokeWidth="9"/>
      {/* Red saltire (St Patrick) */}
      <line x1="0" y1="0" x2="60" y2="40" stroke="#C8102E" strokeWidth="5"/>
      <line x1="60" y1="0" x2="0" y2="40" stroke="#C8102E" strokeWidth="5"/>
      {/* White cross */}
      <rect x="22" y="0" width="16" height="40" fill="white"/>
      <rect x="0" y="12" width="60" height="16" fill="white"/>
      {/* Red cross */}
      <rect x="25" y="0" width="10" height="40" fill="#C8102E"/>
      <rect x="0" y="15" width="60" height="10" fill="#C8102E"/>
    </svg>
  );
}

function USFlag() {
  return (
    <svg viewBox="0 0 60 40" width="54" height="36" xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: 5, border: '1px solid rgba(0,0,0,0.12)', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', display: 'block' }}>
      {/* 13 stripes */}
      {Array.from({ length: 13 }, (_, i) => (
        <rect key={i} x="0" y={i * (40 / 13)} width="60" height={40 / 13 + 0.5}
          fill={i % 2 === 0 ? '#B22234' : 'white'} />
      ))}
      {/* Blue canton */}
      <rect x="0" y="0" width="24" height="21" fill="#3C3B6E"/>
      {/* Stars: 5 rows × 6 */}
      {[0,1,2,3,4].map(r => [0,1,2,3,4,5].map(c => (
        <circle key={`a${r}${c}`} cx={2.2 + c * 3.6} cy={2.4 + r * 4.1} r="0.85" fill="white"/>
      )))}
      {/* Stars: 4 rows × 5 (offset) */}
      {[0,1,2,3].map(r => [0,1,2,3,4].map(c => (
        <circle key={`b${r}${c}`} cx={4.0 + c * 3.6} cy={4.5 + r * 4.1} r="0.85" fill="white"/>
      )))}
    </svg>
  );
}

// ── Islamic geometric background pattern ──────────────────────────────────────

function GeometricBg() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.055 }}>
      <defs>
        <pattern id="ks-geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          {/* 8-pointed star from two overlapping squares */}
          <g transform="translate(40,40)">
            <rect x="-18" y="-18" width="36" height="36" fill="none"
              stroke={KSA_GREEN} strokeWidth="1.4" transform="rotate(0)"/>
            <rect x="-18" y="-18" width="36" height="36" fill="none"
              stroke={KSA_GREEN} strokeWidth="1.4" transform="rotate(45)"/>
            {/* Central octagon fill */}
            <polygon
              points="0,-12.7 9,-9 12.7,0 9,9 0,12.7 -9,9 -12.7,0 -9,-9"
              fill={GOLD} fillOpacity="0.55" stroke={GOLD} strokeWidth="0.4"/>
          </g>
          {/* Corner connector circles */}
          <circle cx="0"  cy="0"  r="3" fill={KSA_GREEN} fillOpacity="0.5"/>
          <circle cx="80" cy="0"  r="3" fill={KSA_GREEN} fillOpacity="0.5"/>
          <circle cx="0"  cy="80" r="3" fill={KSA_GREEN} fillOpacity="0.5"/>
          <circle cx="80" cy="80" r="3" fill={KSA_GREEN} fillOpacity="0.5"/>
          {/* Mid-edge dots */}
          <circle cx="40" cy="0"  r="2" fill={GOLD} fillOpacity="0.5"/>
          <circle cx="40" cy="80" r="2" fill={GOLD} fillOpacity="0.5"/>
          <circle cx="0"  cy="40" r="2" fill={GOLD} fillOpacity="0.5"/>
          <circle cx="80" cy="40" r="2" fill={GOLD} fillOpacity="0.5"/>
          {/* Connecting lines between stars */}
          <line x1="40" y1="27" x2="40" y2="0"  stroke={KSA_GREEN} strokeWidth="0.7"/>
          <line x1="40" y1="53" x2="40" y2="80" stroke={KSA_GREEN} strokeWidth="0.7"/>
          <line x1="27" y1="40" x2="0"  y2="40" stroke={KSA_GREEN} strokeWidth="0.7"/>
          <line x1="53" y1="40" x2="80" y2="40" stroke={KSA_GREEN} strokeWidth="0.7"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ks-geo)"/>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Onboarding({ dispatch }: Props) {
  const [name,  setName]  = useState('');
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
      payload: { name: name.trim(), email: email.trim(), startedAt: new Date().toISOString() },
    });
  };

  const modules = [
    { icon: '✏️', label: 'Grammar',    desc: '12 questions · Adaptive' },
    { icon: '📚', label: 'Vocabulary', desc: '12 questions · Adaptive' },
    { icon: '📖', label: 'Reading',    desc: '12 questions · Adaptive' },
    { icon: '🎧', label: 'Listening',  desc: '12 audio questions · Adaptive' },
    { icon: '🎤', label: 'Speaking',   desc: '2 recorded prompts' },
  ];

  return (
    <div className="relative min-h-[calc(100vh-120px)] flex flex-col items-center justify-center px-4 py-10 overflow-hidden">

      {/* KSA geometric background */}
      <GeometricBg />

      {/* Soft green glow — top-right corner */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${KSA_GREEN}18 0%, transparent 70%)` }} />
      {/* Gold glow — bottom-left */}
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${GOLD}14 0%, transparent 70%)` }} />

      {/* ── Hero ── */}
      <div className="relative max-w-2xl w-full text-center mb-8 z-10">

        {/* KSA localisation badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 shadow-sm"
          style={{ background: `${KSA_GREEN}18`, color: KSA_GREEN, border: `1px solid ${KSA_GREEN}44` }}>
          <span>🇸🇦</span> Designed for Saudi English Learners
        </div>

        {/* Official platform badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm"
            style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
            <span>🎓</span> Official CEFR Assessment Platform
          </div>
        </div>

        <h2 className="text-4xl font-extrabold text-slate-900 mb-3 leading-tight">
          English Proficiency
          <span className="block" style={{ color: '#1d4ed8' }}>Assessment Suite</span>
        </h2>
        <p className="text-slate-500 text-lg leading-relaxed max-w-xl mx-auto mb-8">
          Evaluate your English across five core skills and receive an official CEFR band rating —
          from beginner <strong>A1</strong> to mastery <strong>C2</strong>.
        </p>

        {/* ── Flag strip ── */}
        <div className="flex items-center justify-center gap-5 mb-8">
          {/* UK */}
          <div className="flex flex-col items-center gap-1.5">
            <UKFlag />
            <p className="text-xs font-bold text-slate-700">UK English</p>
            <p className="text-xs text-slate-400">British Standard</p>
          </div>

          {/* Divider + CEFR badge */}
          <div className="flex flex-col items-center gap-1 px-4">
            <div className="flex items-center gap-2">
              <div className="h-px w-8" style={{ background: `linear-gradient(to right, ${KSA_GREEN}, ${GOLD})` }}/>
              <div className="px-3 py-1.5 rounded-xl text-xs font-black text-white shadow-md"
                style={{ background: `linear-gradient(135deg, ${KSA_GREEN}, #009347)`, letterSpacing: '0.04em' }}>
                CEFR A1→C2
              </div>
              <div className="h-px w-8" style={{ background: `linear-gradient(to left, ${KSA_GREEN}, ${GOLD})` }}/>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">International Framework</p>
          </div>

          {/* US */}
          <div className="flex flex-col items-center gap-1.5">
            <USFlag />
            <p className="text-xs font-bold text-slate-700">US English</p>
            <p className="text-xs text-slate-400">American Standard</p>
          </div>
        </div>
      </div>

      {/* ── Module chips ── */}
      <div className="relative z-10 flex flex-wrap justify-center gap-3 mb-8">
        {modules.map(m => (
          <div key={m.label}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
            style={{ background: 'white', border: `1.5px solid #e2e8f0`, color: '#475569' }}>
            <span>{m.icon}</span>
            <span>{m.label}</span>
            <span className="text-xs text-slate-400">· {m.desc}</span>
          </div>
        ))}
      </div>

      {/* ── Registration card ── */}
      <div className="relative z-10 w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
        style={{ background: 'white', border: '1px solid #e2e8f0' }}>

        {/* Card header — KSA green + gold accent */}
        <div className="relative px-7 py-5 overflow-hidden"
          style={{ background: `linear-gradient(135deg, #004d26 0%, ${KSA_GREEN} 60%, #009347 100%)` }}>
          {/* Gold accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1"
            style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}/>
          {/* Subtle geometric overlay */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 12px)' }}/>
          <h3 className="relative text-white font-bold text-lg">Begin Your Assessment</h3>
          <p className="relative text-green-200 text-sm mt-0.5">
            Enter your details to start. Your progress is automatically saved.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name" type="text" value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sarah Al-Rashidi"
              className="w-full px-4 py-3 rounded-xl text-slate-800 text-sm transition-all outline-none"
              style={{ border: error ? '2px solid #ef4444' : '2px solid #e2e8f0', background: '#f8fafc' }}
              onFocus={e => { if (!error) e.target.style.border = `2px solid ${KSA_GREEN}`; }}
              onBlur={e =>  { if (!error) e.target.style.border = '2px solid #e2e8f0'; }}
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
              Email Address
              <span className="text-slate-400 font-normal text-xs ml-1">(optional — to receive your results)</span>
            </label>
            <input
              id="email" type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl text-slate-800 text-sm transition-all outline-none"
              style={{ border: '2px solid #e2e8f0', background: '#f8fafc' }}
              onFocus={e => { e.target.style.border = `2px solid ${KSA_GREEN}`; }}
              onBlur={e =>  { e.target.style.border = '2px solid #e2e8f0'; }}
            />
          </div>

          {/* Notices */}
          <div className="rounded-xl p-4 text-sm space-y-1.5"
            style={{ background: `${KSA_GREEN}0d`, border: `1px solid ${KSA_GREEN}33` }}>
            <p className="font-semibold" style={{ color: KSA_GREEN }}>Before you begin:</p>
            <ul className="space-y-1" style={{ color: '#1a5c38' }}>
              <li>📌 Complete all 5 modules for your overall CEFR band</li>
              <li>🎧 Use headphones for the Listening section</li>
              <li>🎤 Enable microphone access for Speaking</li>
              <li>💾 Progress is saved automatically — refresh is safe</li>
            </ul>
          </div>

          {/* Submit button — KSA green */}
          <button type="submit" className="w-full py-3.5 text-base font-bold rounded-xl text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, #004d26, ${KSA_GREEN})`, boxShadow: `0 4px 18px ${KSA_GREEN}55` }}>
            Start Assessment →
          </button>
        </form>
      </div>

      {/* Gold decorative divider */}
      <div className="relative z-10 flex items-center gap-3 my-5 w-full max-w-md">
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${GOLD}55)` }}/>
        <span className="text-xs font-semibold" style={{ color: GOLD }}>✦</span>
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${GOLD}55)` }}/>
      </div>

      <p className="relative z-10 text-xs text-slate-400 text-center max-w-sm">
        Your assessment data is processed securely. Results are reported to the supervising examiner upon completion.
      </p>
    </div>
  );
}
