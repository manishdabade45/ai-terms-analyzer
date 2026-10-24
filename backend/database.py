"""
SQLite Database Storage for Terms & Conditions Analyses
Persists document summaries, risk scores, and full pipeline analysis reports.
"""

import json
import os
import sqlite3
from typing import Dict, Any, List, Optional
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tos_analyzer.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """
    Initializes the SQLite database tables.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            source_type TEXT NOT NULL,
            source_url TEXT,
            risk_score INTEGER NOT NULL,
            risk_rating TEXT NOT NULL,
            badge_color TEXT NOT NULL,
            total_clauses INTEGER DEFAULT 0,
            high_risk_count INTEGER DEFAULT 0,
            medium_risk_count INTEGER DEFAULT 0,
            low_risk_count INTEGER DEFAULT 0,
            word_count INTEGER DEFAULT 0,
            language TEXT DEFAULT 'English',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            summary_json TEXT NOT NULL,
            report_data_json TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def save_analysis(full_result: Dict[str, Any]) -> int:
    """
    Saves an analysis record into SQLite and returns the generated row ID.
    """
    summary = full_result.get("summary", {})
    risk_analysis = full_result.get("risk_analysis", {})

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO analyses (
            title, source_type, source_url, risk_score, risk_rating,
            badge_color, total_clauses, high_risk_count, medium_risk_count,
            low_risk_count, word_count, language, created_at,
            summary_json, report_data_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        summary.get("title", "Untitled Agreement"),
        summary.get("source_type", "Text"),
        summary.get("source_meta", {}).get("url", ""),
        summary.get("risk_score", 0),
        summary.get("risk_rating", "Unknown"),
        summary.get("badge_color", "emerald"),
        summary.get("total_clauses", 0),
        summary.get("high_risk_clauses_count", 0),
        summary.get("medium_risk_clauses_count", 0),
        summary.get("low_risk_clauses_count", 0),
        summary.get("word_count", 0),
        summary.get("language", "English"),
        datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        json.dumps(summary),
        json.dumps(full_result)
    ))
    row_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return row_id

def get_all_analyses(limit: int = 50) -> List[Dict[str, Any]]:
    """
    Retrieves all past saved analyses ordered by recency.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, title, source_type, source_url, risk_score, risk_rating,
               badge_color, total_clauses, high_risk_count, medium_risk_count,
               low_risk_count, word_count, language, created_at
        FROM analyses
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results

def get_analysis_by_id(analysis_id: int) -> Optional[Dict[str, Any]]:
    """
    Fetches full report data for a specific analysis by its ID.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT report_data_json FROM analyses WHERE id = ?", (analysis_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return json.loads(row["report_data_json"])
    return None

def delete_analysis(analysis_id: int) -> bool:
    """
    Deletes an analysis record.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM analyses WHERE id = ?", (analysis_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

# Initialize database on import
init_db()
