// SERP Preview - Google-style search result preview
export class SerpPreview {
    constructor() {
        this.titleMaxChars = 60;
        this.descMaxChars = 160;
        this.mobileTitleMax = 50;
        this.mobileDescMax = 120;
    }

    // Generate preview HTML
    render(options = {}) {
        const {
            title = '',
            description = '',
            url = 'example.com',
            isMobile = false
        } = options;

        const titleMax = isMobile ? this.mobileTitleMax : this.titleMaxChars;
        const descMax = isMobile ? this.mobileDescMax : this.descMaxChars;

        // Truncate if needed
        const titleTruncated = title.length > titleMax;
        const descTruncated = description.length > descMax;

        // Pixel width approximation
        const titlePixelWidth = this.estimatePixelWidth(title);
        const descPixelWidth = this.estimatePixelWidth(description);

        return {
            url,
            title: title || 'Your Page Title Here',
            titleTruncated,
            titlePixelWidth,
            description: description || 'Your meta description will appear here. Make sure it\'s compelling and includes your target keyword for better click-through rates.',
            descTruncated,
            descPixelWidth,
            isMobile: isMobile || false,

            // Counts
            titleCharCount: title.length,
            descCharCount: description.length
        };
    }

    // Estimate pixel width (approximation)
    estimatePixelWidth(text) {
        if (!text) return 0;

        // Average character width approximation
        // This is a rough estimate - real rendering would use canvas
        const avgWidth = 8; // Average character width in pixels
        const padding = 20; // Padding around text

        return text.length * avgWidth + padding;
    }

    // Check title best practices
    checkTitle(title, keyword = '') {
        const checks = {
            hasKeyword: keyword ? title.toLowerCase().includes(keyword.toLowerCase()) : false,
            length: title.length,
            isTooShort: title.length < 30,
            isTooLong: title.length > 60,
            hasBrand: false, // Would need brand name
            hasNumber: /\d/.test(title),
            hasPowerWord: this.hasPowerWord(title),
            score: 0
        };

        // Calculate score
        let score = 0;
        if (keyword && checks.hasKeyword) score += 30;
        if (checks.length >= 30 && checks.length <= 60) score += 20;
        if (checks.hasNumber) score += 10;
        if (checks.hasPowerWord) score += 15;
        if (!checks.isTooShort && !checks.isTooLong) score += 25;

        checks.score = score;
        return checks;
    }

    // Check description best practices
    checkDescription(description, keyword = '') {
        const hasCTA = this.hasCallToAction(description);
        const checks = {
            hasKeyword: keyword ? description.toLowerCase().includes(keyword.toLowerCase()) : false,
            length: description.length,
            isTooShort: description.length < 120,
            isTooLong: description.length > 160,
            hasCTA,
            score: 0
        };

        // Calculate score
        let score = 0;
        if (keyword && checks.hasKeyword) score += 25;
        if (checks.length >= 120 && checks.length <= 160) score += 25;
        if (checks.hasCTA) score += 25;
        if (!checks.isTooShort && !checks.isTooLong) score += 25;

        checks.score = score;
        return checks;
    }

    // Check for power words
    hasPowerWord(title) {
        const powerWords = [
            'best', 'top', 'free', 'guide', 'how to', 'review', 'comparison',
            'vs', 'vs.', '2024', '2025', '2026', 'new', 'ultimate',
            'complete', 'proven', 'fast', 'easy', 'simple', 'quick'
        ];

        const lower = title.toLowerCase();
        return powerWords.some(word => lower.includes(word));
    }

    // Check for call to action
    hasCallToAction(description) {
        const ctas = [
            'learn', 'discover', 'find', 'get', 'start', 'try',
            'download', 'sign up', 'register', 'join', 'read',
            'see', 'check', 'explore', 'download', 'watch'
        ];

        const lower = description.toLowerCase();
        return ctas.some(word => lower.includes(word));
    }

    // Get suggested title
    suggestTitle(keyword, baseTitle = '') {
        const suggestions = [];

        if (keyword) {
            // Keyword at start
            suggestions.push(`${keyword} - ${baseTitle || 'Your Brand'}`);
            // Keyword at end
            suggestions.push(`${baseTitle || 'Your Brand'}: ${keyword} Guide`);
            // How to
            suggestions.push(`How to Use ${keyword} (Complete Guide)`);
        }

        return suggestions;
    }

    // Get suggested description
    suggestDescription(keyword, introText = '') {
        const suggestions = [];

        if (keyword && introText) {
            suggestions.push(
                `Learn about ${keyword} in our comprehensive guide. ${introText.slice(0, 100)}...`,
                `Discover how ${keyword} can help you. ${introText.slice(0, 100)}...`,
                `${keyword}: Everything you need to know. ${introText.slice(0, 100)}...`
            );
        }

        return suggestions;
    }
}

export default SerpPreview;