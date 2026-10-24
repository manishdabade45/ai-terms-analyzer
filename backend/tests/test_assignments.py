"""
Unit Tests for NLP Assignments 1 to 10, Pipeline, and Risk Engine
Run with: python -m pytest backend/tests
"""

import pytest
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from modules.a1_web_scraping import clean_extracted_text, check_robots_txt
from modules.a2_language_stats import detect_language, compute_document_statistics, get_huffpost_experiment_data
from modules.a3_stem_lemmatize import compare_stemming_and_lemmatization
from modules.a4_pos_embeddings_clf import pos_tagging_analysis, classify_clause
from modules.a5_ner import extract_named_entities
from modules.a6_tfidf import compute_document_tfidf
from modules.a7_ngrams import extract_all_ngrams
from modules.a8_language_model import NGramLanguageModel
from modules.a9_topic_modelling import perform_lda_topic_modelling
from modules.a10_sentiment_opinion import analyze_clause_sentiment
from risk_engine import analyze_document_risks
from pipeline import run_complete_pipeline

SAMPLE_TOS = """
TERMS OF SERVICE
1. Your subscription will automatically renew at monthly rates unless cancelled 48 hours prior.
2. We collect precise geolocation data from your device continuously even when the app is closed.
3. You agree that any dispute will be settled by binding arbitration and class action waiver.
4. IN NO EVENT SHALL THE COMPANY BE LIABLE FOR ANY CONSEQUENTIAL DAMAGES.
5. We may modify these terms at any time without notice.
"""

def test_assignment_1_text_cleaning_and_robots():
    cleaned = clean_extracted_text("Hello   World!\n\n\n\nTest   clause.")
    assert "Hello World!" in cleaned
    assert "\n\n\n" not in cleaned
    robots_res = check_robots_txt("https://example.com")
    assert "allowed" in robots_res

def test_assignment_2_language_stats_and_huffpost():
    lang = detect_language("This agreement is drafted in clear English.")
    assert lang["language_code"] == "en"
    stats = compute_document_statistics(SAMPLE_TOS)
    assert stats["total_words"] > 20
    assert stats["total_sentences"] >= 4
    huffpost = get_huffpost_experiment_data()
    assert huffpost["sample_size"] > 0
    assert "HuffPost" in huffpost["dataset_name"]

def test_assignment_3_stem_vs_lemmatize():
    words = ["liabilities", "cancellations", "arbitration"]
    table = compare_stemming_and_lemmatization(words)
    assert len(table) == 3
    # Check that wordnet lemma of liabilities is liability
    liab = next(item for item in table if item["original"] == "liabilities")
    assert liab["wordnet_lemma"] == "liability"

def test_assignment_4_pos_and_classification():
    pos = pos_tagging_analysis("You shall pay all subscription fees immediately.")
    assert pos["total_tokens"] > 5
    assert any(d["word"].lower() == "shall" for d in pos["deontic_modals_detected"])
    clf = classify_clause("You agree to resolve all claims by binding individual arbitration.")
    assert clf["predicted_category"] == "Dispute Resolution & Arbitration"
    assert clf["confidence"] > 0.0

def test_assignment_5_ner():
    ner = extract_named_entities("OmniStream LLC operates in California and charges $50 cancellation fee.")
    assert ner["total_unique_entities"] > 0
    types = ner["counts_by_type"]
    assert any(t in types for t in ["ORG", "GPE", "MONEY", "CARDINAL"])

def test_assignment_6_tfidf():
    tfidf = compute_document_tfidf(SAMPLE_TOS)
    assert len(tfidf["top_terms"]) > 0
    assert tfidf["vocabulary_size"] > 5

def test_assignment_7_ngrams():
    ngrams = extract_all_ngrams(SAMPLE_TOS)
    assert len(ngrams["unigrams"]) > 0
    assert len(ngrams["bigrams"]) > 0
    assert len(ngrams["detected_key_phrases"]) > 0

def test_assignment_8_language_model():
    lm = NGramLanguageModel(k_smoothing=1.0)
    lm.train(SAMPLE_TOS)
    eval_res = lm.evaluate_sequence("your subscription will automatically renew")
    assert "perplexity" in eval_res
    assert eval_res["perplexity"] > 0

def test_assignment_9_topic_modelling():
    lda_res = perform_lda_topic_modelling(SAMPLE_TOS, n_topics=3)
    assert len(lda_res["topics"]) > 0
    assert "document_topic_mixture" in lda_res

def test_assignment_10_sentiment_opinion():
    sent = analyze_clause_sentiment("We reserve the right to modify these terms at our sole discretion.")
    assert sent["is_unilateral_opinion"] is True
    assert len(sent["opinion_markers"]) > 0

def test_risk_analysis_engine():
    risk = analyze_document_risks(SAMPLE_TOS)
    assert risk["overall_risk_score"] >= 50
    assert risk["risk_rating"] in ["Medium Risk", "High Risk"]
    assert risk["high_risk_count"] >= 1
    assert len(risk["top_flagged_clauses"]) >= 1

def test_complete_nlp_pipeline():
    pipeline_res = run_complete_pipeline(raw_text=SAMPLE_TOS, title="Unit Test Agreement")
    assert pipeline_res["success"] is True
    assert "summary" in pipeline_res
    assert "risk_analysis" in pipeline_res
    assert "assignment_modules" in pipeline_res
    assert len(pipeline_res["assignment_modules"]) == 10
