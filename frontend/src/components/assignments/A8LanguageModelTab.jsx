import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, AlertTriangle, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { runA8LanguageModel } from '../../services/api';

export default function A8LanguageModelTab({ documentText }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sequence, setSequence] = useState('we collect personal information');

  const fetchLm = async (seq) => {
    try {
      setLoading(true);
      const res = await runA8LanguageModel(documentText || '', seq || sequence);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLm(sequence);
  }, [documentText]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sequence.trim()) return;
    fetchLm(sequence.trim());
  };

  const evaluation = data?.evaluation || {};
  const transitions = evaluation.transitions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
            08
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 m-0">Assignment 8: N-gram Language Model</h3>
            <p className="text-xs text-slate-500 m-0">
              Statistical generative bigram language model with Laplace smoothing and sequence perplexity computation.
            </p>
          </div>
        </div>

        {/* Input Sequence Playground */}
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
            placeholder="Type word sequence (e.g. we collect personal information)..."
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
            Evaluate Sequence
          </button>
        </form>
      </div>

      {/* Prominent Educational Notice */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-amber-950 font-bold mb-0.5">Critical NLP Pedagogical Clarification:</strong>
          {data?.academic_clarification || 'This statistical language model measures likelihood of word transitions under training n-gram counts. It is NOT a legal risk detector.'}
        </div>
      </div>

      {/* Probability & Perplexity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Sequence Perplexity (PP)
          </span>
          <div className="text-3xl font-black text-indigo-600">
            {evaluation.perplexity || 0}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Lower PP = Higher statistical familiarity
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Joint Log2 Probability
          </span>
          <div className="text-3xl font-black text-slate-800 font-mono">
            {evaluation.joint_log2_probability || 0}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Approx: {evaluation.joint_probability_approx || 'N/A'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Laplace Smoothing (k)
          </span>
          <div className="text-3xl font-black text-slate-800">
            k = {evaluation.smoothing_k || 1.0}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Vocabulary: {evaluation.vocabulary_size || 0} tokens
          </span>
        </div>
      </div>

      {/* Step-by-Step Transition Probabilities */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h4 className="text-sm font-bold text-slate-900 m-0">Step-by-Step Conditional Transition Probabilities</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Conditional Step</th>
                <th className="py-2.5 px-3">Pair Count C(w1, w2)</th>
                <th className="py-2.5 px-3">History Count C(w1)</th>
                <th className="py-2.5 px-3">Smoothed Probability</th>
                <th className="py-2.5 px-3">Log2 Probability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transitions.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-2 px-3 font-bold text-slate-900">{t.transition}</td>
                  <td className="py-2 px-3 text-slate-600">{t.count_pair}</td>
                  <td className="py-2 px-3 text-slate-600">{t.count_history}</td>
                  <td className="py-2 px-3 font-bold text-indigo-600">{t.probability}</td>
                  <td className="py-2 px-3 text-slate-500">{t.log2_prob}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
