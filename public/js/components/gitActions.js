const gitActions = {
    commands: [
        {
            category: "Initialization & Cloning",
            items: [
                { name: "Initialize Repository", command: "git init", desc: "Creates a new local repository.", example: "git init" },
                { name: "Clone Repository", command: "git clone <url>", desc: "Downloads a project and its entire version history.", example: "git clone https://github.com/user/repo.git" }
            ]
        },
        {
            category: "Basic Snapshotting",
            items: [
                { name: "Check Status", command: "git status", desc: "Lists all new or modified files to be committed.", example: "git status" },
                { name: "Add File", command: "git add <file>", desc: "Snapshots the file in preparation for versioning.", example: "git add index.html" },
                { name: "Add All Files", command: "git add .", desc: "Snapshots all modified and new files.", example: "git add ." },
                { name: "Commit Changes", command: 'git commit -m "<message>"', desc: "Records file snapshots permanently in version history.", example: 'git commit -m "Initial commit"' }
            ]
        },
        {
            category: "Branching & Merging",
            items: [
                { name: "List Branches", command: "git branch", desc: "Lists all local branches in the current repository.", example: "git branch" },
                { name: "Create Branch", command: "git branch <branch-name>", desc: "Creates a new branch.", example: "git branch feature-x" },
                { name: "Switch Branch", command: "git checkout <branch-name>", desc: "Switches to the specified branch.", example: "git checkout feature-x" },
                { name: "Create & Switch Branch", command: "git checkout -b <branch-name>", desc: "Creates a new branch and switches to it.", example: "git checkout -b feature-y" },
                { name: "Merge Branch", command: "git merge <branch-name>", desc: "Combines the specified branch's history into the current branch.", example: "git merge feature-x" }
            ]
        },
        {
            category: "Sharing & Updating Projects",
            items: [
                { name: "Add Remote", command: "git remote add <name> <url>", desc: "Connects a local repository to a remote server.", example: "git remote add origin https://github.com/user/repo.git" },
                { name: "Fetch Changes", command: "git fetch <remote>", desc: "Downloads all history from the remote repository.", example: "git fetch origin" },
                { name: "Pull Changes", command: "git pull <remote> <branch>", desc: "Fetches and merges changes on the remote server to your working directory.", example: "git pull origin main" },
                { name: "Push Changes", command: "git push <remote> <branch>", desc: "Uploads all local branch commits to the remote.", example: "git push origin main" }
            ]
        },
        {
            category: "Inspection & Comparison",
            items: [
                { name: "View Log", command: "git log", desc: "Lists version history for the current branch.", example: "git log" },
                { name: "View Log One-Line", command: "git log --oneline", desc: "Lists version history in a compact format.", example: "git log --oneline" },
                { name: "View Diff", command: "git diff", desc: "Shows file differences not yet staged.", example: "git diff" }
            ]
        },
        {
            category: "Undoing",
            items: [
                { name: "Revert Commit", command: "git revert <commit>", desc: "Creates a new commit that undoes all of the changes made in a given commit.", example: "git revert 3b2a1" },
                { name: "Reset Commit", command: "git reset <commit>", desc: "Undoes all commits after the given commit, preserving changes locally.", example: "git reset 3b2a1" },
                { name: "Discard Local Changes", command: "git checkout -- <file>", desc: "Discards local changes in a specific file.", example: "git checkout -- index.html" }
            ]
        }
    ],

    render() {
        document.getElementById('page-title').textContent = 'Git Actions';
        const content = document.getElementById('app-content');
        
        let html = `
            <div class="cli-actions-container glass-panel" style="padding: 24px;">
                <p style="color: var(--text-muted); margin-bottom: 24px;">Quickly copy commonly used Git commands. Replace bracketed text like &lt;branch-name&gt; with your specific details.</p>
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
                                <button class="btn btn-icon" onclick="gitActions.copyCommand(this, '${item.command.replace(/'/g, "\\'")}')" title="Copy Command">
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
            window.app.showToast('Git command copied to clipboard!');
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
