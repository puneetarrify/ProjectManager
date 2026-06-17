const cliActions = {
    commands: [
        {
            category: "Authentication & Connection",
            items: [
                { name: "Auth New Org", command: "sf org login web -a <Alias>", desc: "Authenticates an org using a web browser." },
                { name: "List All Orgs", command: "sf org list --all", desc: "Lists all currently authorized orgs." },
                { name: "Open Org", command: "sf org open -o <Alias>", desc: "Opens an authorized org in your browser." }
            ]
        },
        {
            category: "Scratch Org Management",
            items: [
                { name: "Create Scratch Org", command: "sf org create scratch -f config/project-scratch-def.json -a <Alias> -y 30 -d", desc: "Creates a new scratch org." },
                { name: "Delete Scratch Org", command: "sf org delete scratch -o <Alias> --no-prompt", desc: "Deletes an active scratch org." }
            ]
        },
        {
            category: "Source Code (Tracked Orgs)",
            items: [
                { name: "Deploy Changes", command: "sf project deploy start", desc: "Deploys local changes to a source-tracked org." },
                { name: "Retrieve Changes", command: "sf project retrieve start", desc: "Retrieves remote changes from a source-tracked org." }
            ]
        },
        {
            category: "Metadata (Non-Tracked Orgs)",
            items: [
                { name: "Deploy Folder", command: "sf project deploy start -d force-app/main/default/classes -o <Alias>", desc: "Deploys specified folder." },
                { name: "Deploy Manifest", command: "sf project deploy start -x manifest/package.xml -o <Alias>", desc: "Deploys based on package.xml." },
                { name: "Retrieve Metadata", command: "sf project retrieve start -m ApexClass:MyClass -o <Alias>", desc: "Retrieves specific metadata." }
            ]
        },
        {
            category: "Data Operations",
            items: [
                { name: "Execute SOQL", command: 'sf data query -q "SELECT Id, Name FROM Account LIMIT 10" -o <Alias>', desc: "Executes a SOQL query." },
                { name: "Export Data Tree", command: 'sf data export tree -q "SELECT Id, Name FROM Account" -d ./data', desc: "Exports records to JSON." },
                { name: "Import Data Tree", command: "sf data import tree -f data/Account.json -o <Alias>", desc: "Imports records from JSON." }
            ]
        },
        {
            category: "Apex Testing & Execution",
            items: [
                { name: "Run Local Tests", command: "sf apex run test -l RunLocalTests -c -r human", desc: "Runs local Apex unit tests." },
                { name: "Execute Anonymous", command: "sf apex run -f scripts/apex/hello.apex -o <Alias>", desc: "Executes anonymous Apex." }
            ]
        },
        {
            category: "User & Permissions",
            items: [
                { name: "Generate Password", command: "sf org generate password -o <Alias>", desc: "Generates password for scratch org user." },
                { name: "Assign Permission Set", command: "sf org assign permset -n <PermSetName> -o <Alias>", desc: "Assigns a specific permission set." }
            ]
        }
    ],

    render() {
        document.getElementById('page-title').textContent = 'CLI Actions';
        const content = document.getElementById('app-content');
        
        let html = `
            <div class="cli-actions-container glass-panel" style="padding: 24px;">
                <p style="color: var(--text-muted); margin-bottom: 24px;">Quickly copy commonly used Salesforce (sf) CLI commands. Replace bracketed text like <Alias> with your specific details.</p>
                <div class="cli-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 24px;">
        `;

        this.commands.forEach(category => {
            html += `
                <div class="cli-category" style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <h3 style="margin-bottom: 16px; font-size: 1.1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; color: var(--primary-color);">${category.category}</h3>
                    <div class="cli-items" style="display: flex; flex-direction: column; gap: 12px;">
            `;

            category.items.forEach(item => {
                html += `
                        <div class="cli-item" style="display: flex; flex-direction: column; gap: 8px; background: rgba(255,255,255,0.02); padding: 12px; border-radius: var(--radius-sm);">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <strong style="color: var(--text-main); font-size: 0.95rem;">${item.name}</strong>
                                <button class="btn btn-icon" onclick="cliActions.copyCommand(this, '${item.command.replace(/'/g, "\\'")}')" title="Copy Command">
                                    <i class='bx bx-copy'></i>
                                </button>
                            </div>
                            <code style="background: #000; padding: 8px; border-radius: 4px; color: #a8ff60; font-family: monospace; font-size: 0.85rem; word-break: break-all;">${item.command}</code>
                            <span style="color: var(--text-muted); font-size: 0.8rem;">${item.desc}</span>
                        </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        content.innerHTML = html;
    },

    copyCommand(btn, command) {
        navigator.clipboard.writeText(command).then(() => {
            window.app.showToast('Command copied to clipboard!');
            const icon = btn.querySelector('i');
            icon.className = 'bx bx-check';
            icon.style.color = 'var(--success-color)';
            setTimeout(() => {
                icon.className = 'bx bx-copy';
                icon.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            window.app.showToast('Failed to copy command', 'error');
        });
    }
};
