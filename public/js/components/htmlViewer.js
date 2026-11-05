const htmlViewer = {
    viewMode: 'split',      // 'split', 'code', 'preview'
    deviceMode: 'desktop',  // 'desktop', 'tablet', 'mobile'
    previewBg: 'light',     // 'light', 'dark'
    autoRun: true,
    debounceTimer: null,

    templates: {
        modernCard: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modern Glass Card</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      padding: 20px;
    }
    .card {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 20px;
      padding: 32px;
      max-width: 420px;
      width: 100%;
      color: #ffffff;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
      text-align: center;
      transition: transform 0.3s ease;
    }
    .card:hover {
      transform: translateY(-6px);
    }
    .avatar-wrapper {
      position: relative;
      width: 96px;
      height: 96px;
      margin: 0 auto 18px;
    }
    .avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: linear-gradient(45deg, #6c5ce7, #00cec9);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 38px;
      box-shadow: 0 8px 24px rgba(108, 92, 231, 0.5);
    }
    .badge {
      position: absolute;
      bottom: 2px;
      right: 2px;
      background: #00cec9;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 3px solid #24243e;
    }
    h2 { font-size: 1.5rem; margin-bottom: 6px; font-weight: 700; }
    p.role { color: #a29bfe; font-size: 0.95rem; margin-bottom: 16px; font-weight: 500; }
    p.bio { color: rgba(255, 255, 255, 0.8); font-size: 0.9rem; line-height: 1.6; margin-bottom: 24px; }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      padding: 16px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      margin-bottom: 24px;
    }
    .stat-val { font-size: 1.25rem; font-weight: 700; color: #fff; }
    .stat-lbl { font-size: 0.75rem; color: #b2bec3; text-transform: uppercase; margin-top: 4px; }
    .btn {
      background: linear-gradient(135deg, #6c5ce7, #a29bfe);
      color: white;
      border: none;
      padding: 12px 28px;
      border-radius: 30px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      box-shadow: 0 6px 20px rgba(108, 92, 231, 0.4);
      transition: all 0.2s ease;
    }
    .btn:hover {
      box-shadow: 0 8px 25px rgba(108, 92, 231, 0.6);
      transform: scale(1.02);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="avatar-wrapper">
      <div class="avatar">⚡</div>
      <div class="badge"></div>
    </div>
    <h2>Alexandra Vance</h2>
    <p class="role">Salesforce Architect & Engineer</p>
    <p class="bio">Building high-throughput cloud integrations, scalable enterprise APIs, and real-time systems.</p>
    <div class="stats">
      <div>
        <div class="stat-val">142</div>
        <div class="stat-lbl">Projects</div>
      </div>
      <div>
        <div class="stat-val">2.8k</div>
        <div class="stat-lbl">Commits</div>
      </div>
      <div>
        <div class="stat-val">99.9%</div>
        <div class="stat-lbl">Uptime</div>
      </div>
    </div>
    <button class="btn" onclick="alert('Connected with Alexandra!')">Connect Profile</button>
  </div>
</body>
</html>`,

        interactiveApp: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interactive Task Counter</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      display: flex;
      justify-content: center;
      padding: 40px 16px;
    }
    .widget {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
      padding: 24px;
      width: 100%;
      max-width: 400px;
    }
    h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; color: #0f172a; }
    p.desc { font-size: 0.875rem; color: #64748b; margin-bottom: 20px; }
    .counter-display {
      background: #f1f5f9;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin-bottom: 20px;
    }
    .number {
      font-size: 3.5rem;
      font-weight: 800;
      color: #4f46e5;
      line-height: 1;
    }
    .label {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-top: 8px;
    }
    .btn-group {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }
    button {
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-dec { background: #fee2e2; color: #dc2626; }
    .btn-dec:hover { background: #fecaca; }
    .btn-reset { background: #f1f5f9; color: #475569; }
    .btn-reset:hover { background: #e2e8f0; }
    .btn-inc { background: #e0e7ff; color: #4338ca; }
    .btn-inc:hover { background: #c7d2fe; }
    .log-box {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 0.8rem;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="widget">
    <h2>Interactive Counter</h2>
    <p class="desc">Live JavaScript test inside the HTML Viewer sandbox.</p>
    
    <div class="counter-display">
      <div class="number" id="count">0</div>
      <div class="label">Current Value</div>
    </div>

    <div class="btn-group">
      <button class="btn-dec" onclick="update(-1)">- 1</button>
      <button class="btn-reset" onclick="update(0, true)">Reset</button>
      <button class="btn-inc" onclick="update(1)">+ 1</button>
    </div>

    <div class="log-box" id="log">Status: Ready. Click buttons to test events.</div>
  </div>

  <script>
    let counter = 0;
    function update(val, reset = false) {
      if (reset) {
        counter = 0;
      } else {
        counter += val;
      }
      document.getElementById('count').textContent = counter;
      document.getElementById('log').textContent = 'Last action: ' + (reset ? 'Reset to 0' : (val > 0 ? '+' + val : val)) + ' at ' + new Date().toLocaleTimeString();
    }
  </script>
</body>
</html>`,

        pricingTable: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Pricing Plans</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px 20px; margin: 0; }
    .container { max-width: 800px; margin: 0 auto; text-align: center; }
    h1 { font-size: 2rem; margin-bottom: 8px; }
    p.sub { color: #94a3b8; margin-bottom: 32px; font-size: 0.95rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; text-align: left; }
    .tier { background: #1e293b; border-radius: 16px; padding: 24px; border: 1px solid #334155; position: relative; display: flex; flex-direction: column; }
    .tier.featured { border-color: #6366f1; box-shadow: 0 0 25px rgba(99, 102, 241, 0.3); }
    .badge { position: absolute; top: -12px; right: 20px; background: #6366f1; color: white; font-size: 0.75rem; padding: 4px 12px; border-radius: 20px; font-weight: 600; }
    .name { font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; }
    .price { font-size: 2.2rem; font-weight: 800; margin-bottom: 16px; }
    .price span { font-size: 0.9rem; color: #94a3b8; font-weight: 400; }
    ul { list-style: none; padding: 0; margin: 0 0 24px 0; flex: 1; }
    li { padding: 6px 0; font-size: 0.85rem; color: #cbd5e1; display: flex; align-items: center; gap: 8px; }
    li::before { content: "✔"; color: #10b981; font-weight: bold; }
    button { background: #334155; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    button:hover { background: #475569; }
    .featured button { background: #6366f1; }
    .featured button:hover { background: #4f46e5; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Simple & Transparent Pricing</h1>
    <p class="sub">Choose the ideal tier for your Salesforce development workflow.</p>
    <div class="grid">
      <div class="tier">
        <div class="name">Starter</div>
        <div class="price">$19<span>/mo</span></div>
        <ul>
          <li>1 Project Environment</li>
          <li>Standard CLI Automation</li>
          <li>Community Support</li>
        </ul>
        <button>Get Started</button>
      </div>
      <div class="tier featured">
        <div class="badge">POPULAR</div>
        <div class="name">Professional</div>
        <div class="price">$49<span>/mo</span></div>
        <ul>
          <li>Unlimited Projects</li>
          <li>Auto Release Deployments</li>
          <li>Git & Branch Context Sync</li>
          <li>Priority 24/7 Support</li>
        </ul>
        <button>Start Free Trial</button>
      </div>
    </div>
  </div>
</body>
</html>`
    },

    currentCode: '',

    render() {
        document.getElementById('page-title').textContent = 'HTML Viewer';
        const content = document.getElementById('app-content');

        if (!this.currentCode) {
            this.currentCode = this.templates.modernCard;
        }

        const html = `
            <div class="html-viewer-container" style="display: flex; flex-direction: column; height: calc(100vh - 120px); gap: 16px;">
                <!-- Control Bar -->
                <div class="glass-panel" style="padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                        <span style="display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 1.1rem; color: var(--text-main);">
                            <i class='bx bx-code-alt' style="color: var(--primary-color); font-size: 1.4rem;"></i>
                            HTML Viewer & Live Editor
                        </span>

                        <!-- Template Picker -->
                        <div style="display: flex; align-items: center; gap: 6px; margin-left: 12px;">
                            <label for="template-select" style="font-size: 0.8rem; color: var(--text-muted);">Template:</label>
                            <select id="template-select" onchange="htmlViewer.onTemplateChange(this.value)"
                                style="background: rgba(0,0,0,0.3); color: var(--text-main); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 4px 8px; font-size: 0.82rem; cursor: pointer; outline: none;">
                                <option value="modernCard">Modern Glass Card</option>
                                <option value="interactiveApp">Interactive App & JS</option>
                                <option value="pricingTable">Pricing Table</option>
                            </select>
                        </div>
                    </div>

                    <!-- Right Controls / Toolbar -->
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <!-- View Toggle -->
                        <div class="btn-group" style="display: inline-flex; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 2px;">
                            <button class="btn-icon ${this.viewMode === 'split' ? 'active-mode' : ''}" id="btn-mode-split" title="Split View" onclick="htmlViewer.setViewMode('split')">
                                <i class='bx bx-columns'></i>
                            </button>
                            <button class="btn-icon ${this.viewMode === 'code' ? 'active-mode' : ''}" id="btn-mode-code" title="Code Only" onclick="htmlViewer.setViewMode('code')">
                                <i class='bx bx-code'></i>
                            </button>
                            <button class="btn-icon ${this.viewMode === 'preview' ? 'active-mode' : ''}" id="btn-mode-preview" title="Preview Only" onclick="htmlViewer.setViewMode('preview')">
                                <i class='bx bx-play-circle'></i>
                            </button>
                        </div>

                        <!-- Device Mode (Preview sizing) -->
                        <div class="btn-group" id="device-selector" style="display: inline-flex; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 2px;">
                            <button class="btn-icon ${this.deviceMode === 'desktop' ? 'active-mode' : ''}" id="btn-dev-desktop" title="Desktop View (100%)" onclick="htmlViewer.setDeviceMode('desktop')">
                                <i class='bx bx-desktop'></i>
                            </button>
                            <button class="btn-icon ${this.deviceMode === 'tablet' ? 'active-mode' : ''}" id="btn-dev-tablet" title="Tablet View (768px)" onclick="htmlViewer.setDeviceMode('tablet')">
                                <i class='bx bx-tab'></i>
                            </button>
                            <button class="btn-icon ${this.deviceMode === 'mobile' ? 'active-mode' : ''}" id="btn-dev-mobile" title="Mobile View (375px)" onclick="htmlViewer.setDeviceMode('mobile')">
                                <i class='bx bx-mobile-alt'></i>
                            </button>
                        </div>

                        <!-- Preview Canvas Background Toggle -->
                        <button class="btn-icon" id="btn-toggle-bg" title="Toggle Preview Background (Light/Dark)" onclick="htmlViewer.togglePreviewBg()">
                            <i class='bx ${this.previewBg === 'light' ? 'bx-sun' : 'bx-moon'}'></i>
                        </button>

                        <!-- Actions -->
                        <button class="btn btn-secondary" onclick="htmlViewer.beautify()" style="padding: 6px 12px; font-size: 0.82rem; background: rgba(255,255,255,0.06); color: var(--text-main);" title="Format & Beautify HTML">
                            <i class='bx bx-align-left'></i> Beautify
                        </button>

                        <button class="btn btn-secondary" onclick="htmlViewer.minify()" style="padding: 6px 12px; font-size: 0.82rem; background: rgba(255,255,255,0.06); color: var(--text-main);" title="Minify HTML">
                            <i class='bx bx-collapse-horizontal'></i> Minify
                        </button>

                        <button class="btn btn-secondary" onclick="htmlViewer.copyCode()" style="padding: 6px 12px; font-size: 0.82rem; background: rgba(255,255,255,0.06); color: var(--text-main);" title="Copy Code">
                            <i class='bx bx-copy'></i> Copy
                        </button>

                        <label class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.82rem; background: rgba(255,255,255,0.06); color: var(--text-main); cursor: pointer; margin: 0;" title="Upload HTML File">
                            <i class='bx bx-upload'></i> Upload
                            <input type="file" id="html-file-upload" accept=".html,.htm,.txt" style="display: none;" onchange="htmlViewer.handleFileUpload(event)">
                        </label>

                        <button class="btn btn-secondary" onclick="htmlViewer.downloadCode()" style="padding: 6px 12px; font-size: 0.82rem; background: rgba(255,255,255,0.06); color: var(--text-main);" title="Download as .html file">
                            <i class='bx bx-download'></i> Download
                        </button>

                        <button class="btn btn-secondary" onclick="htmlViewer.openInNewTab()" style="padding: 6px 12px; font-size: 0.82rem; background: rgba(255,255,255,0.06); color: var(--text-main);" title="Open preview in new tab">
                            <i class='bx bx-link-external'></i> Popout
                        </button>

                        <button class="btn btn-primary" onclick="htmlViewer.forceRun()" style="padding: 6px 14px; font-size: 0.82rem;" title="Run / Refresh Preview">
                            <i class='bx bx-play'></i> Run
                        </button>

                        <button class="btn btn-danger" onclick="htmlViewer.clearCode()" style="padding: 6px 10px; font-size: 0.82rem;" title="Clear Code">
                            <i class='bx bx-trash'></i>
                        </button>
                    </div>
                </div>

                <!-- Main Editor / Preview Workspace -->
                <div id="viewer-workspace" style="display: flex; flex: 1; min-height: 0; gap: 16px; position: relative;">
                    <!-- Code Editor Box -->
                    <div id="editor-pane" class="glass-panel" style="display: flex; flex-direction: column; flex: 1; min-width: 0; overflow: hidden;">
                        <div style="padding: 10px 16px; background: rgba(0,0,0,0.25); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">
                                <i class='bx bx-code-alt' style="margin-right: 4px;"></i> Source Code
                            </span>
                            <span id="editor-stats" style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">
                                0 lines | 0 bytes
                            </span>
                        </div>
                        <textarea id="html-code-editor" 
                            style="flex: 1; width: 100%; border: none; outline: none; background: #0c0d14; color: #eceff4; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 13.5px; line-height: 1.55; padding: 16px; resize: none; tab-size: 2; white-space: pre; overflow: auto;" 
                            placeholder="Type or paste your HTML, CSS, or JS code here..."
                            spellcheck="false"
                            oninput="htmlViewer.onEditorInput(this.value)"
                            onkeydown="htmlViewer.handleTabKey(event)"></textarea>
                    </div>

                    <!-- Live Preview Box -->
                    <div id="preview-pane" class="glass-panel" style="display: flex; flex-direction: column; flex: 1; min-width: 0; overflow: hidden;">
                        <div style="padding: 10px 16px; background: rgba(0,0,0,0.25); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">
                                <i class='bx bx-window' style="margin-right: 4px;"></i> Live Preview
                            </span>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span id="preview-badge" style="font-size: 0.75rem; padding: 2px 8px; border-radius: 10px; background: rgba(0, 206, 201, 0.15); color: #00cec9; font-weight: 600;">
                                    Live
                                </span>
                            </div>
                        </div>

                        <!-- Frame Viewport Container -->
                        <div id="preview-viewport-wrapper" style="flex: 1; display: flex; align-items: center; justify-content: center; background: ${this.previewBg === 'light' ? '#ffffff' : '#141419'}; padding: 0; overflow: auto; transition: background 0.3s ease;">
                            <iframe id="html-preview-frame" 
                                sandbox="allow-scripts allow-modals allow-forms allow-same-origin" 
                                style="width: 100%; height: 100%; border: none; background: transparent; transition: width 0.3s ease, max-width 0.3s ease;">
                            </iframe>
                        </div>
                    </div>
                </div>
            </div>
        `;

        content.innerHTML = html;
        this.initEditor();
    },

    initEditor() {
        const textarea = document.getElementById('html-code-editor');
        if (textarea) {
            textarea.value = this.currentCode;
            this.updateStats();
        }
        this.updateViewModeUI();
        this.updateDeviceModeUI();
        this.renderPreview();
    },

    onEditorInput(val) {
        this.currentCode = val;
        this.updateStats();

        if (this.autoRun) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.renderPreview();
            }, 300);
        }
    },

    forceRun() {
        this.renderPreview();
        if (window.app) window.app.showToast('Preview refreshed!');
    },

    renderPreview() {
        const frame = document.getElementById('html-preview-frame');
        if (!frame) return;

        try {
            let docContent = this.currentCode;
            if (this.previewBg === 'dark' && !docContent.toLowerCase().includes('background')) {
                docContent = `<style>body { color: #f0f0f5; background: #141419; font-family: sans-serif; }</style>` + docContent;
            }
            frame.srcdoc = docContent;
        } catch (err) {
            console.error('Error rendering HTML preview:', err);
        }
    },

    handleTabKey(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const textarea = e.target;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            // Insert 2 spaces
            textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + 2;
            this.onEditorInput(textarea.value);
        }
    },

    updateStats() {
        const statsEl = document.getElementById('editor-stats');
        if (!statsEl) return;
        const lines = this.currentCode ? this.currentCode.split('\n').length : 0;
        const bytes = new Blob([this.currentCode]).size;
        let formattedBytes = bytes + ' bytes';
        if (bytes > 1024) formattedBytes = (bytes / 1024).toFixed(1) + ' KB';
        statsEl.textContent = `${lines} line${lines === 1 ? '' : 's'} | ${formattedBytes}`;
    },

    setViewMode(mode) {
        this.viewMode = mode;
        this.updateViewModeUI();
    },

    updateViewModeUI() {
        const editorPane = document.getElementById('editor-pane');
        const previewPane = document.getElementById('preview-pane');
        const splitBtn = document.getElementById('btn-mode-split');
        const codeBtn = document.getElementById('btn-mode-code');
        const prevBtn = document.getElementById('btn-mode-preview');

        if (!editorPane || !previewPane) return;

        [splitBtn, codeBtn, prevBtn].forEach(b => b && b.classList.remove('active-mode'));

        if (this.viewMode === 'split') {
            editorPane.style.display = 'flex';
            previewPane.style.display = 'flex';
            if (splitBtn) splitBtn.classList.add('active-mode');
        } else if (this.viewMode === 'code') {
            editorPane.style.display = 'flex';
            previewPane.style.display = 'none';
            if (codeBtn) codeBtn.classList.add('active-mode');
        } else if (this.viewMode === 'preview') {
            editorPane.style.display = 'none';
            previewPane.style.display = 'flex';
            if (prevBtn) prevBtn.classList.add('active-mode');
        }
    },

    setDeviceMode(device) {
        this.deviceMode = device;
        this.updateDeviceModeUI();
    },

    updateDeviceModeUI() {
        const frame = document.getElementById('html-preview-frame');
        const deskBtn = document.getElementById('btn-dev-desktop');
        const tabBtn = document.getElementById('btn-dev-tablet');
        const mobBtn = document.getElementById('btn-dev-mobile');

        if (!frame) return;

        [deskBtn, tabBtn, mobBtn].forEach(b => b && b.classList.remove('active-mode'));

        if (this.deviceMode === 'desktop') {
            frame.style.width = '100%';
            frame.style.maxWidth = '100%';
            frame.style.height = '100%';
            frame.style.boxShadow = 'none';
            frame.style.borderRadius = '0';
            frame.style.border = 'none';
            if (deskBtn) deskBtn.classList.add('active-mode');
        } else if (this.deviceMode === 'tablet') {
            frame.style.width = '768px';
            frame.style.maxWidth = '100%';
            frame.style.height = '94%';
            frame.style.boxShadow = '0 0 24px rgba(0,0,0,0.35)';
            frame.style.borderRadius = '12px';
            frame.style.border = '1px solid rgba(255,255,255,0.15)';
            if (tabBtn) tabBtn.classList.add('active-mode');
        } else if (this.deviceMode === 'mobile') {
            frame.style.width = '375px';
            frame.style.maxWidth = '100%';
            frame.style.height = '94%';
            frame.style.boxShadow = '0 0 24px rgba(0,0,0,0.35)';
            frame.style.borderRadius = '18px';
            frame.style.border = '1px solid rgba(255,255,255,0.15)';
            if (mobBtn) mobBtn.classList.add('active-mode');
        }
    },

    togglePreviewBg() {
        this.previewBg = this.previewBg === 'light' ? 'dark' : 'light';
        const wrapper = document.getElementById('preview-viewport-wrapper');
        const btn = document.getElementById('btn-toggle-bg');
        if (wrapper) {
            wrapper.style.background = this.previewBg === 'light' ? '#ffffff' : '#141419';
        }
        if (btn) {
            btn.innerHTML = `<i class='bx ${this.previewBg === 'light' ? 'bx-sun' : 'bx-moon'}'></i>`;
        }
        this.renderPreview();
    },

    onTemplateChange(key) {
        if (this.templates[key]) {
            this.currentCode = this.templates[key];
            const textarea = document.getElementById('html-code-editor');
            if (textarea) textarea.value = this.currentCode;
            this.updateStats();
            this.renderPreview();
            if (window.app) window.app.showToast('Template loaded!');
        }
    },

    beautify() {
        try {
            const beautified = this.formatHtml(this.currentCode);
            this.currentCode = beautified;
            const textarea = document.getElementById('html-code-editor');
            if (textarea) textarea.value = beautified;
            this.updateStats();
            if (window.app) window.app.showToast('HTML beautified!');
        } catch (err) {
            console.error('Format error:', err);
        }
    },

    formatHtml(html) {
        const tab = '  ';
        const protectedBlocks = [];

        // Protect script, style, and pre blocks from being split on < and >
        let cleanHtml = html.replace(/<(script|style|pre)[\s\S]*?<\/\1>/gi, (match) => {
            const id = `___PROTECTED_${protectedBlocks.length}___`;
            protectedBlocks.push(match);
            return id;
        });

        cleanHtml = cleanHtml.replace(/>\s*</g, '><').trim();
        const tokens = cleanHtml.split(/(<[^>]+>|___PROTECTED_\d+___)/g).filter(Boolean);
        const voidTags = ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'];

        let result = '';
        let indent = '';

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i].trim();
            if (!token) continue;

            if (token.startsWith('___PROTECTED_')) {
                const idx = parseInt(token.replace(/\D/g, ''), 10);
                const block = protectedBlocks[idx] || '';
                const blockLines = block.split(/\r?\n/).map((l, li) => li === 0 ? (indent + l) : (indent + '  ' + l)).join('\n');
                result += blockLines + '\n';
            } else if (token.startsWith('</')) {
                indent = indent.slice(tab.length);
                result += indent + token + '\n';
            } else if (token.startsWith('<') && !token.startsWith('<!') && !token.endsWith('/>')) {
                const match = token.match(/<([a-zA-Z0-9-]+)/);
                const tagName = match ? match[1].toLowerCase() : '';
                const isVoid = voidTags.includes(tagName);
                result += indent + token + '\n';
                if (!isVoid) {
                    indent += tab;
                }
            } else if (token.startsWith('<!--')) {
                result += indent + token + '\n';
            } else {
                result += indent + token + '\n';
            }
        }
        return result.trim();
    },

    minify() {
        const minified = this.currentCode
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/>\s+</g, '><')
            .replace(/^\s+|\s+$/gm, '')
            .trim();
        this.currentCode = minified;
        const textarea = document.getElementById('html-code-editor');
        if (textarea) textarea.value = minified;
        this.updateStats();
        if (window.app) window.app.showToast('HTML minified!');
    },

    async copyCode() {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(this.currentCode);
            } else {
                throw new Error('Clipboard fallback');
            }
        } catch {
            const textarea = document.getElementById('html-code-editor') || document.createElement('textarea');
            textarea.value = this.currentCode;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            if (textarea.parentNode === document.body) document.body.removeChild(textarea);
        }
        if (window.app) window.app.showToast('HTML code copied to clipboard!');
    },

    clearCode() {
        if (confirm('Are you sure you want to clear the code?')) {
            this.currentCode = '';
            const textarea = document.getElementById('html-code-editor');
            if (textarea) textarea.value = '';
            this.updateStats();
            this.renderPreview();
            if (window.app) window.app.showToast('Code cleared.');
        }
    },

    downloadCode() {
        const blob = new Blob([this.currentCode], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (window.app) window.app.showToast('Downloaded index.html');
    },

    openInNewTab() {
        const blob = new Blob([this.currentCode], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    },

    handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            this.currentCode = event.target.result;
            const textarea = document.getElementById('html-code-editor');
            if (textarea) textarea.value = this.currentCode;
            this.updateStats();
            this.renderPreview();
            if (window.app) window.app.showToast(`Loaded ${file.name}`);
        };
        reader.readAsText(file);
        e.target.value = '';
    }
};
