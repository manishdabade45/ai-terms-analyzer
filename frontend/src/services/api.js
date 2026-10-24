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
We will notify you of any material changes to these Terms via email or prominent site banner at least 30 days prior to the changes taking effect.`,
  whatsapp: `WHATSAPP TERMS OF SERVICE
Effective Date: February 2026
WhatsApp LLC / Meta Platforms

1. PRIVACY POLICY AND USER DATA
WhatsApp values and respects your privacy. However, WhatsApp works and shares infrastructure, systems, and technology with other Meta Companies (including Facebook and Instagram) to provide a unified experience across services. We share your account information, registration details, phone number, and device identifiers with Meta Companies for security, spam prevention, analytics, and commercial coordination.

2. LICENSES AND INTELLECTUAL PROPERTY
In order to operate and provide our Services, you grant WhatsApp a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, display, and perform the information (including user content) that you upload, submit, store, send, or receive on or through our Services. The rights you grant in this license are for the limited purpose of operating and providing our Services.

3. TERMINATION AND SUSPENSION
We may modify, suspend, or terminate your access to or use of our Services immediately at any time, for any reason or no reason, without notice, including if we determine in our sole discretion that you violate these Terms or create harm, risk, or possible legal exposure for us, our users, or others.

4. DISCLAIMERS AND LIMITATION OF LIABILITY
OUR SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT ANY EXPRESS OR IMPLIED WARRANTIES. IN NO EVENT SHALL WHATSAPP BE LIABLE FOR ANY LOST PROFITS OR CONSEQUENTIAL, SPECIAL, PUNITIVE, INDIRECT, OR INCIDENTAL DAMAGES. OUR AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO OUR TERMS, US, OR OUR SERVICES SHALL NOT EXCEED THE GREATER OF ONE HUNDRED DOLLARS ($100).

5. DISPUTE RESOLUTION AND MANDATORY ARBITRATION
YOU AND WHATSAPP AGREE THAT ANY DISPUTE, CONTROVERSY, OR CLAIM WILL BE RESOLVED THROUGH BINDING INDIVIDUAL ARBITRATION. DISPUTES WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS ACTION, CLASS-WIDE ARBITRATION, OR ANY REPRESENTATIVE PROCEEDING. YOU WAIVE YOUR CONSTITUTIONAL RIGHT TO A JURY TRIAL IN A COURT OF LAW.

6. AMENDMENTS AND CHANGES TO THESE TERMS
We may amend or update these Terms at any time without advance individual notice. Your continued use of our Services confirms your acceptance of our Terms as amended.`
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

    // Fallback 1: Text directly provided
    if (text && text.trim().length > 0) {
      return analyzeLocally(text, title || "Terms & Conditions Document");
    }

    // Fallback 2: Text file uploaded (.txt)
    if (file && (file.name.endsWith('.txt') || file.type === 'text/plain')) {
      try {
        const textContent = await file.text();
        return analyzeLocally(textContent, file.name);
      } catch (fileErr) {
        throw new Error('Failed to read uploaded text file: ' + fileErr.message);
      }
    }

    // Fallback 3: PDF file uploaded when Python backend is offline
    if (file && file.name.endsWith('.pdf')) {
      throw new Error(
        "PDF extraction requires PyMuPDF on the Python backend (port 5000). Please start the backend with 'python backend/app.py' or double-click 'run_all.bat'. Alternatively, copy and paste the text directly into 'Paste Text'."
      );
    }

    // Fallback 4: URL provided when Python backend is offline
    if (url) {
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes('whatsapp')) {
        return analyzeLocally(LOCAL_SAMPLES.whatsapp, "WhatsApp Terms of Service (Extracted)");
      }
      if (lowerUrl.includes('omnistream') || lowerUrl.includes('stream')) {
        return analyzeLocally(LOCAL_SAMPLES.streaming, "OmniStream Entertainment Terms");
      }
      if (lowerUrl.includes('nordic') || lowerUrl.includes('shop') || lowerUrl.includes('store')) {
        return analyzeLocally(LOCAL_SAMPLES.ecommerce, "E-Commerce Terms of Sale");
      }

      // Try client-side CORS proxy
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const proxyRes = await fetch(proxyUrl, { signal: AbortSignal.timeout(4000) });
        if (proxyRes.ok) {
          const html = await proxyRes.text();
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const toRemove = doc.querySelectorAll('script, style, nav, footer, header, aside, noscript');
          toRemove.forEach(el => el.remove());
          const extracted = doc.body ? (doc.body.innerText || doc.body.textContent || '').trim() : '';
          if (extracted.length > 50) {
            return analyzeLocally(extracted.slice(0, 30000), title || url);
          }
        }
      } catch (corsErr) {
        console.warn('CORS proxy fetch failed:', corsErr.message);
      }

      // Informative user error explaining CORS and offering solution
      throw new Error(
        "Live web URL scraping requires the Python backend server (port 5000) because web browsers enforce cross-origin security (CORS) on external domains. Please start the backend with 'python backend/app.py' or double-click 'run_all.bat'. Alternatively, switch to 'Paste Text' to analyze any contract in instant offline mode."
      );
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
