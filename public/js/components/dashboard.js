class Dashboard {
    constructor() {
        this.container = document.getElementById('app-content');
    }

    getBadgeClass(status) {
        switch(status) {
            case 'Active': return 'badge-active';
            case 'On Hold': return 'badge-hold';
            case 'Completed': return 'badge-completed';
            default: return '';
        }
    }

    async render() {
        document.getElementById('page-title').innerText = 'Dashboard';
        
        try {
            const projects = await api.getProjects();
            
            if (projects.length === 0) {
                this.container.innerHTML = `
                    <div style="text-align: center; padding: 60px; color: var(--text-muted);">
                        <i class='bx bx-folder-open' style="font-size: 48px; margin-bottom: 16px;"></i>
                        <h2>No projects found</h2>
                        <p>Create your first project to get started.</p>
                    </div>
                `;
                return;
            }

            let html = '<div class="projects-grid">';
            
            projects.forEach(p => {
                const visitedDate = p.last_visited_at ? new Date(p.last_visited_at.replace(' ', 'T')).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : 'Never visited';
                
                html += `
                    <div class="project-card glass-panel" onclick="app.navigateToProject(${p.id})">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                            <h3>${p.name}</h3>
                            <span class="badge ${this.getBadgeClass(p.status)}">${p.status}</span>
                        </div>
                        <p style="margin-bottom: 8px;">${p.description || 'No description provided.'}</p>
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px;">
                            <i class='bx bx-time'></i> Last visited: ${visitedDate}
                        </p>
                        
                        <div class="stats-row">
                            <div class="stat-item" title="Salesforce Connections">
                                <i class='bx bx-cloud'></i> ${p.connection_count}
                            </div>
                            <div class="stat-item" title="Local Paths">
                                <i class='bx bx-folder'></i> ${p.path_count}
                            </div>
                            <div class="stat-item" title="Tasks">
                                <i class='bx bx-check-square'></i> ${p.task_count}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            this.container.innerHTML = html;

        } catch (error) {
            app.showToast(error.message, 'error');
        }
    }
}

const dashboard = new Dashboard();
