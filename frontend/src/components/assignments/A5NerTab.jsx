import React, { useState, useEffect } from 'react';
import { Fingerprint, AlertTriangle, BookOpen, Layers, CheckCircle } from 'lucide-react';
import { runA5Ner } from '../../services/api';

const ENTITY_COLORS = {
  ORG: 'bg-purple-100 text-purple-800 border-purple-200',
  DATE: 'bg-blue-100 text-blue-800 border-blue-200',
  MONEY: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  PERCENT: 'bg-amber-100 text-amber-800 border-amber-200',
  GPE: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  LAW: 'bg-rose-100 text-rose-800 border-rose-200',
  PRODUCT: 'bg-teal-100 text-teal-800 border-teal-200',
  CARDINAL: 'bg-slate-100 text-slate-800 border-slate-200'
};

export default function A5NerTab({ documentText }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNer = async () => {
      try {
        setLoading(true);
        const res = await runA5Ner(documentText || 'OmniStream Entertainment LLC located in California charges $50 cancellation under CCPA.');
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNer();
  }, [documentText]);

  const entities = data?.entity_extraction?.entities || [];
  const countsByType = data?.entity_extraction?.counts_by_type || {};
  const limitations = data?.legal_ner_limitations_report?.findings || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
            05
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 m-0">Assignment 5: Named Entity Recognition (NER)</h3>
            <p className="text-xs text-slate-500 m-0">
              Entity identification via spaCy pipeline and critical academic analysis of legal domain limitations.
            </p>
          </div>
        </div>
      </div>

      {/* Entity Type Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(countsByType).map(([type, count]) => (
          <div key={type} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${ENTITY_COLORS[type] || 'bg-slate-100 text-slate-800'}`}>
              {type}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-2">{count}</div>
            <span className="text-[11px] text-slate-400">occurrences</span>
          </div>
        ))}
      </div>

      {/* Extracted Entities List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h4 className="text-sm font-bold text-slate-900 m-0">Extracted Entities & Descriptors</h4>
          <span className="text-xs text-slate-500 font-medium">{entities.length} unique entities</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
          {entities.map((ent, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900">{ent.text}</span>
                <span className="text-[11px] text-slate-500 block">{ent.label_description}</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${ENTITY_COLORS[ent.label] || 'bg-slate-100 text-slate-800'}`}>
                {ent.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Crucial Academic Section: Limitations of General NER in Legal Contracts */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 lg:p-8 shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h4 className="text-base font-bold text-white m-0">
            Academic Report: Limitations of General-Purpose NER on Legal Contracts
          </h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed m-0">
          Why standard off-the-shelf NLP models (e.g. trained on OntoNotes/CoNLL) require specialized adaptation when applied to legal contracts:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {limitations.map((item, idx) => (
            <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
              <h5 className="text-xs font-bold text-indigo-300 m-0">
                {idx + 1}. {item.issue}
              </h5>
              <p className="text-[11px] text-slate-300 leading-relaxed m-0">{item.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
