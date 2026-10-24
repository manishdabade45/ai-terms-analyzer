/**
 * API service for AI Terms & Conditions Analyzer
 */

import { analyzeLocally } from './clientNlpEngine';

const BASE_URL = '/api';

const LOCAL_SAMPLES = {
  streaming: `TERMS OF SERVICE AND PRIVACY AGREEMENT
Effective Date: January 1, 2026
OmniStream Digital Entertainment LLC

1. SUBSCRIPTION, BILLING, AND AUTOMATIC RENEWAL
Your subscription will automatically renew at the end of each billing cycle at the standard rate unless you cancel at least 48 hours prior to renewal. All subscription fees and purchases made through the service are strictly non-refundable under any circumstances, including service outages. We may charge your payment method a non-refundable reactivation fee of up to $75.

2. PRIVACY AND DATA COLLECTION
We collect information you provide directly to us. We automatically collect precise geolocation data from your mobile device continuously, even when the application is closed or not in active use. We use tracking pixels, web beacons, and persistent browser fingerprinting to track your activity across third-party websites outside of our domain.

3. THIRD-PARTY DATA SHARING AND COMMERCIALIZATION
We reserve the right to share, sell, lease, or license your personal information, browsing history, and purchase records with advertising partners and data brokers. We retain your personal data indefinitely, even following deletion of your account.

4. USER GENERATED CONTENT AND INTELLECTUAL PROPERTY
By submitting or posting content to the platform, you grant us an irrevocable, perpetual, worldwide, royalty-free, transferable license to use, reproduce, modify, and distribute your content.

5. TERMINATION AND SUSPENSION
The company may suspend or terminate your account immediately at any time, for any reason or no reason, without notice and without liability to you.

6. LIMITATION OF LIABILITY
IN NO EVENT SHALL THE COMPANY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL DAMAGES. OUR TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE GREATER OF FIFTY DOLLARS ($50).

7. MANDATORY ARBITRATION AND CLASS ACTION WAIVER
YOU AND THE COMPANY AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED OR REPRESENTATIVE ACTION. Any controversy or claim shall be settled by binding arbitration in New York, NY.

8. MODIFICATIONS TO TERMS
We may modify these Terms at any time without notice, and your continued use constitutes binding acceptance.`,
  ecommerce: `TERMS OF SALE AND PRIVACY POLICY
Effective Date: March 15, 2026
Nordic Retail & Goods Co.

1. ORDERS AND PAYMENT PROCESSING
All payments are processed securely through certified PCI-DSS compliant third-party payment gateways, and we do not store full credit card numbers on our servers.

2. CANCELLATION AND REFUND POLICY
You may cancel your order at any time before shipment for a full 100% refund. We offer a 30-day money-back guarantee on all returned physical goods in original condition.

3. DATA PRIVACY AND PROTECTION
We collect information you provide directly to us, such as your name, email address, postal address, and phone number when you register for an account. We do not sell, rent, or trade your personal identifiable information to third parties for monetary consideration.

4. DATA RETENTION AND DELETION
Upon account deletion, we purge all personal identifiers from our primary production databases within thirty (30) days.

5. INTELLECTUAL PROPERTY
You retain all intellectual property rights in your user reviews and content, and you grant us only a limited license strictly necessary to host and display the content on our website.

6. CHANGES TO THESE TERMS
We will notify you of any material changes to these Terms via email or prominent site banner at least 30 days prior to the changes taking effect.`
};

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Backend unhealthy');
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

export async function fetchSamples() {
  try {
    const res = await fetch(`${BASE_URL}/samples`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Failed to load samples');
    return await res.json();
  } catch (err) {
    return {
      samples: [
        { id: "streaming", name: "OmniStream Entertainment (High Risk)" },
        { id: "ecommerce", name: "Nordic Retail Store (Fair / Low Risk)" }
      ]
    };
  }
}

export async function fetchSampleContent(sampleId) {
  try {
    const res = await fetch(`${BASE_URL}/samples/${sampleId}`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Failed to fetch sample text');
    return await res.json();
  } catch (err) {
    // Graceful fallback to embedded sample
    const content = LOCAL_SAMPLES[sampleId] || LOCAL_SAMPLES.streaming;
    return { sample_id: sampleId, content };
  }
}

export async function analyzeDocument({ text, url, file, title }) {
  try {
    let options = {};
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);
      options = {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(8000)
      };
    } else {
      options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, url, title }),
        signal: AbortSignal.timeout(8000)
      };
    }

    const res = await fetch(`${BASE_URL}/analyze`, options);
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Server analysis failed');
    }
    return await res.json();
  } catch (err) {
    console.warn('Backend API unreachable or timed out, executing client-side NLP analysis engine:', err.message);
    if (text) {
      return analyzeLocally(text, title || "Terms & Conditions Document");
    }
    throw new Error(err.message || "Failed to analyze document.");
  }
}

export async function fetchHistory() {
  try {
    const res = await fetch(`${BASE_URL}/history`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Failed to load history');
    return await res.json();
  } catch (err) {
    return { history: [], count: 0, offline: true };
  }
}

export async function fetchHistoryDetail(id) {
  try {
    const res = await fetch(`${BASE_URL}/history/${id}`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Failed to load analysis record');
    return await res.json();
  } catch (err) {
    throw new Error('Backend is currently offline. Start backend (python backend/app.py) to access SQLite history.');
  }
}

export async function deleteHistoryItem(id) {
  try {
    const res = await fetch(`${BASE_URL}/history/${id}`, { method: 'DELETE', signal: AbortSignal.timeout(3000) });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Backend offline' };
  }
}

export function getPdfDownloadUrl(analysisId) {
  return `${BASE_URL}/report/pdf/${analysisId}`;
}

export function getMdDownloadUrl(analysisId) {
  return `${BASE_URL}/report/md/${analysisId}`;
}

export async function downloadPdfFromPayload(payload) {
  const res = await fetch(`${BASE_URL}/report/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to generate PDF');
  return await res.blob();
}

// Assignment-specific APIs
export async function runA1Scrape(url, enforceRobots = true) {
  const res = await fetch(`${BASE_URL}/assignment/1/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, enforce_robots: enforceRobots })
  });
  return await res.json();
}

export async function runA2Stats(text) {
  const res = await fetch(`${BASE_URL}/assignment/2/stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return await res.json();
}

export async function runA3StemLemm(text, words = []) {
  const res = await fetch(`${BASE_URL}/assignment/3/stem-lemm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, words })
  });
  return await res.json();
}

export async function runA4PosClf(text, query) {
  const res = await fetch(`${BASE_URL}/assignment/4/pos-clf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, query })
  });
  return await res.json();
}

export async function runA4ClassifyClause(clause) {
  const res = await fetch(`${BASE_URL}/assignment/4/classify-clause`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clause })
  });
  return await res.json();
}

export async function runA5Ner(text) {
  const res = await fetch(`${BASE_URL}/assignment/5/ner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return await res.json();
}

export async function runA6Tfidf(text) {
  const res = await fetch(`${BASE_URL}/assignment/6/tfidf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return await res.json();
}

export async function runA7Ngrams(text) {
  const res = await fetch(`${BASE_URL}/assignment/7/ngrams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return await res.json();
}

export async function runA8LanguageModel(corpus, sequence) {
  const res = await fetch(`${BASE_URL}/assignment/8/language-model`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ corpus, sequence })
  });
  return await res.json();
}

export async function runA9Topics(text, nTopics = 4) {
  const res = await fetch(`${BASE_URL}/assignment/9/topic-model`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, n_topics: nTopics })
  });
  return await res.json();
}

export async function runA10Sentiment(text) {
  const res = await fetch(`${BASE_URL}/assignment/10/sentiment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return await res.json();
}
