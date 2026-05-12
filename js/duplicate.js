// Duplicate Content Detector - Repeated sentences, phrases, copy-paste detection
export class DuplicateEngine {
    constructor() {}

    // Check for duplicates within document
    analyze(text) {
        const sentences = this.tokenizeSentences(text);
        const trigrams = this.getTrigrams(text);

        return {
            repeatedSentences: this.findRepeatedSentences(sentences),
            repeatedPhrases: this.findRepeatedPhrases(trigrams),
            overusedWords: this.findOverusedWords(text),
            similarityScore: null
        };
    }

    // Compare two texts
    compare(textA, textB) {
        const score = this.calculateSimilarity(textA, textB);
        const sentencesA = this.tokenizeSentences(textA);
        const sentencesB = this.tokenizeSentences(textB);

        return {
            similarityScore: score,
            commonSentences: this.findCommonSentences(sentencesA, sentencesB),
            uniqueToA: this.findUniqueSentences(sentencesA, sentencesB),
            uniqueToB: this.findUniqueSentences(sentencesB, sentencesA),
            wordCountDiff: this.getWordCountDifference(textA, textB),
            sentenceCountDiff: sentencesA.length - sentencesB.length
        };
    }

    // Tokenize sentences
    tokenizeSentences(text) {
        return text
            .split(/[.!?]+/)
            .map(s => s.trim().toLowerCase())
            .filter(s => s.length > 20);
    }

    // Get trigrams (three-word sequences)
    getTrigrams(text) {
        const words = text.toLowerCase().split(/\s+/);
        const trigrams = [];

        for (let i = 0; i < words.length - 2; i++) {
            trigrams.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
        }

        return trigrams;
    }

    // Find repeated sentences
    findRepeatedSentences(sentences) {
        const seen = new Map();
        const repeated = [];

        for (const sentence of sentences) {
            const normalized = sentence.replace(/\s+/g, ' ').trim();
            if (!normalized) continue;

            if (seen.has(normalized)) {
                const count = seen.get(normalized) + 1;
                seen.set(normalized, count);
                if (count === 2) {
                    repeated.push({ sentence: normalized, count });
                }
            } else {
                seen.set(normalized, 1);
            }
        }

        return repeated;
    }

    // Find repeated phrases (trigrams)
    findRepeatedPhrases(trigrams) {
        const seen = new Map();
        const repeated = [];

        for (const trigram of trigrams) {
            if (seen.has(trigram)) {
                const count = seen.get(trigram);
                seen.set(trigram, count + 1);
                if (count === 1) {
                    repeated.push({ phrase: trigram, count: count + 1 });
                }
            } else {
                seen.set(trigram, 1);
            }
        }

        return repeated.sort((a, b) => b.count - a.count).slice(0, 10);
    }

    // Find overused words
    findOverusedWords(text) {
        const words = text.toLowerCase().split(/\s+/);
        if (words.length === 0) return [];

        const freq = {};
        for (const word of words) {
            const cleaned = word.replace(/[^a-z]/g, '');
            if (cleaned.length > 2) {
                freq[cleaned] = (freq[cleaned] || 0) + 1;
            }
        }

        // Calculate threshold based on document length
        const threshold = words.length * 0.02; // 2% threshold

        return Object.entries(freq)
            .filter(([word, count]) => count > threshold)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([word, count]) => ({ word, count }));
    }

    // Calculate similarity between two texts (Jaccard + cosine hybrid)
    calculateSimilarity(textA, textB) {
        const wordsA = new Set(textA.toLowerCase().split(/\s+/).filter(w => w.length > 2));
        const wordsB = new Set(textB.toLowerCase().split(/\s+/).filter(w => w.length > 2));

        // Jaccard similarity
        const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
        const union = new Set([...wordsA, ...wordsB]);
        const jaccard = intersection.size / union.size;

        // Character-based similarity (for shorter texts)
        const charA = textA.toLowerCase().replace(/\s/g, '');
        const charB = textB.toLowerCase().replace(/\s/g, '');
        const charIntersection = [...charA].filter(c => charB.includes(c)).length;
        const charSimilarity = charIntersection / Math.max(charA.length, charB.length);

        // Average the two
        return ((jaccard + charSimilarity) / 2) * 100;
    }

    // Find common sentences
    findCommonSentences(sentencesA, sentencesB) {
        const setB = new Set(sentencesB);
        return sentencesA.filter(s => setB.has(s));
    }

    // Find unique sentences
    findUniqueSentences(sentencesA, sentencesB) {
        const setB = new Set(sentencesB);
        return sentencesA.filter(s => !setB.has(s));
    }

    // Word count difference
    getWordCountDifference(textA, textB) {
        const wordsA = textA.split(/\s+/).length;
        const wordsB = textB.split(/\s+/).length;
        return wordsA - wordsB;
    }
}

export default DuplicateEngine;