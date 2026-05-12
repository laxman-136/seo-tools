// On-Page SEO Engine - Keyword density, heading checks, meta checks
import { Parser } from './parser.js';
import { Readability } from './readability.js';

export class SeoEngine {
    constructor() {
        this.parser = new Parser();
    }

    // Main SEO analysis
    analyze(text, htmlContent, focusKeyword, meta = {}) {
        const plainText = htmlContent ? this.parser.stripHtml(htmlContent) : text;
        const words = this.parser.tokenize(plainText);
        const headings = this.parser.extractHeadings(htmlContent);
        const links = htmlContent ? this.parser.extractLinks(htmlContent) : [];
        const images = htmlContent ? this.parser.extractImages(htmlContent) : [];

        const results = {
            // Keyword Analysis
            keywordDensity: this.calculateDensity(words, focusKeyword),
            keywordCount: this.countKeyword(words, focusKeyword),

            // Keyword Positions
            keywordInTitle: this.checkInMetaTitle(meta.title, focusKeyword),
            keywordInMetaDesc: this.checkInMetaDesc(meta.description, focusKeyword),
            keywordInFirst100: this.checkInFirst100Words(plainText, focusKeyword),
            keywordInH1: this.checkInHeadings(headings, 'h1', focusKeyword),
            keywordInH2: this.checkInHeadings(headings, 'h2', focusKeyword),
            keywordInAlt: this.checkInImages(images, focusKeyword),
            keywordInUrlSlug: this.checkInUrlSlug(meta.canonical, focusKeyword),

            // Heading Analysis
            headingCount: headings.length,
            headingCounts: this.countHeadingsByLevel(headings),
            headingHierarchyValid: this.validateHeadingHierarchy(headings),

            // Link Analysis
            internalLinks: this.countInternalLinks(links, ''),
            externalLinks: this.countExternalLinks(links),
            nofollowLinks: this.countNofollow(links),

            // Image Analysis
            imageCount: images.length,
            imagesWithAlt: this.countImagesWithAlt(images),
            altCoverage: this.calculateAltCoverage(images),

            // Meta Analysis
            metaTitleLength: meta.title ? meta.title.length : 0,
            metaDescLength: meta.description ? meta.description.length : 0,

            // Warnings
            overOptimization: this.checkOverOptimization(words, focusKeyword),
            keywordStuffing: this.checkKeywordStuffing(words, focusKeyword),

            // TF-IDF approximation using word frequency
            tfidf: this.calculateTFIDF(words),
            lsiSuggestions: this.generateLSISuggestions(words)
        };

        return results;
    }

    // Calculate keyword density percentage
    calculateDensity(words, keyword) {
        if (!keyword || words.length === 0) return 0;
        const keywordLower = keyword.toLowerCase();
        const keywordMatches = words.filter(w => w.includes(keywordLower) || keywordLower.includes(w));
        return (keywordMatches.length / words.length) * 100;
    }

    // Count keyword occurrences
    countKeyword(words, keyword) {
        if (!keyword) return 0;
        const keywordLower = keyword.toLowerCase();
        return words.filter(w => w.includes(keywordLower) || keywordLower.includes(w)).length;
    }

    // Check keyword in first 100 words
    checkInFirst100Words(text, keyword) {
        if (!keyword) return false;
        const first100 = text.split(/\s+/).slice(0, 100).join(' ');
        return first100.toLowerCase().includes(keyword.toLowerCase());
    }

    // Check in meta title
    checkInMetaTitle(title, keyword) {
        if (!title || !keyword) return false;
        return title.toLowerCase().includes(keyword.toLowerCase());
    }

    // Check in meta description
    checkInMetaDesc(description, keyword) {
        if (!description || !keyword) return false;
        return description.toLowerCase().includes(keyword.toLowerCase());
    }

    // Check in headings
    checkInHeadings(headings, level, keyword) {
        if (!keyword) return false;
        const targetHeadings = headings.filter(h => h.level === level);
        return targetHeadings.some(h => h.text.toLowerCase().includes(keyword.toLowerCase()));
    }

    // Check in image alt text
    checkInImages(images, keyword) {
        if (!keyword || !images.length) return false;
        return images.some(img => img.alt && img.alt.toLowerCase().includes(keyword.toLowerCase()));
    }

    // Check in URL slug
    checkInUrlSlug(url, keyword) {
        if (!url || !keyword) return false;
        return url.toLowerCase().includes(keyword.toLowerCase().replace(/\s+/g, '-'));
    }

    // Count headings by level
    countHeadingsByLevel(headings) {
        const counts = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
        headings.forEach(h => {
            if (counts.hasOwnProperty(h.level)) {
                counts[h.level]++;
            }
        });
        return counts;
    }

    // Validate heading hierarchy
    validateHeadingHierarchy(headings) {
        if (headings.length === 0) return { valid: true, issues: [] };

        const issues = [];
        let lastLevel = 0;

        for (const heading of headings) {
            const currentLevel = parseInt(heading.level[1]);

            // Check for missing H1
            if (lastLevel === 0 && currentLevel > 1) {
                issues.push({ type: 'missing-h1', message: 'No H1 found' });
            }

            // Check for multiple H1s
            if (lastLevel === 1 && currentLevel === 1) {
                issues.push({ type: 'multiple-h1', message: 'Multiple H1s found' });
            }

            // Check for skipping levels
            if (lastLevel > 0 && currentLevel > lastLevel + 1) {
                issues.push({
                    type: 'skipped-level',
                    message: `Skipped from H${lastLevel} to H${currentLevel}`
                });
            }

            lastLevel = currentLevel;
        }

        return { valid: issues.length === 0, issues };
    }

    // Count internal links
    countInternalLinks(links, baseDomain) {
        if (!baseDomain) return 0;
        return links.filter(link => {
            const href = link.href || '';
            return !href.startsWith('http') || href.includes(baseDomain);
        }).length;
    }

    // Count external links
    countExternalLinks(links) {
        return links.filter(link => {
            const href = link.href || '';
            return href.startsWith('http') || href.startsWith('//');
        }).length;
    }

    // Count nofollow links
    countNofollow(links) {
        return links.filter(link => link.isNofollow).length;
    }

    // Count images with alt text
    countImagesWithAlt(images) {
        return images.filter(img => img.hasAlt).length;
    }

    // Calculate alt coverage
    calculateAltCoverage(images) {
        if (!images.length) return 0;
        return (this.countImagesWithAlt(images) / images.length) * 100;
    }

    // Check over-optimization (density > 3%)
    checkOverOptimization(words, keyword) {
        const density = this.calculateDensity(words, keyword);
        return density > 3;
    }

    // Check keyword stuffing
    checkKeywordStuffing(words, keyword) {
        if (!keyword) return false;
        const density = this.calculateDensity(words, keyword);
        const keywordLower = keyword.toLowerCase();
        const exactMatches = words.filter(w => w === keywordLower).length;

        // Flag if: very high density OR many exact matches (>10% of all words)
        return density > 5 || exactMatches > (words.length * 0.1);
    }

    // TF-IDF approximation (using word frequency within document)
    calculateTFIDF(words) {
        const freq = {};
        const total = words.length;

        // Count word frequencies
        for (const word of words) {
            freq[word] = (freq[word] || 0) + 1;
        }

        // Calculate TF (term frequency)
        const tf = {};
        for (const word in freq) {
            tf[word] = freq[word] / total;
        }

        return tf;
    }

    // Generate LSI suggestions (top related words by frequency)
    generateLSISuggestions(words) {
        const stopwordFilter = new Parser.StopwordFilter();
        const filtered = stopwordFilter.filter(words);
        const stopwords = new Set(stopwords);

        const freq = {};
        for (const word of filtered) {
            if (word.length > 3 && !stopwords.has(word)) {
                freq[word] = (freq[word] || 0) + 1;
            }
        }

        // Sort by frequency and take top 10
        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));
    }

    // Levenshtein distance for semantic proximity
    levenshteinDistance(str1, str2) {
        const s1 = str1.toLowerCase();
        const s2 = str2.toLowerCase();

        const matrix = [];

        for (let i = 0; i <= s1.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= s2.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= s1.length; i++) {
            for (let j = 1; j <= s2.length; j++) {
                if (s1[i - 1] === s2[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[s1.length][s2.length];
    }

    // Check exact vs partial match
    checkMatchType(keyword, text) {
        const keywordLower = keyword.toLowerCase();
        const textLower = text.toLowerCase();

        if (textLower.includes(keywordLower)) {
            return { type: 'exact', score: 100 };
        }

        if (keywordLower.includes('_')) {
            const parts = keywordLower.split('_');
            if (parts.every(p => textLower.includes(p))) {
                return { type: 'partial', score: 80 };
            }
        }

        // Check proximity
        const distance = this.levenshteinDistance(keywordLower, textLower.slice(0, keywordLower.length));
        const maxLen = Math.max(keywordLower.length, textLower.length);
        const proximity = 1 - (distance / maxLen);

        if (proximity > 0.6) {
            return { type: 'semantic', score: proximity * 100 };
        }

        return { type: 'none', score: 0 };
    }
}

export default SeoEngine;