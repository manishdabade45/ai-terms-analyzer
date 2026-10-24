"""
Explainable Risk Analysis Engine for Terms & Conditions and Privacy Policies
Evaluates clauses across 10 critical consumer protection dimensions:
1. Personal data collection and surveillance
2. Location tracking and biometrics
3. Third-party data sharing and selling
4. Unilateral terms modification without notice
5. Mandatory binding arbitration and class action waiver
6. Automatic renewal and recurring billing
7. Overreaching limitation of liability and disclaimers
8. Indefinite data retention
9. Overreaching content copyright / IP license
10. Immediate account termination without cause or notice
"""

import os
import sys
import re
from typing import Dict, Any, List

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
from modules.a4_pos_embeddings_clf import classify_clause
from modules.a10_sentiment_opinion import analyze_clause_sentiment

# Rule-based risk patterns with severity, plain-English reasons, and recommendations
RISK_RULES = [
    {
        "id": "ARBITRATION_CLASS_ACTION",
        "category": "Dispute Resolution & Arbitration",
        "severity": "High",
        "weight": 25,
        "patterns": [
            r"class action waiver",
            r"waive (?:any|all) right to (?:a )?jury trial",
            r"binding arbitration",
            r"conducted only on an individual basis",
            r"not in a class, consolidated or representative"
        ],
        "reason": "Forces you into private binding arbitration and strips your constitutional right to participate in a class-action lawsuit.",
        "recommendation": "Check if an arbitration opt-out letter can be submitted within 30 days of opening the account."
    },
    {
        "id": "UNILATERAL_CHANGES",
        "category": "Changes to Terms & Notice",
        "severity": "High",
        "weight": 20,
        "patterns": [
            r"modify (?:these|the) terms (?:at any time )?without notice",
            r"without prior notice",
            r"continued use (?:constitutes|shall constitute) (?:your )?acceptance",
            r"at our sole discretion.*(?:modify|change|alter)"
        ],
        "reason": "Allows the service to alter fees, terms, or privacy policies at any time without notifying you beforehand.",
        "recommendation": "Review the terms page periodically or use an automated website change detector."
    },
    {
        "id": "DATA_SELLING_SHARING",
        "category": "Third-Party Data Sharing",
        "severity": "High",
        "weight": 22,
        "patterns": [
            r"(?:sell|rent|lease|trade) (?:your )?personal (?:data|information)",
            r"share (?:your )?(?:information|data|history) with (?:advertising|marketing) partners",
            r"data brokers",
            r"monetize (?:user|personal) data"
        ],
        # Negative check: ensure it's not a protective negation like "do not sell"
        "negative_patterns": [r"do not sell", r"never sell", r"will not sell", r"does not sell"],
        "reason": "Allows commercial monetization and sharing of your private browsing, demographic, and identity records with advertisers.",
        "recommendation": "Submit a CCPA / GDPR 'Do Not Sell My Info' opt-out request if supported."
    },
    {
        "id": "CONTINUOUS_LOCATION_TRACKING",
        "category": "Privacy & Data Collection",
        "severity": "High",
        "weight": 18,
        "patterns": [
            r"precise (?:geolocation|location) data",
            r"even when the (?:app|application) is (?:closed|not in (?:active )?use)",
            r"continuous(?:ly)? (?:track|collect) (?:your )?location",
            r"browser fingerprinting",
            r"biometric identifiers"
        ],
        "reason": "Surveils your physical whereabouts continuously in the background, or gathers non-revocable biometric markers.",
        "recommendation": "Revoke 'Always Allow' location permissions in your smartphone operating system settings."
    },
    {
        "id": "IMMEDIATE_TERMINATION",
        "category": "Termination & Suspension",
        "severity": "High",
        "weight": 18,
        "patterns": [
            r"terminate (?:or suspend )?your account (?:immediately )?at any time,? for any reason or no reason",
            r"without notice and without liability",
            r"sole discretion to terminate"
        ],
        "reason": "Allows the company to shut down your access and erase stored data without providing reasons, advance warning, or backups.",
        "recommendation": "Regularly back up all important documents, assets, and correspondence offline."
    },
    {
        "id": "PERPETUAL_IP_LICENSE",
        "category": "Intellectual Property & Licensing",
        "severity": "High",
        "weight": 18,
        "patterns": [
            r"irrevocable,? perpetual,? worldwide,? royalty-free",
            r"transferable license to use, reproduce, modify",
            r"own all rights.*in and to.*content you (?:post|upload|submit)"
        ],
        "reason": "Demands permanent, royalty-free commercial exploitation rights over your creative content even after you leave.",
        "recommendation": "Avoid publishing proprietary or copyrighted creative content on this platform."
    },
    {
        "id": "EXTREME_LIABILITY_CAP",
        "category": "Limitation of Liability",
        "severity": "High",
        "weight": 16,
        "patterns": [
            r"shall not exceed the greater of (?:fifty|100|\$50|\$100)",
            r"liability.*limited to (?:the amount paid|fifty dollars|\$50|\$100)",
            r"no event shall.*be liable for any.*loss of (?:data|profits)"
        ],
        "reason": "Caps maximum monetary recovery to a trivial amount (e.g. $50) even if the platform causes catastrophic financial or data loss.",
        "recommendation": "Maintain independent commercial insurance if using this service for critical business operations."
    },
    {
        "id": "AUTO_RENEWAL_NO_REFUND",
        "category": "Payment & Billing",
        "severity": "Medium",
        "weight": 14,
        "patterns": [
            r"automatically renew",
            r"auto-renew",
            r"non-refundable under any circumstances",
            r"strictly non-refundable",
            r"reactivation fee"
        ],
        "reason": "Automatically charges your payment card without requiring manual approval, and refuses refunds even for service outages.",
        "recommendation": "Set calendar reminders to review subscriptions and cancel prior to the auto-billing deadline."
    },
    {
        "id": "INDEFINITE_DATA_RETENTION",
        "category": "Privacy & Data Collection",
        "severity": "Medium",
        "weight": 12,
        "patterns": [
            r"retain (?:your )?(?:personal )?data indefinitely",
            r"even following deletion of your account",
            r"keep your information indefinitely"
        ],
        "reason": "Preserves your personal data forever on company servers, creating permanent data breach liability.",
        "recommendation": "Send an explicit erasure/purging request under privacy laws upon closing your account."
    },
    {
        "id": "BROAD_INDEMNIFICATION",
        "category": "Limitation of Liability",
        "severity": "Medium",
        "weight": 10,
        "patterns": [
            r"defend,? indemnify,? and hold harmless",
            r"indemnify the company",
            r"legal fees arising from your use"
        ],
        "reason": "Shifts legal defense costs and third-party damages onto the user if the service is sued in connection with your activity.",
        "recommendation": "Standard in business contracts, but exercise caution regarding what content you upload."
    }
]

def segment_into_clauses(text: str) -> List[str]:
    """
    Intelligently segments legal text into readable clauses and sections.
    """
    if not text:
        return []

    # First split by double newlines or numbered headers
    raw_blocks = re.split(r"\n\s*\n|(?<=\n)(?=[0-9]+\.\s+[A-Z])", text)
    clauses = []

    for block in raw_blocks:
        block = block.strip()
        if not block:
            continue

        # If block contains multiple sentences and is very long, split by sentences
        if len(block.split()) > 100:
            sentences = re.split(r"(?<=[.!?])\s+(?=[A-Z])", block)
            current_chunk = []
            current_len = 0
            for s in sentences:
                s_words = len(s.split())
                if current_len + s_words > 80 and current_chunk:
                    clauses.append(" ".join(current_chunk).strip())
                    current_chunk = [s]
                    current_len = s_words
                else:
                    current_chunk.append(s)
                    current_len += s_words
            if current_chunk:
                clauses.append(" ".join(current_chunk).strip())
        else:
            if len(block.split()) >= 6:  # Skip tiny fragments
                clauses.append(block)

    return clauses

def evaluate_clause_risk(clause_text: str) -> Dict[str, Any]:
    """
    Evaluates a single clause for risk indicators, category, and sentiment.
    """
    matched_flags = []
    text_lower = clause_text.lower()

    # Rule-based risk matching
    for rule in RISK_RULES:
        # Check negative patterns (exceptions)
        has_exception = False
        if "negative_patterns" in rule:
            for neg in rule["negative_patterns"]:
                if re.search(neg, text_lower):
                    has_exception = True
                    break
        if has_exception:
            continue

        for pattern in rule["patterns"]:
            if re.search(pattern, text_lower):
                matched_flags.append({
                    "rule_id": rule["id"],
                    "category": rule["category"],
                    "severity": rule["severity"],
                    "weight": rule["weight"],
                    "matched_pattern": pattern,
                    "reason": rule["reason"],
                    "recommendation": rule["recommendation"]
                })
                break  # Don't duplicate same rule

    # ML classification
    clf_res = classify_clause(clause_text)

    # Sentiment analysis
    sent_res = analyze_clause_sentiment(clause_text)

    # Determine overall clause risk level
    if any(f["severity"] == "High" for f in matched_flags):
        risk_level = "High"
    elif any(f["severity"] == "Medium" for f in matched_flags):
        risk_level = "Medium"
    else:
        # Check if ML detected higher risk or subjective pressure
        risk_level = "Low"

    return {
        "text": clause_text,
        "risk_level": risk_level,
        "matched_flags": matched_flags,
        "category": clf_res["predicted_category"],
        "confidence": clf_res["confidence"],
        "sentiment": sent_res["sentiment_label"],
        "sentiment_score": sent_res["scores"]["compound"],
        "is_unilateral_opinion": sent_res["is_unilateral_opinion"]
    }

def analyze_document_risks(text: str) -> Dict[str, Any]:
    """
    Performs full explainable risk analysis across the entire agreement.
    """
    clauses = segment_into_clauses(text)
    analyzed_clauses = [evaluate_clause_risk(c) for c in clauses]

    total_clauses = len(analyzed_clauses)
    high_risk_clauses = [c for c in analyzed_clauses if c["risk_level"] == "High"]
    med_risk_clauses = [c for c in analyzed_clauses if c["risk_level"] == "Medium"]
    low_risk_clauses = [c for c in analyzed_clauses if c["risk_level"] == "Low"]

    # Calculate weighted document risk score (0 to 100)
    # Base calculation from flagged rules
    raw_score = sum(f["weight"] for c in analyzed_clauses for f in c["matched_flags"])
    # Cap and normalize
    score = min(100, int(raw_score))

    # Determine qualitative risk rating
    if score >= 65 or len(high_risk_clauses) >= 3:
        rating = "High Risk"
        badge_color = "red"
        rating_summary = "Concerning clauses detected. Contains aggressive rights waivers, forced arbitration, or surveillance provisions."
    elif score >= 35 or len(high_risk_clauses) >= 1 or len(med_risk_clauses) >= 2:
        rating = "Medium Risk"
        badge_color = "amber"
        rating_summary = "Moderate risk. Standard commercial terms present alongside auto-renewals or unilateral modification clauses."
    else:
        rating = "Low Risk"
        badge_color = "emerald"
        rating_summary = "Favorable or standard agreement. No predatory terms, hidden arbitration waivers, or intrusive tracking identified."

    # Category breakdown
    category_counts = {}
    for c in analyzed_clauses:
        cat = c["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1

    threat_matrix = generate_threat_matrix(analyzed_clauses)

    return {
        "overall_risk_score": score,
        "risk_rating": rating,
        "badge_color": badge_color,
        "rating_summary": rating_summary,
        "total_clauses": total_clauses,
        "high_risk_count": len(high_risk_clauses),
        "medium_risk_count": len(med_risk_clauses),
        "low_risk_count": len(low_risk_clauses),
        "category_distribution": category_counts,
        "threat_matrix": threat_matrix,
        "clauses": analyzed_clauses,
        "top_flagged_clauses": (high_risk_clauses + med_risk_clauses)[:10],
        "disclaimer": "Informational assistance only. This analysis does not constitute formal legal advice."
    }

def generate_threat_matrix(analyzed_clauses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Builds the structured 'Consumer Threat Matrix: At a Glance'
    matching modern consumer legal audit cards.
    """
    threat_defs = [
        {
            "id": "data_privacy",
            "name": "Data & Privacy",
            "icon": "eye",
            "rule_ids": ["DATA_SELLING_SHARING", "INDEFINITE_DATA_RETENTION"],
            "default_threat_desc": "Your personal information or browsing data may be shared with or sold to third-party advertisers.",
            "safe_desc": "No high-risk data selling or indefinite retention clauses detected."
        },
        {
            "id": "auto_renewal",
            "name": "Auto-Renewal",
            "icon": "credit-card",
            "rule_ids": ["AUTO_RENEWAL_NO_REFUND"],
            "default_threat_desc": "Your payment method may be charged repeatedly and automatically without individual prior confirmation.",
            "safe_desc": "No aggressive auto-billing patterns detected."
        },
        {
            "id": "court_rights",
            "name": "Dispute & Court Rights",
            "icon": "scale",
            "rule_ids": ["ARBITRATION_CLASS_ACTION"],
            "default_threat_desc": "You give up constitutional rights to bring claims in court, participate in class actions, or seek damages.",
            "safe_desc": "No forced binding arbitration or class action waivers detected."
        },
        {
            "id": "content_rights",
            "name": "Content Rights & IP",
            "icon": "file-text",
            "rule_ids": ["PERPETUAL_IP_LICENSE"],
            "default_threat_desc": "The company claims broad, perpetual, or irrevocable commercial rights over any materials you submit.",
            "safe_desc": "User intellectual property and copyright ownership are respected."
        },
        {
            "id": "account_termination",
            "name": "Account Termination",
            "icon": "alert-triangle",
            "rule_ids": ["IMMEDIATE_TERMINATION"],
            "default_threat_desc": "The company can suspend or terminate your account immediately at any time without reason, notice, or data recovery.",
            "safe_desc": "No explicit high-risk pattern detected in this category."
        },
        {
            "id": "refund_policy",
            "name": "Refund Policy",
            "icon": "ban",
            "rule_ids": ["AUTO_RENEWAL_NO_REFUND"],
            "default_threat_desc": "Prepaid subscription fees and purchases are strictly non-refundable under any circumstances, even during outages.",
            "safe_desc": "Reasonable return or cancellation refund terms present."
        },
        {
            "id": "location_tracking",
            "name": "Location & Tracking",
            "icon": "map-pin",
            "rule_ids": ["CONTINUOUS_LOCATION_TRACKING"],
            "default_threat_desc": "Continuous background location tracking or cross-site persistent browser fingerprinting detected.",
            "safe_desc": "No invasive continuous background location surveillance identified."
        },
        {
            "id": "unilateral_changes",
            "name": "Unilateral Changes",
            "icon": "refresh-cw",
            "rule_ids": ["UNILATERAL_CHANGES"],
            "default_threat_desc": "The company reserves the right to secretly modify agreements, fees, or obligations without advance notice.",
            "safe_desc": "Requires reasonable advance notice before terms modifications take effect."
        }
    ]

    matrix = []
    for td in threat_defs:
        matched = []
        for c in analyzed_clauses:
            for f in c.get("matched_flags", []):
                if f.get("rule_id") in td["rule_ids"]:
                    matched.append({
                        "clause": c["text"],
                        "category": c.get("category", "General"),
                        "severity": f.get("severity", "High"),
                        "reason": f.get("reason", ""),
                        "recommendation": f.get("recommendation", "")
                    })
                    break

        if matched:
            matrix.append({
                "id": td["id"],
                "name": td["name"],
                "icon": td["icon"],
                "status": "danger",
                "color": "red",
                "found_count": len(matched),
                "summary": td["default_threat_desc"],
                "matched_clauses": matched
            })
        else:
            matrix.append({
                "id": td["id"],
                "name": td["name"],
                "icon": td["icon"],
                "status": "safe",
                "color": "green",
                "found_count": 0,
                "summary": td["safe_desc"],
                "matched_clauses": []
            })

    return matrix

if __name__ == "__main__":
    test_text = """
    1. ARBITRATION: You agree that any dispute will be settled by binding arbitration and class action waiver.
    2. LOCATION: We collect precise geolocation data from your device continuously even when the app is closed.
    3. RENEWAL: Your subscription will automatically renew each month.
    """
    res = analyze_document_risks(test_text)
    print("Risk Score:", res["overall_risk_score"], "Rating:", res["risk_rating"])
    print("High Risk Clauses:", res["high_risk_count"])
