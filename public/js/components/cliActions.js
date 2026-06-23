const cliActions = {
    commands: [
        {
            category: "Authentication & Connection",
            items: [
                { name: "Auth New Org", command: "sf org login web -a <Alias>", desc: "Authenticates an org using a web browser.", example: "sf org login web -a MyUATOrg" },
                { name: "List All Orgs", command: "sf org list --all", desc: "Lists all currently authorized orgs.", example: "sf org list --all" },
                { name: "Open Org", command: "sf org open -o <Alias>", desc: "Opens an authorized org in your browser.", example: "sf org open -o MyUATOrg" }
            ]
        },
        {
            category: "Scratch Org Management",
            items: [
                { name: "Create Scratch Org", command: "sf org create scratch -f config/project-scratch-def.json -a <Alias> -y 30 -d", desc: "Creates a new scratch org.", example: "sf org create scratch -f config/project-scratch-def.json -a dev1 -y 30 -d" },
                { name: "Delete Scratch Org", command: "sf org delete scratch -o <Alias> --no-prompt", desc: "Deletes an active scratch org.", example: "sf org delete scratch -o dev1 --no-prompt" }
            ]
        },
        {
            category: "Source Code (Tracked Orgs)",
            items: [
                { name: "Deploy Changes", command: "sf project deploy start", desc: "Deploys local changes to a source-tracked org.", example: "sf project deploy start" },
                { name: "Retrieve Changes", command: "sf project retrieve start", desc: "Retrieves remote changes from a source-tracked org.", example: "sf project retrieve start" }
            ]
        },
        {
            category: "Metadata (Non-Tracked Orgs)",
            items: [
                { name: "Deploy Folder", command: "sf project deploy start -d force-app/main/default/classes -o <Alias>", desc: "Deploys specified folder.", example: "sf project deploy start -d force-app/main/default/classes -o MyUATOrg" },
                { name: "Deploy Manifest", command: "sf project deploy start -x manifest/package.xml -o <Alias>", desc: "Deploys based on package.xml.", example: "sf project deploy start -x manifest/package.xml -o MyUATOrg" },
                { name: "Retrieve Metadata", command: "sf project retrieve start -m ApexClass:MyClass -o <Alias>", desc: "Retrieves specific metadata.", example: "sf project retrieve start -m ApexClass:MyClass -o MyUATOrg" }
            ]
        },
        {
            category: "Development",
            items: [
                { name: "Create Apex Class", command: "sf apex generate class -n <ClassName> -d <OutputDir>", desc: "Generates an Apex class.", example: "sf apex generate class -n MyController -d force-app/main/default/classes" },
                { name: "Create LWC", command: "sf lightning generate component -n <ComponentName> -d <OutputDir> --type lwc", desc: "Generates a Lightning Web Component.", example: "sf lightning generate component -n myComponent -d force-app/main/default/lwc --type lwc" }
            ]
        },
        {
            category: "Data Operations",
            items: [
                { name: "Execute SOQL", command: 'sf data query -q "SELECT Id, Name FROM Account LIMIT 10" -o <Alias>', desc: "Executes a SOQL query.", example: 'sf data query -q "SELECT Id, Name FROM Account LIMIT 10" -o MyUATOrg' },
                { name: "Export Data Tree", command: 'sf data export tree -q "SELECT Id, Name FROM Account" -d ./data', desc: "Exports records to JSON.", example: 'sf data export tree -q "SELECT Id, Name FROM Account" -d ./data' },
                { name: "Import Data Tree", command: "sf data import tree -f data/Account.json -o <Alias>", desc: "Imports records from JSON.", example: "sf data import tree -f data/Account.json -o MyUATOrg" }
            ]
        },
        {
            category: "Apex Testing & Execution",
            items: [
                { name: "Run Local Tests", command: "sf apex run test -l RunLocalTests -c -r human", desc: "Runs local Apex unit tests.", example: "sf apex run test -l RunLocalTests -c -r human" },
                { name: "Execute Anonymous", command: "sf apex run -f scripts/apex/hello.apex -o <Alias>", desc: "Executes anonymous Apex.", example: "sf apex run -f scripts/apex/hello.apex -o MyUATOrg" }
            ]
        },
        {
            category: "User & Permissions",
            items: [
                { name: "Generate Password", command: "sf org generate password -o <Alias>", desc: "Generates password for scratch org user.", example: "sf org generate password -o dev1" },
                { name: "Assign Permission Set", command: "sf org assign permset -n <PermSetName> -o <Alias>", desc: "Assigns a specific permission set.", example: "sf org assign permset -n Sales_User -o MyUATOrg" }
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
                            ${item.example ? `
                            <div style="margin-top: 4px; background: rgba(0,0,0,0.1); padding: 8px; border-radius: 4px; border-left: 2px solid var(--primary-color);">
                                <div style="color: var(--text-muted); font-size: 0.75rem; margin-bottom: 4px;">Example:</div>
                                <code style="color: #bbb; font-family: monospace; font-size: 0.8rem; word-break: break-all;">${item.example}</code>
                            </div>` : ''}
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
