class ModalManager {
    constructor() {
        this.overlay = document.getElementById('global-modal');
        this.container = document.getElementById('modal-container');
        
        // Close modal when clicking outside
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
    }

    open(contentHTML) {
        this.container.innerHTML = contentHTML;
        this.overlay.classList.add('active');
        
        // Bind cancel buttons automatically
        const cancelBtn = this.container.querySelector('.btn-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.close());
        }
    }

    close() {
        this.overlay.classList.remove('active');
        setTimeout(() => {
            this.container.innerHTML = '';
        }, 300); // Wait for transition
    }

    showProjectForm(project = null, onSubmit) {
        const isEdit = !!project;
        const html = `
            <h2 style="margin-bottom: 24px;">${isEdit ? 'Edit' : 'New'} Project</h2>
            <form id="project-form">
                <div class="form-group">
                    <label>Project Name</label>
                    <input type="text" id="proj-name" class="form-control" value="${project?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="proj-desc" class="form-control" rows="3">${project?.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="proj-status" class="form-control">
                        <option value="Active" ${project?.status === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="On Hold" ${project?.status === 'On Hold' ? 'selected' : ''}>On Hold</option>
                        <option value="Completed" ${project?.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Archived" ${project?.status === 'Archived' ? 'selected' : ''}>Archived</option>
                    </select>
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 32px;">
                    <button type="button" class="btn btn-cancel">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Project'}</button>
                </div>
            </form>
        `;

        this.open(html);
        document.getElementById('project-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('proj-name').value,
                description: document.getElementById('proj-desc').value,
                status: document.getElementById('proj-status').value
            };
            onSubmit(data);
        });
    }

    showConfirm(message, onConfirm) {
        const html = `
            <h2 style="margin-bottom: 16px;">Confirm Action</h2>
            <p style="color: var(--text-muted); margin-bottom: 32px;">${message}</p>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button type="button" class="btn btn-cancel">Cancel</button>
                <button type="button" class="btn btn-danger" id="confirm-btn">Confirm Delete</button>
            </div>
        `;
        this.open(html);
        document.getElementById('confirm-btn').addEventListener('click', onConfirm);
    }

    showConnectionForm(connection = null, onSubmit) {
        const isEdit = !!connection;
        const html = `
            <h2 style="margin-bottom: 24px;">${isEdit ? 'Edit' : 'Add'} Salesforce Connection</h2>
            <form id="conn-form">
                <div class="form-group">
                    <label>Alias</label>
                    <input type="text" id="conn-alias" class="form-control" value="${connection?.alias || ''}" placeholder="e.g., swfs-partial" required>
                </div>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="conn-user" class="form-control" value="${connection?.username || ''}" placeholder="e.g., user@domain.com.partial">
                </div>
                <div class="form-group">
                    <label>Org Type</label>
                    <select id="conn-type" class="form-control">
                        <option value="Sandbox" ${connection?.org_type === 'Sandbox' ? 'selected' : ''}>Sandbox</option>
                        <option value="Production" ${connection?.org_type === 'Production' ? 'selected' : ''}>Production</option>
                        <option value="DevHub" ${connection?.org_type === 'DevHub' ? 'selected' : ''}>DevHub</option>
                        <option value="Scratch" ${connection?.org_type === 'Scratch' ? 'selected' : ''}>Scratch</option>
                    </select>
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 32px;">
                    <button type="button" class="btn btn-cancel">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Connection'}</button>
                </div>
            </form>
        `;
        this.open(html);
        document.getElementById('conn-form').addEventListener('submit', (e) => {
            e.preventDefault();
            onSubmit({
                alias: document.getElementById('conn-alias').value,
                username: document.getElementById('conn-user').value,
                org_type: document.getElementById('conn-type').value
            });
        });
    }

    showSoapLoginForm({ credential = null, projectId = null, availableCredentials = [] } = {}, onSubmit) {
        const cred = credential || {};
        const sfCredentials = availableCredentials.filter(c => api.isSalesforceCredential(c));
        const html = `
            <h2 style="margin-bottom: 16px;">SOAP Login (Salesforce CLI)</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px; line-height: 1.5;">
                Authenticate to Salesforce CLI via <strong>Partner SOAP Login API</strong> using credentials. No browser required.
            </p>
            <form id="soap-login-form">
                ${sfCredentials.length > 0 ? `
                <div class="form-group">
                    <label>Autofill from Saved Credentials</label>
                    <select id="soap-cred-select" class="form-control">
                        <option value="">-- Select Saved Credential --</option>
                        ${sfCredentials.map(c => `<option value="${c.id}" ${c.id === cred.id ? 'selected' : ''}>${c.label} (${c.username || 'No Username'})</option>`).join('')}
                    </select>
                </div>
                ` : ''}
                <div class="form-group">
                    <label>Org Alias</label>
                    <input type="text" id="soap-alias" class="form-control" value="${cred.label || ''}" placeholder="e.g., TIB_PROD" required>
                </div>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="soap-username" class="form-control" value="${cred.username || ''}" placeholder="e.g., user@domain.com" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="password" id="soap-password" class="form-control" value="${cred.password || ''}" placeholder="Salesforce Password" required style="flex: 1;">
                        <button type="button" class="btn-icon" onclick="const input = document.getElementById('soap-password'); input.type = input.type === 'password' ? 'text' : 'password';" style="padding: 12px;" title="Show/Hide Password"><i class='bx bx-show'></i></button>
                    </div>
                </div>
                <div class="form-group">
                    <label>Security Token</label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="password" id="soap-security-token" class="form-control" value="${cred.security_token || ''}" placeholder="Security Token (if required)" style="flex: 1;">
                        <button type="button" class="btn-icon" onclick="const input = document.getElementById('soap-security-token'); input.type = input.type === 'password' ? 'text' : 'password';" style="padding: 12px;" title="Show/Hide Security Token"><i class='bx bx-show'></i></button>
                    </div>
                </div>
                <div class="form-group">
                    <label>Login URL</label>
                    <input type="text" id="soap-login-url" class="form-control" value="${cred.login_url || 'https://login.salesforce.com/'}" placeholder="e.g., https://login.salesforce.com/">
                </div>
                <div class="form-group">
                    <label>Org Type</label>
                    <select id="soap-org-type" class="form-control">
                        <option value="Production" ${cred.login_url && cred.login_url.includes('test.salesforce.com') ? '' : 'selected'}>Production</option>
                        <option value="Sandbox" ${cred.login_url && cred.login_url.includes('test.salesforce.com') ? 'selected' : ''}>Sandbox</option>
                        <option value="DevHub">DevHub</option>
                    </select>
                </div>
                <div class="form-group" style="margin-top: 12px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: normal;">
                        <input type="checkbox" id="soap-set-default" checked> Set as Default Org in Salesforce CLI
                    </label>
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 28px;">
                    <button type="button" class="btn btn-cancel">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class='bx bx-cloud-upload'></i> Login & Register CLI
                    </button>
                </div>
            </form>
        `;
        this.open(html);

        if (sfCredentials.length > 0) {
            const selectEl = document.getElementById('soap-cred-select');
            if (selectEl) {
                selectEl.addEventListener('change', (e) => {
                    const selectedId = parseInt(e.target.value);
                    const found = sfCredentials.find(c => c.id === selectedId);
                    if (found) {
                        document.getElementById('soap-alias').value = found.label || '';
                        document.getElementById('soap-username').value = found.username || '';
                        document.getElementById('soap-password').value = found.password || '';
                        document.getElementById('soap-security-token').value = found.security_token || '';
                        document.getElementById('soap-login-url').value = found.login_url || 'https://login.salesforce.com/';
                        if (found.login_url && found.login_url.includes('test.salesforce.com')) {
                            document.getElementById('soap-org-type').value = 'Sandbox';
                        } else {
                            document.getElementById('soap-org-type').value = 'Production';
                        }
                    }
                });
            }
        }

        document.getElementById('soap-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const alias = (document.getElementById('soap-alias').value || '').trim();
            const username = (document.getElementById('soap-username').value || '').trim();
            const password = (document.getElementById('soap-password').value || '').trim();
            const security_token = (document.getElementById('soap-security-token').value || '').trim();
            const login_url = (document.getElementById('soap-login-url').value || '').trim();
            const org_type = (document.getElementById('soap-org-type').value || '').trim();
            const set_default = document.getElementById('soap-set-default').checked;

            this.showAuthLoading(alias, 'SOAP API Login');
            onSubmit({
                projectId,
                credentialId: cred.id || null,
                alias,
                username,
                password,
                security_token,
                login_url,
                org_type,
                set_default
            });
        });
    }

    showNewConnectionForm({ availableCredentials = [] } = {}, onWebSubmit, onSoapSubmit) {
        if (typeof availableCredentials === 'function') {
            onSoapSubmit = onWebSubmit;
            onWebSubmit = availableCredentials;
            availableCredentials = [];
        }

        const sfCredentials = availableCredentials.filter(c => api.isSalesforceCredential(c));

        const html = `
            <h2 style="margin-bottom: 16px;">New Salesforce Connection</h2>
            <div style="display: flex; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
                <button type="button" class="btn" id="tab-btn-soap" style="background: var(--primary-color); color: white;" onclick="modals.switchConnTab('soap')"><i class='bx bx-key'></i> SOAP Login (No Browser)</button>
                <button type="button" class="btn" id="tab-btn-web" style="background: rgba(255,255,255,0.05); color: var(--text-muted);" onclick="modals.switchConnTab('web')"><i class='bx bx-window-open'></i> Browser OAuth</button>
            </div>

            <!-- SOAP Tab -->
            <div id="conn-tab-soap">
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 16px;">
                    Log into Salesforce CLI in background using Username, Password, and Security Token via SOAP API.
                </p>
                <form id="new-soap-conn-form">
                    ${sfCredentials.length > 0 ? `
                    <div class="form-group">
                        <label>Autofill from Saved Credentials</label>
                        <select id="nsoap-cred-select" class="form-control">
                            <option value="">-- Select Saved Credential --</option>
                            ${sfCredentials.map(c => `<option value="${c.id}">${c.label} (${c.username || 'No Username'})</option>`).join('')}
                        </select>
                    </div>
                    ` : ''}
                    <div class="form-group">
                        <label>Alias</label>
                        <input type="text" id="nsoap-alias" class="form-control" placeholder="e.g., TIB_PROD" required>
                    </div>
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" id="nsoap-username" class="form-control" placeholder="e.g., ti@ctgclients.com" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <input type="password" id="nsoap-password" class="form-control" placeholder="Salesforce Password" required style="flex: 1;">
                            <button type="button" class="btn-icon" onclick="const input = document.getElementById('nsoap-password'); input.type = input.type === 'password' ? 'text' : 'password';" style="padding: 12px;" title="Show/Hide Password"><i class='bx bx-show'></i></button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Security Token</label>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <input type="password" id="nsoap-token" class="form-control" placeholder="Security Token (if required)" style="flex: 1;">
                            <button type="button" class="btn-icon" onclick="const input = document.getElementById('nsoap-token'); input.type = input.type === 'password' ? 'text' : 'password';" style="padding: 12px;" title="Show/Hide Security Token"><i class='bx bx-show'></i></button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Login URL</label>
                        <input type="text" id="nsoap-login-url" class="form-control" value="https://login.salesforce.com/" placeholder="e.g., https://login.salesforce.com/">
                    </div>
                    <div class="form-group">
                        <label>Org Type</label>
                        <select id="nsoap-type" class="form-control">
                            <option value="Production">Production</option>
                            <option value="Sandbox">Sandbox</option>
                            <option value="DevHub">DevHub</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-top: 8px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: normal;">
                            <input type="checkbox" id="nsoap-default" checked> Set as Default Org in Salesforce CLI
                        </label>
                    </div>
                    <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                        <button type="button" class="btn btn-cancel">Cancel</button>
                        <button type="submit" class="btn btn-primary"><i class='bx bx-cloud-upload'></i> Login via SOAP</button>
                    </div>
                </form>
            </div>

            <!-- Web Tab -->
            <div id="conn-tab-web" style="display: none;">
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 16px;">
                    This will authenticate a new Salesforce org using <code>sf org login web</code>. A browser window will open automatically.
                </p>
                <form id="new-conn-form">
                    <div class="form-group">
                        <label>Alias</label>
                        <input type="text" id="new-conn-alias" class="form-control" placeholder="e.g., my-dev-org">
                    </div>
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" id="new-conn-user" class="form-control" placeholder="e.g., user@domain.com">
                    </div>
                    <div class="form-group">
                        <label>Org Type</label>
                        <select id="new-conn-type" class="form-control">
                            <option value="Sandbox">Sandbox</option>
                            <option value="Production">Production</option>
                            <option value="DevHub">DevHub</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                        <button type="button" class="btn btn-cancel">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            <i class='bx bx-navigation'></i> Launch Browser Login
                        </button>
                    </div>
                </form>
            </div>
        `;
        this.open(html);

        if (sfCredentials.length > 0) {
            const selectEl = document.getElementById('nsoap-cred-select');
            if (selectEl) {
                selectEl.addEventListener('change', (e) => {
                    const selectedId = parseInt(e.target.value);
                    const found = sfCredentials.find(c => c.id === selectedId);
                    if (found) {
                        document.getElementById('nsoap-alias').value = found.label || '';
                        document.getElementById('nsoap-username').value = found.username || '';
                        document.getElementById('nsoap-password').value = found.password || '';
                        document.getElementById('nsoap-token').value = found.security_token || '';
                        document.getElementById('nsoap-login-url').value = found.login_url || 'https://login.salesforce.com/';
                        if (found.login_url && found.login_url.includes('test.salesforce.com')) {
                            document.getElementById('nsoap-type').value = 'Sandbox';
                        } else {
                            document.getElementById('nsoap-type').value = 'Production';
                        }
                    }
                });
            }
        }

        document.getElementById('new-soap-conn-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const alias = (document.getElementById('nsoap-alias').value || '').trim();
            const username = (document.getElementById('nsoap-username').value || '').trim();
            const password = (document.getElementById('nsoap-password').value || '').trim();
            const security_token = (document.getElementById('nsoap-token').value || '').trim();
            const login_url = (document.getElementById('nsoap-login-url').value || '').trim();
            const org_type = (document.getElementById('nsoap-type').value || '').trim();
            const set_default = document.getElementById('nsoap-default').checked;

            this.showAuthLoading(alias, 'SOAP API Login');
            onSoapSubmit({ alias, username, password, security_token, login_url, org_type, set_default });
        });

        document.getElementById('new-conn-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const alias = (document.getElementById('new-conn-alias').value || '').trim();
            const username = (document.getElementById('new-conn-user').value || '').trim();
            const org_type = (document.getElementById('new-conn-type').value || '').trim();
            
            this.showAuthLoading(alias, 'Browser OAuth');
            onWebSubmit({ alias, username, org_type });
        });
    }

    switchConnTab(tab) {
        const soapTab = document.getElementById('conn-tab-soap');
        const webTab = document.getElementById('conn-tab-web');
        const soapBtn = document.getElementById('tab-btn-soap');
        const webBtn = document.getElementById('tab-btn-web');

        if (tab === 'soap') {
            soapTab.style.display = 'block';
            webTab.style.display = 'none';
            soapBtn.style.background = 'var(--primary-color)';
            soapBtn.style.color = 'white';
            webBtn.style.background = 'rgba(255,255,255,0.05)';
            webBtn.style.color = 'var(--text-muted)';
        } else {
            soapTab.style.display = 'none';
            webTab.style.display = 'block';
            webBtn.style.background = 'var(--primary-color)';
            webBtn.style.color = 'white';
            soapBtn.style.background = 'rgba(255,255,255,0.05)';
            soapBtn.style.color = 'var(--text-muted)';
        }
    }

    showAuthLoading(alias, mode = 'Authenticating') {
        const html = `
            <div style="text-align: center; padding: 40px 20px;">
                <div class="spinner" style="width: 50px; height: 50px; border: 4px solid rgba(255,255,255,0.1); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 24px auto;"></div>
                <h3 style="margin-bottom: 12px; font-size: 1.25rem;">${mode}: ${alias}...</h3>
                <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5; max-width: 340px; margin: 0 auto;">
                    ${mode.includes('SOAP') ? 'Executing Partner SOAP Login & registering access-token with Salesforce CLI...' : 'Launching browser for login approval...'}
                </p>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 24px; font-style: italic;">
                    This modal will close automatically once complete.
                </p>
            </div>
        `;
        this.container.innerHTML = html;
        
        if (!document.getElementById('spinner-style')) {
            const style = document.createElement('style');
            style.id = 'spinner-style';
            style.innerHTML = `
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    showPathForm(path = null, onSubmit) {
        const isEdit = !!path;
        const html = `
            <h2 style="margin-bottom: 24px;">${isEdit ? 'Edit' : 'Map'} Local Path</h2>
            <form id="path-form">
                <div class="form-group">
                    <label>Absolute Path</label>
                    <input type="text" id="path-val" class="form-control" value="${path?.path || ''}" placeholder="e.g., /home/kritik/sfdc/ProjectName" required>
                </div>
                <div class="form-group">
                    <label>Label (Optional)</label>
                    <input type="text" id="path-label" class="form-control" value="${path?.label || ''}" placeholder="e.g., Frontend App">
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 32px;">
                    <button type="button" class="btn btn-cancel">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Path'}</button>
                </div>
            </form>
        `;
        this.open(html);
        document.getElementById('path-form').addEventListener('submit', (e) => {
            e.preventDefault();
            onSubmit({
                path: (document.getElementById('path-val').value || '').trim(),
                label: (document.getElementById('path-label').value || '').trim()
            });
        });
    }

    showTaskForm(task = null, onSubmit) {
        const isEdit = !!task;
        const html = `
            <h2 style="margin-bottom: 24px;">${isEdit ? 'Edit' : 'New'} Task</h2>
            <form id="task-form">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="task-title" class="form-control" value="${task?.title || ''}" required>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="task-status" class="form-control">
                        <option value="To Do" ${task?.status === 'To Do' ? 'selected' : ''}>To Do</option>
                        <option value="In Progress" ${task?.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Done" ${task?.status === 'Done' ? 'selected' : ''}>Done</option>
                        <option value="Blocked" ${task?.status === 'Blocked' ? 'selected' : ''}>Blocked</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Priority</label>
                    <select id="task-priority" class="form-control">
                        <option value="Low" ${task?.priority === 'Low' ? 'selected' : ''}>Low</option>
                        <option value="Medium" ${task?.priority === 'Medium' || !task ? 'selected' : ''}>Medium</option>
                        <option value="High" ${task?.priority === 'High' ? 'selected' : ''}>High</option>
                        <option value="Critical" ${task?.priority === 'Critical' ? 'selected' : ''}>Critical</option>
                    </select>
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 32px;">
                    <button type="button" class="btn btn-cancel">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Task'}</button>
                </div>
            </form>
        `;
        this.open(html);
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            onSubmit({
                title: (document.getElementById('task-title').value || '').trim(),
                status: document.getElementById('task-status').value,
                priority: document.getElementById('task-priority').value
            });
        });
    }

    showCredentialForm(credential = null, isGlobal = false, onSubmit) {
        if (typeof isGlobal === 'function') {
            onSubmit = isGlobal;
            isGlobal = false;
        }
        const isEdit = !!credential;
        const html = `
            <h2 style="margin-bottom: 24px;">${isEdit ? 'Edit' : 'Add'} Credentials</h2>
            <form id="cred-form">
                <div class="form-group">
                    <label>Label</label>
                    <input type="text" id="cred-label" class="form-control" value="${credential?.label || ''}" placeholder="e.g., Sandbox Admin" required>
                </div>
                <div class="form-group">
                    <label>Login URL</label>
                    <input type="url" id="cred-login-url" class="form-control" value="${credential?.login_url || ''}" placeholder="e.g., https://app.formassembly.com">
                </div>
                <div class="form-group">
                    <label>${isGlobal ? 'Username' : 'SFDC Username'}</label>
                    <input type="text" id="cred-username" class="form-control" value="${credential?.username || ''}" placeholder="e.g., user@domain.com" required>
                </div>
                <div class="form-group">
                    <label>${isGlobal ? 'Password' : 'SFDC Password'}</label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="password" id="cred-password" class="form-control" value="${credential?.password || ''}" placeholder="e.g., secure_password123" style="flex: 1;">
                        <button type="button" class="btn-icon" onclick="const input = document.getElementById('cred-password'); input.type = input.type === 'password' ? 'text' : 'password';" style="padding: 12px;" title="Show/Hide Password"><i class='bx bx-show'></i></button>
                    </div>
                </div>
                <div class="form-group">
                    <label>${isGlobal ? 'Security Token' : 'SFDC Security Token'}</label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="password" id="cred-security-token" class="form-control" value="${credential?.security_token || ''}" placeholder="e.g., hf9218Hf82947194hfa" style="flex: 1;">
                        <button type="button" class="btn-icon" onclick="const input = document.getElementById('cred-security-token'); input.type = input.type === 'password' ? 'text' : 'password';" style="padding: 12px;" title="Show/Hide Security Token"><i class='bx bx-show'></i></button>
                    </div>
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 32px;">
                    <button type="button" class="btn btn-cancel">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Save Credentials'}</button>
                </div>
            </form>
        `;
        this.open(html);
        document.getElementById('cred-form').addEventListener('submit', (e) => {
            e.preventDefault();
            onSubmit({
                label: (document.getElementById('cred-label').value || '').trim(),
                login_url: (document.getElementById('cred-login-url').value || '').trim(),
                username: (document.getElementById('cred-username').value || '').trim(),
                password: (document.getElementById('cred-password').value || '').trim(),
                security_token: (document.getElementById('cred-security-token').value || '').trim()
            });
        });
    }
}

const modals = new ModalManager();
