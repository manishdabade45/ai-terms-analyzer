import React, { useState, useMemo } from 'react';
import { Search, Filter, ShieldAlert, AlertTriangle, CheckCircle, ChevronRight, MessageSquareQuote } from 'lucide-react';

export default function ClauseExplorer({ clauses = [], onSelectClause }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set();
    clauses.forEach(c => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set).sort();
  }, [clauses]);

  // Filtered clauses
  const filteredClauses = useMemo(() => {
    return clauses.filter(c => {
      // Severity filter
      if (selectedSeverity !== 'ALL' && c.risk_level !== selectedSeverity) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const textMatch = c.text && c.text.toLowerCase().includes(query);
        const catMatch = c.category && c.category.toLowerCase().includes(query);
        const flagMatch = c.matched_flags && c.matched_flags.some(f => f.reason.toLowerCase().includes(query));
        if (!textMatch && !catMatch && !flagMatch) return false;
      }

      return true;
    });
  }, [clauses, selectedSeverity, selectedCategory, searchTerm]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 m-0">Clause Risk Explorer</h3>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Browse segmented clauses with AI category predictions, sentiment, and explainable risk badges.
          </p>
        </div>

        {/* Counter */}
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filteredClauses.length}</span> of {clauses.length} clauses
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keywords (e.g. arbitration, refund, cookies)..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {['ALL', 'High', 'Medium', 'Low'].map(sev => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedSeverity === sev
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {sev === 'ALL' ? 'All Risks' : sev}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          >
            <option value="ALL">All Legal Categories ({categories.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Clause Cards List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {filteredClauses.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No clauses found matching your filter criteria.
          </div>
        ) : (
          filteredClauses.map((clause, idx) => {
            const sev = clause.risk_level || 'Low';
            const flags = clause.matched_flags || [];

            return (
              <div
                key={idx}
                onClick={() => onSelectClause(clause)}
                className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                  sev === 'High'
                    ? 'border-rose-200 bg-rose-50/20 hover:bg-rose-50/40'
                    : sev === 'Medium'
                    ? 'border-amber-200 bg-amber-50/20 hover:bg-amber-50/40'
                    : 'border-slate-200 bg-white hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                      sev === 'High' ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                      sev === 'Medium' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                      'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    }`}>
                      {sev.toUpperCase()} RISK
                    </span>

                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                      {clause.category || 'General'}
                    </span>

                    <span className={`px-2 py-0.5 text-[10px] rounded-md ${
                      clause.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-600' :
                      clause.sentiment === 'Negative' ? 'bg-rose-50 text-rose-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      Sentiment: {clause.sentiment || 'Neutral'}
                    </span>

                    {clause.is_unilateral_opinion && (
                      <span className="px-2 py-0.5 text-[10px] bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                        One-Sided Discretion
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1 shrink-0 hover:underline">
                    Inspect <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed m-0 font-serif">
                  {clause.text}
                </p>

                {flags.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] text-rose-700">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span><strong>Risk:</strong> {flags[0].reason}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
