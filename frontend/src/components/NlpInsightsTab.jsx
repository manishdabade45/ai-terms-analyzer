import React, { useState } from 'react';
import A1ScrapingTab from './assignments/A1ScrapingTab';
import A2StatsTab from './assignments/A2StatsTab';
import A3StemLemmTab from './assignments/A3StemLemmTab';
import A4ClassificationTab from './assignments/A4ClassificationTab';
import A5NerTab from './assignments/A5NerTab';
import A6TfidfTab from './assignments/A6TfidfTab';
import A7NgramsTab from './assignments/A7NgramsTab';
import A8LanguageModelTab from './assignments/A8LanguageModelTab';
import A9TopicModelTab from './assignments/A9TopicModelTab';
import A10SentimentTab from './assignments/A10SentimentTab';
import {
  Globe,
  BarChart2,
  Scissors,
  Tag,
  Fingerprint,
  Hash,
  Layers,
  Cpu,
  Compass,
  Heart
} from 'lucide-react';

const ASSIGNMENTS = [
  { id: 'a1', label: '1. Web Scraping', icon: Globe },
  { id: 'a2', label: '2. Language & Stats', icon: BarChart2 },
  { id: 'a3', label: '3. Stem vs Lemm', icon: Scissors },
  { id: 'a4', label: '4. POS & Classifier', icon: Tag },
  { id: 'a5', label: '5. Legal NER', icon: Fingerprint },
  { id: 'a6', label: '6. TF-IDF Weights', icon: Hash },
  { id: 'a7', label: '7. N-gram Models', icon: Layers },
  { id: 'a8', label: '8. Language Model (LM)', icon: Cpu },
  { id: 'a9', label: '9. Topic Model (LDA)', icon: Compass },
  { id: 'a10', label: '10. Sentiment vs Risk', icon: Heart }
];

export default function NlpInsightsTab({ documentText }) {
  const [activeModule, setActiveModule] = useState('a1');

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Sub-navigation pills for 10 assignments */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-2 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {ASSIGNMENTS.map((asgn) => {
            const Icon = asgn.icon;
            const isActive = activeModule === asgn.id;
            return (
              <button
                key={asgn.id}
                onClick={() => setActiveModule(asgn.id)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{asgn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render selected assignment sandbox */}
      <div className="transition-all">
        {activeModule === 'a1' && <A1ScrapingTab documentText={documentText} />}
        {activeModule === 'a2' && <A2StatsTab documentText={documentText} />}
        {activeModule === 'a3' && <A3StemLemmTab documentText={documentText} />}
        {activeModule === 'a4' && <A4ClassificationTab documentText={documentText} />}
        {activeModule === 'a5' && <A5NerTab documentText={documentText} />}
        {activeModule === 'a6' && <A6TfidfTab documentText={documentText} />}
        {activeModule === 'a7' && <A7NgramsTab documentText={documentText} />}
        {activeModule === 'a8' && <A8LanguageModelTab documentText={documentText} />}
        {activeModule === 'a9' && <A9TopicModelTab documentText={documentText} />}
        {activeModule === 'a10' && <A10SentimentTab documentText={documentText} />}
      </div>
    </div>
  );
}
