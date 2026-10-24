"""
Flask REST API Server for AI-Based Terms and Conditions Analyzer
Provides endpoints for:
- End-to-end NLP analysis (web scraping, PDF, TXT, text)
- Independent execution and interactive testing of all 10 NLP assignments
- SQLite persistence of analysis history
- PDF and JSON report downloads
- Sample agreements loader
"""

import os
import sys
import io
import json

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

from pipeline import run_complete_pipeline
from database import init_db, save_analysis, get_all_analyses, get_analysis_by_id, delete_analysis
from report_generator import generate_pdf_report
from modules.a1_web_scraping import scrape_url, check_robots_txt
from modules.a2_language_stats import analyze_assignment_2
from modules.a3_stem_lemmatize import analyze_assignment_3
from modules.a4_pos_embeddings_clf import analyze_assignment_4, classify_clause, demonstrate_embeddings_and_search
from modules.a5_ner import analyze_assignment_5
from modules.a6_tfidf import analyze_assignment_6
from modules.a7_ngrams import analyze_assignment_7
from modules.a8_language_model import analyze_assignment_8
from modules.a9_topic_modelling import analyze_assignment_9
from modules.a10_sentiment_opinion import analyze_assignment_10

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for React frontend

# Initialize database
init_db()

SAMPLE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sample_agreements")

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "AI-Based Terms and Conditions Analyzer",
        "version": "1.0.0",
        "assignments_supported": list(range(1, 11)),
        "disclaimer": "Informational assistance only. Does not replace professional legal advice."
    })

@app.route("/api/samples", methods=["GET"])
def list_samples():
    samples = [
        {
            "id": "streaming",
            "name": "OmniStream Entertainment (High Risk)",
            "description": "Streaming service terms with auto-renewals, location surveillance, forced arbitration, and liability disclaimers.",
            "filename": "sample_streaming_service.txt"
        },
        {
            "id": "ecommerce",
            "name": "Nordic Retail Store (Fair / Low Risk)",
            "description": "E-commerce consumer terms with 30-day refund guarantee, transparent privacy safeguards, and no data sales.",
            "filename": "sample_ecommerce_policy.txt"
        }
    ]
    return jsonify({"samples": samples})

@app.route("/api/samples/<sample_id>", methods=["GET"])
def get_sample_content(sample_id):
    filename_map = {
        "streaming": "sample_streaming_service.txt",
        "ecommerce": "sample_ecommerce_policy.txt"
    }
    filename = filename_map.get(sample_id)
    if not filename:
        return jsonify({"error": "Sample agreement not found"}), 404

    filepath = os.path.join(SAMPLE_DIR, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "Sample file missing on server"}), 404

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    return jsonify({"sample_id": sample_id, "content": content})

@app.route("/api/analyze", methods=["POST"])
def analyze_document():
    """
    Main entry point for complete NLP pipeline analysis.
    Supports JSON body (raw text or URL) or multipart/form-data (PDF or TXT upload).
    """
    title = "Terms & Conditions Document"

    if request.is_json:
        data = request.get_json() or {}
        text = data.get("text")
        url = data.get("url")
        title = data.get("title", url or "Terms and Conditions Analysis")

        res = run_complete_pipeline(raw_text=text, url=url, title=title)
    elif "file" in request.files:
        uploaded_file = request.files["file"]
        filename = uploaded_file.filename or "uploaded_agreement"
        title = request.form.get("title", filename)
        file_bytes = uploaded_file.read()

        if filename.lower().endswith(".pdf"):
            res = run_complete_pipeline(pdf_bytes=file_bytes, title=title)
        else:
            res = run_complete_pipeline(txt_bytes=file_bytes, title=title)
    else:
        text = request.form.get("text")
        url = request.form.get("url")
        title = request.form.get("title", url or "Terms and Conditions Analysis")
        res = run_complete_pipeline(raw_text=text, url=url, title=title)

    if not res.get("success"):
        return jsonify(res), 400

    # Persist in SQLite
    try:
        row_id = save_analysis(res)
        res["saved_id"] = row_id
    except Exception as e:
        res["db_warning"] = f"Failed to persist in SQLite: {str(e)}"

    return jsonify(res)

@app.route("/api/history", methods=["GET"])
def get_history():
    analyses = get_all_analyses(limit=50)
    return jsonify({"history": analyses, "count": len(analyses)})

@app.route("/api/history/<int:analysis_id>", methods=["GET"])
def get_history_detail(analysis_id):
    report_data = get_analysis_by_id(analysis_id)
    if not report_data:
        return jsonify({"error": "Analysis not found"}), 404
    return jsonify(report_data)

@app.route("/api/history/<int:analysis_id>", methods=["DELETE"])
def delete_history_item(analysis_id):
    deleted = delete_analysis(analysis_id)
    return jsonify({"success": deleted, "deleted_id": analysis_id})

@app.route("/api/report/pdf/<int:analysis_id>", methods=["GET"])
def download_pdf_by_id(analysis_id):
    report_data = get_analysis_by_id(analysis_id)
    if not report_data:
        return jsonify({"error": "Analysis not found"}), 404

    pdf_buffer = generate_pdf_report(report_data)
    title_slug = report_data.get("summary", {}).get("title", "report").replace(" ", "_")[:30]
    return send_file(
        pdf_buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"legal_analysis_{title_slug}_{analysis_id}.pdf"
    )

def generate_markdown_report(report_data: dict) -> str:
    summary = report_data.get("summary", {})
    risk = report_data.get("risk_analysis", {})
    matrix = risk.get("threat_matrix", [])
    flagged = risk.get("top_flagged_clauses", [])

    md = []
    md.append(f"# AI Terms & Conditions Analysis Report")
    md.append(f"**Document Title:** {summary.get('title', 'Agreement')}")
    md.append(f"**Overall Risk Rating:** {summary.get('risk_score', 0)}/100 ({summary.get('risk_rating', 'Unknown')})")
    md.append(f"**Clauses Evaluated:** {summary.get('total_clauses', 0)} | **High Risk:** {summary.get('high_risk_clauses_count', 0)} | **Medium Risk:** {summary.get('medium_risk_clauses_count', 0)}")
    md.append(f"**Word Count:** {summary.get('word_count', 0)} words (~{summary.get('estimated_reading_time_mins', 0)} min reading time)\n")
    md.append(f"---\n")
    md.append(f"## 1. Executive Summary")
    md.append(f"{summary.get('rating_summary', '')}\n")

    md.append(f"## 2. Consumer Threat Matrix: At a Glance")
    for item in matrix:
        status_icon = "🔴" if item.get("status") == "danger" else "🟢"
        md.append(f"### {status_icon} {item.get('name')}")
        md.append(f"- **Status:** {item.get('status').upper()} (Found in {item.get('found_count', 0)} clause(s))")
        md.append(f"- **Summary:** {item.get('summary')}")
        if item.get("matched_clauses"):
            md.append(f"- **Matched Excerpt:** *\"{item['matched_clauses'][0]['clause']}\"*")
        md.append("")

    md.append(f"## 3. Detailed Flagged Clauses")
    for idx, fc in enumerate(flagged, 1):
        md.append(f"### #{idx}. [{fc.get('risk_level', 'High').upper()}] {fc.get('category', 'General')}")
        md.append(f"> \"{fc.get('text', '')}\"\n")
        flags = fc.get("matched_flags", [])
        if flags:
            md.append(f"- **Why this is concerning:** {flags[0].get('reason', '')}")
            md.append(f"- **Recommendation:** {flags[0].get('recommendation', '')}\n")

    md.append(f"---\n")
    md.append(f"## Statutory Legal Disclaimer")
    md.append(f"{report_data.get('disclaimer', 'This application is an educational NLP tool and does not provide formal legal advice.')}")
    return "\n".join(md)

@app.route("/api/report/md/<int:analysis_id>", methods=["GET"])
def download_md_by_id(analysis_id):
    report_data = get_analysis_by_id(analysis_id)
    if not report_data:
        return jsonify({"error": "Analysis not found"}), 404

    md_content = generate_markdown_report(report_data)
    title_slug = report_data.get("summary", {}).get("title", "report").replace(" ", "_")[:30]
    bio = io.BytesIO(md_content.encode('utf-8'))
    return send_file(
        bio,
        mimetype="text/markdown",
        as_attachment=True,
        download_name=f"legal_analysis_{title_slug}_{analysis_id}.md"
    )

@app.route("/api/report/md", methods=["POST"])
def download_md_from_payload():
    data = request.get_json() or {}
    md_content = generate_markdown_report(data)
    bio = io.BytesIO(md_content.encode('utf-8'))
    return send_file(
        bio,
        mimetype="text/markdown",
        as_attachment=True,
        download_name="legal_risk_analysis_report.md"
    )

@app.route("/api/report/pdf", methods=["POST"])
def download_pdf_from_payload():
    data = request.get_json() or {}
    pdf_buffer = generate_pdf_report(data)
    return send_file(
        pdf_buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name="legal_risk_analysis_report.pdf"
    )

# ==========================================
# Dedicated Endpoints for 10 NLP Assignments
# ==========================================

@app.route("/api/assignment/1/scrape", methods=["POST"])
def assignment_1_scrape():
    data = request.get_json() or {}
    url = data.get("url", "")
    enforce_robots = data.get("enforce_robots", True)
    result = scrape_url(url, enforce_robots=enforce_robots)
    return jsonify(result)

@app.route("/api/assignment/2/stats", methods=["POST"])
def assignment_2_stats():
    data = request.get_json() or {}
    text = data.get("text", "")
    result = analyze_assignment_2(text)
    return jsonify(result)

@app.route("/api/assignment/3/stem-lemm", methods=["POST"])
def assignment_3_stem_lemm():
    data = request.get_json() or {}
    text = data.get("text", "")
    words = data.get("words", [])
    result = analyze_assignment_3(text, custom_words=words)
    return jsonify(result)

@app.route("/api/assignment/4/pos-clf", methods=["POST"])
def assignment_4_pos_clf():
    data = request.get_json() or {}
    text = data.get("text", "")
    query = data.get("query", "cancel my subscription")
    result = analyze_assignment_4(text, test_query=query)
    return jsonify(result)

@app.route("/api/assignment/4/classify-clause", methods=["POST"])
def assignment_4_classify_single():
    data = request.get_json() or {}
    clause = data.get("clause", "")
    result = classify_clause(clause)
    return jsonify(result)

@app.route("/api/assignment/5/ner", methods=["POST"])
def assignment_5_ner():
    data = request.get_json() or {}
    text = data.get("text", "")
    result = analyze_assignment_5(text)
    return jsonify(result)

@app.route("/api/assignment/6/tfidf", methods=["POST"])
def assignment_6_tfidf():
    data = request.get_json() or {}
    text = data.get("text", "")
    result = analyze_assignment_6(text)
    return jsonify(result)

@app.route("/api/assignment/7/ngrams", methods=["POST"])
def assignment_7_ngrams():
    data = request.get_json() or {}
    text = data.get("text", "")
    result = analyze_assignment_7(text)
    return jsonify(result)

@app.route("/api/assignment/8/language-model", methods=["POST"])
def assignment_8_lm():
    data = request.get_json() or {}
    corpus = data.get("corpus", "")
    sequence = data.get("sequence", "we collect personal information")
    result = analyze_assignment_8(corpus, test_sequence=sequence)
    return jsonify(result)

@app.route("/api/assignment/9/topic-model", methods=["POST"])
def assignment_9_topics():
    data = request.get_json() or {}
    text = data.get("text", "")
    n_topics = int(data.get("n_topics", 4))
    result = analyze_assignment_9(text)
    return jsonify(result)

@app.route("/api/assignment/10/sentiment", methods=["POST"])
def assignment_10_sentiment():
    data = request.get_json() or {}
    text = data.get("text", "")
    result = analyze_assignment_10(text)
    return jsonify(result)

if __name__ == "__main__":
    print("Starting AI Terms & Conditions Analyzer Server on port 5000...")
    app.run(host="127.0.0.1", port=5000, debug=True)
