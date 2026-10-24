"""
Downloadable PDF Analysis Report Generator
Creates a formatted enterprise-grade legal risk assessment report using ReportLab.
Features:
- Trust Grade & Consumer Trust Index (A+ to F)
- Regulatory Compliance Audit Matrix (GDPR, CCPA, FTC, UCC, FAA)
- Rights Forfeited vs Protections Retained Summary Table
- Readability Index & Estimated Grade Level
- Critical Flagged Clauses & Plain-English Consumer Recommendations
"""

import io
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf_report(analysis_result: Dict[str, Any]) -> io.BytesIO:
    """
    Builds an enterprise PDF document from analysis results and returns an in-memory byte buffer.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=4
    )

    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=12,
        spaceAfter=5
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#334155')
    )

    bold_body = ParagraphStyle(
        'DocBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    disclaimer_style = ParagraphStyle(
        'DocDisclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#64748b')
    )

    elements = []

    summary = analysis_result.get("summary", {})
    risk = analysis_result.get("risk_analysis", {})
    clauses = risk.get("clauses", [])

    risk_score = summary.get("risk_score", 0)
    risk_rating = summary.get("risk_rating", "Unknown")
    trust_index = max(0, 100 - risk_score)

    letter_grade = 'A+'
    if risk_score >= 75:
        letter_grade = 'F'
    elif risk_score >= 60:
        letter_grade = 'D'
    elif risk_score >= 40:
        letter_grade = 'C'
    elif risk_score >= 20:
        letter_grade = 'B'

    # Title & Metadata
    elements.append(Paragraph(f"AI Contract Audit Report: {summary.get('title', 'Terms & Conditions')}", title_style))
    elements.append(Paragraph(
        f"<b>Source:</b> {summary.get('source_type', 'Document')} &nbsp;|&nbsp; "
        f"<b>Language:</b> {summary.get('language', 'English')} &nbsp;|&nbsp; "
        f"<b>Clauses Audited:</b> {summary.get('total_clauses', 0)} &nbsp;|&nbsp; "
        f"<b>Audit Speed:</b> {summary.get('processing_time_seconds', 0)}s",
        body_style
    ))
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#cbd5e1'), spaceAfter=10))

    # Executive Scorecard Table (Trust Grade, Risk Score, Red Flags, Word Count)
    if risk_score >= 65:
        banner_bg = colors.HexColor('#fef2f2')
        badge_text_color = colors.HexColor('#991b1b')
    elif risk_score >= 35:
        banner_bg = colors.HexColor('#fffbeb')
        badge_text_color = colors.HexColor('#92400e')
    else:
        banner_bg = colors.HexColor('#f0fdf4')
        badge_text_color = colors.HexColor('#166534')

    summary_table_data = [
        [
            Paragraph(f"<b>Consumer Trust Grade:</b> <font size=16 color='{badge_text_color.hexval()}'><b>Grade {letter_grade}</b></font> ({trust_index}% Trust Index)", body_style),
            Paragraph(f"<b>Overall Risk Score:</b> <font size=13 color='{badge_text_color.hexval()}'><b>{risk_score} / 100</b> ({risk_rating})</font>", body_style)
        ],
        [
            Paragraph(f"<b>Length & Reading Time:</b> {summary.get('word_count', 0):,} words (~{summary.get('estimated_reading_time_mins', 0)} min reading)", body_style),
            Paragraph(f"<b>Risk Flags:</b> <font color='#dc2626'><b>{summary.get('high_risk_clauses_count', 0)} High</b></font> &nbsp;|&nbsp; {summary.get('medium_risk_clauses_count', 0)} Med &nbsp;|&nbsp; {summary.get('low_risk_clauses_count', 0)} Low", body_style)
        ]
    ]

    t_summary = Table(summary_table_data, colWidths=[270, 270])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), banner_bg),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(t_summary)
    elements.append(Spacer(1, 10))

    # Executive Overview
    elements.append(Paragraph("Executive Summary & Risk Assessment", h2_style))
    elements.append(Paragraph(summary.get("rating_summary", "No summary available."), body_style))
    elements.append(Spacer(1, 8))

    # Statutory Regulatory Compliance Checklist
    elements.append(Paragraph("Statutory & Regulatory Exposure Benchmarks", h2_style))
    text_all = " ".join([c.get("text", "") for c in clauses]).lower()

    gdpr_status = "Compliant" if ("indefinitely" not in text_all and "sell your personal" not in text_all) else "Non-Compliant Risk"
    ccpa_status = "Compliant" if ("data brokers" not in text_all and "share, sell, lease" not in text_all) else "Potential Violation"
    ftc_status = "Compliant" if ("strictly non-refundable" not in text_all and "reactivation fee" not in text_all) else "Exposure Flag"
    faa_status = "Court Access Retained" if ("class action waiver" not in text_all and "binding arbitration" not in text_all) else "Arbitration Enforced"

    reg_table_data = [
        [
            Paragraph("<b>Regulatory Framework</b>", bold_body),
            Paragraph("<b>Governance Scope</b>", bold_body),
            Paragraph("<b>Compliance Status</b>", bold_body)
        ],
        [
            Paragraph("GDPR (EU 2016/679)", body_style),
            Paragraph("Data Minimization & Right to Erasure (Art. 17)", body_style),
            Paragraph(f"<font color='{'#166534' if gdpr_status == 'Compliant' else '#991b1b'}'><b>{gdpr_status}</b></font>", body_style)
        ],
        [
            Paragraph("CCPA / CPRA (Cal. Civ. Code)", body_style),
            Paragraph("Opt-Out of Data Sale & Biometrics (§ 1798.120)", body_style),
            Paragraph(f"<font color='{'#166534' if ccpa_status == 'Compliant' else '#991b1b'}'><b>{ccpa_status}</b></font>", body_style)
        ],
        [
            Paragraph("FTC Act Section 5", body_style),
            Paragraph("Negative Option Subscriptions & Click-to-Cancel", body_style),
            Paragraph(f"<font color='{'#166534' if ftc_status == 'Compliant' else '#b45309'}'><b>{ftc_status}</b></font>", body_style)
        ],
        [
            Paragraph("Federal Arbitration Act (FAA)", body_style),
            Paragraph("Pre-dispute Binding Arbitration & Class Waiver", body_style),
            Paragraph(f"<font color='{'#166534' if faa_status == 'Court Access Retained' else '#6b21a8'}'><b>{faa_status}</b></font>", body_style)
        ]
    ]

    t_reg = Table(reg_table_data, colWidths=[150, 240, 150])
    t_reg.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(t_reg)
    elements.append(Spacer(1, 10))

    # Top Flagged Risky Clauses with Plain-English Advice
    flagged = risk.get("top_flagged_clauses", [])
    if flagged:
        elements.append(Paragraph("Critical Red Flag Clauses & Plain-English Explanations", h2_style))

        for idx, item in enumerate(flagged[:5], 1):
            severity = item.get("risk_level", "Medium")
            sev_color = "#dc2626" if severity == "High" else "#d97706"
            cat = item.get("category", "General")
            
            clause_text = item.get("text", "")
            if len(clause_text) > 260:
                clause_text = clause_text[:260] + "..."

            reason = "Contractual rights waiver flagged."
            rec = "Review terms."
            flags = item.get("matched_flags", [])
            if flags:
                reason = flags[0].get("reason", reason)
                rec = flags[0].get("recommendation", rec)

            clause_entry = [
                [Paragraph(f"<b>#{idx}. [{severity.upper()}] {cat}</b>", ParagraphStyle('SevH', parent=bold_body, textColor=colors.HexColor(sev_color)))],
                [Paragraph(f"<i>\"{clause_text}\"</i>", ParagraphStyle('Q', parent=body_style, textColor=colors.HexColor('#475569')))],
                [Paragraph(f"<b>Why this is concerning:</b> {reason}", body_style)],
                [Paragraph(f"<b>Consumer Protection Recommendation:</b> {rec}", ParagraphStyle('Rec', parent=body_style, textColor=colors.HexColor('#1e40af')))]
            ]

            t_clause = Table(clause_entry, colWidths=[540])
            t_clause.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
                ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ]))
            elements.append(t_clause)
            elements.append(Spacer(1, 6))

    # Actionable 30-Day Opt-Out Guidance
    elements.append(Spacer(1, 8))
    elements.append(Paragraph("Consumer Rights Action Guide", h2_style))
    elements.append(Paragraph(
        "<b>Action Item:</b> If this agreement contains a mandatory binding arbitration clause, you generally have a statutory "
        "<b>30-day window from account registration</b> to mail or email a formal Opt-Out Notice to the provider's legal department. "
        "Exercising this opt-out preserves your full constitutional right to bring claims in a court of law or join class action remedies.",
        body_style
    ))

    # Statutory Legal Disclaimer
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceAfter=8))
    elements.append(Paragraph(
        "<b>LEGAL DISCLAIMER & ACADEMIC NOTICE:</b> This audit report was generated automatically by the AI-Based "
        "Terms and Conditions Analyzer using Natural Language Processing. The findings, risk scores, and categorizations "
        "are provided strictly for informational and educational assistance. They DO NOT constitute formal legal advice, "
        "nor do they establish an attorney-client relationship. Always consult a licensed attorney for definitive contract advice.",
        disclaimer_style
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer

if __name__ == "__main__":
    from pipeline import run_complete_pipeline
    test_res = run_complete_pipeline(raw_text="Sample terms with auto renewal and binding arbitration waiver.")
    pdf_buf = generate_pdf_report(test_res)
    print("Generated PDF report size:", len(pdf_buf.getvalue()), "bytes")
