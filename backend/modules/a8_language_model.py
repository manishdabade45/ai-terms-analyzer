"""
Assignment 8: N-gram Language Model with Laplace/Add-k Smoothing
- Implements Bigram and Trigram statistical language models.
- Calculates conditional probabilities, joint sequence log-probabilities, and Perplexity.
- Implements Add-1 (Laplace) and Add-k smoothing to eliminate zero-probability barriers.
- Prominent educational disclaimer on the purpose and limits of statistical language models.
"""

from collections import Counter, defaultdict
import math
import re
from typing import Dict, Any, List

class NGramLanguageModel:
    """
    Bigram and Trigram Language Model with Laplace/Add-k smoothing.
    """
    def __init__(self, k_smoothing: float = 1.0):
        self.k = k_smoothing
        self.unigram_counts = Counter()
        self.bigram_counts = Counter()
        self.trigram_counts = Counter()
        self.vocabulary = set()
        self.total_tokens = 0

    def train(self, corpus_text: str):
        """
        Trains the language model on the provided text.
        """
        sentences = re.split(r"[.!?\n]+", corpus_text.lower())
        for s in sentences:
            tokens = ["<s>"] + re.findall(r"\b[a-zA-Z0-9'-]+\b", s) + ["</s>"]
            if len(tokens) <= 2:
                continue

            for t in tokens:
                self.unigram_counts[t] += 1
                self.vocabulary.add(t)
                self.total_tokens += 1

            for i in range(len(tokens) - 1):
                self.bigram_counts[(tokens[i], tokens[i+1])] += 1

            for i in range(len(tokens) - 2):
                self.trigram_counts[(tokens[i], tokens[i+1], tokens[i+2])] += 1

    def get_bigram_prob(self, w1: str, w2: str) -> float:
        """
        Calculates P(w2 | w1) using Add-k (Laplace) smoothing.
        Formula: (Count(w1, w2) + k) / (Count(w1) + k * |V|)
        """
        V = len(self.vocabulary) or 1
        c_bigram = self.bigram_counts.get((w1, w2), 0)
        c_unigram = self.unigram_counts.get(w1, 0)
        return (c_bigram + self.k) / (c_unigram + self.k * V)

    def evaluate_sequence(self, sequence: str) -> Dict[str, Any]:
        """
        Evaluates the joint probability and perplexity of an input word sequence.
        """
        raw_tokens = re.findall(r"\b[a-zA-Z0-9'-]+\b", sequence.lower())
        if not raw_tokens:
            return {"error": "Sequence contains no valid tokens"}

        tokens = ["<s>"] + raw_tokens + ["</s>"]
        log_prob_sum = 0.0
        step_probabilities = []
        V = len(self.vocabulary) or 1

        for i in range(len(tokens) - 1):
            w1 = tokens[i]
            w2 = tokens[i + 1]
            p = self.get_bigram_prob(w1, w2)
            log2_p = math.log2(p)
            log_prob_sum += log2_p
            step_probabilities.append({
                "transition": f"P({w2} | {w1})",
                "count_pair": self.bigram_counts.get((w1, w2), 0),
                "count_history": self.unigram_counts.get(w1, 0),
                "probability": round(p, 6),
                "log2_prob": round(log2_p, 4)
            })

        n_transitions = len(step_probabilities)
        avg_neg_log_prob = - (log_prob_sum / n_transitions) if n_transitions > 0 else 0
        perplexity = 2 ** avg_neg_log_prob
        joint_prob_scientific = f"2^({round(log_prob_sum, 2)}) ≈ {2**log_prob_sum:.2e}" if log_prob_sum > -100 else "< 1e-30"

        return {
            "input_sequence": sequence,
            "tokens_analyzed": raw_tokens,
            "transitions": step_probabilities,
            "joint_log2_probability": round(log_prob_sum, 4),
            "joint_probability_approx": joint_prob_scientific,
            "perplexity": round(perplexity, 2),
            "smoothing_k": self.k,
            "vocabulary_size": V,
            "interpretation": (
                "Lower perplexity indicates that this phrase closely mirrors the statistical drafting patterns "
                "of the training corpus. Higher perplexity indicates atypical, novel, or uncommon legal phrasing."
            )
        }

def analyze_assignment_8(corpus_text: str, test_sequence: str = "we collect personal information") -> Dict[str, Any]:
    """
    Trains a language model on the input text (or default corpus) and evaluates a test phrase.
    """
    # Augment corpus if short
    training_data = corpus_text
    if len(training_data.split()) < 50:
        training_data += """
        We collect personal information when you register for an account.
        Your subscription will automatically renew unless cancelled.
        Any dispute will be settled by binding arbitration in accordance with commercial rules.
        We reserve the right to modify these terms of service without prior notice.
        """

    lm = NGramLanguageModel(k_smoothing=1.0)
    lm.train(training_data)

    eval_result = lm.evaluate_sequence(test_sequence)

    return {
        "assignment": "Assignment 8: N-gram Language Model",
        "model_type": "Bigram Language Model with Laplace (Add-1) Smoothing",
        "evaluation": eval_result,
        "academic_clarification": (
            "CRITICAL NLP CLARIFICATION: This N-gram Language Model is a statistical generative model "
            "that quantifies how probable a sequence of words is under learned transition frequencies. "
            "It is purely an NLP language-model demonstration. It does NOT detect legal risk, liability, or unfairness."
        )
    }

if __name__ == "__main__":
    sample_corpus = """
    We collect personal information when you create an account. 
    We may share personal information with third party partners.
    Your subscription automatically renews each month.
    """
    res = analyze_assignment_8(sample_corpus, "we collect personal information")
    print("Perplexity:", res["evaluation"]["perplexity"])
    print("Joint Log2 Prob:", res["evaluation"]["joint_log2_probability"])
