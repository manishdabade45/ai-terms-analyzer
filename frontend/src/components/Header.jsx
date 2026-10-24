import React from 'react';
import { ShieldAlert, Scale, AlertTriangle, FileText, CheckCircle2, XCircle } from 'lucide-react';

export default function Header({ backendStatus }) {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-40">
      {/* Statutory Legal Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Legal Notice:</strong> This system is an academic Natural Language Processing (NLP) educational tool. 
              Outputs provide informational assistance and do <em>not</em> constitute professional legal advice.
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-slate-400">Status:</span>
            {backendStatus === 'healthy' ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> API Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400 font-medium">
                <XCircle className="w-3.5 h-3.5" /> Backend Offline
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white m-0">AI Terms & Conditions Analyzer</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                NLP Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-400 m-0">
              Contract Intelligence • Multi-Class Clause Classification • Explainable Risk Scoring • 10 NLP Modules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs flex items-center gap-2 text-slate-300">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>PyMuPDF • spaCy • scikit-learn • NLTK</span>
          </div>
        </div>
      </div>
    </header>
  );
}
