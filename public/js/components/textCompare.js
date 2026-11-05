const textCompare = {
    originalText: '',
    modifiedText: '',
    viewMode: 'split',      // 'split', 'unified'
    ignoreCase: false,
    ignoreWhitespace: false,
    debounceTimer: null,

    sampleOriginal: `public with sharing class OpportunityService {
    public static void processOpportunities(List<Opportunity> opps) {
        for (Opportunity opp : opps) {
            if (opp.StageName == 'Closed Won') {
                opp.Description = 'Processed automatically by v1.0';
                opp.IsClosed__c = true;
            }
        }
        update opps;
    }
}`,

    sampleModified: `public with sharing class OpportunityService {
    public static void processOpportunities(List<Opportunity> opps) {
        List<Opportunity> toUpdate = new List<Opportunity>();
        for (Opportunity opp : opps) {
            if (opp.StageName == 'Closed Won' && opp.Amount > 1000) {
                opp.Description = 'Processed automatically by v2.0 - High Value';
                opp.Priority__c = 'High';
                toUpdate.add(opp);
            }
        }
        if (!toUpdate.isEmpty()) {
            update toUpdate;
        }
    }
}`,

    render() {
        document.getElementById('page-title').textContent = 'Text Compare';
        const content = document.getElementById('app-content');

        if (!this.originalText && !this.modifiedText) {
            this.originalText = this.sampleOriginal;
            this.modifiedText = this.sampleModified;
        }

        const html = `
            <div class="text-compare-container" style="display: flex; flex-direction: column; gap: 16px; min-height: calc(100vh - 120px);">
                <!-- Top Toolbar -->
                <div class="glass-panel" style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <div>
                        <h2 style="margin: 0 0 4px 0; font-size: 1.3rem; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
                            <i class='bx bx-git-compare' style="color: var(--primary-color);"></i>
                            Text & Code Compare (Diff)
                        </h2>
                        <p style="color: var(--text-muted); margin: 0; font-size: 0.85rem;">
                            Compare two texts, configurations, or code files side-by-side or inline with visual difference highlighting.
                        </p>
                    </div>

                    <!-- Toolbar Options & Actions -->
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <!-- View Mode Switch -->
                        <div class="btn-group" style="display: inline-flex; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 2px;">
                            <button class="btn-icon ${this.viewMode === 'split' ? 'active-mode' : ''}" id="btn-diff-split" title="Side-by-Side (Split) View" onclick="textCompare.setViewMode('split')">
                                <i class='bx bx-columns'></i> Split View
                            </button>
                            <button class="btn-icon ${this.viewMode === 'unified' ? 'active-mode' : ''}" id="btn-diff-unified" title="Inline (Unified) View" onclick="textCompare.setViewMode('unified')">
                                <i class='bx bx-list-ul'></i> Unified View
                            </button>
                        </div>

                        <!-- Options Dropdown / Toggles -->
                        <div style="display: flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.25); padding: 6px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                            <label style="font-size: 0.8rem; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 5px;">
                                <input type="checkbox" id="chk-ignore-case" ${this.ignoreCase ? 'checked' : ''} onchange="textCompare.toggleOption('ignoreCase', this.checked)">
                                Ignore Case
                            </label>
                            <label style="font-size: 0.8rem; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 5px;">
                                <input type="checkbox" id="chk-ignore-space" ${this.ignoreWhitespace ? 'checked' : ''} onchange="textCompare.toggleOption('ignoreWhitespace', this.checked)">
                                Ignore Whitespace
                            </label>
                        </div>

                        <!-- Actions -->
                        <button class="btn btn-secondary" onclick="textCompare.swapTexts()" style="padding: 6px 12px; font-size: 0.82rem; background: rgba(255,255,255,0.06); color: var(--text-main);" title="Swap Original and Modified">
                            <i class='bx bx-transfer'></i> Swap
                        </button>

                        <button class="btn btn-secondary" onclick="textCompare.loadSample()" style="padding: 6px 12px; font-size: 0.82rem; background: rgba(255,255,255,0.06); color: var(--text-main);" title="Load Sample Code">
                            <i class='bx bx-file-blank'></i> Sample
                        </button>

                        <button class="btn btn-secondary" onclick="textCompare.copyDiff()" style="padding: 6px 12px; font-size: 0.82rem; background: rgba(255,255,255,0.06); color: var(--text-main);" title="Copy Diff Result">
                            <i class='bx bx-copy'></i> Copy Diff
                        </button>

                        <button class="btn btn-danger" onclick="textCompare.clearBoth()" style="padding: 6px 10px; font-size: 0.82rem;" title="Clear Both Inputs">
                            <i class='bx bx-trash'></i> Clear
                        </button>
                    </div>
                </div>

                <!-- Input Text Editors -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <!-- Original Input -->
                    <div class="glass-panel" style="padding: 14px; display: flex; flex-direction: column; gap: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.85rem; font-weight: 600; color: #ff7675; display: flex; align-items: center; gap: 6px;">
                                <i class='bx bx-minus-circle'></i> Original Text (Before)
                            </span>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <label class="btn btn-secondary" style="padding: 3px 8px; font-size: 0.75rem; background: rgba(255,255,255,0.06); color: var(--text-main); cursor: pointer; margin: 0;">
                                    <i class='bx bx-upload'></i> Upload
                                    <input type="file" accept=".*" style="display: none;" onchange="textCompare.handleUpload(event, 'original')">
                                </label>
                                <button class="btn-icon" style="padding: 3px 6px; font-size: 0.8rem;" onclick="textCompare.clearSide('original')" title="Clear Original">
                                    <i class='bx bx-x'></i>
                                </button>
                            </div>
                        </div>
                        <textarea id="diff-orig-input" 
                            rows="6" 
                            style="width: 100%; border: 1px solid var(--border-color); outline: none; background: #0c0d14; color: #eceff4; font-family: monospace; font-size: 13px; line-height: 1.5; padding: 12px; border-radius: var(--radius-sm); resize: vertical;" 
                            placeholder="Paste original / older text here..."
                            oninput="textCompare.onInput('original', this.value)"></textarea>
                    </div>

                    <!-- Modified Input -->
                    <div class="glass-panel" style="padding: 14px; display: flex; flex-direction: column; gap: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.85rem; font-weight: 600; color: #00cec9; display: flex; align-items: center; gap: 6px;">
                                <i class='bx bx-plus-circle'></i> Modified Text (After)
                            </span>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <label class="btn btn-secondary" style="padding: 3px 8px; font-size: 0.75rem; background: rgba(255,255,255,0.06); color: var(--text-main); cursor: pointer; margin: 0;">
                                    <i class='bx bx-upload'></i> Upload
                                    <input type="file" accept=".*" style="display: none;" onchange="textCompare.handleUpload(event, 'modified')">
                                </label>
                                <button class="btn-icon" style="padding: 3px 6px; font-size: 0.8rem;" onclick="textCompare.clearSide('modified')" title="Clear Modified">
                                    <i class='bx bx-x'></i>
                                </button>
                            </div>
                        </div>
                        <textarea id="diff-mod-input" 
                            rows="6" 
                            style="width: 100%; border: 1px solid var(--border-color); outline: none; background: #0c0d14; color: #eceff4; font-family: monospace; font-size: 13px; line-height: 1.5; padding: 12px; border-radius: var(--radius-sm); resize: vertical;" 
                            placeholder="Paste modified / newer text here..."
                            oninput="textCompare.onInput('modified', this.value)"></textarea>
                    </div>
                </div>

                <!-- Diff Stats Banner -->
                <div class="glass-panel" id="diff-stats-bar" style="padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <span id="diff-badge-added" style="font-size: 0.85rem; font-weight: 600; color: #00cec9; display: flex; align-items: center; gap: 4px;">
                            <i class='bx bx-plus'></i> 0 Added
                        </span>
                        <span id="diff-badge-removed" style="font-size: 0.85rem; font-weight: 600; color: #ff6b6b; display: flex; align-items: center; gap: 4px;">
                            <i class='bx bx-minus'></i> 0 Removed
                        </span>
                        <span id="diff-badge-unchanged" style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
                            <i class='bx bx-check'></i> 0 Unchanged
                        </span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 0.8rem; color: var(--text-muted);">Similarity:</span>
                        <span id="diff-similarity" style="font-size: 0.95rem; font-weight: 700; color: var(--primary-color);">100%</span>
                    </div>
                </div>

                <!-- Diff Output Viewer -->
                <div class="glass-panel" style="flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 380px;">
                    <div style="padding: 10px 16px; background: rgba(0,0,0,0.25); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">
                            Difference Output
                        </span>
                        <span id="diff-sync-label" style="font-size: 0.78rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
                            <i class='bx bx-sync'></i> Side-by-Side Unified Alignment
                        </span>
                    </div>

                    <div id="diff-display-container" style="flex: 1; overflow: auto; padding: 0; background: #0c0d14;">
                        <!-- Diff rows injected here -->
                    </div>
                </div>
            </div>
        `;

        content.innerHTML = html;
        this.init();
    },

    init() {
        const origInput = document.getElementById('diff-orig-input');
        const modInput = document.getElementById('diff-mod-input');
        if (origInput) origInput.value = this.originalText;
        if (modInput) modInput.value = this.modifiedText;
        this.computeAndRenderDiff();
    },

    onInput(side, val) {
        if (side === 'original') {
            this.originalText = val;
        } else {
            this.modifiedText = val;
        }

        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.computeAndRenderDiff();
        }, 120);
    },

    toggleOption(opt, val) {
        this[opt] = val;
        this.computeAndRenderDiff();
    },

    setViewMode(mode) {
        this.viewMode = mode;
        const btnSplit = document.getElementById('btn-diff-split');
        const btnUnified = document.getElementById('btn-diff-unified');
        if (btnSplit && btnUnified) {
            btnSplit.classList.toggle('active-mode', mode === 'split');
            btnUnified.classList.toggle('active-mode', mode === 'unified');
        }
        this.computeAndRenderDiff();
    },

    swapTexts() {
        const temp = this.originalText;
        this.originalText = this.modifiedText;
        this.modifiedText = temp;

        const origInput = document.getElementById('diff-orig-input');
        const modInput = document.getElementById('diff-mod-input');
        if (origInput) origInput.value = this.originalText;
        if (modInput) modInput.value = this.modifiedText;

        this.computeAndRenderDiff();
        if (window.app) window.app.showToast('Swapped inputs!');
    },

    loadSample() {
        this.originalText = this.sampleOriginal;
        this.modifiedText = this.sampleModified;

        const origInput = document.getElementById('diff-orig-input');
        const modInput = document.getElementById('diff-mod-input');
        if (origInput) origInput.value = this.originalText;
        if (modInput) modInput.value = this.modifiedText;

        this.computeAndRenderDiff();
        if (window.app) window.app.showToast('Sample comparison loaded!');
    },

    clearSide(side) {
        if (side === 'original') {
            this.originalText = '';
            const el = document.getElementById('diff-orig-input');
            if (el) el.value = '';
        } else {
            this.modifiedText = '';
            const el = document.getElementById('diff-mod-input');
            if (el) el.value = '';
        }
        this.computeAndRenderDiff();
    },

    clearBoth() {
        if (confirm('Clear both inputs?')) {
            this.originalText = '';
            this.modifiedText = '';
            const origInput = document.getElementById('diff-orig-input');
            const modInput = document.getElementById('diff-mod-input');
            if (origInput) origInput.value = '';
            if (modInput) modInput.value = '';
            this.computeAndRenderDiff();
            if (window.app) window.app.showToast('Both cleared.');
        }
    },

    handleUpload(e, side) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            if (side === 'original') {
                this.originalText = content;
                const el = document.getElementById('diff-orig-input');
                if (el) el.value = content;
            } else {
                this.modifiedText = content;
                const el = document.getElementById('diff-mod-input');
                if (el) el.value = content;
            }
            this.computeAndRenderDiff();
            if (window.app) window.app.showToast(`Loaded ${file.name}`);
        };
        reader.readAsText(file);
        e.target.value = '';
    },

    // Fast Myers / Longest Common Subsequence Diff with Common Prefix & Suffix Trimming
    diffLines(linesA, linesB) {
        const m = linesA.length;
        const n = linesB.length;

        const isEqual = (a, b) => {
            let strA = a;
            let strB = b;
            if (this.ignoreWhitespace) {
                strA = strA.trim();
                strB = strB.trim();
            }
            if (this.ignoreCase) {
                strA = strA.toLowerCase();
                strB = strB.toLowerCase();
            }
            return strA === strB;
        };

        if (m === 0 && n === 0) return [];
        if (m === 0) return linesB.map((l, idx) => ({ type: 'add', lineB: l, lineNumB: idx + 1 }));
        if (n === 0) return linesA.map((l, idx) => ({ type: 'remove', lineA: l, lineNumA: idx + 1 }));

        // 1. Common prefix trimming
        let prefixCount = 0;
        while (prefixCount < m && prefixCount < n && isEqual(linesA[prefixCount], linesB[prefixCount])) {
            prefixCount++;
        }

        // 2. Common suffix trimming
        let suffixCount = 0;
        while (
            suffixCount < (m - prefixCount) && 
            suffixCount < (n - prefixCount) && 
            isEqual(linesA[m - 1 - suffixCount], linesB[n - 1 - suffixCount])
        ) {
            suffixCount++;
        }

        const midA = linesA.slice(prefixCount, m - suffixCount);
        const midB = linesB.slice(prefixCount, n - suffixCount);

        const prefixOps = [];
        for (let i = 0; i < prefixCount; i++) {
            prefixOps.push({ type: 'equal', lineA: linesA[i], lineB: linesB[i], lineNumA: i + 1, lineNumB: i + 1 });
        }

        // 3. LCS Dynamic Programming on the differing middle section
        const midOps = [];
        const mM = midA.length;
        const nM = midB.length;

        if (mM > 0 || nM > 0) {
            const dp = new Int32Array((mM + 1) * (nM + 1));
            const idx = (r, c) => r * (nM + 1) + c;

            for (let i = 1; i <= mM; i++) {
                for (let j = 1; j <= nM; j++) {
                    if (isEqual(midA[i - 1], midB[j - 1])) {
                        dp[idx(i, j)] = dp[idx(i - 1, j - 1)] + 1;
                    } else {
                        const top = dp[idx(i - 1, j)];
                        const left = dp[idx(i, j - 1)];
                        dp[idx(i, j)] = top > left ? top : left;
                    }
                }
            }

            let i = mM, j = nM;
            while (i > 0 || j > 0) {
                if (i > 0 && j > 0 && isEqual(midA[i - 1], midB[j - 1])) {
                    midOps.push({
                        type: 'equal',
                        lineA: midA[i - 1],
                        lineB: midB[j - 1],
                        lineNumA: prefixCount + i,
                        lineNumB: prefixCount + j
                    });
                    i--; j--;
                } else if (j > 0 && (i === 0 || dp[idx(i, j - 1)] >= dp[idx(i - 1, j)])) {
                    midOps.push({
                        type: 'add',
                        lineB: midB[j - 1],
                        lineNumB: prefixCount + j
                    });
                    j--;
                } else if (i > 0 && (j === 0 || dp[idx(i, j - 1)] < dp[idx(i - 1, j)])) {
                    midOps.push({
                        type: 'remove',
                        lineA: midA[i - 1],
                        lineNumA: prefixCount + i
                    });
                    i--;
                }
            }
            midOps.reverse();
        }

        const suffixOps = [];
        for (let k = 0; k < suffixCount; k++) {
            const idxA = m - suffixCount + k;
            const idxB = n - suffixCount + k;
            suffixOps.push({
                type: 'equal',
                lineA: linesA[idxA],
                lineB: linesB[idxB],
                lineNumA: idxA + 1,
                lineNumB: idxB + 1
            });
        }

        return prefixOps.concat(midOps, suffixOps);
    },

    // Word diff within modified lines
    diffWords(textA, textB) {
        if (!textA && !textB) return { htmlA: '', htmlB: '' };
        if (!textA) return { htmlA: '', htmlB: `<span class="diff-word-added">${this.escapeHtml(textB)}</span>` };
        if (!textB) return { htmlA: `<span class="diff-word-removed">${this.escapeHtml(textA)}</span>`, htmlB: '' };

        const tokensA = textA.match(/\s+|[^\s\w]+|\w+/g) || [textA];
        const tokensB = textB.match(/\s+|[^\s\w]+|\w+/g) || [textB];

        const m = tokensA.length;
        const n = tokensB.length;
        const dp = new Int32Array((m + 1) * (n + 1));
        const idx = (i, j) => i * (n + 1) + j;

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (tokensA[i - 1] === tokensB[j - 1]) {
                    dp[idx(i, j)] = dp[idx(i - 1, j - 1)] + 1;
                } else {
                    const top = dp[idx(i - 1, j)];
                    const left = dp[idx(i, j - 1)];
                    dp[idx(i, j)] = top > left ? top : left;
                }
            }
        }

        let i = m, j = n;
        const ops = [];
        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && tokensA[i - 1] === tokensB[j - 1]) {
                ops.push({ type: 'equal', val: tokensA[i - 1] });
                i--; j--;
            } else if (j > 0 && (i === 0 || dp[idx(i, j - 1)] >= dp[idx(i - 1, j)])) {
                ops.push({ type: 'add', val: tokensB[j - 1] });
                j--;
            } else if (i > 0 && (j === 0 || dp[idx(i, j - 1)] < dp[idx(i - 1, j)])) {
                ops.push({ type: 'remove', val: tokensA[i - 1] });
                i--;
            }
        }
        ops.reverse();

        let htmlA = '';
        let htmlB = '';
        ops.forEach(op => {
            const escaped = this.escapeHtml(op.val);
            if (op.type === 'equal') {
                htmlA += escaped;
                htmlB += escaped;
            } else if (op.type === 'remove') {
                htmlA += `<span class="diff-word-removed">${escaped}</span>`;
            } else if (op.type === 'add') {
                htmlB += `<span class="diff-word-added">${escaped}</span>`;
            }
        });

        return { htmlA, htmlB };
    },

    computeAndRenderDiff() {
        const container = document.getElementById('diff-display-container');
        if (!container) return;

        const linesA = this.originalText.length ? this.originalText.split(/\r?\n/) : [];
        const linesB = this.modifiedText.length ? this.modifiedText.split(/\r?\n/) : [];

        if (linesA.length === 0 && linesB.length === 0) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 48px 0; font-size: 0.95rem;">Enter text in either pane to see differences.</div>`;
            this.updateStats(0, 0, 0, 100);
            return;
        }

        const ops = this.diffLines(linesA, linesB);

        let addedCount = 0;
        let removedCount = 0;
        let unchangedCount = 0;

        ops.forEach(op => {
            if (op.type === 'add') addedCount++;
            else if (op.type === 'remove') removedCount++;
            else unchangedCount++;
        });

        const totalDiffs = addedCount + removedCount;
        const totalLines = Math.max(linesA.length, linesB.length);
        const similarity = totalLines > 0 ? Math.max(0, Math.round(((totalLines - totalDiffs) / totalLines) * 100)) : 100;

        this.updateStats(addedCount, removedCount, unchangedCount, similarity);

        if (this.viewMode === 'split') {
            this.renderSplitView(ops, container, totalDiffs);
        } else {
            this.renderUnifiedView(ops, container, totalDiffs);
        }
    },

    updateStats(added, removed, unchanged, similarity) {
        const addEl = document.getElementById('diff-badge-added');
        const remEl = document.getElementById('diff-badge-removed');
        const uncEl = document.getElementById('diff-badge-unchanged');
        const simEl = document.getElementById('diff-similarity');

        if (addEl) addEl.innerHTML = `<i class='bx bx-plus'></i> ${added} Added`;
        if (remEl) remEl.innerHTML = `<i class='bx bx-minus'></i> ${removed} Removed`;
        if (uncEl) uncEl.innerHTML = `<i class='bx bx-check'></i> ${unchanged} Unchanged`;
        if (simEl) simEl.textContent = `${similarity}%`;
    },

    renderSplitView(ops, container, totalDiffs) {
        // Collect contiguous changes for aligned side-by-side block pairing
        const pairs = [];
        let i = 0;
        while (i < ops.length) {
            if (ops[i].type === 'equal') {
                pairs.push({ left: ops[i], right: ops[i], type: 'equal' });
                i++;
            } else {
                const removes = [];
                const adds = [];
                while (i < ops.length && ops[i].type !== 'equal') {
                    if (ops[i].type === 'remove') removes.push(ops[i]);
                    else if (ops[i].type === 'add') adds.push(ops[i]);
                    i++;
                }
                const count = Math.max(removes.length, adds.length);
                for (let k = 0; k < count; k++) {
                    const rem = removes[k] || null;
                    const add = adds[k] || null;
                    let type = 'modify';
                    if (rem && !add) type = 'remove';
                    else if (!rem && add) type = 'add';
                    pairs.push({ left: rem, right: add, type });
                }
            }
        }

        let html = '';
        if (totalDiffs === 0 && pairs.length > 0) {
            html += `
                <div style="background: rgba(0, 206, 201, 0.12); border: 1px solid rgba(0, 206, 201, 0.3); color: #00cec9; padding: 10px 16px; margin: 12px; border-radius: var(--radius-sm); font-size: 0.85rem; display: flex; align-items: center; gap: 8px;">
                    <i class='bx bx-check-circle' style="font-size: 1.2rem;"></i>
                    <span>Both texts are 100% identical! No differences found.</span>
                </div>
            `;
        }

        html += `
            <table class="diff-table" style="width: 100%; border-collapse: collapse; font-family: 'Consolas', 'Monaco', monospace; font-size: 13px; line-height: 1.5;">
                <colgroup>
                    <col style="width: 45px;">
                    <col style="width: calc(50% - 45px);">
                    <col style="width: 45px;">
                    <col style="width: calc(50% - 45px);">
                </colgroup>
                <tbody>
        `;

        pairs.forEach(p => {
            let leftNum = '';
            let leftText = '';
            let leftClass = '';

            let rightNum = '';
            let rightText = '';
            let rightClass = '';

            if (p.type === 'equal') {
                leftNum = p.left.lineNumA;
                leftText = this.escapeHtml(p.left.lineA);
                rightNum = p.right.lineNumB;
                rightText = this.escapeHtml(p.right.lineB);
            } else if (p.type === 'modify') {
                leftNum = p.left.lineNumA;
                rightNum = p.right.lineNumB;
                leftClass = 'diff-row-removed';
                rightClass = 'diff-row-added';

                const wordDiff = this.diffWords(p.left.lineA, p.right.lineB);
                leftText = wordDiff.htmlA;
                rightText = wordDiff.htmlB;
            } else if (p.type === 'remove') {
                leftNum = p.left.lineNumA;
                leftText = `<span class="diff-word-removed">${this.escapeHtml(p.left.lineA)}</span>`;
                leftClass = 'diff-row-removed';
                rightClass = 'diff-row-empty';
            } else if (p.type === 'add') {
                leftClass = 'diff-row-empty';
                rightNum = p.right.lineNumB;
                rightText = `<span class="diff-word-added">${this.escapeHtml(p.right.lineB)}</span>`;
                rightClass = 'diff-row-added';
            }

            html += `
                <tr>
                    <td class="diff-gutter ${leftClass}">${leftNum}</td>
                    <td class="diff-content ${leftClass}">${leftText || '&nbsp;'}</td>
                    <td class="diff-gutter ${rightClass}">${rightNum}</td>
                    <td class="diff-content ${rightClass}">${rightText || '&nbsp;'}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    },

    renderUnifiedView(ops, container, totalDiffs) {
        let html = '';
        if (totalDiffs === 0 && ops.length > 0) {
            html += `
                <div style="background: rgba(0, 206, 201, 0.12); border: 1px solid rgba(0, 206, 201, 0.3); color: #00cec9; padding: 10px 16px; margin: 12px; border-radius: var(--radius-sm); font-size: 0.85rem; display: flex; align-items: center; gap: 8px;">
                    <i class='bx bx-check-circle' style="font-size: 1.2rem;"></i>
                    <span>Both texts are 100% identical! No differences found.</span>
                </div>
            `;
        }

        html += `
            <table class="diff-table" style="width: 100%; border-collapse: collapse; font-family: 'Consolas', 'Monaco', monospace; font-size: 13px; line-height: 1.5;">
                <colgroup>
                    <col style="width: 45px;">
                    <col style="width: 45px;">
                    <col style="width: 25px;">
                    <col style="width: auto;">
                </colgroup>
                <tbody>
        `;

        ops.forEach(op => {
            if (op.type === 'equal') {
                html += `
                    <tr>
                        <td class="diff-gutter">${op.lineNumA}</td>
                        <td class="diff-gutter">${op.lineNumB}</td>
                        <td class="diff-marker" style="color: var(--text-muted);">&nbsp;</td>
                        <td class="diff-content">${this.escapeHtml(op.lineA) || '&nbsp;'}</td>
                    </tr>
                `;
            } else if (op.type === 'remove') {
                html += `
                    <tr class="diff-row-removed">
                        <td class="diff-gutter diff-row-removed">${op.lineNumA}</td>
                        <td class="diff-gutter diff-row-removed"></td>
                        <td class="diff-marker" style="color: #ff6b6b; font-weight: bold;">-</td>
                        <td class="diff-content diff-row-removed">${this.escapeHtml(op.lineA) || '&nbsp;'}</td>
                    </tr>
                `;
            } else if (op.type === 'add') {
                html += `
                    <tr class="diff-row-added">
                        <td class="diff-gutter diff-row-added"></td>
                        <td class="diff-gutter diff-row-added">${op.lineNumB}</td>
                        <td class="diff-marker" style="color: #00cec9; font-weight: bold;">+</td>
                        <td class="diff-content diff-row-added">${this.escapeHtml(op.lineB) || '&nbsp;'}</td>
                    </tr>
                `;
            }
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    },

    async copyDiff() {
        const linesA = this.originalText.length ? this.originalText.split(/\r?\n/) : [];
        const linesB = this.modifiedText.length ? this.modifiedText.split(/\r?\n/) : [];
        const ops = this.diffLines(linesA, linesB);

        let patch = '--- Original\n+++ Modified\n';
        ops.forEach(op => {
            if (op.type === 'equal') {
                patch += ` ${op.lineA}\n`;
            } else if (op.type === 'remove') {
                patch += `-${op.lineA}\n`;
            } else if (op.type === 'add') {
                patch += `+${op.lineB}\n`;
            }
        });

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(patch);
            } else {
                throw new Error('Clipboard fallback');
            }
        } catch {
            const el = document.createElement('textarea');
            el.value = patch;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            if (el.parentNode === document.body) document.body.removeChild(el);
        }

        if (window.app) window.app.showToast('Diff patch copied to clipboard!');
    },

    escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};
