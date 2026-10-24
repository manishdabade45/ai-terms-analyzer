import React, { useState, useEffect } from 'react';
import { BookOpen, BarChart2, Globe, Layers, AlertCircle, RefreshCw } from 'lucide-react';
import { runA2Stats } from '../../services/api';

export default function A2StatsTab({ documentText }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState(documentText || '');

  const fetchStats = async (textToAnalyze) => {
    try {
      setLoading(true);
      const res = await runA2Stats(textToAnalyze || 'Sample legal agreement text for testing.');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(documentText);
  }, [documentText]);

  const stats = data?.statistics || {};
  const lang = data?.language || {};
  const tokens = data?.tokenization || {};
  const huffpost = data?.huffpost_experiment || {};

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">Assignment 2: Language, Statistics & Tokenization</h3>
              <p className="text-xs text-slate-500 m-0">
                Language identification, linguistic statistics, tokenization, and HuffPost dataset demonstration.
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchStats(inputText)}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Recompute Stats
          </button>
        </div>
      </div>

      {/* Language & Linguistic Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Language Box */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Detected Language
          </span>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            <span className="text-xl font-bold text-slate-900">{lang.language_name || 'English'}</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Confidence: <strong>{lang.confidence ? (lang.confidence * 100).toFixed(1) : 95}%</strong>
          </span>
        </div>

        {/* Word & Sentences */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Word & Sentence Count
          </span>
          <div className="text-xl font-bold text-slate-900">
            {stats.total_words?.toLocaleString() || 0} <span className="text-xs font-normal text-slate-500">words</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Across <strong>{stats.total_sentences || 0}</strong> sentences
          </span>
        </div>

        {/* Lexical Diversity (TTR) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Lexical Diversity (TTR)
          </span>
          <div className="text-xl font-bold text-slate-900">
            {stats.lexical_diversity_ttr || 0}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Unique Vocabulary: <strong>{stats.vocab_size || 0}</strong> terms
          </span>
        </div>

        {/* Average Sentence Length */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Avg Sentence Length
          </span>
          <div className="text-xl font-bold text-slate-900">
            {stats.avg_sentence_length || 0} <span className="text-xs font-normal text-slate-500">words/sent</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Avg Word: <strong>{stats.avg_word_length || 0}</strong> characters
          </span>
        </div>
      </div>

      {/* Tokenization Sample */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
        <h4 className="text-sm font-bold text-slate-900 m-0">NLTK Tokenization Stream</h4>
        <p className="text-xs text-slate-500 m-0">
          First {tokens.tokens_sample?.length || 0} tokens generated by NLTK's Punkt tokenizer:
        </p>
        <div className="flex flex-wrap gap-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 max-h-40 overflow-y-auto">
          {tokens.tokens_sample?.map((t, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-mono text-slate-700">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* HuffPost News Category Dataset Demonstration */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 lg:p-8 shadow-lg space-y-5">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h4 className="text-base font-bold text-white m-0">
            HuffPost News Category Dataset (2012–2018) Demonstration
          </h4>
        </div>

        {/* Academic Note */}
        <div className="p-4 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-xs text-amber-200 leading-relaxed">
          <strong>Notice:</strong> {huffpost.academic_note}
        </div>

        {/* Sample Records from HuffPost */}
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-3">
            Sample HuffPost Records & Category Distribution
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {huffpost.sample_articles?.slice(0, 4).map((art, idx) => (
              <div key={idx} className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/30 text-indigo-300">
                    {art.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{art.date}</span>
                </div>
                <h6 className="text-xs font-bold text-slate-100 line-clamp-1 m-0">{art.headline}</h6>
                <p className="text-[11px] text-slate-300 line-clamp-2 m-0">{art.short_description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
