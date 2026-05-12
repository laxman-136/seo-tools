// Highlighter - Inline editor highlight injector
export class Highlighter {
    constructor() {
        this.highlights = [];
    }

    // Apply highlights to text
    applyHighlights(text, options = {}) {
        const {
            showHard = true,
            showVeryHard = true,
            showPassive = true,
            showAdverb = true,
            showWeak = true,
            showTransition = true
        } = options;

        this.highlights = [];
        let result = text;

        // We need to return HTML with spans, not plain text
        // This is a simplified version
        return {
            html: this.wrapText(text),
            highlights: this.highlights
        };
    }

    // Wrap text with highlight spans (simplified)
    wrapText(text) {
        // For a real implementation, you'd parse the text and wrap issues
        // This returns the text as-is for now
        return text
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // Get highlight positions
    getPositions(text, issueType) {
        return this.highlights
            .filter(h => h.type === issueType)
            .map(h => h.position);
    }

    // Highlight count by type
    getCounts() {
        return {
            hard: this.highlights.filter(h => h.type === 'hard').length,
            veryHard: this.highlights.filter(h => h.type === 'very-hard').length,
            passive: this.highlights.filter(h => h.type === 'passive').length,
            adverb: this.highlights.filter(h => h.type === 'adverb').length,
            weak: this.highlights.filter(h => h.type === 'weak').length,
            transition: this.highlights.filter(h => h.type === 'transition').length
        };
    }
}

export default Highlighter;