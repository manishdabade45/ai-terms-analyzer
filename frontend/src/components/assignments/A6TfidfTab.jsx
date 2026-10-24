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
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
            06
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 m-0">Assignment 6: Term Frequency-Inverse Document Frequency (TF-IDF)</h3>
            <p className="text-xs text-slate-500 m-0">
              Feature weighting across agreement clauses to highlight discriminative legal commitments over functional noise.
            </p>
          </div>
        </div>
      </div>

      {/* TF-IDF Top Terms Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h4 className="text-sm font-bold text-slate-900 m-0">Top TF-IDF Weighted Legal Terms</h4>
          <span className="text-xs text-slate-500 font-medium">
            Vocab: <strong>{tfidfAnalysis.vocabulary_size || 0}</strong> features
          </span>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {topTerms.map((term, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 flex-1 mr-4">
                <span className="w-6 text-slate-400 font-bold text-right font-mono">#{idx + 1}</span>
                <span className="font-mono font-bold text-slate-800">{term.term}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden hidden sm:block">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, term.relative_importance_pct * 3)}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-indigo-600 w-16 text-right">
                  {term.tfidf_score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formula & Explanation */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
        <strong className="block text-slate-900 font-bold uppercase tracking-wider text-[11px]">
          Mathematical Formulation & Interpretation:
        </strong>
        <p className="leading-relaxed m-0 font-mono text-[11px] bg-white p-3 rounded-xl border border-slate-200">
          TF-IDF(t, d, D) = TF(t, d) × [ log((1 + |D|) / (1 + DF(t, D))) + 1 ]
        </p>
        <p className="m-0 leading-relaxed text-slate-600">
          {tfidfAnalysis.formula_explanation}
        </p>
      </div>
    </div>
  );
}
