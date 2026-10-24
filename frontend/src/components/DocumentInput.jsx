import React, { useState } from 'react';
import { FileText, Globe, Upload, Sparkles, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { fetchSampleContent } from '../services/api';

export default function DocumentInput({ onAnalyze, loading }) {
  const [activeTab, setActiveTab] = useState('text'); // 'text', 'upload', 'url'
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const [sampleLoading, setSampleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoadSample = async (sampleId) => {
    try {
      setSampleLoading(true);
      setErrorMsg('');
      const data = await fetchSampleContent(sampleId);
      setText(data.content);
      setDocTitle(sampleId === 'streaming' ? 'OmniStream Entertainment Terms' : 'Nordic Retail Terms of Sale');
      setActiveTab('text');
    } catch (err) {
      setErrorMsg('Failed to load sample agreement: ' + err.message);
    } finally {
      setSampleLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setDocTitle(selected.name.replace(/\.[^/.]+$/, ''));
      setErrorMsg('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (activeTab === 'text') {
      if (!text.trim() || text.trim().split(/\s+/).length < 5) {
        setErrorMsg('Please paste at least one clause or paragraph of terms and conditions.');
        return;
      }
      onAnalyze({ text: text.trim(), title: docTitle || 'Pasted Agreement' });
    } else if (activeTab === 'url') {
      if (!url.trim()) {
        setErrorMsg('Please enter a valid website URL.');
        return;
      }
      onAnalyze({ url: url.trim(), title: docTitle || url.trim() });
    } else if (activeTab === 'upload') {
      if (!file) {
        setErrorMsg('Please select a PDF or TXT document to upload.');
        return;
      }
      onAnalyze({ file, title: docTitle || file.name });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 m-0">Input Agreement for NLP Analysis</h2>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Select an ingestion channel to extract clauses, detect predatory terms, and run all 10 NLP assignments.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Quick Samples:</span>
          <button
            type="button"
            disabled={sampleLoading || loading}
            onClick={() => handleLoadSample('streaming')}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Streaming (High Risk)
          </button>
          <button
            type="button"
            disabled={sampleLoading || loading}
            onClick={() => handleLoadSample('ecommerce')}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            E-Commerce (Fair)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 pt-4 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'text'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Paste Legal Text
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload PDF / TXT
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'url'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          Scrape Public Website URL
        </button>
      </div>

      {errorMsg && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Document Title (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Agreement Title / Provider Name <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            placeholder="e.g. Acme Cloud Services Terms of Service (2026)"
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800"
          />
        </div>

        {/* Tab 1: Text Area */}
        {activeTab === 'text' && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Terms & Conditions / Privacy Policy Text
              </label>
              <span className="text-[11px] text-slate-400">
                {text ? `${text.trim().split(/\s+/).length} words` : '0 words'}
              </span>
            </div>
            <textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste terms of service, privacy policy clauses, liability disclaimers, or full agreements here..."
              className="w-full p-3.5 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800 placeholder:font-sans"
            />
          </div>
        )}

        {/* Tab 2: File Upload */}
        {activeTab === 'upload' && (
          <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/60 hover:bg-slate-50 text-center transition-colors">
            <input
              type="file"
              id="tos-file-input"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="tos-file-input" className="cursor-pointer block">
              <Upload className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
              <span className="text-xs font-semibold text-slate-800 block">
                {file ? file.name : 'Click to select a PDF or TXT file'}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports PDF documents via PyMuPDF and UTF-8 plain text files'}
              </span>
            </label>
          </div>
        )}

        {/* Tab 3: URL Scraping */}
        {activeTab === 'url' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Public Website URL for Terms or Privacy Policy
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/terms or https://company.org/privacy"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Assignment 1 ethical scraper verifies <code className="bg-slate-100 px-1 py-0.5 rounded">robots.txt</code>, strips boilerplate HTML navigation/footers, and respects rate limits.
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {text && activeTab === 'text' && (
            <button
              type="button"
              onClick={() => { setText(''); setDocTitle(''); }}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Clear Text
            </button>
          )}

          <button
            type="submit"
            disabled={loading || sampleLoading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Complete NLP Pipeline...</span>
              </>
            ) : (
              <>
                <span>Analyze Agreement</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
