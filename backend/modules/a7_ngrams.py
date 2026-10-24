"""
Assignment 7: N-gram Models and Frequent Legal Phrase Extraction
- Extracts Unigram (1-gram), Bigram (2-gram), and Trigram (3-gram) distributions.
- Detects recurring multi-word legal constructions ('personal information', 'automatic renewal', 'class action waiver').
"""

from collections import Counter
import re
from typing import Dict, Any, List
import nltk
from nltk.corpus import stopwords

_STOPWORDS = None

def get_stopwords():
    global _STOPWORDS
    if _STOPWORDS is None:
        try:
            _STOPWORDS = set(stopwords.words("english"))
        except Exception:
            _STOPWORDS = {"the", "a", "an", "and", "or", "to", "in", "of", "for", "with", "on", "at", "by", "from"}
    return _STOPWORDS

def generate_ngrams(tokens: List[str], n: int) -> List[str]:
    """
    Constructs n-grams from a list of tokens.
    """
    if len(tokens) < n:
        return []
    return [" ".join(tokens[i:i + n]) for i in range(len(tokens) - n + 1)]

def extract_all_ngrams(text: str, top_n: int = 15) -> Dict[str, Any]:
    """
    Extracts top unigrams, bigrams, and trigrams with frequencies.
    """
    if not text:
        return {"unigrams": [], "bigrams": [], "trigrams": []}

    sw = get_stopwords()
    raw_tokens = re.findall(r"\b[a-zA-Z]{2,}\b", text.lower())

    # Filtered tokens for cleaner ngrams
    filtered_tokens = [t for t in raw_tokens if t not in sw]

    # Unigrams (filtered for informative words)
    unigram_counts = Counter(filtered_tokens).most_common(top_n)
    unigrams = [{"phrase": phrase, "count": count} for phrase, count in unigram_counts]

    # Bigrams (allow one stopword in bigram to capture phrases like 'terms of', 'right to', or pure filtered)
    raw_bigrams = generate_ngrams(raw_tokens, 2)
    # Exclude bigrams where both words are stopwords
    valid_bigrams = [
        bg for bg in raw_bigrams
        if not (bg.split()[0] in sw and bg.split()[1] in sw)
    ]
    bigram_counts = Counter(valid_bigrams).most_common(top_n)
    bigrams = [{"phrase": phrase, "count": count} for phrase, count in bigram_counts]

    # Trigrams
    raw_trigrams = generate_ngrams(raw_tokens, 3)
    valid_trigrams = [
        tg for tg in raw_trigrams
        if sum(1 for w in tg.split() if w in sw) <= 1  # At most 1 stopword in trigram
    ]
    trigram_counts = Counter(valid_trigrams).most_common(top_n)
    trigrams = [{"phrase": phrase, "count": count} for phrase, count in trigram_counts]

    # Highlight common legal n-gram indicators
    legal_key_phrases = [
        "personal information", "third party", "third-party services",
        "automatic renewal", "without prior notice", "class action waiver",
        "binding arbitration", "limitation of liability", "terms of service",
        "privacy policy", "sole discretion", "governing law", "intellectual property"
    ]
    
    detected_key_phrases = []
    text_l = text.lower()
    for kp in legal_key_phrases:
        cnt = text_l.count(kp.replace("-", " "))
        if cnt > 0:
            detected_key_phrases.append({"phrase": kp, "count": cnt})

    return {
        "unigrams": unigrams,
        "bigrams": bigrams,
        "trigrams": trigrams,
        "detected_key_phrases": detected_key_phrases,
        "total_word_tokens": len(raw_tokens)
    }

def analyze_assignment_7(text: str) -> Dict[str, Any]:
    """
    Unified execution function for Assignment 7.
    """
    ngram_data = extract_all_ngrams(text)
    return {
        "assignment": "Assignment 7: N-gram Models",
        "ngrams": ngram_data,
        "explanation": (
            "N-grams capture co-occurrence patterns across adjacent words. In legal NLP, unigrams frequently lose "
            "context (e.g. 'class' or 'waiver' separately), while bigrams and trigrams reveal definitive legal commitments "
            "such as 'class action waiver', 'automatic renewal', or 'without notice'."
        )
    }

if __name__ == "__main__":
    sample = "You agree to automatic renewal and class action waiver. Your personal information will be shared with third party partners."
    res = analyze_assignment_7(sample)
    print("Top Bigrams:", [b["phrase"] for b in res["ngrams"]["bigrams"][:3]])
    print("Key Phrases Detected:", res["ngrams"]["detected_key_phrases"])
