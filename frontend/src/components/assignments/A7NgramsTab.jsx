import React, { useState, useEffect } from 'react';
import { Layers, AlignLeft, Sparkles } from 'lucide-react';
import { runA7Ngrams } from '../../services/api';

export default function A7NgramsTab({ documentText }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeNgramTab, setActiveNgramTab] = useState('bigrams'); // 'unigrams', 'bigrams', 'trigrams'

  useEffect(() => {
    const fetchNgrams = async () => {
      try {
        setLoading(true);
        const res = await runA7Ngrams(documentText || 'We collect personal information. Your subscription will automatically renew at monthly rates.');
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNgrams();
  }, [documentText]);

  const ngrams = data?.ngrams || {};
  const currentList = ngrams[activeNgramTab] || [];
  const detectedKeyPhrases = ngrams.detected_key_phrases || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
            07
          </div>
          <div>
            <h3 className="text-base font-bold text-white m-0">Module 07: N-gram Models</h3>
            <p className="text-xs text-slate-400 m-0">
              Unigram, bigram, and trigram extraction to capture multi-word contractual constructions.
            </p>
          </div>
        </div>
      </div>

      {/* Detected Core Legal Key Phrases */}
      {detectedKeyPhrases.length > 0 && (
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-sm space-y-3">
          <h4 className="text-sm font-bold text-white m-0 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Detected Multi-Word Legal Key Phrases
          </h4>
          <div className="flex flex-wrap gap-2 pt-1">
            {detectedKeyPhrases.map((kp, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs font-semibold text-indigo-200 flex items-center gap-2">
                <span>{kp.phrase}</span>
                <span className="bg-indigo-500/30 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {kp.count}x
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* N-gram Selector & Frequency Table */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {['unigrams', 'bigrams', 'trigrams'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveNgramTab(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeNgramTab === tab
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab === 'unigrams' ? 'Unigrams (1-Word)' : tab === 'bigrams' ? 'Bigrams (2-Word)' : 'Trigrams (3-Word)'}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500">Total Tokens: {ngrams.total_word_tokens || 0}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
          {currentList.map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-300 font-medium truncate pr-2">
                "{item.phrase}"
              </span>
              <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded font-bold text-sky-400 text-[11px] shrink-0">
                {item.count}x
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
