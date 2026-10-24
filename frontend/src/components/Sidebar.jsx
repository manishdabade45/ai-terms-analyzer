import React, { useState } from 'react';
import { FileText, Globe, Upload, Lock, Sparkles, ChevronDown, CheckCircle2, History } from 'lucide-react';

export default function Sidebar({
  inputMode,
  setInputMode,
  onLoadSample,
  sampleLoading,
  analyzing,
  historyCount = 0,
  onOpenHistory
}) {
  const [showSampleMenu, setShowSampleMenu] = useState(false);

  const radioOptions = [
    { id: 'text', label: 'Paste Text', icon: '🟠' },
    { id: 'url', label: 'Fetch from Web URL', icon: '🌐' },
    { id: 'pdf', label: 'Upload PDF Document', icon: '📄' }
  ];

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-[#0e1424] border-b lg:border-b-0 lg:border-r border-slate-800/80 p-5 flex flex-col justify-between space-y-6">
      <div className="space-y-6">
        {/* Choose how to load terms header */}
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Choose how to load terms:
          </h3>

          <div className="space-y-2">
            {radioOptions.map((opt) => {
              const isSelected = inputMode === opt.id;
              return (
                <label
                  key={opt.id}
                  onClick={() => setInputMode(opt.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500/50 text-white shadow-xs'
                      : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected ? 'border-amber-400 bg-amber-400/20' : 'border-slate-600 bg-slate-900'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                  </div>
                  <span className="text-sm mr-1">{opt.icon}</span>
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Load Sample T&C Button */}
        <div className="relative">
          <button
            type="button"
            disabled={sampleLoading || analyzing}
            onClick={() => setShowSampleMenu(!showSampleMenu)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/80 flex items-center justify-between cursor-pointer transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">📄</span>
              <span>Load Sample T&C</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showSampleMenu && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#141b2d] border border-slate-700 rounded-xl shadow-2xl p-1.5 z-30 space-y-1">
              <button
                type="button"
                onClick={() => {
                  onLoadSample('streaming');
                  setShowSampleMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 transition-colors flex items-center justify-between"
              >
                <span>Streaming Service (High Risk)</span>
                <span className="text-[10px] bg-rose-500/20 px-1.5 py-0.5 rounded text-rose-400 font-bold">78/100</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onLoadSample('ecommerce');
                  setShowSampleMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-emerald-950/40 text-emerald-300 hover:text-emerald-200 transition-colors flex items-center justify-between"
              >
                <span>E-Commerce Policy (Fair)</span>
                <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400 font-bold">14/100</span>
              </button>
            </div>
          )}
        </div>

        {/* 100% Local & Private Card (Matches photo exactly) */}
        <div className="bg-[#0b2847]/40 border border-[#0ea5e9]/30 rounded-2xl p-4 text-[#7dd3fc] space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-[#38bdf8]">
            <Lock className="w-4 h-4 text-[#38bdf8] shrink-0" />
            <span>100% Local & Private:</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#bae6fd]/80 m-0">
            All NLP analysis runs completely on your machine. No contract data is sent to external servers.
          </p>
        </div>
      </div>

      {/* Footer Info / Past History Link */}
      <div className="pt-4 border-t border-slate-800/60 space-y-3">
        <button
          onClick={onOpenHistory}
          className="w-full py-2 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>Saved SQLite History</span>
          </div>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
            {historyCount}
          </span>
        </button>

        <div className="text-[10px] text-slate-500 text-center">
          Powered by spaCy • NLTK • scikit-learn
        </div>
      </div>
    </aside>
  );
}
