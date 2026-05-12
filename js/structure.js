// Content Structure Analyzer - Heading hierarchy, transition words, paragraph analysis
import { transitionWords } from './data/transition-words.js';
import { Parser } from './parser.js';

export class StructureEngine {
    constructor() {
        this.transitionWords = transitionWords;
        this.transitionSet = new Set(transitionWords.map(w => w.toLowerCase()));
    }

    // Analyze content structure
    analyze(text, htmlContent = '') {
        const parser = new Parser();
        const plainText = htmlContent ? parser.stripHtml(htmlContent) : text;
        const words = parser.tokenize(plainText);
        const sentences = parser.tokenizeSentences(plainText);
        const paragraphs = parser.tokenizeParagraphs(plainText);

        const results = {
            // Basic stats
            wordCount: words.length,
            sentenceCount: sentences.length,
            paragraphCount: paragraphs.length,

            // Averages
            avgWordsPerSentence: sentences.length > 0 ? words.length / sentences.length : 0,
            avgWordsPerParagraph: paragraphs.length > 0 ? words.length / paragraphs.length : 0,

            // Sentence analysis
            longestSentence: this.findLongest(sentences),
            shortestSentence: this.findShortest(sentences),

            // Transition words
            transitionWordRatio: this.calculateTransitionRatio(sentences),
            transitionWordCount: this.countTransitionWords(sentences),

            // Paragraph analysis
            paragraphLengths: paragraphs.map(p => parser.tokenize(p).length),
            paragraphDistribution: this.analyzeParagraphDistribution(paragraphs),

            // Introduction
            introLength: paragraphs.length > 0 ? parser.tokenize(paragraphs[0]).length : 0,

            // Conclusion
            conclusionDetected: this.detectConclusion(paragraphs),

            // Content structure
            contentToStructureRatio: this.calculateContentRatio(sentences, words),

            // Subheading distribution (if headings available)
            subheadingDistribution: null
        };

        return results;
    }

    // Analyze with HTML headings
    analyzeWithHeadings(text, htmlContent, headings) {
        const basic = this.analyze(text, htmlContent);
        basic.subheadingDistribution = this.analyzeHeadingDistribution(headings, basic.wordCount);
        return basic;
    }

    // Find longest sentence
    findLongest(sentences) {
        if (!sentences.length) return null;

        let longest = sentences[0];
        let maxLength = 0;
        const parser = new Parser();

        for (const sentence of sentences) {
            const wordCount = parser.tokenize(sentence).length;
            if (wordCount > maxLength) {
                maxLength = wordCount;
                longest = { text: sentence, wordCount };
            }
        }

        return longest;
    }

    // Find shortest sentence
    findShortest(sentences) {
        if (!sentences.length) return null;

        let shortest = sentences[0];
        let minLength = Infinity;
        const parser = new Parser();

        for (const sentence of sentences) {
            const wordCount = parser.tokenize(sentence).length;
            if (wordCount < minLength && wordCount > 0) {
                minLength = wordCount;
                shortest = { text: sentence, wordCount };
            }
        }

        return shortest;
    }

    // Calculate transition word ratio
    calculateTransitionRatio(sentences) {
        if (!sentences.length) return 0;

        let transitionCount = 0;
        let sentenceCount = 0;

        for (const sentence of sentences) {
            const words = sentence.toLowerCase().split(/\s+/);
            if (this.transitionSet.has(words[0])) {
                transitionCount++;
            }
            sentenceCount++;
            // Also check for transition words anywhere in sentence
            for (const word of words) {
                if (this.transitionSet.has(word)) {
                    transitionCount++;
                    break;
                }
            }
        }

        return (transitionCount / sentences.length) * 100;
    }

    // Count transition words
    countTransitionWords(sentences) {
        const parser = new Parser();
        const count = { found: new Map(), total: 0 };

        for (const sentence of sentences) {
            const words = parser.tokenize(sentence).map(w => w.toLowerCase());
            for (const word of words) {
                if (this.transitionSet.has(word)) {
                    count.found.set(word, (count.found.get(word) || 0) + 1);
                    count.total++;
                }
            }
        }

        return count;
    }

    // Detect conclusion
    detectConclusion(paragraphs) {
        if (paragraphs.length < 2) return false;

        const lastPara = paragraphs[paragraphs.length - 1].toLowerCase();

        const conclusionPhrases = [
            'in conclusion',
            'to summarize',
            'in summary',
            'finally',
            'to conclude',
            'overall',
            'takeaways',
            'key takeaways',
            'in the end',
            'ultimately'
        ];

        for (const phrase of conclusionPhrases) {
            if (lastPara.includes(phrase)) {
                return true;
            }
        }

        return false;
    }

    // Analyze paragraph distribution
    analyzeParagraphDistribution(paragraphs) {
        const parser = new Parser();
        const lengths = paragraphs.map(p => parser.tokenize(p).length);

        if (lengths.length === 0) return { even: true, distribution: 'none' };

        const avg = lengths.reduce((sum, l) => sum + l, 0) / lengths.length;
        const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;
        const stdDev = Math.sqrt(variance);

        // Determine if distribution is even
        const even = stdDev < avg * 0.5;

        return {
            even,
            stdDev,
            avg,
            shortest: Math.min(...lengths),
            longest: Math.max(...lengths)
        };
    }

    // Calculate content-to-structure ratio
    calculateContentRatio(sentences, words) {
        // Headings vs body content
        // This is a simplified version - would need HTML to be accurate
        const totalWords = words.length;
        return totalWords > 0 ? 100 : 0;
    }

    // Analyze heading distribution
    analyzeHeadingDistribution(headings, totalWords) {
        if (!headings.length || totalWords === 0) {
            return { distribution: 'none', sections: [] };
        }

        const sections = headings.map(h => ({
            level: h.level,
            wordCount: h.words,
            density: (h.words / totalWords) * 100
        }));

        // Check for even distribution
        let even = true;
        if (sections.length > 1) {
            const avg = sections.reduce((sum, s) => sum + s.density, 0) / sections.length;
            for (const section of sections) {
                if (Math.abs(section.density - avg) > avg * 0.5) {
                    even = false;
                    break;
                }
            }
        }

        return { even, distribution: even ? 'even' : 'uneven', sections };
    }

    // Suggest table of contents (trigger if 1500+ words and 4+ H2s)
    suggestTableOfContents(wordCount, headings) {
        const h2Count = headings.filter(h => h.level === 'h2').length;

        return {
            shouldSuggest: wordCount >= 1500 && h2Count >= 4,
            reason: wordCount >= 1500 ? 'Content exceeds 1500 words' : 'Not enough content',
            h2Count,
            wordCount
        };
    }
}

export default StructureEngine;