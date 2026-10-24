"""
Assignment 10: Sentiment Analysis, Emotion / Tone Analysis, and Opinion Mining
- NLTK VADER sentiment scoring (Positive, Neutral, Negative, Compound).
- Subjective assertion & one-sided opinion mining ('sole discretion', 'solely determined by us').
- Critical legal distinction: Explains why Negative Sentiment does NOT equate to Legal Risk.
"""

from typing import Dict, Any, List
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

_VADER_ANALYZER = None

def get_vader_analyzer():
    global _VADER_ANALYZER
    if _VADER_ANALYZER is None:
        _VADER_ANALYZER = SentimentIntensityAnalyzer()
    return _VADER_ANALYZER

# Subjective opinion / unilateral discretion markers
UNILATERAL_OPINION_MARKERS = [
    "sole discretion", "sole judgement", "deemed necessary", "at any time without notice",
    "reserve the right", "as we see fit", "without liability", "no warranty of any kind",
    "entire risk", "as is and as available", "waive all rights"
]

def analyze_clause_sentiment(clause_text: str) -> Dict[str, Any]:
    """
    Computes VADER sentiment polarity and subjectivity markers for a clause.
    """
    vader = get_vader_analyzer()
    scores = vader.polarity_scores(clause_text)

    compound = scores["compound"]
    if compound >= 0.05:
        sentiment_label = "Positive"
    elif compound <= -0.05:
        sentiment_label = "Negative"
    else:
        sentiment_label = "Neutral"

    # Opinion mining: check for unilateral or discretionary assertions
    clause_l = clause_text.lower()
    opinion_flags = []
    for marker in UNILATERAL_OPINION_MARKERS:
        if marker in clause_l:
            opinion_flags.append({
                "marker": marker,
                "implication": f"Unilateral discretion indicator: The drafter retains '{marker}', diminishing user rights."
            })

    is_subjective = len(opinion_flags) > 0 or abs(compound) > 0.4

    return {
        "text": clause_text,
        "sentiment_label": sentiment_label,
        "scores": {
            "compound": round(compound, 3),
            "positive": round(scores["pos"], 3),
            "negative": round(scores["neg"], 3),
            "neutral": round(scores["neu"], 3)
        },
        "is_unilateral_opinion": is_subjective,
        "opinion_markers": opinion_flags
    }

def analyze_assignment_10(text: str) -> Dict[str, Any]:
    """
    Unified execution function for Assignment 10.
    """
    vader = get_vader_analyzer()
    doc_scores = vader.polarity_scores(text[:15000])

    # Sample clauses demonstrating the Sentiment != Legal Risk paradox
    paradox_demonstration = [
        {
            "clause": "We do not sell, rent, or trade your personal data to any third party for commercial purposes.",
            "sentiment": "Neutral / Slightly Negative (Tokens: 'not', 'sell')",
            "legal_risk": "LOW (Protective)",
            "explanation": "Syntactic negation ('do not sell') triggers negative or neutral sentiment in NLP lexicons, yet legally it provides maximum consumer protection."
        },
        {
            "clause": "We are thrilled to share all your personal browsing records, contacts, and precise GPS location with our marketing affiliates.",
            "sentiment": "Positive (Tokens: 'thrilled', 'share', 'affiliates')",
            "legal_risk": "HIGH (Intrusive)",
            "explanation": "Friendly, promotional adjectives create high positive sentiment polarity, while the underlying legal effect is severe data privacy surrender."
        }
    ]

    return {
        "assignment": "Assignment 10: Sentiment Analysis, Emotion Analysis, and Opinion Mining",
        "document_sentiment": {
            "overall_label": "Neutral" if abs(doc_scores["compound"]) < 0.1 else ("Positive" if doc_scores["compound"] > 0 else "Negative"),
            "compound": round(doc_scores["compound"], 3),
            "positive": round(doc_scores["pos"], 3),
            "negative": round(doc_scores["neg"], 3),
            "neutral": round(doc_scores["neu"], 3)
        },
        "sentiment_vs_risk_paradox": paradox_demonstration,
        "core_pedagogical_principle": (
            "CRITICAL LESSON IN LEGAL NLP: General sentiment analysis models must NEVER be used as a direct proxy for legal risk. "
            "Legal agreements use formal, sanitized, neutral prose to describe severe rights forfeitures, while protective clauses "
            "often use explicit negative prohibitions ('shall not', 'do not disclose'). Legal risk must instead be evaluated "
            "via domain classification and substantive risk triggers."
        )
    }

if __name__ == "__main__":
    res = analyze_assignment_10("We do not sell your personal data. We reserve the right to terminate your account at our sole discretion.")
    print("Doc Sentiment:", res["document_sentiment"])
    print("Paradox demo entries:", len(res["sentiment_vs_risk_paradox"]))
