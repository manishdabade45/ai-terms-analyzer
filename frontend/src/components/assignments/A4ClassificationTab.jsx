import React, { useState, useEffect } from 'react';
import { Tag, Cpu, Search, CheckCircle, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import { runA4PosClf, runA4ClassifyClause } from '../../services/api';

export default function A4ClassificationTab({ documentText }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('how can I cancel my subscription and get a refund');
  const [customClause, setCustomClause] = useState('We reserve the right to modify these terms without notice.');
  const [clauseResult, setClauseResult] = useState(null);
  const [clfLoading, setClfLoading] = useState(false);

  const fetchA4Data = async (userQuery) => {
    try {
      setLoading(true);
      const res = await runA4PosClf(documentText, userQuery || query);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchA4Data(query);
  }, [documentText]);

  const handleClassifyCustom = async (e) => {
    e.preventDefault();
    if (!customClause.trim()) return;

    try {
      setClfLoading(true);
      const res = await runA4ClassifyClause(customClause.trim());
      setClauseResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setClfLoading(false);
    }
  };

  const posDist = data?.pos_analysis?.pos_distribution || {};
  const deontic = data?.pos_analysis?.deontic_modals_detected || [];
  const evalMetrics = data?.classifier_evaluation || {};
  const searchResults = data?.embeddings_semantic_search?.top_matches || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
            04
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 m-0">Assignment 4: POS Tagging, Embeddings & Clause Classification</h3>
            <p className="text-xs text-slate-500 m-0">
              Grammatical tagging, deontic legal modals, dense embeddings similarity, and supervised legal classification.
            </p>
          </div>
        </div>
      </div>

      {/* POS Distribution & Deontic Modals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* POS Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h4 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-600" />
            Grammatical Part-of-Speech Distribution
          </h4>
          <div className="space-y-2 pt-2">
            {Object.entries(posDist).slice(0, 5).map(([pos, item]) => (
              <div key={pos} className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">{pos}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                  <span className="font-bold text-slate-900 w-10 text-right">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deontic Modals */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h4 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-600" />
            Deontic Modals in Legal Syntax
          </h4>
          <p className="text-[11px] text-slate-500 m-0">
            Deontic markers establish legal obligations, prohibitions, or unilateral rights:
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 pt-1">
            {deontic.length > 0 ? (
              deontic.slice(0, 6).map((d, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-indigo-600">"{d.word}"</span>
                    <span className="text-[11px] text-slate-500 block">{d.type}</span>
                  </div>
                  <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded border border-amber-200">
                    Deontic Signal
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 py-4 text-center">
                Standard deontic modals ('shall', 'must', 'may') will appear when analyzing legal contracts.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Supervised Classifier Sandbox */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 m-0">
            Interactive Supervised Legal Classifier Playground
          </h4>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Test any clause against our trained Multi-Class Logistic Regression pipeline:
          </p>
        </div>

        <form onSubmit={handleClassifyCustom} className="space-y-3">
          <textarea
            rows={2}
            value={customClause}
            onChange={(e) => setCustomClause(e.target.value)}
            placeholder="Type any contract clause..."
            className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={clfLoading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {clfLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />}
              Classify Clause
            </button>
          </div>
        </form>

        {clauseResult && (
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-indigo-900 font-semibold">Predicted Legal Category:</span>
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-600 text-white shadow-xs">
                {clauseResult.predicted_category}
              </span>
            </div>
            <div className="text-[11px] text-slate-600">
              Confidence: <strong>{(clauseResult.confidence * 100).toFixed(1)}%</strong>
            </div>

            {/* Top Category Probs */}
            <div className="pt-2 border-t border-indigo-200/60">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Top Category Probabilities:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(clauseResult.category_probabilities || {}).slice(0, 3).map(([cat, prob]) => (
                  <div key={cat} className="p-2 bg-white rounded-lg border border-indigo-100 text-[11px]">
                    <span className="text-slate-700 block truncate">{cat}</span>
                    <strong className="text-indigo-600">{(prob * 100).toFixed(1)}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Embeddings Semantic Similarity Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-600" />
            Dense Embeddings Semantic Similarity Retrieval
          </h4>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Retrieve relevant legal clauses matching a user's natural language query using vector space cosine similarity:
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type query (e.g. cancel my subscription and get refund)..."
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
          <button
            onClick={() => fetchA4Data(query)}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            Search Vector Space
          </button>
        </div>

        <div className="space-y-2 pt-2">
          {searchResults.map((match, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-700">
                  {match.category}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">
                  Cosine Similarity: {match.similarity_score}
                </span>
              </div>
              <p className="text-slate-800 italic font-serif m-0">"{match.clause}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
