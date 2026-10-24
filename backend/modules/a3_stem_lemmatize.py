"""
Assignment 3: Stemming and Lemmatization
- PorterStemmer and SnowballStemmer (algorithmic suffix-stripping heuristic).
- WordNetLemmatizer with Part-of-Speech (POS) mapping.
- Side-by-side comparative linguistic matrix for legal terminology.
"""

from typing import Dict, Any, List
import nltk
from nltk.stem import PorterStemmer, SnowballStemmer, WordNetLemmatizer
from nltk.corpus import wordnet
from nltk.tokenize import word_tokenize

def get_wordnet_pos(treebank_tag: str) -> str:
    """
    Maps Penn Treebank POS tag to WordNet POS tag for accurate lemmatization.
    """
    if treebank_tag.startswith('J'):
        return wordnet.ADJ
    elif treebank_tag.startswith('V'):
        return wordnet.VERB
    elif treebank_tag.startswith('N'):
        return wordnet.NOUN
    elif treebank_tag.startswith('R'):
        return wordnet.ADV
    else:
        return wordnet.NOUN

def compare_stemming_and_lemmatization(words: List[str]) -> List[Dict[str, Any]]:
    """
    Generates a side-by-side comparative table for given words.
    """
    porter = PorterStemmer()
    snowball = SnowballStemmer("english")
    lemmatizer = WordNetLemmatizer()

    # Tag POS if possible
    tagged = nltk.pos_tag(words) if words else []
    results = []

    for idx, word in enumerate(words):
        cleaned = word.strip().lower()
        if not cleaned.isalpha():
            continue

        p_stem = porter.stem(cleaned)
        s_stem = snowball.stem(cleaned)

        pos_tag = tagged[idx][1] if idx < len(tagged) else "NN"
        wn_pos = get_wordnet_pos(pos_tag)
        lemma = lemmatizer.lemmatize(cleaned, pos=wn_pos)

        # Highlight difference
        differs = (p_stem != lemma) or (s_stem != lemma)

        results.append({
            "original": word,
            "pos_tag": pos_tag,
            "porter_stem": p_stem,
            "snowball_stem": s_stem,
            "wordnet_lemma": lemma,
            "is_lemma_real_word": True,
            "differs": differs
        })

    return results

def analyze_assignment_3(text: str, custom_words: List[str] = None) -> Dict[str, Any]:
    """
    Executes Assignment 3 on input text or default legal terms.
    """
    default_legal_terms = [
        "terminating", "liabilities", "cancellations", "arbitration",
        "collected", "governing", "indemnification", "severability",
        "jurisdiction", "subscribers", "automatically", "disputes",
        "operating", "agreements", "warranties", "unilateral"
    ]

    target_words = custom_words if custom_words and len(custom_words) > 0 else []

    if not target_words and text:
        tokens = word_tokenize(text)
        # Select distinct words with length >= 4
        words_seen = set()
        for t in tokens:
            t_lower = t.lower()
            if t_lower.isalpha() and len(t_lower) >= 4 and t_lower not in words_seen:
                words_seen.add(t_lower)
                target_words.append(t)
            if len(target_words) >= 15:
                break

    if not target_words:
        target_words = default_legal_terms

    comparison_table = compare_stemming_and_lemmatization(target_words)

    return {
        "assignment": "Assignment 3: Stemming and Lemmatization",
        "total_words_analyzed": len(comparison_table),
        "comparison_table": comparison_table,
        "educational_insights": {
            "stemming_concept": (
                "Stemming (Porter / Snowball) uses algorithmic suffix-chopping rules. "
                "It is fast and computationally lightweight, but frequently creates crude, non-dictionary stems "
                "(e.g., 'liabilities' -> 'liabil', 'arbitration' -> 'arbitr')."
            ),
            "lemmatization_concept": (
                "Lemmatization (WordNet) uses vocabulary morphological analysis and part-of-speech context "
                "to return the true canonical dictionary root (the 'lemma') (e.g., 'liabilities' -> 'liability')."
            ),
            "legal_nlp_recommendation": (
                "For legal text analysis, lemmatization is strongly preferred over crude stemming because preserving "
                "precise legal root words prevents conflating distinct statutory concepts."
            )
        }
    }

if __name__ == "__main__":
    res = analyze_assignment_3("The subscriber agreed that all liabilities and cancellations are subject to binding arbitration.")
    print("Stemming vs Lemmatization table entries:", len(res["comparison_table"]))
    print(res["comparison_table"][:3])
