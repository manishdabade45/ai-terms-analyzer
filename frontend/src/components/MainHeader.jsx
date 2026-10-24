import React from 'react';
import { Shield, Link2, MoreVertical, CheckCircle2, Sparkles } from 'lucide-react';

export default function MainHeader({ backendOnline }) {
  return (
    <header className="border-b border-slate-800/80 px-6 py-5 bg-[#090d16]/90 backdrop-blur-md sticky top-0 z-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/20 shrink-0">
            <div className="w-full h-full bg-[#0a0f1d] rounded-[14px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black tracking-tight text-white m-0">
                Terms & Conditions Analyzer
              </h1>
              <a
                href="#top"
                className="text-slate-400 hover:text-sky-400 transition-colors inline-flex items-center"
                title="Anchor Link"
              >
                <Link2 className="w-4 h-4" />
              </a>
            </div>

            <p className="text-xs text-slate-400 m-0 mt-0.5 font-medium">
              Manish | PRN: 124B1C122 | B.Tech CSE (AI & ML) — Real-World Enhanced Edition
            </p>
          </div>
        </div>

        {/* Right Corner Buttons */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded-full text-[11px] font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{backendOnline ? 'NLP Engine Active' : 'Connecting Engine...'}</span>
          </div>

          <button
            type="button"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors cursor-pointer hidden md:flex items-center gap-1"
          >
            Deploy
          </button>

          <button
            type="button"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
