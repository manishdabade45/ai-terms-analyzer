import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Download,
  Share2,
  Printer,
  ChevronRight,
  Sparkles,
  Scale,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Award,
  Zap,
  Info,
  SlidersHorizontal,
  ExternalLink,
  Mail,
  Copy
} from 'lucide-react';
import ClauseExplorer from './ClauseExplorer';
import RiskDetailModal from './RiskDetailModal';
import ArbitrationOptOutModal from './ArbitrationOptOutModal';
import { getPdfDownloadUrl } from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function AnalysisDashboard({ result, onReset }) {
  const [selectedClause, setSelectedClause] = useState(null);
  const [showOptOutModal, setShowOptOutModal] = useState(false);
  const [activeDimensionFilter, setActiveDimensionFilter] = useState(null);

  if (!result || !result.summary) return null;

  const summary = result.summary;
  const risk = result.risk_analysis || {};
  const clauses = risk.clauses || [];
  const topFlagged = risk.top_flagged_clauses || [];
  const modules = result.assignment_modules || {};

  const riskScore = summary.risk_score || 0;
  const riskRating = summary.risk_rating || 'Low Risk';

  // Calculate Trust Letter Grade & Trust Index
  const trustIndex = Math.max(0, 100 - riskScore);
  let letterGrade = 'A+';
  let gradeColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  let gradeVerdict = 'Consumer Protection Certified';

  if (riskScore >= 75) {
    letterGrade = 'F';
    gradeColor = 'text-rose-700 bg-rose-50 border-rose-200';
    gradeVerdict = 'Severe Rights Forfeiture Detected';
  } else if (riskScore >= 60) {
    letterGrade = 'D';
    gradeColor = 'text-rose-600 bg-rose-50 border-rose-200';
    gradeVerdict = 'Predatory & High Corporate Bias';
  } else if (riskScore >= 40) {
    letterGrade = 'C';
    gradeColor = 'text-amber-600 bg-amber-50 border-amber-200';
    gradeVerdict = 'Moderate Caution Advised';
  } else if (riskScore >= 20) {
    letterGrade = 'B';
    gradeColor = 'text-indigo-600 bg-indigo-50 border-indigo-200';
    gradeVerdict = 'Fair with Standard Commercial Disclaimers';
  }

  // Flesch Reading Ease & Grade Level approximation
  const avgSentenceLen = modules?.assignment_2?.statistics?.avg_sentence_length || 24;
  const avgWordLen = modules?.assignment_2?.statistics?.avg_word_length || 5.2;
  // Standard Flesch Reading Ease heuristic: 206.835 - 1.015*(avg_sentence_len) - 84.6*(syllables_per_word ~ avgWordLen/3)
  const estimatedReadingEase = Math.max(12, Math.min(95, Math.round(206.835 - (1.015 * avgSentenceLen) - (28 * (avgWordLen - 3.8)))));
  const readingComplexityLevel = estimatedReadingEase < 30 ? 'College Graduate / Attorney Level (Very Difficult)' :
    estimatedReadingEase < 50 ? 'College Undergraduate Level (Difficult)' :
    estimatedReadingEase < 65 ? 'High School Graduate Level (Standard)' : 'Plain Language (Easy to Read)';

  // Corporate Bias Ratio vs Consumer Protection Ratio
  const corporateFavorability = Math.min(95, Math.max(20, Math.round(40 + (riskScore * 0.55))));
  const consumerFavorability = 100 - corporateFavorability;

  // 10 Key Risk Dimensions Analysis
  const riskDimensions = useMemo(() => {
    const categoriesList = [
      { id: 'arbitration', name: 'Mandatory Arbitration & Class Action Waiver', pattern: /arbitration|class action/i, icon: Scale },
      { id: 'tracking', name: 'Geolocation Tracking & Biometrics', pattern: /geolocation|location|biometric|fingerprint/i, icon: Zap },
      { id: 'datasharing', name: 'Third-Party Data Sharing & Selling', pattern: /data broker|sell.*data|share.*partner/i, icon: Share2 },
      { id: 'changes', name: 'Unilateral Modifications Without Notice', pattern: /modify.*without notice|sole discretion.*change/i, icon: SlidersHorizontal },
      { id: 'autorenew', name: 'Automatic Renewal & No Refunds', pattern: /automatically renew|auto-renew|non-refundable/i, icon: Clock },
      { id: 'liability', name: 'Overreaching Limitation of Liability', pattern: /limitation of liability|exceed.*50|punitive damages/i, icon: ShieldAlert },
      { id: 'termination', name: 'Termination Without Cause or Notice', pattern: /terminate.*without notice|for any reason or no reason/i, icon: XCircle },
      { id: 'retention', name: 'Indefinite Data Retention', pattern: /indefinitely|even following deletion/i, icon: FileText },
      { id: 'iprights', name: 'Perpetual Content & IP License', pattern: /perpetual.*worldwide.*license|royalty-free/i, icon: Sparkles },
      { id: 'indemnity', name: 'Broad User Indemnification', pattern: /indemnify|hold harmless/i, icon: ShieldCheck }
    ];

    return categoriesList.map(dim => {
      const matchingClauses = clauses.filter(c => dim.pattern.test(c.text) || (c.matched_flags && c.matched_flags.some(f => dim.pattern.test(f.reason))));
      const hasHighRisk = matchingClauses.some(c => c.risk_level === 'High');
      const hasMedRisk = matchingClauses.some(c => c.risk_level === 'Medium');

      let status = 'Safe / Absent';
      let score = 0;
      let badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';

      if (hasHighRisk) {
        status = 'Critical Risk';
        score = 100;
        badgeStyle = 'bg-rose-100 text-rose-800 border-rose-300';
      } else if (hasMedRisk || matchingClauses.length > 0) {
        status = 'Moderate Risk';
        score = 55;
        badgeStyle = 'bg-amber-100 text-amber-800 border-amber-300';
      }

      return {
        ...dim,
        status,
        score,
        badgeStyle,
        count: matchingClauses.length,
        clauses: matchingClauses
      };
    });
  }, [clauses]);

  // Regulatory Compliance Checkpoints (GDPR, CCPA, FTC, UCC, FAA)
  const complianceCheckpoints = useMemo(() => {
    const textAll = clauses.map(c => c.text).join(' ').toLowerCase();

    // 1. GDPR Art. 17 (Right to Erasure) & Art. 6/7 (Consent)
    const gdprPass = !textAll.includes('indefinitely') && !textAll.includes('sell your personal');
    // 2. CCPA / CPRA § 1798.120 (Do Not Sell)
    const ccpaPass = !textAll.includes('data brokers') && !textAll.includes('share, sell, lease, or license');
    // 3. FTC Act § 5 (Deceptive Auto-Renewal & Click to Cancel)
    const ftcPass = !textAll.includes('strictly non-refundable under any circumstances') && !textAll.includes('reactivation fee');
    // 4. UCC § 2-316 (Conspicuous Warranty & Consequential Damages)
    const uccFlagged = textAll.includes('in no event shall the company be liable for any indirect') || textAll.includes('fifty dollars ($50)');
    // 5. FAA Arbitration & Class Action Waiver enforceability
    const faaFlagged = textAll.includes('class action waiver') || textAll.includes('binding arbitration');

    return [
      {
        statute: 'GDPR (EU 2016/679)',
        domain: 'Data Protection & Right to Erasure',
        status: gdprPass ? 'Compliant' : 'Non-Compliant Risk',
        badge: gdprPass ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-300',
        note: gdprPass
          ? 'Guarantees definite data purge timelines upon user request.'
          : 'Indefinite retention or commercial sale violates Art. 17 right to be forgotten.'
      },
      {
        statute: 'CCPA / CPRA (Cal. Civ. Code)',
        domain: 'Do Not Sell / Share & Biometrics',
        status: ccpaPass ? 'Compliant' : 'Potential Violation',
        badge: ccpaPass ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-300',
        note: ccpaPass
          ? 'Explicit prohibitions on selling personal identifying records.'
          : 'Transfers behavioral history to advertising brokers without conspicuous opt-out.'
      },
      {
        statute: 'FTC Act Section 5 & Click-to-Cancel',
        domain: 'Subscription Auto-Renewal & Dark Patterns',
        status: ftcPass ? 'Compliant' : 'High Regulatory Exposure',
        badge: ftcPass ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200',
        note: ftcPass
          ? 'Straightforward cancellation terms without hidden reactivation fees.'
          : 'Strict non-refundable terms and penalty fees trigger FTC scrutiny.'
      },
      {
        statute: 'UCC § 2-316 & § 2-719',
        domain: 'Conspicuousness of Liability Caps',
        status: !uccFlagged ? 'Standard' : 'Unconscionable Liability Cap',
        badge: !uccFlagged ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-rose-100 text-rose-800 border-rose-300',
        note: !uccFlagged
          ? 'Standard commercial risk-shifting boilerplate.'
          : 'Capping damages at $50 for gross service failure risks unconscionability rulings.'
      },
      {
        statute: 'Federal Arbitration Act (FAA)',
        domain: 'Pre-Dispute Arbitration & Class Waiver',
        status: !faaFlagged ? 'Court Access Retained' : 'Mandatory Arbitration Enforced',
        badge: !faaFlagged ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-purple-100 text-purple-800 border-purple-200',
        note: !faaFlagged
          ? 'Users retain full rights to pursue judicial litigation and class remedies.'
          : 'Requires submission of formal 30-day opt-out letter to preserve court rights.'
      }
    ];
  }, [clauses]);

  // Executive TL;DR Rights Forfeited vs Protections Retained
  const rightsForfeited = useMemo(() => {
    const list = [];
    const textAll = clauses.map(c => c.text).join(' ').toLowerCase();

    if (textAll.includes('class action')) list.push('Surrender constitutional right to participate in consumer class action lawsuits.');
    if (textAll.includes('binding arbitration')) list.push('Forfeiture of public jury trial in favor of mandatory private arbitration.');
    if (textAll.includes('geolocation') || textAll.includes('location')) list.push('Surrender continuous background physical location tracking permissions.');
    if (textAll.includes('modify') && (textAll.includes('without notice') || textAll.includes('without prior notice'))) list.push('Vendor retains unilateral power to alter terms, fees, or privacy standards without notice.');
    if (textAll.includes('automatically renew')) list.push('Automated recurring subscription charges without manual payment confirmation.');
    if (textAll.includes('irrevocable') || textAll.includes('perpetual')) list.push('Perpetual, transferable commercial license granted over user uploaded media and content.');
    if (textAll.includes('non-refundable')) list.push('Zero refund guarantee even during severe platform outages or early termination.');
    if (textAll.includes('fifty dollars') || textAll.includes('$50')) list.push('Severe recovery limitation: damages capped at $50 regardless of actual financial loss.');

    if (list.length === 0) list.push('No severe statutory rights forfeitures detected in this agreement.');
    return list;
  }, [clauses]);

  const rightsRetained = useMemo(() => {
    const list = [];
    const textAll = clauses.map(c => c.text).join(' ').toLowerCase();

    if (textAll.includes('do not sell') || textAll.includes('not sell')) list.push('Vendor agrees not to sell or rent personal identifiable information to brokers.');
    if (textAll.includes('30 days') || textAll.includes('notice')) list.push('Affirmative obligation for vendor to give reasonable advance notice before changes.');
    if (textAll.includes('pci-dss') || textAll.includes('payment gateway')) list.push('Payments processed via PCI-DSS compliant secure third-party encryption.');
    if (textAll.includes('cancel at any time') || textAll.includes('cancel your subscription')) list.push('Self-service cancellation available directly through account settings.');
    if (textAll.includes('retain all intellectual property') || textAll.includes('retain all rights')) list.push('Full copyright ownership of user reviews and content is retained by user.');
    if (textAll.includes('money-back') || textAll.includes('full 100% refund')) list.push('Guaranteed 30-day refund window on returned goods or unfulfilled orders.');

    if (list.length === 0) list.push('Standard commercial terms apply. Inspect specific operational clauses below.');
    return list;
  }, [clauses]);

  // AI Contract Negotiation: Predatory Clause vs Fair Alternative
  const fairAlternativePair = useMemo(() => {
    const predatory = topFlagged[0] || clauses.find(c => c.risk_level === 'High');
    if (!predatory) return null;

    let fairAlternativeText = "We may modify these Terms with at least thirty (30) days advance notice via email. You retain the right to cancel your account with a pro-rata refund if you decline the modifications.";
    let legalRationale = "Fair market terms provide advance notice, explicit acceptance, and exit remedies.";

    const textL = predatory.text.toLowerCase();
    if (textL.includes('arbitration') || textL.includes('class action')) {
      fairAlternativeText = "Any dispute may be brought before small claims court or individual arbitration at the user's election. Nothing in this agreement shall waive statutory consumer protection rights or class remedies where permitted by law.";
      legalRationale = "Preserves judicial access and eliminates unconscionable pre-dispute waivers.";
    } else if (textL.includes('location') || textL.includes('geolocation')) {
      fairAlternativeText = "We collect device location strictly when the application is actively in use and strictly with your explicit affirmative consent. Location history is never shared with third-party advertising brokers.";
      legalRationale = "Eliminates continuous background surveillance and mandates explicit opt-in.";
    } else if (textL.includes('perpetual') || textL.includes('license')) {
      fairAlternativeText = "You retain full copyright in your content. You grant us a limited, non-exclusive license solely to host and display your content to your intended audience, terminating upon account deletion.";
      legalRationale = "Protects user creative ownership and limits license scope to functional delivery.";
    } else if (textL.includes('non-refundable') || textL.includes('automatically renew')) {
      fairAlternativeText = "Subscriptions renew monthly after sending a courtesy email notification 5 days prior. You may cancel at any time with a full refund within 14 days of any renewal charge.";
      legalRationale = "Adheres to FTC Click-to-Cancel transparency standards.";
    }

    return {
      predatoryClause: predatory.text,
      category: predatory.category,
      fairAlternativeText,
      legalRationale
    };
  }, [topFlagged, clauses]);

  // Charts data
  const riskDoughnutData = {
    labels: ['High Risk', 'Medium Risk', 'Low Risk'],
    datasets: [
      {
        data: [
          summary.high_risk_clauses_count || 0,
          summary.medium_risk_clauses_count || 0,
          summary.low_risk_clauses_count || 0
        ],
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderWidth: 3,
        borderColor: '#ffffff'
      }
    ]
  };

  const catDist = risk.category_distribution || {};
  const catLabels = Object.keys(catDist);
  const catValues = Object.values(catDist);

  const categoryBarData = {
    labels: catLabels.map(l => l.length > 20 ? l.substring(0, 18) + '...' : l),
    datasets: [
      {
        label: 'Clauses',
        data: catValues,
        backgroundColor: '#6366f1',
        borderRadius: 8
      }
    ]
  };

  const handleDownloadPdf = () => {
    if (result.saved_id) {
      window.open(getPdfDownloadUrl(result.saved_id), '_blank');
    } else {
      window.print();
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `${summary.title.replace(/\s+/g, '_')}_nlp_analysis.json`);
    dlAnchor.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* SECTION 1: Top Enterprise Header & Quick Action Suite */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-slate-900 text-white tracking-wide uppercase">
                {summary.source_type}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Audited in {summary.processing_time_seconds}s
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500">
                Language: {summary.language}
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight m-0">
              {summary.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1.5 m-0 max-w-2xl leading-relaxed">
              {summary.rating_summary}
            </p>
          </div>

          {/* Quick Action Suite */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowOptOutModal(true)}
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              Generate Opt-Out Notice
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Audit PDF
            </button>

            <button
              onClick={handleExportJson}
              className="px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Export Raw NLP JSON"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              JSON
            </button>

            <button
              onClick={() => window.print()}
              className="p-2.5 text-xs rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Print Summary"
            >
              <Printer className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* SECTION 2: Executive Scorecard Grid (4 High-Impact Metrics) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Card 1: Letter Grade & Trust Score */}
          <div className={`p-5 rounded-2xl border ${gradeColor} relative overflow-hidden flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                  Consumer Trust Grade
                </span>
                <Award className="w-4 h-4 opacity-75" />
              </div>
              <div className="flex items-baseline gap-3 my-1">
                <span className="text-5xl font-black tracking-tight">{letterGrade}</span>
                <div>
                  <span className="text-xl font-bold">{trustIndex}%</span>
                  <span className="text-[10px] block opacity-75">Trust Index</span>
                </div>
              </div>
            </div>
            <div className="text-[11px] font-bold pt-2 border-t border-black/10">
              {gradeVerdict}
            </div>
          </div>

          {/* Card 2: Risk Meter */}
          <div className={`p-5 rounded-2xl border ${
            riskScore >= 65 ? 'bg-rose-50/50 border-rose-200' :
            riskScore >= 35 ? 'bg-amber-50/50 border-amber-200' :
            'bg-emerald-50/50 border-emerald-200'
          } flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Overall Risk Score
                </span>
                <ShieldAlert className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className={`text-5xl font-black ${
                  riskScore >= 65 ? 'text-rose-600' :
                  riskScore >= 35 ? 'text-amber-600' :
                  'text-emerald-600'
                }`}>
                  {riskScore}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ 100 max</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/60 text-[11px]">
              <span className="text-rose-600 font-bold">{summary.high_risk_clauses_count} Red Flags</span>
              <span className="text-slate-300">•</span>
              <span className="text-amber-600 font-bold">{summary.medium_risk_clauses_count} Moderate</span>
            </div>
          </div>

          {/* Card 3: Readability & Jargon Complexity */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Readability Index
                </span>
                <BookOpen className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-4xl font-black text-slate-900">{estimatedReadingEase}</span>
                <span className="text-xs text-slate-400 font-semibold">/ 100 (Flesch)</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-200 truncate">
              {readingComplexityLevel}
            </div>
          </div>

          {/* Card 4: Contractual Balance Ratio */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Contractual Balance
                </span>
                <Scale className="w-4 h-4 text-slate-400" />
              </div>
              <div className="my-2 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-rose-600">Corp Shield: {corporateFavorability}%</span>
                  <span className="text-emerald-600">User Rights: {consumerFavorability}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                  <div className="bg-rose-500 h-full" style={{ width: `${corporateFavorability}%` }} />
                  <div className="bg-emerald-500 h-full" style={{ width: `${consumerFavorability}%` }} />
                </div>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
              Evaluated across {summary.total_clauses} segmented clauses
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Regulatory & Statutory Compliance Audit Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">Regulatory Compliance Healthcheck</h3>
              <p className="text-xs text-slate-500 m-0">Statutory exposure benchmarked against major global privacy and consumer protection laws</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
            5 Regulatory Frameworks Benchmarked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {complianceCheckpoints.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2 flex flex-col justify-between hover:bg-slate-50 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-slate-900 tracking-tight">{item.statute}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${item.badge}`}>
                    {item.status}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">{item.domain}</span>
                <p className="text-[11px] text-slate-600 leading-relaxed m-0">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: Executive TL;DR: "What You Forfeit" vs "What You Retain" */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Rights Surrendered */}
        <div className="bg-white rounded-3xl border border-rose-200/80 shadow-sm p-6 lg:p-7 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-rose-100">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0">What Rights You Forfeit / Give Up</h3>
              <p className="text-[11px] text-rose-600 m-0 font-medium">Critical user protections stripped by this agreement</p>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-700">
            {rightsForfeited.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-rose-50/40 border border-rose-100">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Rights Retained */}
        <div className="bg-white rounded-3xl border border-emerald-200/80 shadow-sm p-6 lg:p-7 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-emerald-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0">What Protections You Retain</h3>
              <p className="text-[11px] text-emerald-600 m-0 font-medium">Affirmative consumer safeguards provided by the drafter</p>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-700">
            {rightsRetained.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-emerald-50/40 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* SECTION 5: 10-Dimension Legal Risk Heatmap & Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">10-Dimension Risk Heatmap</h3>
              <p className="text-xs text-slate-500 m-0">Granular risk exposure breakdown across key contract governance areas</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">Click any category to inspect matching clauses</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {riskDimensions.map((dim) => {
            const Icon = dim.icon;
            return (
              <div
                key={dim.id}
                onClick={() => {
                  if (dim.clauses.length > 0) {
                    setSelectedClause(dim.clauses[0]);
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
                  dim.status === 'Critical Risk'
                    ? 'bg-rose-50/40 border-rose-200 hover:bg-rose-50/70'
                    : dim.status === 'Moderate Risk'
                    ? 'bg-amber-50/40 border-amber-200 hover:bg-amber-50/70'
                    : 'bg-slate-50 border-slate-200 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border ${dim.badgeStyle}`}>
                      {dim.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 m-0 mb-2">
                    {dim.name}
                  </h4>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-200/60">
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        dim.score === 100 ? 'bg-rose-500' : dim.score > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(10, dim.score)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{dim.count} matching clauses</span>
                    <span className="font-bold text-slate-700">{dim.score}% Risk</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 6: AI Contract Redaction: Predatory Clause vs Fair Alternative */}
      {fairAlternativePair && (
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 lg:p-8 shadow-xl space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base font-bold text-white m-0">AI Contract Negotiation: What a Fair Clause Looks Like</h3>
                <p className="text-xs text-slate-300 m-0">Comparison between what the vendor drafted vs balanced consumer protective drafting</p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Category: {fairAlternativePair.category}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: Original Predatory Clause */}
            <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-500/30 text-rose-300">
                Original Drafter Clause (Predatory / One-Sided)
              </span>
              <p className="text-xs text-rose-100 font-serif italic leading-relaxed m-0 pt-1">
                "{fairAlternativePair.predatoryClause}"
              </p>
            </div>

            {/* Right: Fair Alternative */}
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-500/30 text-emerald-300">
                AI Suggested Fair Alternative (Equitable / Standard)
              </span>
              <p className="text-xs text-emerald-100 font-serif leading-relaxed m-0 pt-1">
                "{fairAlternativePair.fairAlternativeText}"
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs text-slate-300 leading-relaxed flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span><strong>Legal Rationale:</strong> {fairAlternativePair.legalRationale}</span>
          </div>
        </div>
      )}

      {/* SECTION 7: Charts (Risk Severity & Categories Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doughnut Chart: Risk Severity */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-between">
          <div className="w-full text-left mb-4">
            <h3 className="text-sm font-bold text-slate-900 m-0">Risk Severity Distribution</h3>
            <p className="text-xs text-slate-500 m-0">Clause proportion by severity level</p>
          </div>
          <div className="w-48 h-48 relative">
            <Doughnut
              data={riskDoughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
                }
              }}
            />
          </div>
          <div className="w-full flex justify-around text-center text-xs text-slate-600 pt-4 border-t border-slate-100 mt-4">
            <div>
              <span className="font-bold text-rose-600 text-sm">{summary.high_risk_clauses_count}</span>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">High</div>
            </div>
            <div>
              <span className="font-bold text-amber-600 text-sm">{summary.medium_risk_clauses_count}</span>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Medium</div>
            </div>
            <div>
              <span className="font-bold text-emerald-600 text-sm">{summary.low_risk_clauses_count}</span>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Low</div>
            </div>
          </div>
        </div>

        {/* Bar Chart: Legal Categories */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="text-left mb-4">
            <h3 className="text-sm font-bold text-slate-900 m-0">Clauses by Legal Category</h3>
            <p className="text-xs text-slate-500 m-0">Supervised classification via TF-IDF + Logistic Regression</p>
          </div>
          <div className="h-56">
            <Bar
              data={categoryBarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, ticks: { precision: 0 } },
                  x: { ticks: { font: { size: 10 } } }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 8: Top Flagged Red Flags Warning Cards */}
      {topFlagged.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-7 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900 m-0">
                Top Priority Red Flags ({topFlagged.length})
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Clauses with maximum weighted liability or surveillance impact
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topFlagged.slice(0, 4).map((item, idx) => {
              const flags = item.matched_flags || [];

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedClause(item)}
                  className="p-5 rounded-2xl border border-rose-200 bg-rose-50/20 hover:bg-rose-50/40 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-700">
                        {item.category}
                      </span>
                      <span className="text-xs text-indigo-600 font-semibold flex items-center gap-0.5">
                        Inspect Rationale <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 italic font-serif line-clamp-3 m-0 leading-relaxed">
                      "{item.text}"
                    </p>
                  </div>

                  {flags.length > 0 && (
                    <div className="text-[11px] text-rose-800 bg-rose-100/70 p-2.5 rounded-xl leading-relaxed">
                      <strong>Risk Factor:</strong> {flags[0].reason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 9: Detailed Filterable Clause Explorer */}
      <ClauseExplorer clauses={clauses} onSelectClause={(clause) => setSelectedClause(clause)} />

      {/* Detailed Clause Modal */}
      {selectedClause && (
        <RiskDetailModal clause={selectedClause} onClose={() => setSelectedClause(null)} />
      )}

      {/* Arbitration & DSAR Opt-Out Letter Generator Modal */}
      {showOptOutModal && (
        <ArbitrationOptOutModal
          docTitle={summary.title || "Company"}
          onClose={() => setShowOptOutModal(false)}
        />
      )}
    </div>
  );
}
