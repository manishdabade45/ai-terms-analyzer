import React, { useState } from 'react';
import { Globe, ShieldCheck, AlertCircle, ArrowRight, RefreshCw, FileText } from 'lucide-react';
import { runA1Scrape } from '../../services/api';

export default function A1ScrapingTab({ documentText }) {
  const [url, setUrl] = useState('https://example.com');
  const [enforceRobots, setEnforceRobots] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    try {
      setLoading(true);
      setError('');
      const data = await runA1Scrape(url.trim(), enforceRobots);
      if (!data.success) {
        setError(data.error || 'Scraping failed');
        setResult(data);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
            01
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 m-0">Assignment 1: Web Scraping & Ingestion</h3>
            <p className="text-xs text-slate-500 m-0">
              Ethical web scraping via requests & BeautifulSoup with robots.txt validation and PyMuPDF document support.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleScrape} className="mt-5 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL (e.g. https://example.com)"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              Fetch & Parse
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enforce-robots"
              checked={enforceRobots}
              onChange={(e) => setEnforceRobots(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="enforce-robots" className="text-xs text-slate-600 cursor-pointer">
              Enforce <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">robots.txt</code> compliance (disallow access if forbidden by domain policy)
            </label>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Card */}
      {result && result.success && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-emerald-600 uppercase">Extraction Succeeded</span>
              <h4 className="text-sm font-bold text-slate-900 m-0">{result.title}</h4>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Status: <strong className="text-slate-800">{result.status_code}</strong></span>
              <span>Words: <strong className="text-slate-800">{result.word_count}</strong></span>
            </div>
          </div>

          {result.robots_info && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <strong>Robots.txt:</strong> {result.robots_info.reason} ({result.robots_info.robots_url})
              </span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Clean Extracted Text Preview:</label>
            <div className="max-h-60 overflow-y-auto p-3.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
              {result.text}
            </div>
          </div>
        </div>
      )}

      {/* Educational Guidelines */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-2 text-xs text-slate-600">
        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider m-0">Assignment 1 Technical Principles</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Ethical Scraping:</strong> Inspects and adheres to <code className="bg-white px-1 py-0.5 rounded border border-slate-200">urllib.robotparser</code> rules before opening connections.</li>
          <li><strong>DOM Sanitization:</strong> Strips non-content boilerplate elements (<code className="bg-white px-1 rounded">nav</code>, <code className="bg-white px-1 rounded">footer</code>, <code className="bg-white px-1 rounded">script</code>, <code className="bg-white px-1 rounded">style</code>) to extract pure legal clauses.</li>
          <li><strong>Document Diversity:</strong> Supports HTTP URLs, native PDF parsing via PyMuPDF (<code className="bg-white px-1 rounded">fitz</code>), and plain text documents.</li>
        </ul>
      </div>
    </div>
  );
}
