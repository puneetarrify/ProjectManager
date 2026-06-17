class ProjectDetail {
    constructor() {
        this.container = document.getElementById('app-content');
        this.currentProject = null;
        this.showAllTasks = false;
    }

    getBadgeClass(status) {
        if (status === 'Active' || status === 'Done') return 'badge-active';
        if (status === 'On Hold' || status === 'Blocked') return 'badge-hold';
        if (status === 'Completed') return 'badge-completed';
        return '';
    }

    async render(projectId) {
        try {
            this.currentProject = await api.getProject(projectId, this.showAllTasks);
            const p = this.currentProject;

            document.getElementById('page-title').innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; cursor: pointer" onclick="app.navigateHome()">
                    <i class='bx bx-arrow-back' style="color: var(--text-muted)"></i>
                    ${p.name}
                </div>
            `;

            let html = `
                <div class="glass-panel" style="padding: 32px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                                <h2 style="font-size: 2rem;">${p.name}</h2>
                                <span class="badge ${this.getBadgeClass(p.status)}">${p.status}</span>
                            </div>
                            <p style="color: var(--text-muted); font-size: 1.1rem; max-width: 600px;">${p.description || 'No description provided.'}</p>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-icon" onclick="projectDetail.editProject()"><i class='bx bx-edit'></i> Edit</button>
                            <button class="btn btn-icon" style="color: var(--danger-color)" onclick="projectDetail.deleteProject()"><i class='bx bx-trash'></i> Delete</button>
                        </div>
                    </div>
                </div>

                <div class="sections-container" style="display: flex; flex-direction: column; gap: 24px;">
                    <!-- Connections Section -->
                    <div class="glass-panel" style="padding: 24px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
                            <h3>SFDC Connections (${p.connections.length})</h3>
                            <button class="btn btn-primary" onclick="projectDetail.addConnection()"><i class='bx bx-plus'></i> Add Connection</button>
                        </div>
                        ${this.renderConnections(p.connections)}
                    </div>

                    <!-- Paths Section -->
                    <div class="glass-panel" style="padding: 24px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
                            <h3>Local Paths (${p.paths.length})</h3>
                            <button class="btn btn-primary" onclick="projectDetail.addPath()"><i class='bx bx-plus'></i> Map Path</button>
                        </div>
                        ${this.renderPaths(p.paths)}
                    </div>

                    <!-- Tasks Section -->
                    <div class="glass-panel" style="padding: 24px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
                            <h3>Tasks (${p.tasks.length})</h3>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn" style="background: var(--surface-light); color: var(--text-color);" onclick="projectDetail.toggleAllTasks()"><i class='bx bx-list-ul'></i> ${this.showAllTasks ? 'Hide Done/Blocked' : 'Show All Tasks'}</button>
                                <button class="btn" style="background: var(--surface-light); color: var(--text-color);" onclick="projectDetail.refreshProjectContext()" title="Refresh Context"><i class='bx bx-refresh'></i> Refresh Context</button>
                                <button class="btn btn-primary" onclick="projectDetail.addTask()"><i class='bx bx-plus'></i> New Task</button>
                            </div>
                        </div>
                        ${this.renderTasks(p.tasks)}
                    </div>
                </div>
            `;

            this.container.innerHTML = html;

        } catch (error) {
            app.showToast(error.message, 'error');
            app.navigateHome();
        }
    }

    renderConnections(conns) {
        if (conns.length === 0) return '<p style="color: var(--text-muted)">No connections mapped yet.</p>';
        return `
            <table class="data-table">
                <thead><tr><th>Alias</th><th>Username</th><th>Type</th><th>Actions</th></tr></thead>
                <tbody>
                    ${conns.map(c => `
                        <tr>
                            <td style="font-weight: 500; color: var(--primary-color)">${c.alias}</td>
                            <td>${c.username || '-'}</td>
                            <td><span class="badge">${c.org_type}</span></td>
                            <td style="display: flex; gap: 8px;">
                                <button class="btn btn-icon" style="color: var(--primary-color)" onclick="projectDetail.editConnection(${c.id})" title="Edit Connection"><i class='bx bx-edit'></i></button>
                                <button class="btn btn-icon" style="color: var(--primary-color)" onclick="projectDetail.openConnection(${c.id})" title="Open in Browser"><i class='bx bx-link-external'></i> Open</button>
                                <button class="btn-icon" style="color: var(--danger-color)" onclick="projectDetail.removeConnection(${c.id})"><i class='bx bx-trash'></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderPaths(paths) {
        if (paths.length === 0) return '<p style="color: var(--text-muted)">No local paths mapped yet.</p>';
        return `
            <table class="data-table">
                <thead><tr><th>Label</th><th>Path</th><th>Actions</th></tr></thead>
                <tbody>
                    ${paths.map(p => `
                        <tr>
                            <td style="font-weight: 500;">${p.label || '-'}</td>
                            <td style="font-family: monospace; color: var(--text-muted)">${p.path}</td>
                            <td style="display: flex; gap: 8px;">
                                <button class="btn btn-icon" style="color: var(--primary-color)" onclick="projectDetail.editPath(${p.id})" title="Edit Path"><i class='bx bx-edit'></i></button>
                                <button class="btn btn-icon" style="color: var(--primary-color)" onclick="projectDetail.openPathInIDE(${p.id}, 'intellij')" title="Open in IntelliJ IDE"><i class='bx bx-code-alt'></i> IntelliJ</button>
                                <button class="btn btn-icon" style="color: var(--primary-color)" onclick="projectDetail.openPathInIDE(${p.id}, 'antigravity')" title="Open in Antigravity"><i class='bx bx-code-alt'></i> Antigravity</button>
                                <button class="btn-icon" style="color: var(--danger-color)" onclick="projectDetail.removePath(${p.id})"><i class='bx bx-trash'></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderTasks(tasks) {
        if (tasks.length === 0) return '<p style="color: var(--text-muted)">No active tasks found.</p>';
        return `
            <table class="data-table">
                <thead><tr><th>Title</th><th>Status</th><th>Priority</th><th>Actions</th></tr></thead>
                <tbody>
                    ${tasks.map(t => `
                        <tr>
                            <td style="font-weight: 500; cursor: pointer; color: var(--primary-color);" onclick="projectDetail.toggleTaskContent(${t.id})" title="Click to view task content">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <i class='bx bx-chevron-right' id="task-icon-${t.id}"></i>
                                    ${t.title}
                                </div>
                            </td>
                            <td><span class="badge ${this.getBadgeClass(t.status)}">${t.status}</span></td>
                            <td>${t.priority}</td>
                            <td style="display: flex; gap: 8px;">
                                <button class="btn btn-icon" style="color: var(--primary-color)" onclick="projectDetail.editTask(${t.id})" title="Edit Task"><i class='bx bx-edit'></i></button>
                                <button class="btn btn-icon" style="color: var(--primary-color)" onclick="projectDetail.openTaskContext(${t.id}, 'intellij')" title="Open Context in IntelliJ IDE"><i class='bx bx-code-alt'></i> IntelliJ</button>
                                <button class="btn btn-icon" style="color: var(--primary-color)" onclick="projectDetail.openTaskContext(${t.id}, 'antigravity')" title="Open Context in Antigravity"><i class='bx bx-code-alt'></i> Antigravity</button>
                                <button class="btn-icon" style="color: var(--danger-color)" onclick="projectDetail.removeTask(${t.id})" title="Delete Task"><i class='bx bx-trash'></i></button>
                            </td>
                        </tr>
                        <tr id="task-content-${t.id}" style="display: none; background: var(--surface-light);">
                            <td colspan="4" style="padding: 16px 24px; border-bottom: 1px solid var(--border-color);">
                                <div id="task-content-inner-${t.id}" style="white-space: pre-wrap; font-family: monospace; color: var(--text-muted); font-size: 0.9rem; max-height: 400px; overflow-y: auto;">Loading...</div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Actions
    editProject() {
        modals.showProjectForm(this.currentProject, async (data) => {
            try {
                await api.updateProject(this.currentProject.id, data);
                modals.close();
                app.showToast('Project updated successfully');
                this.render(this.currentProject.id); // Reload
            } catch (err) {
                app.showToast(err.message, 'error');
            }
        });
    }

    deleteProject() {
        modals.showConfirm(`Are you sure you want to delete '${this.currentProject.name}'? This will remove all mapped connections, paths, and tasks.`, async () => {
            try {
                await api.deleteProject(this.currentProject.id);
                modals.close();
                app.showToast('Project deleted');
                app.navigateHome();
            } catch (err) {
                app.showToast(err.message, 'error');
            }
        });
    }

    // Sub-item Adders
    addConnection() {
        modals.showConnectionForm(null, async (data) => {
            try {
                await api.addConnection(this.currentProject.id, data);
                modals.close();
                app.showToast('Connection added');
                this.render(this.currentProject.id);
            } catch (err) { app.showToast(err.message, 'error'); }
        });
    }

    editConnection(id) {
        const conn = this.currentProject.connections.find(c => c.id === id);
        if (!conn) return;
        modals.showConnectionForm(conn, async (data) => {
            try {
                await api.updateConnection(conn.id, data);
                modals.close();
                app.showToast('Connection updated');
                this.render(this.currentProject.id);
            } catch (err) { app.showToast(err.message, 'error'); }
        });
    }

    addPath() {
        modals.showPathForm(null, async (data) => {
            try {
                await api.addPath(this.currentProject.id, data);
                modals.close();
                app.showToast('Path mapped');
                this.render(this.currentProject.id);
            } catch (err) { app.showToast(err.message, 'error'); }
        });
    }

    editPath(id) {
        const path = this.currentProject.paths.find(p => p.id === id);
        if (!path) return;
        modals.showPathForm(path, async (data) => {
            try {
                await api.updatePath(path.id, data);
                modals.close();
                app.showToast('Path updated');
                this.render(this.currentProject.id);
            } catch (err) { app.showToast(err.message, 'error'); }
        });
    }

    addTask() {
        modals.showTaskForm(null, async (data) => {
            try {
                await api.addTask(this.currentProject.id, data);
                modals.close();
                app.showToast('Task added');
                this.render(this.currentProject.id);
            } catch (err) { app.showToast(err.message, 'error'); }
        });
    }

    editTask(id) {
        const task = this.currentProject.tasks.find(t => t.id === id);
        if (!task) return;

        modals.showTaskForm(task, async (data) => {
            try {
                data.description = task.description; // Preserve description
                await api.updateTask(task.id, data);
                modals.close();
                app.showToast('Task updated');
                this.render(this.currentProject.id);
            } catch (err) { app.showToast(err.message, 'error'); }
        });
    }

    toggleAllTasks() {
        this.showAllTasks = !this.showAllTasks;
        if (this.currentProject) {
            this.render(this.currentProject.id);
        }
    }

    async toggleTaskContent(id) {
        const contentRow = document.getElementById(`task-content-${id}`);
        const icon = document.getElementById(`task-icon-${id}`);

        if (contentRow.style.display === 'none') {
            contentRow.style.display = 'table-row';
            icon.classList.replace('bx-chevron-right', 'bx-chevron-down');

            try {
                const response = await api.getTaskContent(id);
                document.getElementById(`task-content-inner-${id}`).innerText = response.content;
            } catch (err) {
                document.getElementById(`task-content-inner-${id}`).innerText = 'Failed to load task content.';
                app.showToast(err.message, 'error');
            }
        } else {
            contentRow.style.display = 'none';
            icon.classList.replace('bx-chevron-down', 'bx-chevron-right');
        }
    }

    removeTask(id) {
        modals.showConfirm('Remove this task?', async () => {
            try {
                await api.removeTask(id);
                modals.close();
                this.render(this.currentProject.id);
            } catch (err) { app.showToast(err.message, 'error'); }
        });
    }

    // Sub-item Removers
    removeConnection(id) {
        modals.showConfirm('Remove this Salesforce connection?', async () => {
            try {
                await api.removeConnection(id);
                modals.close();
                this.render(this.currentProject.id);
            } catch (err) { app.showToast(err.message, 'error'); }
        });
    }

    async openConnection(id) {
        try {
            await api.openConnection(id);
            app.showToast('Opening SFDC connection in browser...', 'success');
        } catch (err) {
            app.showToast(err.message, 'error');
        }
    }

    removePath(id) {
        modals.showConfirm('Remove this local path mapping?', async () => {
            try {
                await api.removePath(id);
                modals.close();
                this.render(this.currentProject.id);
            } catch (err) { app.showToast(err.message, 'error'); }
        });
    }

    async openPathInIDE(id, ide) {
        try {
            await api.openPath(id, ide);
            app.showToast(`Opening in ${ide === 'intellij' ? 'IntelliJ IDE' : 'Antigravity'}...`, 'success');
        } catch (err) {
            app.showToast(err.message, 'error');
        }
    }



    async openTaskContext(id, ide) {
        try {
            await api.openTaskContext(id, ide);
            app.showToast(`Opening Context in ${ide === 'intellij' ? 'IntelliJ IDE' : 'Antigravity'}...`, 'success');
        } catch (err) {
            app.showToast(err.message, 'error');
        }
    }

    async refreshProjectContext() {
        try {
            await api.refreshProjectContext(this.currentProject.id);
            app.showToast('Project context refreshed successfully', 'success');
        } catch (err) {
            app.showToast(err.message, 'error');
        }
    }
}

const projectDetail = new ProjectDetail();
