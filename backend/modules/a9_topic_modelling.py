"""
Assignment 9: Topic Modelling (Latent Dirichlet Allocation - LDA)
- Discovers recurring latent legal themes across clauses.
- Outputs topic-word distributions and per-document topic mixture vectors.
- Emphasizes that unsupervised topics require human interpretation to assign meaningful domain labels.
"""

import re
from typing import Dict, Any, List
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation

# Domain heuristic labels mapped to common word clusters in legal text
THEMATIC_LABELS = [
    {"keywords": {"privacy", "information", "personal", "data", "collect", "cookies", "tracking"}, "label": "Data Privacy & Tracking"},
    {"keywords": {"subscription", "billing", "fee", "payment", "renewal", "automatic", "charge", "refund"}, "label": "Billing & Subscriptions"},
    {"keywords": {"liability", "damages", "disclaimer", "warranty", "warranties", "incidental", "consequential"}, "label": "Liability & Disclaimers"},
    {"keywords": {"terminate", "suspension", "termination", "breach", "notice", "discretion"}, "label": "Termination & Suspension"},
    {"keywords": {"arbitration", "dispute", "court", "class", "action", "waiver", "jurisdiction"}, "label": "Dispute Resolution & Arbitration"},
    {"keywords": {"content", "license", "copyright", "intellectual", "property", "trademark", "user"}, "label": "IP & User Content License"}
]

def perform_lda_topic_modelling(text: str, n_topics: int = 4, top_words_per_topic: int = 7) -> Dict[str, Any]:
    """
    Fits an LDA topic model over document clauses or paragraphs.
    """
    if not text or len(text.strip()) < 50:
        return {"topics": [], "document_topic_distribution": [], "error": "Insufficient text for topic modelling"}

    # Split into clauses or sentences to serve as documents in the LDA corpus
    clauses = [c.strip() for c in re.split(r"\n\s*\n|\.\s+", text) if len(c.strip()) > 25]
    if len(clauses) < 4:
        # Augment by splitting sentences
        clauses = [s.strip() for s in re.split(r"[.!?]+", text) if len(s.strip()) > 15]

    if len(clauses) < n_topics:
        n_topics = max(2, len(clauses))

    vectorizer = CountVectorizer(
        stop_words="english",
        max_features=1200,
        min_df=1,
        ngram_range=(1, 2)
    )

    try:
        dtm = vectorizer.fit_transform(clauses)
        feature_names = vectorizer.get_feature_names_out()

        lda = LatentDirichletAllocation(
            n_components=n_topics,
            random_state=42,
            max_iter=25,
            learning_method="online"
        )
        lda.fit(dtm)

        topics_data = []
        for topic_idx, topic in enumerate(lda.components_):
            top_feature_indices = topic.argsort()[::-1][:top_words_per_topic]
            top_words = []
            topic_word_set = set()

            for idx in top_feature_indices:
                word = feature_names[idx]
                weight = float(topic[idx])
                top_words.append({"word": word, "weight": round(weight, 2)})
                topic_word_set.add(word.split()[0].lower())

            # Infer human-friendly thematic label
            best_label = f"Topic {topic_idx + 1}: General Contractual Terms"
            max_overlap = 0
            for tl in THEMATIC_LABELS:
                overlap = len(topic_word_set.intersection(tl["keywords"]))
                if overlap > max_overlap:
                    max_overlap = overlap
                    best_label = f"Topic {topic_idx + 1}: {tl['label']}"

            topics_data.append({
                "topic_id": topic_idx + 1,
                "suggested_label": best_label,
                "top_words": top_words
            })

        # Calculate whole document topic distribution
        doc_dtm = vectorizer.transform([text])
        doc_dist = lda.transform(doc_dtm)[0]
        topic_mixture = [
            {
                "topic_id": idx + 1,
                "label": topics_data[idx]["suggested_label"],
                "prevalence_pct": round(float(prob) * 100, 1)
            }
            for idx, prob in enumerate(doc_dist)
        ]
        topic_mixture.sort(key=lambda x: x["prevalence_pct"], reverse=True)

        return {
            "n_topics": n_topics,
            "clauses_analyzed": len(clauses),
            "topics": topics_data,
            "document_topic_mixture": topic_mixture,
            "perplexity": round(float(lda.perplexity(dtm)), 2)
        }

    except Exception as e:
        return {"topics": [], "document_topic_distribution": [], "error": str(e)}

def analyze_assignment_9(text: str) -> Dict[str, Any]:
    """
    Unified execution function for Assignment 9.
    """
    lda_res = perform_lda_topic_modelling(text)
    return {
        "assignment": "Assignment 9: Latent Dirichlet Allocation (LDA) Topic Modelling",
        "lda_results": lda_res,
        "academic_explanation": (
            "IMPORTANT INTERPRETABILITY PRINCIPLE: LDA is an unsupervised generative probabilistic model. "
            "It groups co-occurring words into latent Dirichlet distributions. LDA does NOT understand legal doctrine; "
            "it only groups words that tend to appear together. Human legal analysts must interpret and label the "
            "discovered topics based on domain context."
        )
    }

if __name__ == "__main__":
    sample = """
    We collect personal data and browsing history for targeted advertising. 
    Your subscription will automatically renew at monthly billing rates unless canceled.
    Any dispute will be resolved exclusively through binding individual arbitration.
    The company disclaims all liability for incidental, indirect, or consequential damages.
    """
    res = analyze_assignment_9(sample)
    print("Topics discovered:", len(res["lda_results"].get("topics", [])))
    for t in res["lda_results"].get("topics", []):
        print(" -", t["suggested_label"], [w["word"] for w in t["top_words"][:3]])
