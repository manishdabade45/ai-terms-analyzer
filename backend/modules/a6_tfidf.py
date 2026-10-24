"""
Assignment 6: Term Frequency-Inverse Document Frequency (TF-IDF)
- Calculates TF-IDF weights across legal agreements and clauses.
- Identifies discriminative domain terms vs common functional words.
- Provides per-document and per-clause feature importance vectors.
"""

import math
import re
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer

# Extended stopwords list including common non-discriminative contract noise
LEGAL_STOPWORDS = {
    "said", "herein", "thereof", "whereas", "pursuant", "therefore", "shall", "may",
    "the", "and", "or", "to", "in", "of", "a", "is", "for", "by", "on", "with",
    "as", "at", "from", "any", "all", "this", "that", "these", "those", "such"
}

def compute_document_tfidf(text: str, top_n: int = 25) -> Dict[str, Any]:
    """
    Computes top TF-IDF weighted terms for the document by treating sentences/clauses as sub-documents.
    """
    if not text or len(text.strip()) < 20:
        return {"top_terms": [], "vocabulary_size": 0}

    # Split into paragraphs or sentences as document units
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n|\.\s+", text) if len(p.strip()) > 25]
    if len(paragraphs) < 2:
        paragraphs = [text[:len(text)//2], text[len(text)//2:]]

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        max_features=2000,
        sublinear_tf=True
    )

    try:
        tfidf_matrix = vectorizer.fit_transform(paragraphs)
        feature_names = vectorizer.get_feature_names_out()

        # Mean TF-IDF score across all paragraph units
        mean_scores = tfidf_matrix.mean(axis=0).A1
        top_indices = mean_scores.argsort()[::-1][:top_n]

        top_terms = []
        for idx in top_indices:
            score = float(mean_scores[idx])
            if score > 0.001:
                top_terms.append({
                    "term": feature_names[idx],
                    "tfidf_score": round(score, 4),
                    "relative_importance_pct": round(score * 100, 1)
                })

        return {
            "top_terms": top_terms,
            "vocabulary_size": len(feature_names),
            "paragraphs_analyzed": len(paragraphs),
            "formula_explanation": (
                "TF-IDF(t, d, D) = TF(t, d) × log((1 + |D|) / (1 + DF(t, D))) + 1. "
                "Term Frequency (TF) measures how often term t occurs in clause d, "
                "while Inverse Document Frequency (IDF) penalizes ubiquitous words across all clauses. "
                "This highlights specific legal obligations (e.g. 'arbitration', 'refund', 'indemnify') "
                "over generic boilerplate text."
            )
        }
    except Exception as e:
        return {"top_terms": [], "error": str(e), "vocabulary_size": 0}

def get_clause_tfidf_keywords(clause_text: str, top_n: int = 5) -> List[str]:
    """
    Quickly extracts top TF-IDF / frequency keywords for an individual clause.
    """
    words = re.findall(r"\b[a-zA-Z]{3,}\b", clause_text.lower())
    filtered = [w for w in words if w not in LEGAL_STOPWORDS]
    if not filtered:
        return []

    # Simple frequency scoring for small clause
    freq = {}
    for w in filtered:
        freq[w] = freq.get(w, 0) + 1

    sorted_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    return [w[0] for w in sorted_words[:top_n]]

def analyze_assignment_6(text: str) -> Dict[str, Any]:
    """
    Unified execution function for Assignment 6.
    """
    tfidf_results = compute_document_tfidf(text)
    return {
        "assignment": "Assignment 6: Term Frequency-Inverse Document Frequency (TF-IDF)",
        "tfidf_analysis": tfidf_results
    }

if __name__ == "__main__":
    sample = """
    We collect personal information when you register for an account. 
    Your subscription automatically renews at standard rates. 
    Any dispute will be resolved through binding arbitration and class action waiver.
    """
    res = analyze_assignment_6(sample)
    print("Top TF-IDF Terms:")
    for t in res["tfidf_analysis"]["top_terms"][:5]:
        print(f" - {t['term']}: {t['tfidf_score']}")
