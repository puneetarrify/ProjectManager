const wordsCounter = {
    currentText: '',
    excludeStopWords: true,

    stopWords: new Set([
        'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at', 
        'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 
        'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 
        'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 
        'each', 'few', 'for', 'from', 'further', 
        'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 
        'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 
        'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 
        'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 
        'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 
        'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too', 
        'under', 'until', 'up', 'very', 
        'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 
        'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
    ]),

    sampleText: `Salesforce development brings powerful enterprise capabilities, combining declarative configuration with programmatic custom logic like Apex, Lightning Web Components, and sophisticated integration APIs.

As organizations scale, continuous integration and release governance become paramount. Managing sandbox environments, synchronizing metadata across Git branches, tracking scratch org credentials, and automating deployments allow teams to deliver high quality applications with precision and velocity.

A great developer toolkit empowers engineers to write clean code, audit differences quickly, analyze documentation, and convert multimedia assets seamlessly directly from their centralized workspace.`,

    render() {
        document.getElementById('page-title').textContent = 'Words Counter';
        const content = document.getElementById('app-content');

        if (!this.currentText) {
            this.currentText = this.sampleText;
        }

        const html = `
            <div class="words-counter-container" style="display: flex; flex-direction: column; gap: 20px;">
                <!-- Header Card -->
                <div class="glass-panel" style="padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                    <div>
                        <h2 style="margin: 0 0 6px 0; font-size: 1.35rem; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
                            <i class='bx bx-text' style="color: var(--primary-color);"></i>
                            Words & Text Counter
                        </h2>
                        <p style="color: var(--text-muted); margin: 0; font-size: 0.9rem;">
                            Real-time text analytics, word density, readability metrics, and text manipulation tools.
                        </p>
                    </div>

                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <button class="btn btn-secondary" onclick="wordsCounter.loadSample()" style="padding: 7px 14px; font-size: 0.85rem; background: rgba(255,255,255,0.06); color: var(--text-main);">
                            <i class='bx bx-file-blank'></i> Sample Text
                        </button>

                        <label class="btn btn-secondary" style="padding: 7px 14px; font-size: 0.85rem; background: rgba(255,255,255,0.06); color: var(--text-main); cursor: pointer; margin: 0;">
                            <i class='bx bx-upload'></i> Upload File
                            <input type="file" id="word-counter-upload" accept=".txt,.md,.json,.csv,.log,.html,.js" style="display: none;" onchange="wordsCounter.handleFileUpload(event)">
                        </label>

                        <button class="btn btn-secondary" onclick="wordsCounter.copyText()" style="padding: 7px 14px; font-size: 0.85rem; background: rgba(255,255,255,0.06); color: var(--text-main);">
                            <i class='bx bx-copy'></i> Copy
                        </button>

                        <button class="btn btn-secondary" onclick="wordsCounter.downloadText()" style="padding: 7px 14px; font-size: 0.85rem; background: rgba(255,255,255,0.06); color: var(--text-main);">
                            <i class='bx bx-download'></i> Download .txt
                        </button>

                        <button class="btn btn-danger" onclick="wordsCounter.clearText()" style="padding: 7px 12px; font-size: 0.85rem;">
                            <i class='bx bx-trash'></i> Clear
                        </button>
                    </div>
                </div>

                <!-- Primary Metrics Cards Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
                    <div class="glass-panel stat-card" style="padding: 16px 20px; text-align: center; border-bottom: 3px solid #6c5ce7;">
                        <div id="stat-words" style="font-size: 2rem; font-weight: 700; color: #fff;">0</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-top: 4px; font-weight: 500;">Words</div>
                    </div>
                    <div class="glass-panel stat-card" style="padding: 16px 20px; text-align: center; border-bottom: 3px solid #00cec9;">
                        <div id="stat-chars-all" style="font-size: 2rem; font-weight: 700; color: #fff;">0</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-top: 4px; font-weight: 500;">Characters</div>
                    </div>
                    <div class="glass-panel stat-card" style="padding: 16px 20px; text-align: center; border-bottom: 3px solid #fdcb6e;">
                        <div id="stat-chars-no-space" style="font-size: 2rem; font-weight: 700; color: #fff;">0</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-top: 4px; font-weight: 500;">Chars (No Space)</div>
                    </div>
                    <div class="glass-panel stat-card" style="padding: 16px 20px; text-align: center; border-bottom: 3px solid #a29bfe;">
                        <div id="stat-sentences" style="font-size: 2rem; font-weight: 700; color: #fff;">0</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-top: 4px; font-weight: 500;">Sentences</div>
                    </div>
                    <div class="glass-panel stat-card" style="padding: 16px 20px; text-align: center; border-bottom: 3px solid #e17055;">
                        <div id="stat-paragraphs" style="font-size: 2rem; font-weight: 700; color: #fff;">0</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-top: 4px; font-weight: 500;">Paragraphs</div>
                    </div>
                    <div class="glass-panel stat-card" style="padding: 16px 20px; text-align: center; border-bottom: 3px solid #0984e3;">
                        <div id="stat-lines" style="font-size: 2rem; font-weight: 700; color: #fff;">0</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-top: 4px; font-weight: 500;">Lines</div>
                    </div>
                </div>

                <!-- Secondary Estimates Banner -->
                <div class="glass-panel" style="padding: 14px 20px; display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 16px; background: rgba(0,0,0,0.25);">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class='bx bx-book-open' style="color: var(--primary-color); font-size: 1.25rem;"></i>
                        <div>
                            <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Reading Time (~225 wpm)</span>
                            <span id="stat-reading-time" style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">0 sec</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class='bx bx-microphone' style="color: #00cec9; font-size: 1.25rem;"></i>
                        <div>
                            <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Speaking Time (~140 wpm)</span>
                            <span id="stat-speaking-time" style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">0 sec</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class='bx bx-file' style="color: #fdcb6e; font-size: 1.25rem;"></i>
                        <div>
                            <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Estimated Pages</span>
                            <span id="stat-pages" style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">0 pages</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class='bx bx-ruler' style="color: #a29bfe; font-size: 1.25rem;"></i>
                        <div>
                            <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Avg Word / Sentence</span>
                            <span id="stat-averages" style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">0 chars / 0 words</span>
                        </div>
                    </div>
                </div>

                <!-- Text Area & Quick Text Transforms -->
                <div class="glass-panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px;">
                    <!-- Transforms Toolbar -->
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">
                            Quick Text Actions
                        </span>
                        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                            <button class="btn btn-secondary" onclick="wordsCounter.transform('upper')" style="padding: 5px 10px; font-size: 0.78rem; background: rgba(255,255,255,0.06); color: var(--text-main);">
                                UPPERCASE
                            </button>
                            <button class="btn btn-secondary" onclick="wordsCounter.transform('lower')" style="padding: 5px 10px; font-size: 0.78rem; background: rgba(255,255,255,0.06); color: var(--text-main);">
                                lowercase
                            </button>
                            <button class="btn btn-secondary" onclick="wordsCounter.transform('title')" style="padding: 5px 10px; font-size: 0.78rem; background: rgba(255,255,255,0.06); color: var(--text-main);">
                                Title Case
                            </button>
                            <button class="btn btn-secondary" onclick="wordsCounter.transform('sentence')" style="padding: 5px 10px; font-size: 0.78rem; background: rgba(255,255,255,0.06); color: var(--text-main);">
                                Sentence case
                            </button>
                            <button class="btn btn-secondary" onclick="wordsCounter.transform('trimSpaces')" style="padding: 5px 10px; font-size: 0.78rem; background: rgba(255,255,255,0.06); color: var(--text-main);" title="Trim leading/trailing spaces and collapse multiple whitespaces per line">
                                Trim Extra Spaces
                            </button>
                            <button class="btn btn-secondary" onclick="wordsCounter.transform('removeEmptyLines')" style="padding: 5px 10px; font-size: 0.78rem; background: rgba(255,255,255,0.06); color: var(--text-main);" title="Remove blank lines">
                                Remove Empty Lines
                            </button>
                            <button class="btn btn-secondary" onclick="wordsCounter.transform('stripHtml')" style="padding: 5px 10px; font-size: 0.78rem; background: rgba(255,255,255,0.06); color: var(--text-main);" title="Strip HTML tags">
                                Strip HTML
                            </button>
                        </div>
                    </div>

                    <!-- Main Textarea -->
                    <textarea id="wc-text-input" 
                        rows="10" 
                        style="width: 100%; border: 1px solid var(--border-color); outline: none; background: rgba(0,0,0,0.3); color: var(--text-main); font-size: 14.5px; line-height: 1.6; padding: 16px; border-radius: var(--radius-md); resize: vertical;" 
                        placeholder="Type, paste, or upload text here to analyze..."
                        oninput="wordsCounter.onInput(this.value)"></textarea>
                </div>

                <!-- Keyword Density & Character Breakdown Section -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
                    <!-- Top Keyword Frequency -->
                    <div class="glass-panel" style="padding: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                            <h3 style="margin: 0; font-size: 1rem; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
                                <i class='bx bx-bar-chart-alt-2' style="color: var(--primary-color);"></i>
                                Keyword Frequency & Density
                            </h3>
                            <label style="font-size: 0.78rem; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                <input type="checkbox" id="chk-stop-words" ${this.excludeStopWords ? 'checked' : ''} onchange="wordsCounter.toggleStopWords(this.checked)">
                                Exclude Stop Words
                            </label>
                        </div>
                        <div id="keyword-density-list" style="display: flex; flex-direction: column; gap: 10px; max-height: 280px; overflow-y: auto;">
                            <!-- Keyword list populated here -->
                        </div>
                    </div>

                    <!-- Character Breakdown -->
                    <div class="glass-panel" style="padding: 20px;">
                        <h3 style="margin: 0 0 16px 0; font-size: 1rem; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
                            <i class='bx bx-pie-chart-alt-2' style="color: #00cec9;"></i>
                            Character Distribution
                        </h3>
                        <div id="char-distribution-list" style="display: flex; flex-direction: column; gap: 12px;">
                            <!-- Character distribution bars populated here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        content.innerHTML = html;
        this.init();
    },

    init() {
        const textarea = document.getElementById('wc-text-input');
        if (textarea) {
            textarea.value = this.currentText;
        }
        this.calculate();
    },

    onInput(val) {
        this.currentText = val;
        this.calculate();
    },

    calculate() {
        const text = this.currentText || '';

        // 1. Words
        const wordsArr = text.trim().match(/[\w'-]+/g) || [];
        const words = wordsArr.length;

        // 2. Characters
        const charsAll = text.length;
        const charsNoSpace = text.replace(/\s/g, '').length;

        // 3. Sentences
        const sentencesArr = text.trim() ? text.split(/[.!?]+(?:\s|$)/).filter(s => s.trim().length > 0) : [];
        const sentences = sentencesArr.length;

        // 4. Paragraphs
        const paragraphsArr = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim().length > 0) : [];
        const paragraphs = paragraphsArr.length;

        // 5. Lines
        const lines = text.length > 0 ? text.split(/\r\n|\r|\n/).length : 0;

        // 6. Reading / Speaking times
        const readingMinutes = words / 225;
        const speakingMinutes = words / 140;

        // Update Stats DOM
        this.setEl('stat-words', words.toLocaleString());
        this.setEl('stat-chars-all', charsAll.toLocaleString());
        this.setEl('stat-chars-no-space', charsNoSpace.toLocaleString());
        this.setEl('stat-sentences', sentences.toLocaleString());
        this.setEl('stat-paragraphs', paragraphs.toLocaleString());
        this.setEl('stat-lines', lines.toLocaleString());

        this.setEl('stat-reading-time', this.formatTime(readingMinutes));
        this.setEl('stat-speaking-time', this.formatTime(speakingMinutes));
        this.setEl('stat-pages', `${(words / 275).toFixed(1)} pages`);

        const avgWord = words > 0 ? (charsNoSpace / words).toFixed(1) : '0';
        const avgSentence = sentences > 0 ? (words / sentences).toFixed(1) : '0';
        this.setEl('stat-averages', `${avgWord} chars / ${avgSentence} words`);

        // Keyword Density
        this.renderKeywords(wordsArr, words);

        // Character Distribution
        this.renderCharDistribution(text, charsAll);
    },

    formatTime(minutesFloat) {
        if (!minutesFloat || minutesFloat === 0) return '0 sec';
        const totalSeconds = Math.round(minutesFloat * 60);
        if (totalSeconds < 60) {
            return `${totalSeconds} sec`;
        }
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
    },

    setEl(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    },

    renderKeywords(wordsArr, totalWords) {
        const container = document.getElementById('keyword-density-list');
        if (!container) return;

        if (totalWords === 0) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 24px 0; font-size: 0.85rem;">No words entered yet.</div>`;
            return;
        }

        const counts = {};
        wordsArr.forEach(w => {
            const clean = w.toLowerCase();
            if (this.excludeStopWords && this.stopWords.has(clean)) return;
            if (clean.length < 2) return;
            counts[clean] = (counts[clean] || 0) + 1;
        });

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);

        if (sorted.length === 0) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 24px 0; font-size: 0.85rem;">No unique keywords found with current filter.</div>`;
            return;
        }

        const maxCount = sorted[0][1];

        let html = '';
        sorted.forEach(([word, count]) => {
            const pct = ((count / totalWords) * 100).toFixed(1);
            const barWidth = Math.max(8, Math.round((count / maxCount) * 100));

            html += `
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                        <span style="font-weight: 500; color: var(--text-main);">${word}</span>
                        <span style="color: var(--text-muted); font-size: 0.8rem;">${count} (${pct}%)</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                        <div style="width: ${barWidth}%; height: 100%; background: linear-gradient(90deg, var(--primary-color), #a29bfe); border-radius: 3px;"></div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    renderCharDistribution(text, totalChars) {
        const container = document.getElementById('char-distribution-list');
        if (!container) return;

        if (totalChars === 0) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 24px 0; font-size: 0.85rem;">No characters entered yet.</div>`;
            return;
        }

        const letters = (text.match(/[a-zA-Z]/g) || []).length;
        const digits = (text.match(/[0-9]/g) || []).length;
        const spaces = (text.match(/\s/g) || []).length;
        const symbols = totalChars - (letters + digits + spaces);

        const items = [
            { label: 'Letters (a-z, A-Z)', count: letters, color: '#6c5ce7' },
            { label: 'Numbers (0-9)', count: digits, color: '#00cec9' },
            { label: 'Spaces & Tabs', count: spaces, color: '#fdcb6e' },
            { label: 'Punctuation & Symbols', count: symbols, color: '#ff6b6b' }
        ];

        let html = '';
        items.forEach(item => {
            const pct = ((item.count / totalChars) * 100).toFixed(1);
            html += `
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                        <span style="color: var(--text-main); font-weight: 500;">${item.label}</span>
                        <span style="color: var(--text-muted); font-size: 0.8rem;">${item.count.toLocaleString()} (${pct}%)</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                        <div style="width: ${pct}%; height: 100%; background: ${item.color}; border-radius: 3px;"></div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    toggleStopWords(checked) {
        this.excludeStopWords = checked;
        this.calculate();
    },

    transform(type) {
        if (!this.currentText) return;

        let result = this.currentText;
        if (type === 'upper') {
            result = result.toUpperCase();
        } else if (type === 'lower') {
            result = result.toLowerCase();
        } else if (type === 'title') {
            result = result.toLowerCase().replace(/(^|[^\p{L}\p{N}])(\p{L})/gu, (match, prefix, char) => prefix + char.toUpperCase());
        } else if (type === 'sentence') {
            result = result.toLowerCase().replace(/(^\s*|\n+\s*|[.!?]\s+)(\p{L})/gu, (match, prefix, char) => prefix + char.toUpperCase());
        } else if (type === 'trimSpaces') {
            result = result.split(/\r?\n/).map(line => line.trim().replace(/[ \t]+/g, ' ')).join('\n');
        } else if (type === 'removeEmptyLines') {
            result = result.split(/\r?\n/).filter(line => line.trim().length > 0).join('\n');
        } else if (type === 'stripHtml') {
            result = result.replace(/<[^>]*>/g, '');
        }

        this.currentText = result;
        const textarea = document.getElementById('wc-text-input');
        if (textarea) textarea.value = result;
        this.calculate();
        if (window.app) window.app.showToast('Text transformed!');
    },

    loadSample() {
        this.currentText = this.sampleText;
        const textarea = document.getElementById('wc-text-input');
        if (textarea) textarea.value = this.currentText;
        this.calculate();
        if (window.app) window.app.showToast('Sample text loaded!');
    },

    async copyText() {
        if (!this.currentText) return;
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(this.currentText);
            } else {
                throw new Error('Clipboard fallback');
            }
        } catch {
            const textarea = document.getElementById('wc-text-input') || document.createElement('textarea');
            textarea.value = this.currentText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            if (textarea.parentNode === document.body) document.body.removeChild(textarea);
        }
        if (window.app) window.app.showToast('Text copied to clipboard!');
    },

    downloadText() {
        const blob = new Blob([this.currentText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'word-counter-text.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (window.app) window.app.showToast('Downloaded text file.');
    },

    clearText() {
        if (confirm('Clear all text?')) {
            this.currentText = '';
            const textarea = document.getElementById('wc-text-input');
            if (textarea) textarea.value = '';
            this.calculate();
            if (window.app) window.app.showToast('Text cleared.');
        }
    },

    handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            this.currentText = event.target.result;
            const textarea = document.getElementById('wc-text-input');
            if (textarea) textarea.value = this.currentText;
            this.calculate();
            if (window.app) window.app.showToast(`Loaded ${file.name}`);
        };
        reader.readAsText(file);
        e.target.value = '';
    }
};
