// Export Functions - Text, JSON, Print export
export class ExportEngine {
    constructor() {}

    // Export as plain text
    exportText(results, options = {}) {
        const { title = 'SEO Analysis Report', date = new Date() } = options;
        let text = `# ${title}\nGenerated: ${date.toLocaleString()}\n\n`;

        // Master Score
        if (results.score) {
            text += `## Overall Score: ${results.score.master}/100 (${results.score.label})\n\n`;
        }

        // Readability
        if (results.readability) {
            text += `## Readability Scores\n`;
            text += `- Flesch-Kincaid Reading Ease: ${results.readability.fleschKincaidEase.toFixed(1)}\n`;
            text += `- Flesch-Kincaid Grade Level: ${results.readability.fleschKincaidGrade.toFixed(1)}\n`;
            text += `- Gunning Fog Index: ${results.readability.gunningFog.toFixed(1)}\n`;
            text += `- SMOG Index: ${results.readability.smogIndex.toFixed(1)}\n`;
            text += `- Coleman-Liau Index: ${results.readability.colemanLiau.toFixed(1)}\n`;
            text += `- ARI: ${results.readability.ari.toFixed(1)}\n\n`;
        }

        // Content Stats
        if (results.stats) {
            text += `## Content Statistics\n`;
            text += `- Word Count: ${results.stats.wordCount}\n`;
            text += `- Sentence Count: ${results.stats.sentenceCount}\n`;
            text += `- Paragraph Count: ${results.stats.paragraphCount}\n`;
            text += `- Avg Words/Sentence: ${results.stats.avgWordsPerSentence.toFixed(1)}\n`;
            text += `- Reading Time: ${results.stats.readingTime} min\n\n`;
        }

        // Keyword Analysis
        if (results.seo) {
            text += `## Keyword Analysis\n`;
            text += `- Keyword Density: ${results.seo.keywordDensity.toFixed(2)}%\n`;
            text += `- Keyword Count: ${results.seo.keywordCount}\n`;
            text += `- Keyword in Title: ${results.seo.keywordInTitle ? 'Yes' : 'No'}\n`;
            text += `- Keyword in Meta Description: ${results.seo.keywordInMetaDesc ? 'Yes' : 'No'}\n`;
            text += `- Keyword in First 100 Words: ${results.seo.keywordInFirst100 ? 'Yes' : 'No'}\n`;
            text += `- Keyword in H1: ${results.seo.keywordInH1 ? 'Yes' : 'No'}\n`;
            text += `- Keyword in H2/H3: ${results.seo.keywordInH2 ? 'Yes' : 'No'}\n\n`;
        }

        // Headings
        if (results.seo && results.seo.headingCounts) {
            text += `## Heading Structure\n`;
            const counts = results.seo.headingCounts;
            text += `- Total Headings: ${results.seo.headingCount}\n`;
            text += `- H1: ${counts.h1}, H2: ${counts.h2}, H3: ${counts.h3}\n\n`;
        }

        // Links
        if (results.links) {
            text += `## Links\n`;
            text += `- Internal Links: ${results.links.internal}\n`;
            text += `- External Links: ${results.links.external}\n`;
            text += `- Nofollow Links: ${results.links.nofollow}\n\n`;
        }

        // Images
        if (results.images) {
            text += `## Images\n`;
            text += `- Total Images: ${results.images.totalImages}\n`;
            text += `- Images with Alt Text: ${results.images.imagesWithAlt}\n`;
            text += `- Alt Coverage: ${results.images.altCoverage.toFixed(1)}%\n\n`;
        }

        // Issues
        if (results.issues) {
            text += `## Writing Issues\n`;
            text += `- Hard Sentences: ${results.issues.hardSentences || 0}\n`;
            text += `- Very Hard Sentences: ${results.issues.veryHard || 0}\n`;
            text += `- Passive Voice: ${results.issues.passiveVoice || 0}\n`;
            text += `- Adverbs: ${results.issues.adverbs || 0}\n`;
            text += `- Weak Words: ${results.issues.weakWords || 0}\n\n`;
        }

        return text;
    }

    // Export as JSON
    exportJSON(results, options = {}) {
        return JSON.stringify({
            ...results,
            exportedAt: new Date().toISOString(),
            ...options
        }, null, 2);
    }

    // Download file
    download(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Print view
    printResults(results) {
        const text = this.exportText(results);
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>SEO Analysis Report</title>
                <style>
                    body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
                    h1 { color: #333; }
                    h2 { color: #666; margin-top: 24px; }
                    pre { white-space: pre-wrap; }
                </style>
            </head>
            <body>
                <pre>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}

export default ExportEngine;