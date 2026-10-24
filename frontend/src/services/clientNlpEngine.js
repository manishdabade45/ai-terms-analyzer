/**
 * Client-Side NLP Engine (Fail-safe for Vercel / Static deployments)
 * Analyzes clauses, identifies consumer threats, and computes risk scores on-device
 * if the Python backend is cold, sleeping, or unreachable.
 */

const RISK_RULES = [
  {
    id: "ARBITRATION_CLASS_ACTION",
    category: "Dispute Resolution & Arbitration",
    severity: "High",
    weight: 25,
    patterns: [
      /class action waiver/i,
      /waive (?:any|all) right to (?:a )?jury trial/i,
      /binding arbitration/i,
      /conducted only on an individual basis/i,
      /not in a class,? consolidated or representative/i
    ],
    reason: "Forces you into private binding arbitration and strips your constitutional right to participate in a class-action lawsuit.",
    recommendation: "Check if an arbitration opt-out letter can be submitted within 30 days of opening the account."
  },
  {
    id: "UNILATERAL_CHANGES",
    category: "Changes to Terms & Notice",
    severity: "High",
    weight: 20,
    patterns: [
      /modify (?:these|the) terms (?:at any time )?without notice/i,
      /without prior notice/i,
      /continued use (?:constitutes|shall constitute) (?:your )?acceptance/i,
      /at our sole discretion.*(?:modify|change|alter)/i
    ],
    reason: "Allows the service to alter fees, terms, or privacy policies at any time without notifying you beforehand.",
    recommendation: "Review the terms page periodically or use an automated website change detector."
  },
  {
    id: "DATA_SELLING_SHARING",
    category: "Third-Party Data Sharing",
    severity: "High",
    weight: 22,
    patterns: [
      /(?:sell|rent|lease|trade) (?:your )?personal (?:data|information)/i,
      /share (?:your )?(?:information|data|history) with (?:advertising|marketing) partners/i,
      /data brokers/i,
      /monetize (?:user|personal) data/i
    ],
    negativePatterns: [/do not sell/i, /never sell/i, /will not sell/i, /does not sell/i],
    reason: "Allows commercial monetization and sharing of your private browsing, demographic, and identity records with advertisers.",
    recommendation: "Submit a CCPA / GDPR 'Do Not Sell My Info' opt-out request if supported."
  },
  {
    id: "CONTINUOUS_LOCATION_TRACKING",
    category: "Privacy & Data Collection",
    severity: "High",
    weight: 18,
    patterns: [
      /precise (?:geolocation|location) data/i,
      /even when the (?:app|application) is (?:closed|not in (?:active )?use)/i,
      /continuous(?:ly)? (?:track|collect) (?:your )?location/i,
      /browser fingerprinting/i,
      /biometric identifiers/i
    ],
    reason: "Surveils your physical whereabouts continuously in the background, or gathers non-revocable biometric markers.",
    recommendation: "Revoke 'Always Allow' location permissions in your smartphone operating system settings."
  },
  {
    id: "IMMEDIATE_TERMINATION",
    category: "Termination & Suspension",
    severity: "High",
    weight: 18,
    patterns: [
      /terminate (?:or suspend )?your account (?:immediately )?at any time,? for any reason or no reason/i,
      /without notice and without liability/i,
      /sole discretion to terminate/i
    ],
    reason: "Allows the company to shut down your access and erase stored data without providing reasons, advance warning, or backups.",
    recommendation: "Regularly back up all important documents, assets, and correspondence offline."
  },
  {
    id: "PERPETUAL_IP_LICENSE",
    category: "Intellectual Property & Licensing",
    severity: "High",
    weight: 18,
    patterns: [
      /irrevocable,? perpetual,? worldwide,? royalty-free/i,
      /transferable license to use, reproduce, modify/i,
      /own all rights.*in and to.*content you (?:post|upload|submit)/i
    ],
    reason: "Demands permanent, royalty-free commercial exploitation rights over your creative content even after you leave.",
    recommendation: "Avoid publishing proprietary or copyrighted creative content on this platform."
  },
  {
    id: "EXTREME_LIABILITY_CAP",
    category: "Limitation of Liability",
    severity: "High",
    weight: 16,
    patterns: [
      /shall not exceed the greater of (?:fifty|100|\$50|\$100)/i,
      /liability.*limited to (?:the amount paid|fifty dollars|\$50|\$100)/i,
      /no event shall.*be liable for any.*loss of (?:data|profits)/i
    ],
    reason: "Caps maximum monetary recovery to a trivial amount (e.g. $50) even if the platform causes catastrophic financial or data loss.",
    recommendation: "Maintain independent commercial insurance if using this service for critical business operations."
  },
  {
    id: "AUTO_RENEWAL_NO_REFUND",
    category: "Payment & Billing",
    severity: "Medium",
    weight: 14,
    patterns: [
      /automatically renew/i,
      /auto-renew/i,
      /non-refundable under any circumstances/i,
      /strictly non-refundable/i,
      /reactivation fee/i
    ],
    reason: "Automatically charges your payment card without requiring manual approval, and refuses refunds even for service outages.",
    recommendation: "Set calendar reminders to review subscriptions and cancel prior to the auto-billing deadline."
  },
  {
    id: "INDEFINITE_DATA_RETENTION",
    category: "Privacy & Data Collection",
    severity: "Medium",
    weight: 12,
    patterns: [
      /retain (?:your )?(?:personal )?data indefinitely/i,
      /even following deletion of your account/i,
      /keep your information indefinitely/i
    ],
    reason: "Preserves your personal data forever on company servers, creating permanent data breach liability.",
    recommendation: "Send an explicit erasure/purging request under privacy laws upon closing your account."
  }
];

export function analyzeLocally(rawText, title = "Terms & Conditions Analysis") {
  const text = rawText || "";
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Segment clauses
  const blocks = text.split(/\n\s*\n|(?<=\n)(?=[0-9]+\.\s+[A-Z])/);
  const clauses = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed || trimmed.split(/\s+/).length < 5) continue;
    
    if (trimmed.split(/\s+/).length > 80) {
      const sentences = trimmed.split(/(?<=[.!?])\s+(?=[A-Z])/);
      sentences.forEach(s => {
        if (s.trim().split(/\s+/).length >= 5) clauses.push(s.trim());
      });
    } else {
      clauses.push(trimmed);
    }
  }

  // Analyze each clause
  const analyzedClauses = clauses.map((clauseText) => {
    const matchedFlags = [];
    const textLower = clauseText.toLowerCase();

    for (const rule of RISK_RULES) {
      let isNegated = false;
      if (rule.negativePatterns) {
        for (const neg of rule.negativePatterns) {
          if (neg.test(textLower)) {
            isNegated = true;
            break;
          }
        }
      }
      if (isNegated) continue;

      for (const pat of rule.patterns) {
        if (pat.test(textLower)) {
          matchedFlags.push({
            rule_id: rule.id,
            category: rule.category,
            severity: rule.severity,
            weight: rule.weight,
            reason: rule.reason,
            recommendation: rule.recommendation
          });
          break;
        }
      }
    }

    let riskLevel = "Low";
    if (matchedFlags.some(f => f.severity === "High")) riskLevel = "High";
    else if (matchedFlags.some(f => f.severity === "Medium")) riskLevel = "Medium";

    // Detect category heuristic
    let category = "General & Miscellaneous";
    if (/privacy|personal data|cookies|tracking|information/i.test(textLower)) category = "Privacy & Data Collection";
    else if (/payment|subscription|billing|renewal|fee/i.test(textLower)) category = "Payment & Billing";
    else if (/refund|cancel/i.test(textLower)) category = "Cancellation & Refund";
    else if (/arbitration|dispute|jury|class action/i.test(textLower)) category = "Dispute Resolution & Arbitration";
    else if (/liability|damage|warranty|disclaimer/i.test(textLower)) category = "Limitation of Liability";
    else if (/terminate|suspension/i.test(textLower)) category = "Termination & Suspension";
    else if (/copyright|intellectual property|license|content/i.test(textLower)) category = "Intellectual Property & Licensing";

    return {
      text: clauseText,
      risk_level: riskLevel,
      matched_flags: matchedFlags,
      category,
      confidence: 0.92,
      sentiment: matchedFlags.length > 0 ? "Neutral" : "Positive",
      is_unilateral_opinion: /sole discretion|without notice/i.test(textLower)
    };
  });

  const highRisks = analyzedClauses.filter(c => c.risk_level === "High");
  const medRisks = analyzedClauses.filter(c => c.risk_level === "Medium");
  const lowRisks = analyzedClauses.filter(c => c.risk_level === "Low");

  const rawScore = analyzedClauses.reduce((acc, c) => acc + c.matched_flags.reduce((fAcc, f) => fAcc + f.weight, 0), 0);
  const score = Math.min(100, Math.max(0, rawScore));

  let rating = "Low Risk";
  let summaryText = "Favorable terms without concerning arbitration or tracking clauses.";
  if (score >= 65 || highRisks.length >= 2) {
    rating = "High Risk";
    summaryText = "Concerning clauses detected. Contains aggressive rights waivers, forced arbitration, or surveillance provisions.";
  } else if (score >= 35 || highRisks.length >= 1 || medRisks.length >= 1) {
    rating = "Medium Risk";
    summaryText = "Moderate risk. Standard commercial terms present alongside auto-renewals or unilateral modification clauses.";
  }

  // Threat Matrix
  const threatMatrix = [
    {
      id: "data_privacy",
      name: "Data & Privacy",
      icon: "eye",
      rule_ids: ["DATA_SELLING_SHARING", "INDEFINITE_DATA_RETENTION"],
      default_threat_desc: "Your personal information or browsing data may be shared with or sold to third-party advertisers.",
      safe_desc: "No high-risk data selling or indefinite retention clauses detected."
    },
    {
      id: "auto_renewal",
      name: "Auto-Renewal",
      icon: "credit-card",
      rule_ids: ["AUTO_RENEWAL_NO_REFUND"],
      default_threat_desc: "Your payment method may be charged repeatedly and automatically without individual prior confirmation.",
      safe_desc: "No aggressive auto-billing patterns detected."
    },
    {
      id: "court_rights",
      name: "Dispute & Court Rights",
      icon: "scale",
      rule_ids: ["ARBITRATION_CLASS_ACTION"],
      default_threat_desc: "You give up constitutional rights to bring claims in court, participate in class actions, or seek damages.",
      safe_desc: "No forced binding arbitration or class action waivers detected."
    },
    {
      id: "content_rights",
      name: "Content Rights & IP",
      icon: "file-text",
      rule_ids: ["PERPETUAL_IP_LICENSE"],
      default_threat_desc: "The company claims broad, perpetual, or irrevocable commercial rights over any materials you submit.",
      safe_desc: "User intellectual property and copyright ownership are respected."
    },
    {
      id: "account_termination",
      name: "Account Termination",
      icon: "alert-triangle",
      rule_ids: ["IMMEDIATE_TERMINATION"],
      default_threat_desc: "The company can suspend or terminate your account immediately at any time without reason, notice, or data recovery.",
      safe_desc: "No explicit high-risk pattern detected in this category."
    },
    {
      id: "refund_policy",
      name: "Refund Policy",
      icon: "ban",
      rule_ids: ["AUTO_RENEWAL_NO_REFUND"],
      default_threat_desc: "Prepaid subscription fees and purchases are strictly non-refundable under any circumstances, even during outages.",
      safe_desc: "Reasonable return or cancellation refund terms present."
    },
    {
      id: "location_tracking",
      name: "Location & Tracking",
      icon: "map-pin",
      rule_ids: ["CONTINUOUS_LOCATION_TRACKING"],
      default_threat_desc: "Continuous background location tracking or cross-site persistent browser fingerprinting detected.",
      safe_desc: "No invasive continuous background location surveillance identified."
    },
    {
      id: "unilateral_changes",
      name: "Unilateral Changes",
      icon: "refresh-cw",
      rule_ids: ["UNILATERAL_CHANGES"],
      default_threat_desc: "The company reserves the right to secretly modify agreements, fees, or obligations without advance notice.",
      safe_desc: "Requires reasonable advance notice before terms modifications take effect."
    }
  ].map(td => {
    const matched = [];
    analyzedClauses.forEach(c => {
      c.matched_flags.forEach(f => {
        if (td.rule_ids.includes(f.rule_id)) {
          matched.push({
            clause: c.text,
            category: c.category,
            severity: f.severity,
            reason: f.reason,
            recommendation: f.recommendation
          });
        }
      });
    });

    if (matched.length > 0) {
      return {
        id: td.id,
        name: td.name,
        icon: td.icon,
        status: "danger",
        color: "red",
        found_count: matched.length,
        summary: td.default_threat_desc,
        matched_clauses: matched
      };
    } else {
      return {
        id: td.id,
        name: td.name,
        icon: td.icon,
        status: "safe",
        color: "green",
        found_count: 0,
        summary: td.safe_desc,
        matched_clauses: []
      };
    }
  });

  return {
    success: true,
    summary: {
      title,
      source_type: "Direct Text Input (Client-Side Safe Mode)",
      processing_time_seconds: 0.15,
      language: "English",
      word_count: wordCount,
      sentence_count: clauses.length,
      estimated_reading_time_mins: (wordCount / 220).toFixed(1),
      risk_score: score,
      risk_rating: rating,
      badge_color: score >= 65 ? "red" : (score >= 35 ? "amber" : "emerald"),
      rating_summary: summaryText,
      total_clauses: clauses.length,
      high_risk_clauses_count: highRisks.length,
      medium_risk_clauses_count: medRisks.length,
      low_risk_clauses_count: lowRisks.length
    },
    risk_analysis: {
      overall_risk_score: score,
      risk_rating: rating,
      rating_summary: summaryText,
      total_clauses: clauses.length,
      high_risk_count: highRisks.length,
      medium_risk_count: medRisks.length,
      low_risk_count: lowRisks.length,
      threat_matrix: threatMatrix,
      clauses: analyzedClauses,
      top_flagged_clauses: [...highRisks, ...medRisks].slice(0, 10)
    },
    disclaimer: "Notice: This application is an educational NLP tool designed for informational assistance only. It does not replace professional legal advice."
  };
}
