import React from 'react';
import { Tag, Scale, Cpu, Calendar, DollarSign, Globe, Shield, Sparkles } from 'lucide-react';

export default function KeyDetailsTab({ result }) {
  if (!result) return null;

  const modules = result.assignment_modules || {};
  const posAnalysis = modules.assignment_4?.pos_analysis || {};
  const posDist = posAnalysis.pos_distribution || {};
  const deonticModals = posAnalysis.deontic_modals_detected || [];
  const nerData = modules.assignment_5?.data || {};
  const entities = nerData.entities || [];

  // Group entities by type
  const orgs = entities.filter(e => e.label === 'ORG');
  const dates = entities.filter(e => e.label === 'DATE');
  const monies = entities.filter(e => e.label === 'MONEY');
  const laws = entities.filter(e => e.label === 'LAW' || e.label === 'GPE');

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Section 1: Deontic Modals (shall, must, may) */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white m-0">
            Deontic Modals & Contractual Covenants
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed m-0">
          Deontic syntax forms the backbone of contract enforceability: <strong>"shall"</strong> / <strong>"must"</strong> impose mandatory legal duties, while <strong>"may"</strong> confers unilateral discretion onto the vendor.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {deonticModals.length > 0 ? (
            deonticModals.slice(0, 9).map((dm, idx) => (
              <div key={idx} className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-400 text-xs">
                    "{dm.word}"
                  </span>
                  <span className="px-2 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                    {dm.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight m-0">{dm.explanation}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full py-6 text-center text-xs text-slate-500">
              Run an analysis on terms of service to extract deontic modal occurrences.
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Named Entities Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Companies & Third Parties */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white m-0 flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" />
              Organizations & Third-Party Brokers
            </h4>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold">
              {orgs.length} detected
            </span>
          </div>

          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pt-1">
            {orgs.length > 0 ? (
              orgs.map((o, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-purple-950/40 border border-purple-500/30 rounded-lg text-xs font-mono text-purple-200">
                  {o.text}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No external organizations explicitly identified.</span>
            )}
          </div>
        </div>

        {/* Money, Fees & Penalties */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white m-0 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Fees, Liability Caps & Amounts
            </h4>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
              {monies.length} detected
            </span>
          </div>

          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pt-1">
            {monies.length > 0 ? (
              monies.map((m, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold text-emerald-300">
                  {m.text}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No specific currency or liability dollar amounts detected.</span>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Governing Law & Jurisdiction */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white m-0 flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-400" />
            Governing Law, Regulations & Jurisdictions
          </h4>
          <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-bold">
            {laws.length} found
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {laws.length > 0 ? (
            laws.map((l, idx) => (
              <span key={idx} className="px-3 py-1 bg-sky-950/40 border border-sky-500/30 rounded-lg text-xs font-mono text-sky-200">
                {l.text}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500 italic">Standard statutory jurisdictions apply.</span>
          )}
        </div>
      </div>
    </div>
  );
}
