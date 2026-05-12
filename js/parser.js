// Content Parser - Text tokenizer, sentence tokenizer, HTML parser
import { stopwords } from './data/stopwords.js';

// TextParser - Strip HTML, tokenize into words, sentences, paragraphs
export class TextParser {
    constructor() {
        this.rawText = '';
        this.htmlContent = '';
    }

    // Strip HTML tags from content
    stripHtml(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }

    // Tokenize text into words (array of words)
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s'-]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 0);
    }

    // Tokenize into sentences (split at . ! ? but handle abbreviations)
    tokenizeSentences(text) {
        const sentences = [];
        // Common abbreviations to avoid splitting
        const abbrevs = ['mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'vs', 'etc', 'eg', 'ie', 'al', 'approx', 'apt', 'avg', 'bldg', 'dept', 'est', 'fig', 'govt', 'hon', 'inc', 'jr', 'ltd', 'mr', 'mrs', 'ms', 'no', 'opp', 'org', 'oz', 'prof', 'pt', 'rep', 'rev', 'sen', 'sr', 'st', 'stat', 'tel', 'univ', 'vol', 'vs', 'yr'];

        // Split at . ! ? followed by space and capital letter
        const parts = text.split(/([.!?]+[\s\n]+)/);

        let current = '';
        for (const part of parts) {
            if (/[.!?]+/.test(part)) {
                current += part;
                const trimmed = current.trim();
                // Check if this could be an abbreviation
                const lastWord = trimmed.split(/\s+/).pop().toLowerCase().replace(/\./g, '');
                if (!abbrevs.includes(lastWord) && trimmed.length > 10) {
                    sentences.push(trimmed);
                    current = '';
                } else {
                    current = '';
                }
            } else {
                current += part;
            }
        }
        if (current.trim()) {
            sentences.push(current.trim());
        }

        return sentences.filter(s => s.length > 0);
    }

    // Tokenize into paragraphs
    tokenizeParagraphs(text) {
        return text
            .split(/\n\s*\n/)
            .map(p => p.trim())
            .filter(p => p.length > 0);
    }

    // Count syllables in a word (method approximation algorithm)
    countSyllables(word) {
        word = word.toLowerCase().replace(/[^a-z]/g, '');
        if (word.length <= 3) return 1;

        // Count vowel groups
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');

        const matches = word.match(/[aeiouy]{1,2}/g);
        return matches ? matches.length : 1;
    }

    // Get all words with syllable counts
    getWordsWithSyllables(text) {
        const words = this.tokenize(text);
        return words.map(word => ({
            word,
            syllables: this.countSyllables(word)
        }));
    }

    // Parse content and return normalized object
    parse(text, htmlContent = '') {
        this.rawText = text;
        this.htmlContent = htmlContent;

        const plainText = htmlContent ? this.stripHtml(htmlContent) : text;

        return {
            rawText: text,
            htmlContent,
            plainText,
            words: this.tokenize(plainText),
            sentences: this.tokenizeSentences(plainText),
            paragraphs: this.tokenizeParagraphs(plainText),
            wordCount: this.tokenize(plainText).length,
            sentenceCount: this.tokenizeSentences(plainText).length,
            paragraphCount: this.tokenizeParagraphs(plainText).length
        };
    }
}

// HTML Parser - Extract headings, links, images, meta tags
export class HtmlParser {
    constructor() {
        this.dom = null;
    }

    // Parse HTML string to DOM
    parseHtml(html) {
        const parser = new DOMParser();
        this.dom = parser.parseFromString(html, 'text/html');
        return this.dom;
    }

    // Extract all headings (h1-h6)
    extractHeadings(html) {
        const dom = this.parseHtml(html);
        const headings = [];
        const levels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

        for (const level of levels) {
            const elements = dom.querySelectorAll(level);
            elements.forEach((el, index) => {
                headings.push({
                    level,
                    text: el.textContent.trim(),
                    id: el.id || `${level}-${index}`,
                    words: el.textContent.trim().split(/\s+/).length
                });
            });
        }

        return headings;
    }

    // Extract all links
    extractLinks(html, baseUrl = '') {
        const dom = this.parseHtml(html);
        const links = [];

        dom.querySelectorAll('a[href]').forEach(el => {
            const href = el.getAttribute('href');
            const anchorText = el.textContent.trim();
            const isExternal = href && (href.startsWith('http') || href.startsWith('//'));
            const rel = el.getAttribute('rel') || '';
            const target = el.getAttribute('target') || '';

            if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                links.push({
                    href,
                    anchorText,
                    isExternal,
                    rel,
                    target,
                    isNofollow: rel.includes('nofollow'),
                    opensNewTab: target === '_blank'
                });
            }
        });

        return links;
    }

    // Extract all images
    extractImages(html) {
        const dom = this.parseHtml(html);
        const images = [];

        dom.querySelectorAll('img').forEach(el => {
            const src = el.getAttribute('src') || '';
            const alt = el.getAttribute('alt') || '';
            const title = el.getAttribute('title') || '';
            const width = el.getAttribute('width') || '';
            const height = el.getAttribute('height') || '';
            const loading = el.getAttribute('loading') || '';

            if (src) {
                images.push({
                    src,
                    alt,
                    title,
                    width,
                    height,
                    loading,
                    hasAlt: alt.length > 0,
                    hasLazyLoad: loading === 'lazy'
                });
            }
        });

        return images;
    }

    // Extract meta tags
    extractMeta(html) {
        const dom = this.parseHtml(html);
        const meta = {};

        // Title
        const titleEl = dom.querySelector('title');
        meta.title = titleEl ? titleEl.textContent.trim() : '';

        // Meta description
        const descEl = dom.querySelector('meta[name="description"]');
        meta.description = descEl ? descEl.getAttribute('content') || '' : '';

        // Canonical
        const canonicalEl = dom.querySelector('link[rel="canonical"]');
        meta.canonical = canonicalEl ? canonicalEl.getAttribute('href') || '' : '';

        // Open Graph
        const ogTitle = dom.querySelector('meta[property="og:title"]');
        meta.ogTitle = ogTitle ? ogTitle.getAttribute('content') || '' : '';

        const ogDesc = dom.querySelector('meta[property="og:description"]');
        meta.ogDescription = ogDesc ? ogDesc.getAttribute('content') || '' : '';

        // Schema.org JSON-LD
        const schemaEls = dom.querySelectorAll('script[type="application/ld+json"]');
        meta.schema = Array.from(schemaEls).map(el => {
            try {
                return JSON.parse(el.textContent);
            } catch {
                return null;
            }
        }).filter(s => s);

        return meta;
    }

    // Count internal vs external links
    classifyLinks(links, baseDomain = '') {
        const internal = [];
        const external = [];

        for (const link of links) {
            let isInternal = false;

            if (baseDomain) {
                const linkDomain = link.href.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
                isInternal = linkDomain === baseDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
            }

            if (isInternal) {
                internal.push(link);
            } else {
                external.push(link);
            }
        }

        return { internal, external };
    }
}

// Stopword Filter
export class StopwordFilter {
    constructor() {
        this.stopwords = new Set(stopwords);
    }

    filter(words) {
        return words.filter(word => !this.stopwords.has(word.toLowerCase()));
    }

    isStopword(word) {
        return this.stopwords.has(word.toLowerCase());
    }
}

// Export all
export const Parser = {
    TextParser,
    HtmlParser,
    StopwordFilter
};

export default Parser;