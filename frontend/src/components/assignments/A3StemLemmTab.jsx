import React, { useState, useEffect } from 'react';
import { Scissors, Check, Sparkles, RefreshCw, HelpCircle } from 'lucide-react';
import { runA3StemLemm } from '../../services/api';

export default function A3StemLemmTab({ documentText }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customWordsInput, setCustomWordsInput] = useState('arbitration, liabilities, terminating, cancellations, automatically, indemnification');

  const fetchComparison = async (wordsArr) => {
    try {
      setLoading(true);
      const res = await runA3StemLemm(documentText, wordsArr);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison([]);
  }, [documentText]);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const words = customWordsInput.split(',').map(w => w.trim()).filter(Boolean);
    fetchComparison(words);
  };

  const table = data?.comparison_table || [];
  const insights = data?.educational_insights || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
            03
          </div>
          <div>
            <h3 className="text-base font-bold text-white m-0">Module 03: Stemming & Lemmatization</h3>
            <p className="text-xs text-slate-400 m-0">
              Comparative analysis between Porter Stemmer, Snowball Stemmer, and WordNet Lemmatizer on legal vocabulary.
            </p>
          </div>
        </div>

        {/* Custom Input Sandbox */}
        <form onSubmit={handleCustomSubmit} className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={customWordsInput}
            onChange={(e) => setCustomWordsInput(e.target.value)}
            placeholder="Enter comma-separated words (e.g. liabilities, arbitration, cancelling)..."
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 focus:ring-2 focus:ring-indigo-500 text-white placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Compare Words
          </button>
        </form>
      </div>

      {/* Comparative Table */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-sm font-bold text-white m-0">Comparative Linguistic Matrix</h4>
          <span className="text-xs text-slate-400 font-medium">{table.length} tokens evaluated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Original Word</th>
                <th className="py-3 px-4">POS Tag</th>
                <th className="py-3 px-4">Porter Stemmer</th>
                <th className="py-3 px-4">Snowball Stemmer</th>
                <th className="py-3 px-4">WordNet Lemmatizer</th>
                <th className="py-3 px-4">Morphological Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {table.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors font-mono">
                  <td className="py-2.5 px-4 font-bold text-white">{row.original}</td>
                  <td className="py-2.5 px-4 text-slate-400">{row.pos_tag}</td>
                  <td className="py-2.5 px-4 text-amber-300 bg-amber-500/5">{row.porter_stem}</td>
                  <td className="py-2.5 px-4 text-amber-300 bg-amber-500/5">{row.snowball_stem}</td>
                  <td className="py-2.5 px-4 text-sky-300 bg-sky-500/10 font-bold">{row.wordnet_lemma}</td>
                  <td className="py-2.5 px-4 font-sans">
                    {row.differs ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                        Stemmer truncated non-word
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                        Identical root
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Educational Callouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
          <strong className="block text-amber-300 font-bold mb-1">Stemming (Porter / Snowball):</strong>
          <p className="m-0 leading-relaxed text-slate-300">{insights.stemming_concept}</p>
        </div>

        <div className="p-5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-200 space-y-1">
          <strong className="block text-sky-300 font-bold mb-1">Lemmatization (WordNet):</strong>
          <p className="m-0 leading-relaxed text-slate-300">{insights.lemmatization_concept}</p>
        </div>
      </div>
    </div>
  );
}
