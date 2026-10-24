import React from 'react';
import { X, ShieldAlert, AlertTriangle, CheckCircle, Info, Sparkles } from 'lucide-react';

export default function RiskDetailModal({ clause, onClose }) {
  if (!clause) return null;

  const severity = clause.risk_level || 'Low';
  const flags = clause.matched_flags || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            severity === 'High' ? 'bg-rose-100 text-rose-600' :
            severity === 'Medium' ? 'bg-amber-100 text-amber-600' :
            'bg-emerald-100 text-emerald-600'
          }`}>
            {severity === 'High' ? <ShieldAlert className="w-5 h-5" /> :
             severity === 'Medium' ? <AlertTriangle className="w-5 h-5" /> :
             <CheckCircle className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 m-0">Clause Risk Breakdown</h3>
              <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                severity === 'High' ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                severity === 'Medium' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                'bg-emerald-100 text-emerald-700 border border-emerald-300'
              }`}>
                {severity.toUpperCase()} RISK
              </span>
            </div>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Category: <strong className="text-slate-700">{clause.category || 'General'}</strong> • Sentiment: <strong className="text-slate-700">{clause.sentiment || 'Neutral'}</strong>
            </p>
          </div>
        </div>

        {/* Clause Text */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Contractual Clause Text
          </span>
          <p className="text-xs text-slate-800 leading-relaxed font-serif italic m-0">
            "{clause.text}"
          </p>
        </div>

        {/* Flagged Explanations */}
        {flags.length > 0 ? (
          <div className="space-y-3 mb-5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Detected Risk Factors & Explanations ({flags.length})
            </h4>

            {flags.map((flag, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Rule ID: {flag.rule_id}
                  </span>
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Weight: +{flag.weight} pts
                  </span>
                </div>

                <div className="text-xs text-slate-700">
                  <strong className="text-slate-900 block mb-0.5">Why this clause is concerning:</strong>
                  {flag.reason}
                </div>

                <div className="text-xs text-indigo-900 bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100">
                  <strong className="text-indigo-950 flex items-center gap-1 mb-0.5">
                    <Sparkles className="w-3 h-3 text-indigo-600" /> Consumer Protection Recommendation:
                  </strong>
                  {flag.recommendation}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 mb-5 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>This clause conforms to standard contractual norms without severe rights forfeitures.</span>
          </div>
        )}

        {/* Educational Note */}
        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <span>
            Scoring integrates TF-IDF multi-class classification, N-gram triggers, and deontic syntax. 
            For formal disputes or contract negotiation, consult with a qualified attorney.
          </span>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
}
