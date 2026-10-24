"""
NLP Assignments 1 to 10 Modules Package
"""
from .a1_web_scraping import scrape_url, extract_pdf_bytes, extract_txt_bytes
from .a2_language_stats import analyze_assignment_2, detect_language, compute_document_statistics
from .a3_stem_lemmatize import analyze_assignment_3, compare_stemming_and_lemmatization
from .a4_pos_embeddings_clf import analyze_assignment_4, classify_clause, pos_tagging_analysis
from .a5_ner import analyze_assignment_5, extract_named_entities
from .a6_tfidf import analyze_assignment_6, compute_document_tfidf
from .a7_ngrams import analyze_assignment_7, extract_all_ngrams
from .a8_language_model import analyze_assignment_8, NGramLanguageModel
from .a9_topic_modelling import analyze_assignment_9, perform_lda_topic_modelling
from .a10_sentiment_opinion import analyze_assignment_10, analyze_clause_sentiment
