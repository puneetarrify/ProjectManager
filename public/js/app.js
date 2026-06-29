class App {
    constructor() {
        this.bindGlobalEvents();
        this.navigateHome();
    }

    bindGlobalEvents() {
        document.getElementById('nav-dashboard').addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateHome();
        });

        document.getElementById('nav-cli').addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateCli();
        });

        document.getElementById('nav-git').addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateGit();
        });

        document.getElementById('nav-sf-release').addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateSalesforceRelease();
        });

        document.getElementById('btn-new-project').addEventListener('click', () => {
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

    navigateHome() {
        // Toggle UI states
        document.getElementById('nav-dashboard').classList.add('active');
        document.getElementById('nav-cli').classList.remove('active');
        document.getElementById('nav-git').classList.remove('active');
        if(document.getElementById('nav-sf-release')) document.getElementById('nav-sf-release').classList.remove('active');
        document.getElementById('btn-new-project').style.display = 'inline-flex';
        dashboard.render();
    }

    navigateCli() {
        document.getElementById('nav-cli').classList.add('active');
        document.getElementById('nav-dashboard').classList.remove('active');
        document.getElementById('nav-git').classList.remove('active');
        if(document.getElementById('nav-sf-release')) document.getElementById('nav-sf-release').classList.remove('active');
        document.getElementById('btn-new-project').style.display = 'none';
        cliActions.render();
    }

    navigateGit() {
        document.getElementById('nav-git').classList.add('active');
        document.getElementById('nav-dashboard').classList.remove('active');
        document.getElementById('nav-cli').classList.remove('active');
        if(document.getElementById('nav-sf-release')) document.getElementById('nav-sf-release').classList.remove('active');
        document.getElementById('btn-new-project').style.display = 'none';
        gitActions.render();
    }

    navigateSalesforceRelease() {
        if(document.getElementById('nav-sf-release')) document.getElementById('nav-sf-release').classList.add('active');
        document.getElementById('nav-dashboard').classList.remove('active');
        document.getElementById('nav-cli').classList.remove('active');
        document.getElementById('nav-git').classList.remove('active');
        document.getElementById('btn-new-project').style.display = 'none';
        salesforceRelease.render();
    }

    navigateToProject(id) {
        document.getElementById('nav-dashboard').classList.remove('active');
        document.getElementById('nav-cli').classList.remove('active');
        document.getElementById('nav-git').classList.remove('active');
        if(document.getElementById('nav-sf-release')) document.getElementById('nav-sf-release').classList.remove('active');
        document.getElementById('btn-new-project').style.display = 'none';
        projectDetail.render(id);
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
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
