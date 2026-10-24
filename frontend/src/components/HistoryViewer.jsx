import React, { useState, useEffect } from 'react';
import { History, Trash2, ArrowUpRight, Download, RefreshCw, AlertCircle, FileText } from 'lucide-react';
import { fetchHistory, fetchHistoryDetail, deleteHistoryItem, getPdfDownloadUrl } from '../services/api';

export default function HistoryViewer({ onSelectReport }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchHistory();
      setHistory(data.history || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSelect = async (id) => {
    try {
      setLoading(true);
      const detail = await fetchHistoryDetail(id);
      detail.saved_id = id;
      onSelectReport(detail);
    } catch (err) {
      setError('Failed to load past analysis: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this saved analysis record?')) return;

    try {
      await deleteHistoryItem(id);
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 m-0">Saved Analysis History (SQLite)</h3>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Review and reload past contracts analyzed by the NLP pipeline.
          </p>
        </div>

        <button
          onClick={loadHistory}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          title="Refresh History"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {history.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          No saved analyses found in the SQLite database yet. Run an analysis above to save one.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-all cursor-pointer"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                    item.risk_score >= 65 ? 'bg-rose-100 text-rose-800' :
                    item.risk_score >= 35 ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.risk_score}/100 • {item.risk_rating}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{item.title}</span>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-3">
                  <span>Source: <strong>{item.source_type}</strong></span>
                  <span>•</span>
                  <span>Clauses: <strong>{item.total_clauses}</strong></span>
                  <span>•</span>
                  <span>Date: <strong>{item.created_at}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={getPdfDownloadUrl(item.id)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </a>

                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleSelect(item.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Open</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
