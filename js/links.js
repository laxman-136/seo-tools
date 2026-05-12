// Link Analyzer - Link classifier, anchor text checker
import { Parser } from './parser.js';

export class LinkEngine {
    constructor() {
        this.genericAnchors = [
            'click here', 'click here to', 'read more', 'read more to', 'here',
            'link', 'links', 'this', 'this link', 'that', 'that link',
            'article', 'post', 'page', 'website', 'this page', 'this article',
            'more info', 'more information', 'learn more', 'find out more',
            'sign up', 'sign up here', 'register', 'register here',
            'buy now', 'order now', 'shop now', 'get started',
            'continue', 'continue reading', 'continue reading'
        ];
    }

    // Analyze links from HTML
    analyze(links, baseDomain = '') {
        const classified = this.classifyLinks(links, baseDomain);

        return {
            // Counts
            totalLinks: links.length,
            internal: classified.internal.length,
            external: classified.external.length,
            nofollow: classified.nofollow.length,
            newTab: classified.newTab.length,

            // Quality issues
            genericAnchors: this.detectGenericAnchors(links),
            longAnchors: this.detectLongAnchors(links),
            keywordAnchors: null, // Set when keyword provided

            // Link to content ratio
            linkDensity: null, // Set when content length provided

            // All URLs
            urls: links.map(l => ({
                url: l.href,
                anchor: l.anchorText,
                type: this.getLinkType(l.href, baseDomain)
            }))
        };
    }

    // Classify internal vs external
    classifyLinks(links, baseDomain) {
        const internal = [];
        const external = [];
        const nofollow = [];
        const newTab = [];

        for (const link of links) {
            const type = this.getLinkType(link.href, baseDomain);

            if (type === 'internal') {
                internal.push(link);
            } else {
                external.push(link);
            }

            if (link.isNofollow) {
                nofollow.push(link);
            }

            if (link.opensNewTab) {
                newTab.push(link);
            }
        }

        return { internal, external, nofollow, newTab };
    }

    // Get link type
    getLinkType(href, baseDomain) {
        if (!href) return 'unknown';
        if (!href.startsWith('http') && !href.startsWith('//')) return 'internal';
        if (!baseDomain) return 'unknown';

        const hrefDomain = href.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        const base = baseDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

        return hrefDomain === base ? 'internal' : 'external';
    }

    // Detect generic anchor texts
    detectGenericAnchors(links) {
        const found = [];

        for (const link of links) {
            const anchor = link.anchorText.toLowerCase().trim();
            if (this.genericAnchors.includes(anchor) || this.genericAnchors.some(g => anchor.includes(g))) {
                found.push({
                    anchor: link.anchorText,
                    url: link.href
                });
            }
        }

        return found;
    }

    // Detect long anchor texts (>60 chars)
    detectLongAnchors(links) {
        return links.filter(link => link.anchorText.length > 60);
    }

    // Determine if keyword in anchor
    checkKeywordInAnchor(links, keyword) {
        if (!keyword) return [];

        return links.filter(link =>
            link.anchorText.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    // Calculate link to content ratio
    calculateLinkDensity(links, wordCount) {
        if (!wordCount) return 0;
        return (links.length / wordCount) * 100;
    }

    // Check for duplicate links
    findDuplicateLinks(links) {
        const seen = new Map();
        const duplicates = [];

        for (const link of links) {
            const href = link.href;
            if (seen.has(href)) {
                duplicates.push({
                    url: href,
                    count: seen.get(href) + 1
                });
            } else {
                seen.set(href, 1);
            }
        }

        return duplicates.filter(d => d.count > 1);
    }
}

export default LinkEngine;