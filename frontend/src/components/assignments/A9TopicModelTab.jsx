import React, { useState, useEffect } from 'react';
import { Compass, BookOpen, Layers, Info } from 'lucide-react';
import { runA9Topics } from '../../services/api';

export default function A9TopicModelTab({ documentText }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const res = await runA9Topics(documentText || 'We collect personal information. Your subscription renews automatically. Any dispute resolved by arbitration. The company disclaims liability.');
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [documentText]);

  const ldaResults = data?.lda_results || {};
  const topics = ldaResults.topics || [];
  const docMixture = ldaResults.document_topic_mixture || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
            09
          </div>
          <div>
            <h3 className="text-base font-bold text-white m-0">Module 09: Topic Modeling (LDA)</h3>
            <p className="text-xs text-slate-400 m-0">
              Unsupervised Latent Dirichlet Allocation discovering latent thematic clusters across contract clauses.
            </p>
          </div>
        </div>
      </div>

      {/* Discovered Topics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((t, idx) => (
          <div key={idx} className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white">
                {t.suggested_label}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                Topic #{t.topic_id}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {t.top_words?.map((w, wIdx) => (
                <span key={wIdx} className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <span>{w.word}</span>
                  <span className="text-[10px] text-slate-500 font-sans">({w.weight})</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Document Topic Mixture */}
      {docMixture.length > 0 && (
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-sm space-y-3">
          <h4 className="text-sm font-bold text-white m-0">Document-Level Topic Prevalence</h4>
          <div className="space-y-2 pt-1">
            {docMixture.map((m, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{m.label}</span>
                  <span className="font-bold text-sky-400">{m.prevalence_pct}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${m.prevalence_pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interpretability Principle */}
      <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl text-xs text-indigo-200 leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-indigo-300 font-bold mb-0.5">Thematic Clustering Principle:</strong>
          {data?.academic_explanation}
        </div>
      </div>
    </div>
  );
}
