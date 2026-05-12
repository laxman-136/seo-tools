// Image SEO Checker - Image alt text, filename, lazy load checker
import { Parser } from './parser.js';

export class ImageEngine {
    constructor() {}

    // Analyze images from HTML
    analyze(images, focusKeyword = '') {
        return {
            // Counts
            totalImages: images.length,
            imagesWithAlt: images.filter(i => i.hasAlt).length,
            imagesWithoutAlt: images.filter(i => !i.hasAlt).length,

            // Coverage
            altCoverage: this.calculateCoverage(images),
            missingAlt: this.findMissingAlt(images),

            // Keyword checks
            keywordInAlt: this.findKeywordInAlt(images, focusKeyword),
            keywordInFilename: this.findKeywordInFilename(images, focusKeyword),

            // Quality
            descriptiveAlt: this.findDescriptiveAlt(images),
            genericAlt: this.findGenericAlt(images),

            // Lazy loading
            lazyLoadCoverage: this.calculateLazyLoadCoverage(images),

            // Size issues
            missingDimensions: this.findMissingDimensions(images),

            // All images
            images: images.map(img => ({
                src: img.src,
                alt: img.alt,
                title: img.title,
                width: img.width,
                height: img.height,
                hasAlt: img.hasAlt,
                hasLazyLoad: img.hasLazyLoad
            }))
        };
    }

    // Calculate alt text coverage percentage
    calculateCoverage(images) {
        if (!images.length) return 0;
        const withAlt = images.filter(i => i.hasAlt).length;
        return (withAlt / images.length) * 100;
    }

    // Find images missing alt text
    findMissingAlt(images) {
        return images
            .filter(i => !i.hasAlt)
            .map(i => ({
                src: i.src,
                alt: i.alt || '(empty)',
                issue: 'Missing alt text'
            }));
    }

    // Find keyword in alt text
    findKeywordInAlt(images, keyword) {
        if (!keyword) return [];
        return images.filter(i =>
            i.alt && i.alt.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    // Find keyword in filename
    findKeywordInFilename(images, keyword) {
        if (!keyword) return [];
        const keywordLower = keyword.toLowerCase().replace(/\s+/g, '-');
        return images.filter(i =>
            i.src.toLowerCase().includes(keywordLower)
        );
    }

    // Find descriptive alt text (not just filename)
    findDescriptiveAlt(images) {
        const genericPatterns = [
            /^image\d+/i,
            /^img\d+/i,
            /^photo\d+/i,
            /^picture\d+/i,
            /\.jpe?g$/i,
            /\.png$/i,
            /\.gif$/i,
            /\.webp$/i
        ];

        return images.filter(i => {
            if (!i.alt) return false;
            // Check if alt is just a filename
            return !genericPatterns.some(p => p.test(i.alt));
        });
    }

    // Find generic alt text
    findGenericAlt(images) {
        const genericPatterns = [
            /^image\d+/i,
            /^img\d+/i,
            /^photo\d+/i,
            /^picture\d+/i,
            /^DSC/i,
            /^PXL/i,
            /^IMG_/i,
            /^[a-z0-9]+\.(jpe?g|png|gif|webp)$/i
        ];

        return images
            .filter(i => i.alt && genericPatterns.some(p => p.test(i.alt)))
            .map(i => ({
                src: i.src,
                alt: i.alt,
                issue: 'Generic/f filename as alt text'
            }));
    }

    // Calculate lazy load coverage
    calculateLazyLoadCoverage(images) {
        if (!images.length) return 0;
        const lazy = images.filter(i => i.hasLazyLoad).length;
        return (lazy / images.length) * 100;
    }

    // Find images missing width/height
    findMissingDimensions(images) {
        return images
            .filter(i => !i.width || !i.height)
            .map(i => ({
                src: i.src,
                width: i.width || '(missing)',
                height: i.height || '(missing)',
                issue: 'Missing dimensions'
            }));
    }
}

export default ImageEngine;