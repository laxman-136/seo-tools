// Session Management - localStorage save/restore + URL share encoding
export class SessionManager {
    constructor() {
        this.sessionKey = 'seo-tools-session';
    }

    // Save session to localStorage
    save(data) {
        try {
            const session = {
                ...data,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
            return true;
        } catch (e) {
            console.error('Failed to save session:', e);
            return false;
        }
    }

    // Restore session from localStorage
    restore() {
        try {
            const stored = localStorage.getItem(this.sessionKey);
            if (!stored) return null;
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to restore session:', e);
            return null;
        }
    }

    // Clear session
    clear() {
        localStorage.removeItem(this.sessionKey);
    }

    // Encode content for URL sharing
    encodeForUrl(content) {
        try {
            const encoded = btoa(encodeURIComponent(content));
            return encoded;
        } catch (e) {
            console.error('Failed to encode for URL:', e);
            return null;
        }
    }

    // Decode from URL
    decodeFromUrl(encoded) {
        try {
            const decoded = decodeURIComponent(atob(encoded));
            return decoded;
        } catch (e) {
            console.error('Failed to decode from URL:', e);
            return null;
        }
    }

    // Get share URL
    getShareUrl(content) {
        const encoded = this.encodeForUrl(content);
        if (!encoded) return null;

        const baseUrl = window.location.href.split('#')[0];
        return `${baseUrl}#content=${encoded}`;
    }

    // Check for content in URL hash
    getContentFromUrl() {
        try {
            const hash = window.location.hash;
            if (!hash || !hash.includes('content=')) return null;

            const encoded = hash.split('content=')[1];
            return this.decodeFromUrl(encoded);
        } catch (e) {
            console.error('Failed to get content from URL:', e);
            return null;
        }
    }

    // Has saved session
    hasSession() {
        return localStorage.getItem(this.sessionKey) !== null;
    }
}

export default SessionManager;