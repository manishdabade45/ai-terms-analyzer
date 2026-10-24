import React, { useState, useMemo } from 'react';
import { Search, Filter, ShieldAlert, AlertTriangle, CheckCircle, ChevronRight, Sparkles } from 'lucide-react';
import RiskDetailModal from './RiskDetailModal';

export default function ClauseRiskReport({ result }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedModalClause, setSelectedModalClause] = useState(null);

  const clauses = result?.risk_analysis?.clauses || [];

  const categories = useMemo(() => {
    const set = new Set();
    clauses.forEach(c => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set).sort();
  }, [clauses]);

  const filteredClauses = useMemo(() => {
    return clauses.filter(c => {
      if (selectedSeverity !== 'ALL' && c.risk_level !== selectedSeverity) return false;
      if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const textMatch = c.text && c.text.toLowerCase().includes(q);
        const catMatch = c.category && c.category.toLowerCase().includes(q);
        const reasonMatch = c.matched_flags && c.matched_flags.some(f => f.reason.toLowerCase().includes(q));
        if (!textMatch && !catMatch && !reasonMatch) return false;
      }
      return true;
    });
  }, [clauses, selectedSeverity, selectedCategory, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header and Filter Toolbar */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white m-0">
              Clause-by-Clause Risk Report
            </h3>
            <p className="text-xs text-slate-400 m-0 mt-0.5">
              Filtered evaluation of every extracted clause with AI categorization and consumer impact reasoning.
            </p>
          </div>
          <div className="text-xs text-slate-400">
            Showing <strong className="text-white">{filteredClauses.length}</strong> of {clauses.length} clauses
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by keyword (e.g. arbitration, cookies)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Severity Toggle Pills */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {['ALL', 'High', 'Medium', 'Low'].map(sev => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedSeverity === sev
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev === 'ALL' ? 'All Risks' : sev}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Clauses Cards List */}
      <div className="space-y-3">
        {filteredClauses.length === 0 ? (
          <div className="bg-[#111827] rounded-2xl border border-slate-800 p-12 text-center text-xs text-slate-500">
            No clauses found matching your filter criteria.
          </div>
        ) : (
          filteredClauses.map((clause, idx) => {
            const sev = clause.risk_level || 'Low';
            const flags = clause.matched_flags || [];

            return (
              <div
                key={idx}
                className={`bg-[#111827] rounded-2xl border p-5 shadow-sm transition-all hover:border-slate-600 space-y-3 ${
                  sev === 'High' ? 'border-rose-900/60 bg-[#16121f]/50' :
                  sev === 'Medium' ? 'border-amber-900/50 bg-[#191515]/40' :
                  'border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md ${
                      sev === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      sev === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {sev.toUpperCase()} RISK
                    </span>

                    <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md">
                      {clause.category || 'General'}
                    </span>

                    <span className="px-2.5 py-0.5 text-[10px] rounded-md bg-slate-800 text-slate-400">
                      Sentiment: {clause.sentiment || 'Neutral'}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedModalClause(clause)}
                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect Reason</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-serif italic m-0">
                  "{clause.text}"
                </p>

                {flags.length > 0 && (
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <div className="text-rose-300 font-medium">
                      <strong>Concerning Factor:</strong> {flags[0].reason}
                    </div>
                    <div className="text-sky-300/90 text-[11px]">
                      <strong>Advice:</strong> {flags[0].recommendation}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {selectedModalClause && (
        <RiskDetailModal
          clause={selectedModalClause}
          onClose={() => setSelectedModalClause(null)}
        />
      )}
    </div>
  );
}
