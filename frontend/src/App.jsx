import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainHeader from './components/MainHeader';
import ThreatMatrix from './components/ThreatMatrix';
import ClauseRiskReport from './components/ClauseRiskReport';
import KeyDetailsTab from './components/KeyDetailsTab';
import NlpInsightsTab from './components/NlpInsightsTab';
import HistoryViewer from './components/HistoryViewer';
import { checkBackendHealth, analyzeDocument, fetchSampleContent, fetchHistory } from './services/api';
import {
  Zap,
  FileText,
  Search,
  Cpu,
  History,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Globe,
  Upload,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [inputMode, setInputMode] = useState('text'); // 'text', 'url', 'pdf'
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [activeTab, setActiveTab] = useState('tldr'); // 'tldr', 'clauses', 'key_details', 'nlp_insights', 'history'
  
  const [backendOnline, setBackendOnline] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [historyCount, setHistoryCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Default sample placeholder matching user's photo 1
  const defaultPlaceholder = `• [Signature consumer(s)] (only if this form is presented on paper)\n\n* Cross out what is not applicable or fill out what applies.`;

  // On mount check health & load sample automatically for instant gratification
  useEffect(() => {
    const init = async () => {
      const health = await checkBackendHealth();
      setBackendOnline(health.status === 'healthy');

      // Fetch history count
      try {
        const hist = await fetchHistory();
        setHistoryCount(hist.count || 0);
      } catch (e) {}

      // Auto-load high-risk streaming sample so dashboard is alive on first glance
      try {
        const sample = await fetchSampleContent('streaming');
        setText(sample.content);
        // Automatically run initial analysis
        const initialRes = await analyzeDocument({
          text: sample.content,
          title: 'OmniStream Entertainment Terms (Real-World Edition)'
        });
        setAnalysisResult(initialRes);
      } catch (err) {
        console.error('Initial load notice:', err);
      }
    };
    init();

    // Automatic polling every 5s so when Python backend is started, UI updates immediately
    const pollTimer = setInterval(async () => {
      const health = await checkBackendHealth();
      setBackendOnline(health.status === 'healthy');
    }, 5000);

    return () => clearInterval(pollTimer);
  }, []);

  const handleLoadSample = async (sampleId) => {
    try {
      setSampleLoading(true);
      setErrorMsg('');
      const data = await fetchSampleContent(sampleId);
      setText(data.content);
      setInputMode('text');

      // Auto-analyze
      setAnalyzing(true);
      const res = await analyzeDocument({
        text: data.content,
        title: sampleId === 'streaming' ? 'OmniStream Entertainment Terms' : 'Nordic Retail Terms of Sale'
      });
      setAnalysisResult(res);
      setActiveTab('tldr');
    } catch (err) {
      setErrorMsg('Failed to load sample: ' + err.message);
    } finally {
      setSampleLoading(false);
      setAnalyzing(false);
    }
  };

  const handleRunAnalysis = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    try {
      setAnalyzing(true);
      let payload = {};

      if (inputMode === 'text') {
        if (!text.trim() || text.trim().split(/\s+/).length < 5) {
          throw new Error('Please enter or paste at least one clause of terms & conditions.');
        }
        payload = { text: text.trim(), title: 'Custom Agreement Analysis' };
      } else if (inputMode === 'url') {
        if (!url.trim()) throw new Error('Please enter a valid website URL.');
        payload = { url: url.trim(), title: url.trim() };
      } else if (inputMode === 'pdf') {
        if (!file) throw new Error('Please select a PDF or TXT file to upload.');
        payload = { file, title: file.name };
      }

      const res = await analyzeDocument(payload);
      setAnalysisResult(res);
      setActiveTab('tldr');

      // Update history count
      const hist = await fetchHistory();
      setHistoryCount(hist.count || 0);
    } catch (err) {
      setErrorMsg(err.message || 'Analysis failed. Please verify input.');
    } finally {
      setAnalyzing(false);
    }
  };

  const tabs = [
    { id: 'tldr', label: '⚡ TL;DR Executive Gotchas' },
    { id: 'clauses', label: '📄 Clause Risk Report' },
    { id: 'key_details', label: '🔍 Key Details & POS' },
    { id: 'nlp_insights', label: '📊 NLP Insights' },
    { id: 'history', label: '📜 History & Reports' }
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Sidebar (Matches Photo 1, 2, 3) */}
        <Sidebar
          inputMode={inputMode}
          setInputMode={setInputMode}
          onLoadSample={handleLoadSample}
          sampleLoading={sampleLoading}
          analyzing={analyzing}
          historyCount={historyCount}
          onOpenHistory={() => setActiveTab('history')}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <MainHeader backendOnline={backendOnline} />

          <main className="p-6 lg:p-8 space-y-8 max-w-6xl w-full mx-auto">
            {/* Input Section (Text / URL / PDF based on sidebar selection) */}
            <section className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Terms & Conditions Text (up to 30,000 characters):
              </label>

              {inputMode === 'text' && (
                <div className="relative">
                  <textarea
                    rows={6}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={defaultPlaceholder}
                    className="w-full p-4 rounded-2xl bg-[#101726] border border-slate-800 text-slate-200 text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all leading-relaxed"
                  />
                  <div className="absolute right-3 bottom-3 text-[10px] text-slate-500 font-mono">
                    {text ? `${text.length.toLocaleString()} chars` : '0 chars'}
                  </div>
                </div>
              )}

              {inputMode === 'url' && (
                <div className="p-5 rounded-2xl bg-[#101726] border border-slate-800 space-y-3">
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/terms or https://company.org/privacy"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 m-0">
                    Ethical web scraper verifies <code className="text-sky-300">robots.txt</code>, strips boilerplate navigation/footers, and respects rate limits.
                  </p>
                </div>
              )}

              {inputMode === 'pdf' && (
                <div className="p-8 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl bg-[#101726] text-center transition-colors">
                  <input
                    type="file"
                    id="doc-upload"
                    accept=".pdf,.txt"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="doc-upload" className="cursor-pointer block space-y-2">
                    <Upload className="w-8 h-8 text-sky-400 mx-auto" />
                    <span className="text-xs font-semibold text-slate-200 block">
                      {file ? file.name : 'Click to upload a PDF or TXT agreement'}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Parsed securely in-memory using PyMuPDF (fitz)
                    </span>
                  </label>
                </div>
              )}

              {/* Action Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 italic">
                  Tip: Use the sidebar quick samples to load pre-configured high-risk or fair agreements.
                </span>

                <button
                  type="button"
                  disabled={analyzing || sampleLoading}
                  onClick={handleRunAnalysis}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-sky-200" />
                      <span>Running Complete NLP Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Terms & Conditions</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </section>

            {/* TAB BAR (Photo 1, 2, 3: Orange active underline) */}
            <div className="border-b border-slate-800/80 pt-2">
              <nav className="flex items-center gap-6 overflow-x-auto min-w-max pb-px">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`text-xs font-bold pb-3 transition-all relative cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* TAB CONTENTS */}
            {analysisResult ? (
              <div className="transition-all">
                {/* Tab 1: ⚡ TL;DR Executive Gotchas (Photo 3 & Photo 2) */}
                {activeTab === 'tldr' && (
                  <ThreatMatrix result={analysisResult} />
                )}

                {/* Tab 2: 📄 Clause Risk Report */}
                {activeTab === 'clauses' && (
                  <ClauseRiskReport result={analysisResult} />
                )}

                {/* Tab 3: 🔍 Key Details & POS */}
                {activeTab === 'key_details' && (
                  <KeyDetailsTab result={analysisResult} />
                )}

                {/* Tab 4: 📊 NLP Insights (The 10 Assignments) */}
                {activeTab === 'nlp_insights' && (
                  <NlpInsightsTab documentText={text} />
                )}

                {/* Tab 5: 📜 History & Saved Analyses */}
                {activeTab === 'history' && (
                  <HistoryViewer
                    onSelectReport={(rep) => {
                      setAnalysisResult(rep);
                      setActiveTab('tldr');
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="bg-[#111827] rounded-3xl border border-slate-800 p-12 text-center text-slate-500 text-xs">
                No contract analyzed yet. Paste text or click "Load Sample T&C" in the sidebar to run the analysis.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
