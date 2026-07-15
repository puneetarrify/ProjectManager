const credentialsView = {
    credentials: [],

    async render() {
        document.getElementById('page-title').textContent = 'Global Credentials';
        const content = document.getElementById('app-content');
        
        try {
            this.credentials = await api.getGlobalCredentials();
            this.renderList(content);
        } catch (error) {
            window.app.showToast(error.message, 'error');
        }
    },

    renderList(container) {
        let html = `
            <div class="glass-panel" style="padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <div>
                        <p style="color: var(--text-muted); margin: 0;">Store and manage global Salesforce org credentials or security tokens not tied to a single project.</p>
                    </div>
                    <button class="btn btn-primary" onclick="credentialsView.addCredential()"><i class='bx bx-plus'></i> Add Credentials</button>
                </div>
        `;

        if (this.credentials.length === 0) {
            html += `
                <div style="text-align: center; color: var(--text-muted); padding: 48px 0;">
                    <i class='bx bx-key' style="font-size: 3rem; margin-bottom: 16px; color: var(--text-muted); opacity: 0.5;"></i>
                    <p>No global credentials found. Click 'Add Credentials' to create your first one.</p>
                </div>
            </div>`;
            container.innerHTML = html;
            return;
        }

        html += `
            <div class="table-responsive">
                <table class="data-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th>Label</th>
                            <th>Username</th>
                            <th>Password</th>
                            <th>Security Token</th>
                            <th style="width: 100px; text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.credentials.map(c => `
                            <tr>
                                <td><strong>${c.label}</strong></td>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="font-family: monospace;">${c.username || '-'}</span>
                                        ${c.username ? `<button class="btn-icon" onclick="credentialsView.copyText('${c.username}')" style="padding: 2px;" title="Copy Username"><i class='bx bx-copy'></i></button>` : ''}
                                    </div>
                                </td>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <input type="password" readonly value="${c.password || ''}" class="cred-input" id="gcred-pwd-${c.id}" style="width: 120px;">
                                        ${c.password ? `
                                            <button class="btn-icon" onclick="credentialsView.toggleCredential('gcred-pwd-${c.id}')" style="padding: 2px;" title="Show/Hide Password"><i class='bx bx-show' id="gcred-pwd-${c.id}-icon"></i></button>
                                            <button class="btn-icon" onclick="credentialsView.copyText('${c.password}')" style="padding: 2px;" title="Copy Password"><i class='bx bx-copy'></i></button>
                                        ` : '<span style="color: var(--text-muted);">-</span>'}
                                    </div>
                                </td>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <input type="password" readonly value="${c.security_token || ''}" class="cred-input" id="gcred-tok-${c.id}" style="width: 150px;">
                                        ${c.security_token ? `
                                            <button class="btn-icon" onclick="credentialsView.toggleCredential('gcred-tok-${c.id}')" style="padding: 2px;" title="Show/Hide Security Token"><i class='bx bx-show' id="gcred-tok-${c.id}-icon"></i></button>
                                            <button class="btn-icon" onclick="credentialsView.copyText('${c.security_token}')" style="padding: 2px;" title="Copy Security Token"><i class='bx bx-copy'></i></button>
                                        ` : '<span style="color: var(--text-muted);">-</span>'}
                                    </div>
                                </td>
                                <td style="text-align: right;">
                                    <div style="display: flex; gap: 4px; justify-content: flex-end;">
                                        <button class="btn-icon" onclick="credentialsView.editCredential(${c.id}, \`${c.label.replace(/'/g, "\\'")}\`, \`${c.username.replace(/'/g, "\\'")}\`, \`${c.password.replace(/'/g, "\\'")}\`, \`${c.security_token.replace(/'/g, "\\'")}\`)" title="Edit"><i class='bx bx-edit'></i></button>
                                        <button class="btn-icon" style="color: var(--danger-color);" onclick="credentialsView.deleteCredential(${c.id})" title="Delete"><i class='bx bx-trash'></i></button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;

        container.innerHTML = html;
    },

    toggleCredential(id) {
        const input = document.getElementById(id);
        const icon = document.getElementById(`${id}-icon`);
        if (input && icon) {
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('bx-show', 'bx-hide');
            } else {
                input.type = 'password';
                icon.classList.replace('bx-hide', 'bx-show');
            }
        }
    },

    async copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            window.app.showToast('Copied to clipboard!', 'success');
        } catch (err) {
            window.app.showToast('Failed to copy to clipboard', 'error');
        }
    },

    addCredential() {
        modals.showCredentialForm(null, true, async (data) => {
            try {
                await api.addGlobalCredential(data);
                window.app.showToast('Global credentials saved successfully');
                modals.close();
                this.render();
            } catch (err) {
                window.app.showToast(err.message, 'error');
            }
        });
    },

    editCredential(id, label, username, password, security_token) {
        const credential = { id, label, username, password, security_token };
        modals.showCredentialForm(credential, true, async (data) => {
            try {
                await api.updateGlobalCredential(id, data);
                window.app.showToast('Global credentials updated successfully');
                modals.close();
                this.render();
            } catch (err) {
                window.app.showToast(err.message, 'error');
            }
        });
    },

    async deleteCredential(id) {
        if (!confirm('Are you sure you want to delete these credentials?')) return;
        try {
            await api.removeGlobalCredential(id);
            window.app.showToast('Global credentials deleted successfully');
            this.render();
        } catch (err) {
            window.app.showToast(err.message, 'error');
        }
    }
};
