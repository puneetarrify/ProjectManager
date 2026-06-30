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

    showNewConnectionForm(onSubmit) {
        const html = `
            <h2 style="margin-bottom: 24px;">New Salesforce Connection</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px; line-height: 1.5;">
                This will authenticate a new Salesforce org using the <code>sf</code> CLI. 
                A browser window will open automatically for you to log in.
            </p>
            <form id="new-conn-form">
                <div class="form-group">
                    <label>Alias</label>
                    <input type="text" id="new-conn-alias" class="form-control" placeholder="e.g., my-dev-org" required>
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
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 32px;">
                    <button type="button" class="btn btn-cancel">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class='bx bx-navigation'></i> Proceed
                    </button>
                </div>
            </form>
        `;
        this.open(html);
        document.getElementById('new-conn-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const alias = document.getElementById('new-conn-alias').value;
            const username = document.getElementById('new-conn-user').value;
            const org_type = document.getElementById('new-conn-type').value;
            
            this.showAuthLoading(alias);
            onSubmit({ alias, username, org_type });
        });
    }

    showAuthLoading(alias) {
        const html = `
            <div style="text-align: center; padding: 40px 20px;">
                <div class="spinner" style="width: 50px; height: 50px; border: 4px solid rgba(255,255,255,0.1); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 24px auto;"></div>
                <h3 style="margin-bottom: 12px; font-size: 1.25rem;">Authenticating Org...</h3>
                <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5; max-width: 320px; margin: 0 auto;">
                    We are launching the browser for <strong>${alias}</strong>. Please log in and approve the Salesforce CLI access.
                </p>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 24px; font-style: italic;">
                    This modal will close automatically once authentication is successful.
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
                path: document.getElementById('path-val').value,
                label: document.getElementById('path-label').value
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
                title: document.getElementById('task-title').value,
                status: document.getElementById('task-status').value,
                priority: document.getElementById('task-priority').value
            });
        });
    }
}

const modals = new ModalManager();
