// SEO Tools - Main Application
import { Parser, TextParser, HtmlParser, StopwordFilter } from './parser.js';
import { Readability } from './readability.js';
import { SeoEngine } from './seo.js';
import { StructureEngine } from './structure.js';
import { LinkEngine } from './links.js';
import { ImageEngine } from './images.js';
import { DuplicateEngine } from './duplicate.js';
import { ScoreEngine } from './scorer.js';
import { SerpPreview } from './serp.js';
import { ExportEngine } from './export.js';
import { SessionManager } from './session.js';
import { transitionWords } from './data/transition-words.js';
import { weakWords } from './data/weak-words.js';

class SEO ToolsApp {
    constructor() {
        this.parser = new Parser();
        this.textParser = new TextParser();
        this.htmlParser = new HtmlParser();
        this.stopwordFilter = new StopwordFilter();
        this.readability = Readability;
        this.seo = new SeoEngine();
        this.structure = new StructureEngine();
        this.linkEngine = new LinkEngine();
        this.imageEngine = new ImageEngine();
        this.duplicateEngine = new DuplicateEngine();
        this.scoreEngine = new ScoreEngine();
        this.serpPreview = new SerpPreview();
        this.exportEngine = new ExportEngine();
        this.sessionManager = new SessionManager();

        this.state = {
            content: '',
            htmlContent: '',
            focusKeyword: '',
            results: null
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.restoreSession();
        this.checkUrlContent();
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Analyze buttons
        document.getElementById('btn-run-analysis')?.addEventListener('click', () => this.runAnalysis());
        document.getElementById('btn-analyze')?.addEventListener('click', () => this.runAnalysis());

        // Clear button
        document.getElementById('btn-clear')?.addEventListener('click', () => this.clearContent());

        // Fetch URL
        document.getElementById('btn-fetch')?.addEventListener('click', () => this.fetchUrl());

        // Keyword check
        document.getElementById('btn-check-keyword')?.addEventListener('click', () => this.checkKeyword());

        // Export
        document.getElementById('btn-export')?.addEventListener('click', () => this.showExportModal());
        document.getElementById('btn-export-text')?.addEventListener('click', () => this.exportText());
        document.getElementById('btn-export-json')?.addEventListener('click', () => this.exportJSON());
        document.getElementById('btn-export-print')?.addEventListener('click', () => this.printReport());

        // Share
        document.getElementById('btn-share')?.addEventListener('click', () => this.shareAnalysis());
        document.getElementById('btn-copy-share')?.addEventListener('click', () => this.copyShareLink());

        // SERP preview
        document.getElementById('meta-title-input')?.addEventListener('input', () => this.updateSerpTitle());
        document.getElementById('meta-desc-input')?.addEventListener('input', () => this.updateSerpDesc());
        document.getElementById('btn-mobile-view')?.addEventListener('click', () => this.setMobileView(true));
        document.getElementById('btn-desktop-view')?.addEventListener('click', () => this.setMobileView(false));

        // Compare mode
        document.getElementById('btn-compare-mode')?.addEventListener('click', () => this.showCompareModal());
        document.getElementById('btn-run-compare')?.addEventListener('click', () => this.runCompare());

        // Modal close
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // Close modal on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModals();
            });
        });

        // Auto-analyze on typing (debounced)
        let debounceTimer;
        const editor = document.getElementById('content-editor');
        if (editor) {
            editor.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => this.runAnalysis(), 500);
            });
        }

        // Keyword input
        const focusKeyword = document.getElementById('focus-keyword');
        if (focusKeyword) {
            focusKeyword.addEventListener('input', () => {
                this.state.focusKeyword = focusKeyword.value;
                if (this.state.content) {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => this.runAnalysis(), 500);
                }
            });
        }
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        document.querySelector(`.tab[data-tab="${tabId}"]`)?.classList.add('active');
        document.getElementById(`tab-${tabId}`)?.classList.add('active');
    }

    runAnalysis() {
        const textEditor = document.getElementById('content-editor');
        const htmlEditor = document.getElementById('html-editor');
        const focusKeyword = document.getElementById('focus-keyword');

        this.state.content = textEditor?.value || '';
        this.state.htmlContent = htmlEditor?.value || '';
        this.state.focusKeyword = focusKeyword?.value || '';

        if (!this.state.content && !this.state.htmlContent) {
            return;
        }

        // Run all analysis engines
        const readabilityScores = this.readability.analyze(this.state.content);
        const structureScores = this.structure.analyze(this.state.content, this.state.htmlContent);
        const seoScores = this.seo.analyze(
            this.state.content,
            this.state.htmlContent,
            this.state.focusKeyword,
            { title: '', description: '' }
        );

        // Calculate master score
        const score = this.scoreEngine.calculate({
            readability: readabilityScores,
            structure: structureScores,
            seo: seoScores,
            links: { internal: seoScores.internalLinks, external: seoScores.externalLinks, nofollow: seoScores.nofollowLinks },
            images: { totalImages: seoScores.imageCount, altCoverage: seoScores.altCoverage }
        });

        this.state.results = {
            readability: readabilityScores,
            structure: structureScores,
            seo: seoScores,
            score,
            meta: {
                wordCount: this.textParser.tokenize(this.state.content).length,
                sentenceCount: this.textParser.tokenizeSentences(this.state.content).length,
                paragraphCount: this.textParser.tokenizeParagraphs(this.state.content).length
            }
        };

        this.updateUI();
        this.saveSession();
    }

    updateUI() {
        const results = this.state.results;
        if (!results) return;

        // Update Score Dashboard
        this.updateScoreDashboard(results.score);

        // Update Readability
        this.updateReadability(results.readability);

        // Update Stats
        this.updateStats(results.meta || results.structure);

        // Update Keyword
        this.updateKeyword(results.seo);

        // Update On-Page Checklist
        this.updateChecklist(results.seo);

        // Update Headings
        this.updateHeadings(results.seo);

        // Update Links
        this.updateLinks(results.seo);

        // Update Images
        this.updateImages(results.seo);

        // Update Issues
        this.updateIssues();
    }

    updateScoreDashboard(score) {
        if (!score) return;

        const masterScore = document.getElementById('master-score');
        const scoreCircle = document.getElementById('score-circle');

        if (masterScore) masterScore.textContent = score.master;
        if (scoreCircle) {
            const offset = 283 - (283 * score.master / 100);
            scoreCircle.style.strokeDashoffset = offset;

            // Color based on score
            const color = score.color === 'green' ? '#22c55e' : score.color === 'amber' ? '#f59e0b' : '#ef4444';
            scoreCircle.style.stroke = color;
        }

        // Update component scores
        ['readability', 'seo', 'structure', 'meta', 'links'].forEach(comp => {
            const bar = document.getElementById(`score-${comp}`);
            const val = document.getElementById(`score-${comp}-val`);
            if (bar) bar.style.width = `${score.components[comp]}%`;
            if (val) val.textContent = score.components[comp];
        });
    }

    updateReadability(readability) {
        if (!readability) return;

        const fields = [
            ['flesch-ease', readability.fleschKincaidEase],
            ['flesch-grade', readability.fleschKincaidGrade],
            ['gunning-fog', readability.gunningFog],
            ['smog-index', readability.smog],
            ['coleman-liau', readability.colemanLiau],
            ['ari-index', readability.ari]
        ];

        fields.forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value?.toFixed(1) || '-';
        });
    }

    updateStats(stats) {
        if (!stats) return;

        const fields = [
            ['word-count', stats.wordCount],
            ['sentence-count', stats.sentenceCount],
            ['paragraph-count', stats.paragraphCount],
            ['avg-words-sentence', stats.avgWordsPerSentence?.toFixed(1)],
            ['avg-words-para', stats.avgWordsPerParagraph?.toFixed(1)]
        ];

        fields.forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value || 0;
        });

        // Reading time
        const readingTime = document.getElementById('reading-time');
        const speakingTime = document.getElementById('speaking-time');

        const words = stats.wordCount || 0;
        const readingMin = Math.ceil(words / 200);
        const speakingMin = Math.ceil(words / 130);

        if (readingTime) readingTime.textContent = `${readingMin} min`;
        if (speakingTime) speakingTime.textContent = `${speakingMin} min`;
    }

    updateKeyword(seo) {
        if (!seo) return;

        const densityEl = document.getElementById('keyword-density');
        const countEl = document.getElementById('keyword-count');

        if (densityEl) densityEl.textContent = `${seo.keywordDensity?.toFixed(2) || 0}%`;
        if (countEl) countEl.textContent = seo.keywordCount || 0;
    }

    updateChecklist(seo) {
        if (!seo) return;

        const checks = [
            ['title-keyword', seo.keywordInTitle],
            ['meta-desc-keyword', seo.keywordInMetaDesc],
            ['first-100', seo.keywordInFirst100],
            ['h1-keyword', seo.keywordInH1],
            ['h2-keyword', seo.keywordInH2],
            ['alt-keyword', seo.keywordInAlt],
            ['url-keyword', seo.keywordInUrlSlug],
            ['heading-hierarchy', seo.headingHierarchyValid?.valid],
            ['no-stuffing', !seo.keywordStuffing]
        ];

        checks.forEach(([id, passed]) => {
            const el = document.querySelector(`.check-item[data-check="${id}"]`);
            if (el) {
                el.classList.remove('pass', 'fail');
                el.classList.add(passed ? 'pass' : 'fail');
            }
        });
    }

    updateHeadings(seo) {
        if (!seo) return;

        const countEl = document.getElementById('heading-count');
        const h1El = document.getElementById('h1-count');
        const h2El = document.getElementById('h2-count');

        if (countEl) countEl.textContent = seo.headingCount || 0;
        if (h1El) h1El.textContent = seo.headingCounts?.h1 || 0;
        if (h2El) h2El.textContent = seo.headingCounts?.h2 || 0;
    }

    updateLinks(seo) {
        if (!seo) return;

        const fields = [
            ['internal-links', seo.internalLinks],
            ['external-links', seo.externalLinks],
            ['nofollow-links', seo.nofollowLinks]
        ];

        fields.forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value || 0;
        });
    }

    updateImages(seo) {
        if (!seo) return;

        const fields = [
            ['image-count', seo.imageCount],
            ['images-with-alt', seo.imagesWithAlt],
            ['alt-coverage', seo.altCoverage]
        ];

        fields.forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) {
                if (id === 'alt-coverage') {
                    el.textContent = `${value?.toFixed(1) || 0}%`;
                } else {
                    el.textContent = value || 0;
                }
            }
        });
    }

    updateIssues() {
        // This would update based on actual issue detection
        // Simplified for now
    }

    updateSerpTitle() {
        const input = document.getElementById('meta-title-input');
        const preview = document.getElementById('serp-title');
        const count = document.getElementById('title-count');

        if (preview) preview.textContent = input?.value || 'Your Page Title Here';
        if (count) {
            const len = input?.value?.length || 0;
            count.textContent = `${len}/60`;
            count.classList.remove('warning', 'error');
            if (len > 60) count.classList.add('error');
            else if (len > 50) count.classList.add('warning');
        }
    }

    updateSerpDesc() {
        const input = document.getElementById('meta-desc-input');
        const preview = document.getElementById('serp-description');
        const count = document.getElementById('desc-count');

        if (preview) preview.textContent = input?.value || 'Your meta description will appear here...';
        if (count) {
            const len = input?.value?.length || 0;
            count.textContent = `${len}/160`;
            count.classList.remove('warning', 'error');
            if (len > 160) count.classList.add('error');
            else if (len > 150) count.classList.add('warning');
        }
    }

    setMobileView(isMobile) {
        const preview = document.getElementById('serp-preview');
        if (preview) {
            preview.style.maxWidth = isMobile ? '350px' : '600px';
        }
    }

    clearContent() {
        document.getElementById('content-editor').value = '';
        document.getElementById('html-editor').value = '';
        document.getElementById('focus-keyword').value = '';
        this.state = { content: '', htmlContent: '', focusKeyword: '', results: null };
        this.sessionManager.clear();
    }

    async fetchUrl() {
        const input = document.getElementById('url-input');
        const status = document.getElementById('fetch-status');
        const url = input?.value;

        if (!url) return;

        if (status) status.textContent = 'Fetching...';
        if (status) status.classList.add('loading');

        try {
            // Use a CORS proxy if needed
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);

            if (!response.ok) throw new Error('Failed to fetch');

            const html = await response.text();
            document.getElementById('html-editor').value = html;
            this.switchTab('html');

            if (status) status.textContent = 'Fetched successfully!';

            // Auto-analyze
            this.runAnalysis();
        } catch (e) {
            if (status) status.textContent = `Error: ${e.message}`;
        } finally {
            if (status) status.classList.remove('loading');
        }
    }

    checkKeyword() {
        const input = document.getElementById('keyword-check');
        const keyword = input?.value;

        if (!keyword || !this.state.content) return;

        // Re-run analysis with this keyword
        const results = this.state.results;
        if (results) {
            const density = (results.seo?.keywordDensity || 0).toFixed(2);
            document.getElementById('keyword-density').textContent = `${density}%`;
        }
    }

    showExportModal() {
        document.getElementById('export-modal')?.classList.add('show');
    }

    exportText() {
        if (!this.state.results) return;
        const text = this.exportEngine.exportText(this.state.results);
        this.exportEngine.download(text, 'seo-analysis-report.txt', 'text/plain');
        this.closeModals();
    }

    exportJSON() {
        if (!this.state.results) return;
        const json = this.exportEngine.exportJSON(this.state.results);
        this.exportEngine.download(json, 'seo-analysis-report.json', 'application/json');
        this.closeModals();
    }

    printReport() {
        if (!this.state.results) return;
        this.exportEngine.printResults(this.state.results);
        this.closeModals();
    }

    shareAnalysis() {
        const url = this.sessionManager.getShareUrl(this.state.content);
        if (url) {
            document.getElementById('share-url').value = url;
            document.getElementById('share-modal')?.classList.add('show');
        }
    }

    copyShareLink() {
        const input = document.getElementById('share-url');
        if (input) {
            input.select();
            document.execCommand('copy');
        }
    }

    showCompareModal() {
        document.getElementById('compare-modal')?.classList.add('show');
    }

    runCompare() {
        const textA = document.getElementById('compare-text-a')?.value;
        const textB = document.getElementById('compare-text-b')?.value;

        if (!textA || !textB) return;

        const result = this.duplicateEngine.compare(textA, textB);
        const resultsDiv = document.getElementById('compare-results');

        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <h4>Comparison Results</h4>
                <p><strong>Similarity:</strong> ${result.similarityScore.toFixed(1)}%</p>
                <p><strong>Word Count Difference:</strong> ${result.wordCountDiff}</p>
                <p><strong>Sentence Count Difference:</strong> ${result.sentenceCountDiff}</p>
                <p><strong>Common Sentences:</strong> ${result.commonSentences.length}</p>
            `;
        }
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    saveSession() {
        this.sessionManager.save({
            content: this.state.content,
            htmlContent: this.state.htmlContent,
            focusKeyword: this.state.focusKeyword
        });
    }

    restoreSession() {
        const session = this.sessionManager.restore();
        if (session) {
            document.getElementById('content-editor').value = session.content || '';
            document.getElementById('html-editor').value = session.htmlContent || '';
            document.getElementById('focus-keyword').value = session.focusKeyword || '';
        }
    }

    checkUrlContent() {
        const content = this.sessionManager.getContentFromUrl();
        if (content) {
            document.getElementById('content-editor').value = content;
            this.runAnalysis();
        }
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.seoToolsApp = new SEO ToolsApp();
});

export default SEO ToolsApp;