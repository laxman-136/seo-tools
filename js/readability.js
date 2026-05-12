// Readability Engine - 6 Readability Formula Implementations
import { Parser } from './parser.js';
import { passivePatterns } from './data/passive-patterns.js';

// Syllable Counter using CMU Pronouncing Dictionary approximation algorithm
class SyllableCounter {
    constructor() {
        this.cache = new Map();
    }

    count(word) {
        // Check cache first
        if (this.cache.has(word)) {
            return this.cache.get(word);
        }

        const lower = word.toLowerCase().replace(/[^a-z]/g, '');
        if (lower.length <= 3) {
            this.cache.set(word, 1);
            return 1;
        }

        // Remove common suffixes that don't add syllables
        let processed = lower.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        processed = processed.replace(/^y/, '');

        // Count vowel groups
        const matches = processed.match(/[aeiouy]{1,2}/g);
        const count = matches ? matches.length : 1;

        this.cache.set(word, count);
        return count;
    }

    countInText(text) {
        const words = Parser.TextParser.prototype.tokenize.call(null, text);
        return words.reduce((total, word) => total + this.count(word), 0);
    }
}

const syllableCounter = new SyllableCounter();

// Readability Algorithms
export class ReadabilityEngine {
    constructor() {
        this.syllableCounter = syllableCounter;
    }

    // Calculate all readability scores
    analyze(text) {
        const words = this.getWords(text);
        const sentences = this.getSentences(text);
        const complexWords = this.getComplexWords(words);

        const wordCount = words.length;
        const sentenceCount = sentences.length;
        const syllableCount = this.countAllSyllables(words);

        if (wordCount === 0 || sentenceCount === 0) {
            return {
                fleschKincaidEase: 0,
                fleschKincaidGrade: 0,
                gunningFog: 0,
                smog: 0,
                colemanLiau: 0,
                ari: 0,
                readingEase: 0,
                gradeLevel: 0
            };
        }

        // Flesch-Kincaid Reading Ease
        // 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
        const fleschEase = 206.835
            - 1.015 * (wordCount / sentenceCount)
            - 84.6 * (syllableCount / wordCount);

        // Flesch-Kincaid Grade Level
        // 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
        const fleschGrade = 0.39 * (wordCount / sentenceCount)
            + 11.8 * (syllableCount / wordCount)
            - 15.59;

        // Gunning Fog Index
        // 0.4 * ((words/sentences) + 100 * (complexWords/words))
        const avgWordsPerSentence = wordCount / sentenceCount;
        const percentComplex = (complexWords.length / wordCount) * 100;
        const gunningFog = 0.4 * (avgWordsPerSentence + percentComplex);

        // SMOG Index
        // 1.0430 * sqrt(complexWords * (30/sentences)) + 3.1291
        const smog = sentenceCount > 0
            ? 1.0430 * Math.sqrt(complexWords.length * (30 / sentenceCount)) + 3.1291
            : 0;

        // Coleman-Liau Index
        // 0.0588 * L - 0.296 * S - 15.8
        const L = (this.countLetters(text) / wordCount) * 100; // letters per 100 words
        const S = (sentenceCount / wordCount) * 100; // sentences per 100 words
        const colemanLiau = 0.0588 * L - 0.296 * S - 15.8;

        // Automated Readability Index
        // 4.71 * (characters/words) + 0.5 * (words/sentences) - 21.43
        const charCount = this.countCharacters(text);
        const ari = 4.71 * (charCount / wordCount) + 0.5 * (wordCount / sentenceCount) - 21.43;

        return {
            fleschKincaidEase: Math.max(0, Math.min(100, fleschEase)),
            fleschKincaidGrade: Math.max(0, fleschGrade),
            gunningFog: Math.max(0, gunningFog),
            smog: Math.max(0, smog),
            colemanLiau: Math.max(0, colemanLiau),
            ari: Math.max(0, ari),
            readingEase: Math.max(0, Math.min(100, fleschEase)),
            gradeLevel: Math.max(0, fleschGrade)
        };
    }

    getWords(text) {
        return text.toLowerCase()
            .replace(/[^\w\s'-]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 0);
    }

    getSentences(text) {
        return text.split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 10);
    }

    countAllSyllables(words) {
        return words.reduce((total, word) => total + this.syllableCounter.count(word), 0);
    }

    getComplexWords(words) {
        // Complex words: 3+ syllables
        return words.filter(word => this.syllableCounter.count(word) >= 3);
    }

    countCharacters(text) {
        return text.replace(/[^a-zA-Z]/g, '').length;
    }

    // Average sentence length
    getAvgSentenceLength(text) {
        const words = this.getWords(text);
        const sentences = this.getSentences(text);
        return sentences.length > 0 ? words.length / sentences.length : 0;
    }

    // Average word length
    getAvgWordLength(text) {
        const words = this.getWords(text);
        if (words.length === 0) return 0;
        const totalLength = words.reduce((sum, w) => sum + w.length, 0);
        return totalLength / words.length;
    }

    // Hard sentence detector (over 14 words)
    getHardSentences(text) {
        const sentences = this.getSentences(text);
        return sentences.filter(s => {
            const wordCount = this.getWords(s).length;
            return wordCount > 14 && wordCount <= 25;
        });
    }

    // Very hard sentence detector (over 25 words)
    getVeryHardSentences(text) {
        const sentences = this.getSentences(text);
        return sentences.filter(s => this.getWords(s).length > 25;
    }

    // Detect passive voice
    detectPassiveVoice(text) {
        const found = [];

        for (const pattern of passivePatterns) {
            const matches = text.matchAll(pattern.pattern);
            for (const match of matches) {
                found.push({
                    text: match[0],
                    type: pattern.name,
                    index: match.index
                });
            }
        }

        return found;
    }

    // Detect adverbs (words ending in -ly in wrong positions)
    detectAdverbs(text) {
        const adverbs = [];
        const words = this.getWords(text);

        // Common -ly words that are not adverbs when used like this
        const notAdverbs = ['only', 'lively', 'friendly', 'lonely', 'lovely', 'ugly', 'elderly', 'early', 'family', 'belly', 'jelly', 'holy', 'jolly', 'well', 'elly', 'duly', 'slyly'];

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (word.endsWith('ly') && word.length > 3 && !notAdverbs.includes(word)) {
                // Check if it's in an unusual position (not after be-verb, not at start)
                const prevWord = i > 0 ? words[i - 1] : '';
                if (!['is', 'are', 'was', 'were', 'be', 'been', 'being', 'am'].includes(prevWord.toLowerCase())) {
                    adverbs.push({
                        word,
                        position: i + 1,
                        context: `...${prevWord} ${word}...`
                    });
                }
            }
        }

        return adverbs;
    }

    // Detect weak/filler words
    detectWeakWords(text, weakWordList) {
        const words = this.getWords(text);
        const found = [];

        for (const word of words) {
            if (weakWordList.includes(word.toLowerCase())) {
                found.push(word);
            }
        }

        return found;
    }

    // Word complexity highlighter (3+ syllable words)
    getComplexWordList(text) {
        const words = this.getWords(text);
        return words.filter(word => this.syllableCounter.count(word) >= 3);
    }
}

// Export
export const Readability = new ReadabilityEngine();
export default Readability;