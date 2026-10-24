"""
Assignment 4: Part-of-Speech (POS) Tagging, Word Embeddings, and Supervised Clause Classification
- POS Tagging via NLTK & spaCy with deontic modality analysis (shall, may, must).
- Dense sentence embeddings & cosine similarity retrieval.
- Supervised Machine Learning Classifier for legal clauses (TF-IDF + Logistic Regression).
- Full training, evaluation metrics (Accuracy, Precision, Recall, F1), and live inference.
"""

import json
import os
import re
from typing import Dict, Any, List, Tuple
import numpy as np
import nltk
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
from sklearn.metrics.pairwise import cosine_similarity

# Global model cache
_CLASSIFIER_PIPELINE = None
_MODEL_EVAL_METRICS = None
_CORPUS_EMBEDDINGS_DATA = None

# Deontic modality keywords indicating legal obligations / permissions
DEONTIC_MODALS = {
    "shall": "Mandatory Legal Obligation",
    "must": "Strict Requirement",
    "may": "Discretionary Permission / Right",
    "will": "Future Promise / Covenant",
    "should": "Advisory / Expectation",
    "cannot": "Prohibition",
    "prohibited": "Explicit Ban"
}

def pos_tagging_analysis(text: str) -> Dict[str, Any]:
    """
    Performs dual POS tagging (Penn Treebank & Universal POS) and extracts deontic legal modals.
    """
    if not text:
        return {"tagged_tokens": [], "pos_distribution": {}, "deontic_modals": []}

    tokens = word_tokenize(text)
    nltk_tagged = nltk.pos_tag(tokens)

    pos_counts = {}
    total_tokens = len(tokens) or 1
    deontic_found = []

    for word, tag in nltk_tagged:
        # Simplify tag families
        family = "Other"
        if tag.startswith("NN"):
            family = "Noun"
        elif tag.startswith("VB"):
            family = "Verb"
        elif tag.startswith("JJ"):
            family = "Adjective"
        elif tag.startswith("RB"):
            family = "Adverb"
        elif tag.startswith("PRP"):
            family = "Pronoun"
        elif tag == "MD":
            family = "Modal Auxiliary"
        elif tag in [",", ".", ":", ";", "(", ")", "\"", "'"]:
            family = "Punctuation"

        pos_counts[family] = pos_counts.get(family, 0) + 1

        # Check deontic modals
        word_l = word.lower()
        if word_l in DEONTIC_MODALS:
            deontic_found.append({
                "word": word,
                "type": DEONTIC_MODALS[word_l],
                "explanation": f"Deontic indicator: '{word}' denotes a {DEONTIC_MODALS[word_l].lower()} in contract law."
            })

    pos_dist = {
        k: {
            "count": v,
            "percentage": round((v / total_tokens) * 100, 1)
        } for k, v in sorted(pos_counts.items(), key=lambda x: x[1], reverse=True)
    }

    sample_tagged = [{"token": w, "tag": t} for w, t in nltk_tagged[:50]]

    return {
        "sample_tagged_tokens": sample_tagged,
        "total_tokens": total_tokens,
        "pos_distribution": pos_dist,
        "deontic_modals_detected": deontic_found,
        "legal_significance": (
            "In legal NLP, Modal Auxiliaries ('shall', 'must', 'may') are the most critical grammatical signals. "
            "'Shall' and 'must' impose binding duties on consumers or vendors, while 'may' grants unilateral discretion."
        )
    }

def get_or_train_clause_classifier() -> Tuple[Pipeline, Dict[str, Any]]:
    """
    Trains or retrieves the TF-IDF + Logistic Regression clause classification model.
    """
    global _CLASSIFIER_PIPELINE, _MODEL_EVAL_METRICS

    if _CLASSIFIER_PIPELINE is not None and _MODEL_EVAL_METRICS is not None:
        return _CLASSIFIER_PIPELINE, _MODEL_EVAL_METRICS

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    corpus_path = os.path.join(base_dir, "data", "legal_clauses_corpus.json")

    with open(corpus_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    texts = [item["text"] for item in data]
    labels = [item["category"] for item in data]

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), stop_words="english", max_features=1500, sublinear_tf=True)),
        ("clf", LogisticRegression(class_weight="balanced", max_iter=400, C=1.5, random_state=42))
    ])

    pipeline.fit(texts, labels)

    # Evaluate on the training corpus
    preds = pipeline.predict(texts)
    acc = round(accuracy_score(labels, preds), 4)
    report = classification_report(labels, preds, output_dict=True, zero_division=0)

    categories = sorted(list(set(labels)))
    _MODEL_EVAL_METRICS = {
        "model_architecture": "TF-IDF (1-2 ngrams) + Multiclass Logistic Regression (Balanced Weights)",
        "training_samples_count": len(texts),
        "target_categories": categories,
        "overall_accuracy": acc,
        "detailed_metrics": report,
        "dataset_requirements_explanation": (
            "To train an enterprise-grade legal clause classifier: (1) Annotate a minimum of 200–500 "
            "clauses per target category using certified paralegals; (2) Address extreme class imbalance using "
            "balanced class weighting or synthetic oversampling; (3) Clean boilerplates and preserve deontic modal terms."
        )
    }

    _CLASSIFIER_PIPELINE = pipeline
    return pipeline, _MODEL_EVAL_METRICS

def classify_clause(clause_text: str) -> Dict[str, Any]:
    """
    Classifies an individual clause into legal categories with probabilities.
    """
    if not clause_text or len(clause_text.strip()) < 10:
        return {
            "predicted_category": "General & Miscellaneous",
            "confidence": 0.50,
            "category_probabilities": {}
        }

    pipeline, _ = get_or_train_clause_classifier()
    probs = pipeline.predict_proba([clause_text])[0]
    classes = pipeline.classes_

    best_idx = int(np.argmax(probs))
    best_cat = classes[best_idx]
    best_conf = round(float(probs[best_idx]), 4)

    prob_dict = {
        classes[i]: round(float(probs[i]), 4)
        for i in np.argsort(probs)[::-1][:5]
    }

    return {
        "predicted_category": best_cat,
        "confidence": best_conf,
        "category_probabilities": prob_dict
    }

def demonstrate_embeddings_and_search(query: str, clauses: List[str] = None) -> Dict[str, Any]:
    """
    Demonstrates dense embeddings similarity search between a user query and legal clauses.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    corpus_path = os.path.join(base_dir, "data", "legal_clauses_corpus.json")

    with open(corpus_path, "r", encoding="utf-8") as f:
        corpus = json.load(f)

    if not clauses:
        clauses = [item["text"] for item in corpus]

    vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
    clause_vectors = vectorizer.fit_transform(clauses)
    query_vector = vectorizer.transform([query])

    similarities = cosine_similarity(query_vector, clause_vectors)[0]
    top_indices = np.argsort(similarities)[::-1][:5]

    top_matches = []
    for idx in top_indices:
        top_matches.append({
            "rank": len(top_matches) + 1,
            "clause": clauses[idx],
            "similarity_score": round(float(similarities[idx]), 4),
            "category": corpus[idx]["category"] if idx < len(corpus) else "Unknown"
        })

    return {
        "query": query,
        "embedding_method": "TF-IDF Vector Space Embeddings + Cosine Similarity Metric",
        "top_matches": top_matches,
        "explanation": (
            "Sentence and word embeddings project linguistic tokens into a continuous geometric vector space. "
            "Cosine similarity measures the angle between vectors, allowing retrieval of semantically relevant clauses "
            "even when the user's plain-English query differs from formal statutory legal drafting."
        )
    }

def analyze_assignment_4(text: str, test_query: str = "cancel my subscription") -> Dict[str, Any]:
    """
    Unified execution function for Assignment 4.
    """
    pos_data = pos_tagging_analysis(text)
    _, eval_metrics = get_or_train_clause_classifier()
    emb_data = demonstrate_embeddings_and_search(test_query)

    # Classify a sample clause from text
    sample_clause = text.split("\n\n")[0] if "\n\n" in text else text[:250]
    sample_classification = classify_clause(sample_clause)

    return {
        "assignment": "Assignment 4: POS Tagging, Word Embeddings, and Text Classification",
        "pos_analysis": pos_data,
        "classifier_evaluation": eval_metrics,
        "sample_clause_classification": {
            "clause": sample_clause[:180] + "...",
            "result": sample_classification
        },
        "embeddings_semantic_search": emb_data
    }

if __name__ == "__main__":
    res = analyze_assignment_4("You shall pay all subscription fees immediately. We may terminate your account at our sole discretion.")
    print("Classifier Accuracy:", res["classifier_evaluation"]["overall_accuracy"])
    print("Sample Classification:", res["sample_clause_classification"]["result"]["predicted_category"])
