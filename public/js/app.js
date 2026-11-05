class App {
    constructor() {
        this.navIds = [
            'nav-dashboard',
            'nav-credentials',
            'nav-cli',
            'nav-git',
            'nav-sf-release',
            'nav-image-converter',
            'nav-html-viewer',
            'nav-words-counter',
            'nav-text-compare'
        ];
        this.bindGlobalEvents();
        this.navigateHome();
    }

    setActiveNav(activeId) {
        this.navIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (id === activeId) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            }
        });

        const btnNew = document.getElementById('btn-new-project');
        if (btnNew) {
            btnNew.style.display = (activeId === 'nav-dashboard') ? 'inline-flex' : 'none';
        }
    }

    bindGlobalEvents() {
        const bindClick = (id, handler) => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    handler();
                });
            }
        };

        bindClick('nav-dashboard', () => this.navigateHome());
        bindClick('nav-credentials', () => this.navigateCredentials());
        bindClick('nav-cli', () => this.navigateCli());
        bindClick('nav-git', () => this.navigateGit());
        bindClick('nav-sf-release', () => this.navigateSalesforceRelease());
        bindClick('nav-image-converter', () => this.navigateImageConverter());
        bindClick('nav-html-viewer', () => this.navigateHtmlViewer());
        bindClick('nav-words-counter', () => this.navigateWordsCounter());
        bindClick('nav-text-compare', () => this.navigateTextCompare());

        const btnNewProject = document.getElementById('btn-new-project');
        if (btnNewProject) {
            btnNewProject.addEventListener('click', () => {
                modals.showProjectForm(null, async (data) => {
                    try {
                        await api.createProject(data);
                        modals.close();
                        this.showToast('Project created successfully!');
                        this.navigateHome(); // Refresh
                    } catch (error) {
                        this.showToast(error.message, 'error');
                    }
                });
            });
        }
    }

    navigateHome() {
        this.setActiveNav('nav-dashboard');
        dashboard.render();
    }

    navigateCredentials() {
        this.setActiveNav('nav-credentials');
        credentialsView.render();
    }

    navigateCli() {
        this.setActiveNav('nav-cli');
        cliActions.render();
    }

    navigateGit() {
        this.setActiveNav('nav-git');
        gitActions.render();
    }

    navigateSalesforceRelease() {
        this.setActiveNav('nav-sf-release');
        salesforceRelease.render();
    }

    navigateImageConverter() {
        this.setActiveNav('nav-image-converter');
        imageConverter.render();
    }

    navigateHtmlViewer() {
        this.setActiveNav('nav-html-viewer');
        htmlViewer.render();
    }

    navigateWordsCounter() {
        this.setActiveNav('nav-words-counter');
        wordsCounter.render();
    }

    navigateTextCompare() {
        this.setActiveNav('nav-text-compare');
        textCompare.render();
    }

    navigateToProject(id) {
        this.setActiveNav(null);
        projectDetail.render(id);
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.borderLeft = `4px solid ${type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'}`;
        
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class='bx ${type === 'success' ? 'bx-check-circle' : 'bx-error-circle'}'></i>
                <span>${message}</span>
            </div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
