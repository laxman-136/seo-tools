// Score Aggregator - Weighted score calculator
export class ScoreEngine {
    constructor() {}

    // Calculate master score from all engines
    calculate(results) {
        const readability = this.calculateReadabilityScore(results.readability);
        const seo = this.calculateSeoScore(results.seo);
        const structure = this.calculateStructureScore(results.structure);
        const meta = this.calculateMetaScore(results.seo);
        const links = this.calculateLinksScore(results.links, results.images);

        // Weighted average
        // Readability 25%, SEO 30%, Structure 20%, Meta 15%, Links & Images 10%
        const weightedScore = (
            readability * 0.25 +
            seo * 0.30 +
            structure * 0.20 +
            meta * 0.15 +
            links * 0.10
        );

        return {
            master: Math.round(weightedScore),
            components: {
                readability: Math.round(readability),
                seo: Math.round(seo),
                structure: Math.round(structure),
                meta: Math.round(meta),
                links: Math.round(links)
            },
            color: this.getScoreColor(weightedScore),
            label: this.getScoreLabel(weightedScore)
        };
    }

    // Readability score (0-100)
    calculateReadabilityScore(readability) {
        if (!readability) return 0;

        const scores = [
            readability.fleschKincaidEase,
            100 - (readability.fleschKincaidGrade * 10), // Grade 10 = 0 score
            100 - (readability.gunningFog * 10),
            100 - (readability.smog * 10),
            100 - (readability.colemanLiau * 10),
            100 - (readability.ari * 10)
        ];

        // Average of all scores, clamped to 0-100
        const avg = scores.reduce((sum, s) => sum + Math.max(0, Math.min(100, s)), 0) / scores.length;
        return avg;
    }

    // SEO score (0-100)
    calculateSeoScore(seo) {
        if (!seo) return 0;

        let score = 0;
        let maxScore = 0;

        // Keyword position checks (30 points max)
        if (seo.keywordInTitle) score += 10;
        if (seo.keywordInMetaDesc) score += 8;
        if (seo.keywordInFirst100) score += 8;
        if (seo.keywordInH1) score += 10;
        if (seo.keywordInH2) score += 8;
        if (seo.keywordInAlt) score += 4;
        if (seo.keywordInUrlSlug) score += 4;
        maxScore += 52;

        // Keyword density (20 points max)
        const density = seo.keywordDensity || 0;
        if (density >= 1 && density <= 3) score += 20;
        else if (density > 0 && density < 1) score += 10;
        else if (density >= 3 && density < 5) score += 10;
        maxScore += 20;

        // Heading structure (10 points)
        if (seo.headingHierarchyValid && seo.headingHierarchyValid.valid) score += 10;
        maxScore += 10;

        // No stuffing (10 points)
        if (!seo.keywordStuffing) score += 10;
        maxScore += 10;

        // Headings exist (8 points)
        if (seo.headingCount >= 2) score += 8;
        maxScore += 8;

        return (score / maxScore) * 100;
    }

    // Structure score (0-100)
    calculateStructureScore(structure) {
        if (!structure) return 0;

        let score = 0;
        let maxScore = 0;

        // Word count (20 points)
        const wordCount = structure.wordCount || 0;
        if (wordCount >= 300) score += 20;
        else if (wordCount >= 150) score += 15;
        else if (wordCount >= 100) score += 10;
        else if (wordCount >= 50) score += 5;
        maxScore += 20;

        // Transition words (20 points)
        const transitionRatio = structure.transitionWordRatio || 0;
        if (transitionRatio >= 15) score += 20;
        else if (transitionRatio >= 10) score += 15;
        else if (transitionRatio >= 5) score += 10;
        else if (transitionRatio > 0) score += 5;
        maxScore += 20;

        // Introduction (10 points)
        if (structure.introLength >= 30) score += 10;
        else if (structure.introLength >= 20) score += 7;
        else if (structure.introLength >= 10) score += 4;
        maxScore += 10;

        // Conclusion (10 points)
        if (structure.conclusionDetected) score += 10;
        maxScore += 10;

        // Paragraph count (10 points)
        const paraCount = structure.paragraphCount || 0;
        if (paraCount >= 3) score += 10;
        else if (paraCount >= 2) score += 7;
        else if (paraCount >= 1) score += 4;
        maxScore += 10;

        // Sentence variety (10 points)
        const avgWords = structure.avgWordsPerSentence || 0;
        if (avgWords >= 10 && avgWords <= 20) score += 10;
        else if (avgWords >= 8 && avgWords <= 25) score += 7;
        else if (avgWords > 0) score += 4;
        maxScore += 10;

        // Subheading distribution (20 points)
        const subheadDist = structure.subheadingDistribution;
        if (subheadDist && subheadDist.even) score += 20;
        else if (subheadDist && subheadDist.sections && subheadDist.sections.length >= 3) score += 12;
        maxScore += 20;

        return (score / maxScore) * 100;
    }

    // Meta tags score (0-100)
    calculateMetaScore(seo) {
        if (!seo) return 0;

        let score = 0;
        let maxScore = 0;

        // Title length (30 points)
        const titleLen = seo.metaTitleLength || 0;
        if (titleLen >= 30 && titleLen <= 60) score += 30;
        else if (titleLen > 0 && titleLen < 30) score += 15;
        else if (titleLen > 60 && titleLen <= 70) score += 15;
        maxScore += 30;

        // Description length (30 points)
        const descLen = seo.metaDescLength || 0;
        if (descLen >= 120 && descLen <= 160) score += 30;
        else if (descLen > 0 && descLen < 120) score += 15;
        else if (descLen > 160 && descLen <= 180) score += 15;
        maxScore += 30;

        // Meta tags present (20 points)
        if (seo.metaTitleLength > 0) score += 10;
        if (seo.metaDescLength > 0) score += 10;
        maxScore += 20;

        // Schema present (20 points)
        // Would need schema data in seo results
        maxScore += 20;

        return (score / maxScore) * 100;
    }

    // Links & Images score (0-100)
    calculateLinksScore(links, images) {
        if (!links && !images) return 0;

        let score = 0;
        let maxScore = 0;

        // Link quality (40 points)
        if (links) {
            const totalLinks = links.internal + links.external || 0;
            if (totalLinks >= 1 && totalLinks <= 10) score += 40;
            else if (totalLinks > 0) score += 20;

            // Nofollow distribution
            if (links.nofollow > 0 && links.nofollow < totalLinks) score += 10;
            maxScore += 50;
        }

        // Image optimization (60 points)
        if (images) {
            const altCoverage = images.altCoverage || 0;
            if (altCoverage >= 90) score += 40;
            else if (altCoverage >= 70) score += 30;
            else if (altCoverage >= 50) score += 20;
            else if (altCoverage > 0) score += 10;

            // Lazy loading
            if (images.lazyLoadCoverage > 0) score += 10;
            maxScore += 50;
        }

        return maxScore > 0 ? (score / maxScore) * 100 : 0;
    }

    // Get color for score
    getScoreColor(score) {
        if (score >= 71) return 'green';
        if (score >= 41) return 'amber';
        return 'red';
    }

    // Get label for score
    getScoreLabel(score) {
        if (score >= 71) return 'Good';
        if (score >= 41) return 'Needs Work';
        return 'Poor';
    }
}

export default ScoreEngine;