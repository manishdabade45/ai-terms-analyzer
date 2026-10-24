import React, { useState, useEffect } from 'react';
import { Heart, Smile, Frown, Meh, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { runA10Sentiment } from '../../services/api';

export default function A10SentimentTab({ documentText }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        setLoading(true);
        const res = await runA10Sentiment(documentText || 'We do not sell personal data. The company reserves the right to terminate access at its sole discretion.');
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSentiment();
  }, [documentText]);

  const docSentiment = data?.document_sentiment || {};
  const paradoxExamples = data?.sentiment_vs_risk_paradox || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
            10
          </div>
          <div>
            <h3 className="text-base font-bold text-white m-0">Module 10: Sentiment Analysis, Emotion & Opinion Mining</h3>
            <p className="text-xs text-slate-400 m-0">
              VADER polarity scoring, subjective assertion mining, and the critical distinction between sentiment and legal risk.
            </p>
          </div>
        </div>
      </div>

      {/* Document Sentiment Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Overall Sentiment
          </span>
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            {docSentiment.overall_label === 'Positive' ? <Smile className="w-5 h-5 text-emerald-400" /> :
             docSentiment.overall_label === 'Negative' ? <Frown className="w-5 h-5 text-rose-400" /> :
             <Meh className="w-5 h-5 text-slate-400" />}
            <span>{docSentiment.overall_label || 'Neutral'}</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block font-mono">
            Compound: {docSentiment.compound || 0.0}
          </span>
        </div>

        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Positive Polarity
          </span>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {((docSentiment.positive || 0) * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Favorable lexicon tokens</span>
        </div>

        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Negative Polarity
          </span>
          <div className="text-xl font-bold text-rose-400 font-mono">
            {((docSentiment.negative || 0) * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Prohibitions & denials</span>
        </div>

        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Neutral Ratio
          </span>
          <div className="text-xl font-bold text-slate-200 font-mono">
            {((docSentiment.neutral || 0) * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Objective statutory drafting</span>
        </div>
      </div>

      {/* The Sentiment != Legal Risk Paradox */}
      <div className="bg-[#0e1424] text-white rounded-3xl p-6 lg:p-8 border border-slate-800 shadow-xl space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h4 className="text-base font-bold text-white m-0">
              The Legal NLP Paradox: Sentiment ≠ Legal Risk
            </h4>
          </div>
          <p className="text-xs text-slate-400 m-0">
            Why general sentiment analyzers fail if used directly as risk detectors for legal contracts:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paradoxExamples.map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md ${
                  item.legal_risk.includes('LOW')
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  Legal Risk: {item.legal_risk}
                </span>

                <span className="text-[10px] text-slate-400 font-mono">
                  {item.sentiment}
                </span>
              </div>

              <p className="text-xs text-slate-200 italic font-serif leading-relaxed m-0">
                "{item.clause}"
              </p>

              <div className="text-[11px] text-slate-300 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 leading-relaxed">
                <strong>Why this happens:</strong> {item.explanation}
              </div>
            </div>
          ))}
        </div>

        {/* Core Lesson Summary */}
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs text-indigo-300 leading-relaxed">
          <strong>Key Takeaway:</strong> General sentiment analysis models must never be used as a direct proxy for legal risk. Legal agreements use neutral, sanitized prose to describe severe rights forfeitures, while protective clauses often use explicit negative prohibitions ('shall not', 'do not disclose').
        </div>
      </div>
    </div>
  );
}
