import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  showWatermark?: boolean;
}

export default function Layout({ children, showWatermark = false }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f1f5f9' }}>
      {/* Background watermark — appears only on test/dashboard screens */}
      {showWatermark && (
        <div className="watermark" aria-hidden="true">
          <div className="watermark-text">Dr. ARS Assessment</div>
        </div>
      )}

      {/* ── Header ── */}
      <header
        className="relative z-10 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #0f2744 0%, #1e3a5f 50%, #1d4ed8 100%)' }}
      >
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-inner"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              ARS
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight tracking-tight">
                CEFR Language Assessment
              </h1>
              <p className="text-blue-200 text-xs font-medium">
                Professional English Proficiency Evaluation
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-blue-200 text-xs">Aligned to</p>
            <p className="text-white text-sm font-semibold">A1 → C2 Framework</p>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 relative z-10">
        {children}
      </main>

      {/* ── Sticky branding footer ── */}
      <footer
        className="relative z-10 py-3 px-4 text-center sticky bottom-0 shadow-[0_-2px_12px_rgba(0,0,0,0.12)]"
        style={{ background: 'linear-gradient(135deg, #0f2744 0%, #1e3a5f 100%)' }}
      >
        <p className="text-blue-100 text-xs font-medium tracking-wide">
          Prepared by{' '}
          <span className="text-white font-semibold">Dr. Adnan Rashid Sheikh</span>
          {' '}·{' '}
          <a
            href="mailto:arsheikh540@gmail.com"
            className="text-blue-300 hover:text-white transition-colors underline underline-offset-2"
          >
            arsheikh540@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
}
