"""
Assignment 5: Named Entity Recognition (NER) and Legal Domain Limitations
- Entity extraction using spaCy (ORG, DATE, MONEY, PERCENT, GPE, LAW, PRODUCT).
- Entity frequency distributions and span offsets.
- Critical academic analysis of general-purpose NER limitations in legal contracts.
"""

from typing import Dict, Any, List
import spacy

_NLP_MODEL = None

ENTITY_DESCRIPTIONS = {
    "ORG": "Companies, agencies, third parties, data brokers, or institutions",
    "DATE": "Notice periods, agreement effective dates, billing deadlines",
    "MONEY": "Subscription fees, reactivation penalties, liability caps",
    "PERCENT": "Interest rates, fee percentages, cancellation charge rates",
    "GPE": "Countries, states, cities, or legal jurisdictions",
    "LAW": "Statutes, regulations, acts (e.g., GDPR, CCPA, DMCA)",
    "PRODUCT": "Platforms, software, applications, or commercial services",
    "PERSON": "Named corporate officers, agents, or designated contacts",
    "CARDINAL": "Numerals, period counts, day limits"
}

def get_spacy_model():
    """
    Lazy loads the spaCy model.
    """
    global _NLP_MODEL
    if _NLP_MODEL is None:
        _NLP_MODEL = spacy.load("en_core_web_sm")
    return _NLP_MODEL

def extract_named_entities(text: str) -> Dict[str, Any]:
    """
    Extracts named entities from the text and categorizes them.
    """
    if not text or not text.strip():
        return {"entities": [], "counts_by_type": {}, "total_entities": 0}

    nlp = get_spacy_model()
    # Process up to 50,000 characters to keep execution snappy in interactive environments
    doc = nlp(text[:50000])

    relevant_types = {"ORG", "DATE", "MONEY", "PERCENT", "GPE", "LAW", "PRODUCT", "PERSON", "CARDINAL"}
    entities = []
    counts_by_type = {}
    seen = set()

    for ent in doc.ents:
        if ent.label_ in relevant_types:
            clean_text = ent.text.strip().replace("\n", " ")
            if len(clean_text) < 2:
                continue

            key = (clean_text.lower(), ent.label_)
            if key not in seen:
                seen.add(key)
                entities.append({
                    "text": clean_text,
                    "label": ent.label_,
                    "label_description": ENTITY_DESCRIPTIONS.get(ent.label_, ent.label_),
                    "start_char": ent.start_char,
                    "end_char": ent.end_char
                })
                counts_by_type[ent.label_] = counts_by_type.get(ent.label_, 0) + 1

    return {
        "entities": entities[:100],  # Return up to 100 unique entities
        "counts_by_type": counts_by_type,
        "total_unique_entities": len(entities)
    }

def analyze_assignment_5(text: str) -> Dict[str, Any]:
    """
    Unified execution function for Assignment 5.
    """
    ner_data = extract_named_entities(text)

    return {
        "assignment": "Assignment 5: Named Entity Recognition (NER)",
        "entity_extraction": ner_data,
        "legal_ner_limitations_report": {
            "title": "Limitations of General-Purpose NER on Legal and Regulatory Documents",
            "findings": [
                {
                    "issue": "Training Domain Mismatch",
                    "explanation": (
                        "General-purpose NER models (like spaCy's en_core_web_sm) are trained on OntoNotes 5.0, "
                        "which consists predominantly of broadcast news, telephone conversations, and weblogs. "
                        "Consequently, they lack knowledge of specialized legal terminology and formal deontic phrasing."
                    )
                },
                {
                    "issue": "Failure on Legal Roles vs. Proper Names",
                    "explanation": (
                        "In contracts, critical actors are designated by defined legal roles ('Data Controller', "
                        "'Sub-processor', 'Indemnitee', 'Licensor', 'Third-Party Beneficiary') rather than named corporations. "
                        "General models fail to recognize these capitalized functional roles as entities."
                    )
                },
                {
                    "issue": "Statutory Citation Misclassification",
                    "explanation": (
                        "Complex statutory citations (e.g., '15 U.S.C. § 1681', 'Cal. Civ. Code § 1798.100', 'Regulation (EU) 2016/679') "
                        "are frequently fragmented or erroneously tagged as dates or cardinal numbers instead of LAW entities."
                    )
                },
                {
                    "issue": "Case-Sensitivity Distortion in All-Caps Boilerplates",
                    "explanation": (
                        "Standard legal boilerplate sections (e.g., WARRANTY DISCLAIMERS and LIMITATION OF LIABILITY) "
                        "are drafted in ALL-CAPITAL LETTERS to satisfy statutory 'conspicuousness' requirements under the UCC. "
                        "Standard capitalization features fail on all-caps text, leading to high false-negative rates."
                    )
                },
                {
                    "issue": "Recommended Solution for Production Legal Systems",
                    "explanation": (
                        "Production legal intelligence pipelines must fine-tune domain-specific transformer models "
                        "(such as Legal-BERT or LexGLUE) with custom annotation schemas for legal covenants and jurisdiction clauses."
                    )
                }
            ]
        }
    }

if __name__ == "__main__":
    sample = "OmniStream LLC based in New York, NY charges $75 for cancellation under CCPA regulations effective January 1, 2026."
    res = analyze_assignment_5(sample)
    print("Entities found:", res["entity_extraction"]["total_unique_entities"])
    for e in res["entity_extraction"]["entities"]:
        print(f" - {e['text']} [{e['label']}]")
