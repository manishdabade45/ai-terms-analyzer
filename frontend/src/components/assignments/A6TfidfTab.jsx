import React, { useState, useEffect } from 'react';
import { Hash, BarChart3, BookOpen, Layers } from 'lucide-react';
import { runA6Tfidf } from '../../services/api';

export default function A6TfidfTab({ documentText }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTfidf = async () => {
      try {
        setLoading(true);
        const res = await runA6Tfidf(documentText || 'We collect personal information. Your subscription automatically renews. Disputes resolved by arbitration.');
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTfidf();
  }, [documentText]);

  const tfidfAnalysis = data?.tfidf_analysis || {};
  const topTerms = tfidfAnalysis.top_terms || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
            06
          </div>
          <div>
            <h3 className="text-base font-bold text-white m-0">Module 06: Term Frequency-Inverse Document Frequency (TF-IDF)</h3>
            <p className="text-xs text-slate-400 m-0">
              Feature weighting across agreement clauses to highlight discriminative legal commitments over functional noise.
            </p>
          </div>
        </div>
      </div>

      {/* TF-IDF Top Terms Table */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h4 className="text-sm font-bold text-white m-0">Top TF-IDF Weighted Legal Terms</h4>
          <span className="text-xs text-slate-400 font-medium">
            Vocab: <strong className="text-white">{tfidfAnalysis.vocabulary_size || 0}</strong> features
          </span>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {topTerms.map((term, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 flex-1 mr-4">
                <span className="w-6 text-slate-500 font-bold text-right font-mono">#{idx + 1}</span>
                <span className="font-mono font-bold text-slate-200">{term.term}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden hidden sm:block">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, term.relative_importance_pct * 3)}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-sky-400 w-16 text-right">
                  {term.tfidf_score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formula & Explanation */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs text-slate-300">
        <strong className="block text-white font-bold uppercase tracking-wider text-[11px]">
          Mathematical Formulation & Interpretation:
        </strong>
        <p className="leading-relaxed m-0 font-mono text-[11px] bg-black/40 text-sky-300 p-3 rounded-xl border border-slate-800">
          TF-IDF(t, d, D) = TF(t, d) × [ log((1 + |D|) / (1 + DF(t, D))) + 1 ]
        </p>
        <p className="m-0 leading-relaxed text-slate-400">
          {tfidfAnalysis.formula_explanation}
        </p>
      </div>
    </div>
  );
}
