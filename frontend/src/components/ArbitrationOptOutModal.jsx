import React, { useState } from 'react';
import { X, Copy, Check, FileText, Mail, ShieldAlert, Sparkles, Download } from 'lucide-react';

export default function ArbitrationOptOutModal({ docTitle = "Company", onClose }) {
  const [activeTemplate, setActiveTemplate] = useState('arbitration'); // 'arbitration' | 'dsar'
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState('Jane Doe');
  const [userEmail, setUserEmail] = useState('jane.doe@example.com');
  const [userAddress, setUserAddress] = useState('123 Main Street, New York, NY 10001');

  const todayDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const arbitrationLetterText = `DATE: ${todayDate}

VIA CERTIFIED MAIL / EMAIL
TO: Legal Department / Arbitration Opt-Out
RE: Formal Notice of Opt-Out of Mandatory Binding Arbitration and Class Action Waiver
Account / User Name: ${userName}
Associated Email: ${userEmail}
Address: ${userAddress}

Dear Legal Department,

I am writing to formally provide written notice that I hereby exercise my legal right to OPT OUT of the mandatory binding arbitration agreement, class action waiver, and jury trial waiver contained within the Terms of Service and End User Agreement of ${docTitle}.

In accordance with the opt-out provisions set forth in the applicable agreement (or governing state and federal consumer contract laws), this notice is being submitted within the required thirty (30) day opt-out window from the date of account creation or agreement modification.

Please ensure your records reflect that all disputes between myself and ${docTitle} shall remain subject to adjudication in a court of competent jurisdiction and are not subject to mandatory arbitration or individual claim consolidation restrictions.

Please provide written confirmation of receipt and processing of this opt-out notice to my email address at ${userEmail}.

Sincerely,

${userName}
${userAddress}
${userEmail}`;

  const dsarLetterText = `DATE: ${todayDate}

VIA EMAIL
TO: Data Protection Officer / Privacy Team (${docTitle})
RE: Data Subject Access Request (DSAR) – Request for Deletion and Opt-Out of Sale/Sharing
User / Data Subject: ${userName}
Email: ${userEmail}

Dear Data Protection Officer,

Pursuant to my statutory rights under applicable privacy legislation (including GDPR Art. 17 / CCPA & CPRA Cal. Civ. Code § 1798.105 & § 1798.120):

1. OPT-OUT OF SALE / SHARING: I hereby exercise my right to direct ${docTitle} to immediately cease selling, renting, licensing, or sharing my personal information, browsing history, device identifiers, and location records with any third-party data brokers or advertising partners.
2. RIGHT TO ERASURE: Upon cessation of active service, I request the complete and irreversible deletion of all my personal data, telemetry, and biometric logs from your primary production databases and backup repositories.

Please confirm receipt and completion of this request within the statutory timeframe (30 days under GDPR / 45 days under CCPA).

Sincerely,

${userName}
${userEmail}`;

  const currentText = activeTemplate === 'arbitration' ? arbitrationLetterText : dsarLetterText;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([currentText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTemplate === 'arbitration' ? 'Arbitration_Opt_Out_Notice' : 'DSAR_Privacy_Request'}_${docTitle.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 lg:p-7 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 m-0">Legal Opt-Out & Rights Generator</h3>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Generate formally drafted legal notices to protect your constitutional and statutory rights.
            </p>
          </div>
        </div>

        {/* Template Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl mb-4">
          <button
            onClick={() => setActiveTemplate('arbitration')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTemplate === 'arbitration'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            30-Day Arbitration Opt-Out Notice
          </button>
          <button
            onClick={() => setActiveTemplate('dsar')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTemplate === 'dsar'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            CCPA / GDPR Data Erasure & Opt-Out
          </button>
        </div>

        {/* Customization Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Your Full Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Associated Email</label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Postal Address</label>
            <input
              type="text"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Letter Preview */}
        <div className="relative mb-5">
          <div className="max-h-72 overflow-y-auto p-4 bg-slate-950 text-slate-100 rounded-2xl font-mono text-xs leading-relaxed border border-slate-800 whitespace-pre-wrap select-all">
            {currentText}
          </div>
        </div>

        {/* Statutory Instruction */}
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 mb-5 leading-relaxed">
          <strong>Important Tip:</strong> Most tech platforms (Amazon, Apple, Uber, streaming services) include a clause stating you must opt out of arbitration within <strong>30 days of account creation</strong> by mailing or emailing their legal department. Once received, you retain the full right to take them to court or join class actions!
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={handleDownloadTxt}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download .TXT
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Formal Notice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
