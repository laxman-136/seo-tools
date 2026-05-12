# SEO Tools

A complete, open-source SEO content analysis suite with 15 built-in features. No APIs, no paid dependencies, no external services - pure browser-native JavaScript.

## Features

### 1. Readability Engine
- Flesch-Kincaid Reading Ease & Grade Level
- Gunning Fog Index
- SMOG Index
- Coleman-Liau Index
- Automated Readability Index (ARI)
- Average sentence/word length
- Hard sentence detector (14+ words)
- Very hard sentence detector (25+ words)
- Passive voice detection
- Adverb detector (-ly words)
- Weak word detector
- Complex word highlighter (3+ syllables)

### 2. On-Page SEO Analyzer
- Focus keyword input
- Keyword density calculator
- Keyword in title/meta/H1/H2 check
- Keyword in first 100 words
- Keyword in image alt text
- Keyword in URL slug
- TF-IDF approximation
- LSI/related keyword suggestions
- Exact/partial/semantic match scoring
- Keyword stuffing warning
- Heading hierarchy validator
- Link counter

### 3. Content Structure Analyzer
- Word/sentence/paragraph count
- Paragraph length analysis
- Longest/shortest sentence
- Transition word ratio
- Introduction/conclusion detection
- Subheading distribution

### 4. SERP Preview Simulator
- Live Google-style preview
- Title/description character counter
- Truncation warnings
- Mobile/desktop toggle
- Best practice scoring

### 5. Heading Structure Visualizer
- H1-H6 tree view
- Missing/multiple H1 detection
- Hierarchy violation flags
- Keyword in headings

### 6. Keyword Density & Frequency Map
- Word frequency table
- Stopword filtering
- Bigram/trigram analysis
- Density heatmap

### 7. Link Analyzer
- Internal/external link count
- Anchor text quality check
- Generic anchor detection
- Nofollow checker

### 8. Image SEO Checker
- Alt text coverage
- Lazy loading check
- Dimension checker

### 9. Content Score Dashboard
- Master score (0-100)
- Weighted sub-scores
- Color-coded ratings

### 10. Duplicate Content Detector
- Repeated sentences
- Phrase repetition
- Overused words
- Compare mode

### 11-15. Additional Tools
- Writing Statistics Panel
- Technical Content Checks
- Export & Report Functions
- Session persistence
- URL sharing

## Tech Stack

- Vanilla JavaScript
- Browser DOMParser API
- Pure regex patterns
- localStorage for sessions
- Zero paid dependencies

## Usage

1. Clone or download this repository
2. Open `index.html` in any browser
3. Paste your content or HTML
4. Enter your focus keyword
5. Click "Analyze"

For URL analysis, enter a URL and click "Fetch & Analyze"

## File Structure

```
seo-tools/
├── index.html          # Main app
├── style.css         # All styling
├── js/
│   ├── main.js        # App initialization
│   ├── parser.js      # Content parsers
│   ├── readability.js # Readability formulas
│   ├── seo.js       # SEO analysis
│   ├── structure.js  # Content structure
│   ├── links.js     # Link analyzer
│   ├── images.js    # Image checker
│   ├── duplicate.js # Duplicate detection
│   ├── scorer.js    # Score aggregator
│   ├── serp.js     # SERP preview
│   ├── export.js   # Export functions
│   ├── session.js  # localStorage
│   └── data/
│       ├── stopwords.js
│       ├── transition-words.js
│       ├── weak-words.js
│       └── passive-patterns.js
└── README.md
```

## License

MIT License - Free to use, modify, and distribute.

## Philosophy

Everything runs on open algorithms, public data, browser-native parsing, and mathematical formulas. No OpenAI, no Anthropic, no Moz API, no Ahrefs API. Pure engineering.