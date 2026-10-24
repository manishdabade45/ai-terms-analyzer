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
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
            10
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 m-0">Assignment 10: Sentiment Analysis, Emotion & Opinion Mining</h3>
            <p className="text-xs text-slate-500 m-0">
              VADER polarity scoring, subjective assertion mining, and the critical distinction between sentiment and legal risk.
            </p>
          </div>
        </div>
      </div>

      {/* Document Sentiment Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Overall Sentiment
          </span>
          <div className="flex items-center gap-2 text-xl font-bold text-slate-900">
            {docSentiment.overall_label === 'Positive' ? <Smile className="w-5 h-5 text-emerald-600" /> :
             docSentiment.overall_label === 'Negative' ? <Frown className="w-5 h-5 text-rose-600" /> :
             <Meh className="w-5 h-5 text-slate-500" />}
            <span>{docSentiment.overall_label || 'Neutral'}</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block font-mono">
            Compound: {docSentiment.compound || 0.0}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Positive Polarity
          </span>
          <div className="text-xl font-bold text-emerald-600 font-mono">
            {((docSentiment.positive || 0) * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Favorable lexicon tokens</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Negative Polarity
          </span>
          <div className="text-xl font-bold text-rose-600 font-mono">
            {((docSentiment.negative || 0) * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Prohibitions & denials</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Neutral Ratio
          </span>
          <div className="text-xl font-bold text-slate-700 font-mono">
            {((docSentiment.neutral || 0) * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Objective statutory drafting</span>
        </div>
      </div>

      {/* CRUCIAL SECTION: The Sentiment != Legal Risk Paradox */}
      <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-3xl p-6 lg:p-8 shadow-xl space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h4 className="text-base font-bold text-white m-0">
              The Critical Legal NLP Paradox: Sentiment ≠ Legal Risk
            </h4>
          </div>
          <p className="text-xs text-slate-300 m-0">
            Why general sentiment analyzers fail catastrophically if used as risk detectors for legal contracts:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paradoxExamples.map((item, idx) => (
            <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md ${
                  item.legal_risk.includes('LOW')
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                }`}>
                  Legal Risk: {item.legal_risk}
                </span>

                <span className="text-[10px] text-slate-400 font-mono">
                  {item.sentiment}
                </span>
              </div>

              <p className="text-xs text-slate-100 italic font-serif leading-relaxed m-0">
                "{item.clause}"
              </p>

              <div className="text-[11px] text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                <strong>Why this happens:</strong> {item.explanation}
              </div>
            </div>
          ))}
        </div>

        {/* Core Lesson Summary */}
        <div className="p-4 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl text-xs text-indigo-200 leading-relaxed">
          <strong>Key Takeaway for AI Examiners:</strong> {data?.core_pedagogical_principle}
        </div>
      </div>
    </div>
  );
}
