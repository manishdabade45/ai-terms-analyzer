import React, { useState } from 'react';
import {
  Eye,
  CreditCard,
  AlertTriangle,
  Ban,
  Scale,
  FileText,
  MapPin,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Download,
  Copy,
  Check,
  Link2,
  FileCode
} from 'lucide-react';
import { getPdfDownloadUrl, getMdDownloadUrl } from '../services/api';

const ICON_MAP = {
  'eye': Eye,
  'credit-card': CreditCard,
  'alert-triangle': AlertTriangle,
  'ban': Ban,
  'scale': Scale,
  'file-text': FileText,
  'map-pin': MapPin,
  'refresh-cw': RefreshCw
};

export default function ThreatMatrix({ result }) {
  const [expandedCards, setExpandedCards] = useState({});
  const [copied, setCopied] = useState(false);

  if (!result || !result.summary) return null;

  const summary = result.summary;
  const risk = result.risk_analysis || {};
  const matrix = risk.threat_matrix || [];
  const riskScore = summary.risk_score || 0;
  const totalRisky = (summary.high_risk_clauses_count || 0) + (summary.medium_risk_clauses_count || 0);

  const toggleExpand = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopySummary = () => {
    const text = `AI Legal Analysis: ${summary.title}\nOverall Risk: ${riskScore}/100 (${summary.risk_rating})\nRisky Clauses Flagged: ${totalRisky}\nSummary: ${summary.rating_summary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    if (result.saved_id) {
      window.open(getMdDownloadUrl(result.saved_id), '_blank');
    } else {
      // Direct client-side generation
      let md = `# AI Terms & Conditions Analysis Report\n`;
      md += `**Document Title:** ${summary.title}\n`;
      md += `**Overall Risk Rating:** ${riskScore}/100 (${summary.risk_rating})\n`;
      md += `**Risky Clauses Flagged:** ${totalRisky}\n\n`;
      md += `## Consumer Threat Matrix\n`;
      matrix.forEach(m => {
        md += `### ${m.name} (${m.status.toUpperCase()})\n`;
        md += `- **Found:** ${m.found_count} clause(s)\n`;
        md += `- **Summary:** ${m.summary}\n\n`;
      });
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${summary.title.replace(/\s+/g, '_')}_analysis.md`;
      a.click();
    }
  };

  const handleDownloadPdf = () => {
    if (result.saved_id) {
      window.open(getPdfDownloadUrl(result.saved_id), '_blank');
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      {/* SECTION 1: Consumer Threat Matrix: At a Glance (Photo 3) */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white tracking-tight m-0 flex items-center gap-2">
            <span>Consumer Threat Matrix: At a Glance</span>
            <span className="text-slate-500 text-sm cursor-pointer hover:text-sky-400">🔗</span>
          </h2>
        </div>

        {/* Threat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matrix.map((threat) => {
            const IconComponent = ICON_MAP[threat.icon] || AlertTriangle;
            const isDanger = threat.status === 'danger';
            const isExpanded = !!expandedCards[threat.id];

            return (
              <div
                key={threat.id}
                className="bg-[#111827]/90 rounded-2xl border border-slate-800/80 p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-700/80 transition-all"
              >
                {/* Header with Circle Dot & Title */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    {/* Pulsing indicator dot */}
                    <div className="relative flex items-center justify-center">
                      <div className={`w-3.5 h-3.5 rounded-full ${
                        isDanger ? 'bg-rose-500' : 'bg-emerald-500'
                      }`} />
                      {isDanger && (
                        <div className="w-3.5 h-3.5 rounded-full bg-rose-500 absolute animate-ping opacity-60" />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-4 h-4 ${isDanger ? 'text-rose-400' : 'text-emerald-400'}`} />
                      <h3 className="text-sm font-bold text-white tracking-tight m-0">
                        {threat.name}
                      </h3>
                    </div>
                  </div>

                  {/* Found Count Badge */}
                  {isDanger ? (
                    <div className="text-xs font-semibold text-rose-300/90">
                      Found in {threat.found_count} clause(s)
                    </div>
                  ) : (
                    <div className="text-xs font-medium text-emerald-400/90">
                      Safe / Standard Terms
                    </div>
                  )}

                  {/* Summary Description */}
                  <p className="text-xs text-slate-300 leading-relaxed m-0">
                    {threat.summary}
                  </p>
                </div>

                {/* Show matched clause Button / Expander */}
                <div>
                  {threat.matched_clauses && threat.matched_clauses.length > 0 ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleExpand(threat.id)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/70 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <span>›</span>
                          <span>Show matched clause</span>
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-2.5 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/60 space-y-2 text-xs">
                          {threat.matched_clauses.map((mc, cIdx) => (
                            <div key={cIdx} className="space-y-1.5 border-b border-slate-800 last:border-b-0 pb-2 last:pb-0">
                              <p className="text-slate-200 italic font-serif leading-relaxed m-0">
                                "{mc.clause}"
                              </p>
                              {mc.reason && (
                                <div className="text-[11px] text-amber-300/90 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                                  <strong>Risk Reason:</strong> {mc.reason}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic">
                      No explicit high-risk pattern detected in this category.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: Overall Risk Rating (Photo 2) */}
      <section className="pt-6 border-t border-slate-800/80 space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Overall Risk Rating
          </span>

          <div className="flex items-baseline gap-2">
            <span className="text-5xl lg:text-6xl font-black text-white tracking-tight">
              {riskScore}/100
            </span>
          </div>

          {/* Risky clauses flagged pill */}
          <div className="mt-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              riskScore >= 65
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : riskScore >= 35
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              <span>↑</span>
              <span>{totalRisky} risky clauses flagged</span>
            </span>
          </div>
        </div>

        {/* Action Buttons (Download .md, Download .pdf, Copy) */}
        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadMd}
            className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white text-xs font-semibold border border-slate-700/80 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <FileCode className="w-4 h-4 text-sky-400" />
            <span>Download Analysis Report (.md)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white text-xs font-semibold border border-slate-700/80 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download Analysis Report (.pdf)</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="px-4 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
