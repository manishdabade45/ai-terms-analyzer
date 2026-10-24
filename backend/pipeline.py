"""
Complete NLP Pipeline Orchestrator
Sequentially executes the end-to-end NLP workflow:
1. Document Input & Ingestion (Web Scraping / PDF / TXT / Raw Text)
2. Text Cleaning & Normalization
3. Language Detection (Assignment 2)
4. Sentence Segmentation and Tokenization (Assignment 2)
5. Stemming and Lemmatization (Assignment 3)
6. POS Tagging (Assignment 4) & Named Entity Recognition (Assignment 5)
7. TF-IDF Weights (Assignment 6) & N-gram Feature Extraction (Assignment 7)
8. N-gram Language Model Evaluation (Assignment 8)
9. Clause Segmentation and Classification (Assignment 4)
10. Latent Dirichlet Allocation Topic Modelling (Assignment 9)
11. Sentiment and Opinion Mining (Assignment 10)
12. Explainable Risk Scoring and Flag Generation
13. Executive Summary & Printable Report Data
"""

import os
import sys
import time
from typing import Dict, Any, Optional

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
from modules.a1_web_scraping import scrape_url, extract_pdf_bytes, extract_txt_bytes, clean_extracted_text
from modules.a2_language_stats import detect_language, compute_document_statistics, tokenize_text, get_huffpost_experiment_data
from modules.a3_stem_lemmatize import analyze_assignment_3
from modules.a4_pos_embeddings_clf import analyze_assignment_4, pos_tagging_analysis, classify_clause
from modules.a5_ner import analyze_assignment_5, extract_named_entities
from modules.a6_tfidf import analyze_assignment_6, compute_document_tfidf
from modules.a7_ngrams import analyze_assignment_7, extract_all_ngrams
from modules.a8_language_model import analyze_assignment_8
from modules.a9_topic_modelling import analyze_assignment_9, perform_lda_topic_modelling
from modules.a10_sentiment_opinion import analyze_assignment_10
from risk_engine import analyze_document_risks

def run_complete_pipeline(
    raw_text: Optional[str] = None,
    url: Optional[str] = None,
    pdf_bytes: Optional[bytes] = None,
    txt_bytes: Optional[bytes] = None,
    title: str = "Terms and Conditions Analysis"
) -> Dict[str, Any]:
    """
    Executes the complete end-to-end NLP analysis pipeline.
    """
    start_time = time.time()
    source_type = "Direct Text Input"
    source_meta = {}

    # Stage 1: Document Ingestion
    if url:
        source_type = "Web Scraping"
        scraping_result = scrape_url(url)
        if not scraping_result.get("success"):
            return {
                "success": False,
                "error": scraping_result.get("error", "Failed to scrape URL"),
                "stage": "Document Ingestion (Web Scraping)"
            }
        text = scraping_result["text"]
        title = scraping_result.get("title", title)
        source_meta = {"url": url, "robots_info": scraping_result.get("robots_info")}

    elif pdf_bytes:
        source_type = "PDF Upload"
        pdf_res = extract_pdf_bytes(pdf_bytes, filename=title)
        if not pdf_res.get("success"):
            return {
                "success": False,
                "error": pdf_res.get("error", "Failed to extract text from PDF"),
                "stage": "Document Ingestion (PDF Extraction)"
            }
        text = pdf_res["text"]
        source_meta = {"pages": pdf_res.get("page_count", 1)}

    elif txt_bytes:
        source_type = "TXT Upload"
        txt_res = extract_txt_bytes(txt_bytes, filename=title)
        if not txt_res.get("success"):
            return {
                "success": False,
                "error": txt_res.get("error", "Failed to decode TXT file"),
                "stage": "Document Ingestion (TXT)"
            }
        text = txt_res["text"]

    else:
        text = clean_extracted_text(raw_text or "")
        if not text or len(text.split()) < 5:
            return {
                "success": False,
                "error": "Input text is too short or empty. Please provide valid terms & conditions text.",
                "stage": "Document Validation"
            }

    # Stage 2: Language & Document Statistics (Assignment 2)
    lang_info = detect_language(text)
    doc_stats = compute_document_statistics(text)
    token_samples = tokenize_text(text)

    # Stage 3: Stemming & Lemmatization (Assignment 3)
    stem_lemm_data = analyze_assignment_3(text)

    # Stage 4: POS Tagging & Embeddings (Assignment 4)
    pos_data = pos_tagging_analysis(text)

    # Stage 5: Named Entity Recognition (Assignment 5)
    ner_data = extract_named_entities(text)

    # Stage 6: TF-IDF Features (Assignment 6)
    tfidf_data = compute_document_tfidf(text)

    # Stage 7: N-gram Extraction (Assignment 7)
    ngrams_data = extract_all_ngrams(text)

    # Stage 8: N-gram Language Model (Assignment 8)
    lm_data = analyze_assignment_8(text, test_sequence="we collect personal information")

    # Stage 9: LDA Topic Modelling (Assignment 9)
    topic_data = perform_lda_topic_modelling(text)

    # Stage 10: Sentiment Analysis (Assignment 10)
    sentiment_data = analyze_assignment_10(text)

    # Stage 11: Risk Analysis Engine
    risk_data = analyze_document_risks(text)

    # Stage 12: Executive Summary Generation
    elapsed_time = round(time.time() - start_time, 2)

    summary = {
        "title": title,
        "source_type": source_type,
        "source_meta": source_meta,
        "processing_time_seconds": elapsed_time,
        "language": lang_info["language_name"],
        "word_count": doc_stats["total_words"],
        "sentence_count": doc_stats["total_sentences"],
        "estimated_reading_time_mins": doc_stats["estimated_reading_time_mins"],
        "risk_score": risk_data["overall_risk_score"],
        "risk_rating": risk_data["risk_rating"],
        "badge_color": risk_data["badge_color"],
        "rating_summary": risk_data["rating_summary"],
        "total_clauses": risk_data["total_clauses"],
        "high_risk_clauses_count": risk_data["high_risk_count"],
        "medium_risk_clauses_count": risk_data["medium_risk_count"],
        "low_risk_clauses_count": risk_data["low_risk_count"]
    }

    return {
        "success": True,
        "summary": summary,
        "risk_analysis": risk_data,
        "assignment_modules": {
            "assignment_1": {
                "name": "Web Scraping & Document Ingestion",
                "source_type": source_type,
                "source_meta": source_meta
            },
            "assignment_2": {
                "name": "Language Detection, Statistics & Tokenization",
                "language": lang_info,
                "statistics": doc_stats,
                "tokenization": token_samples,
                "huffpost_experiment": get_huffpost_experiment_data()
            },
            "assignment_3": {
                "name": "Stemming and Lemmatization",
                "data": stem_lemm_data
            },
            "assignment_4": {
                "name": "POS Tagging, Embeddings & Clause Classification",
                "pos_analysis": pos_data
            },
            "assignment_5": {
                "name": "Named Entity Recognition (NER)",
                "data": ner_data,
                "limitations_note": "General NER lacks training on legal contracts and misses statutory references or specialized roles."
            },
            "assignment_6": {
                "name": "TF-IDF Feature Weights",
                "data": tfidf_data
            },
            "assignment_7": {
                "name": "N-gram Models & Frequent Phrases",
                "data": ngrams_data
            },
            "assignment_8": {
                "name": "N-gram Language Model (Laplace Smoothing)",
                "data": lm_data
            },
            "assignment_9": {
                "name": "LDA Topic Modelling",
                "data": topic_data
            },
            "assignment_10": {
                "name": "Sentiment, Emotion & Opinion Mining",
                "data": sentiment_data
            }
        },
        "disclaimer": "Notice: This application is an educational NLP tool designed for informational assistance only. It does NOT replace professional legal advice."
    }

if __name__ == "__main__":
    sample = """
    TERMS OF SERVICE
    1. Your subscription will automatically renew at monthly rates unless cancelled.
    2. We collect your personal information and geolocation data continuously.
    3. You agree to resolve all disputes by binding arbitration and class action waiver.
    """
    res = run_complete_pipeline(raw_text=sample)
    print("Pipeline Success:", res["success"])
    print("Risk Score:", res["summary"]["risk_score"], "Rating:", res["summary"]["risk_rating"])
    print("Processing Time:", res["summary"]["processing_time_seconds"], "s")
