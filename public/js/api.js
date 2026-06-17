class ApiClient {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'API Request Failed');
            }
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Projects
    getProjects() { return this.request('/projects'); }
    getProject(id, showAll = false) { return this.request(`/projects/${id}${showAll ? '?showAll=true' : ''}`); }
    createProject(data) { return this.request('/projects', 'POST', data); }
    updateProject(id, data) { return this.request(`/projects/${id}`, 'PUT', data); }
    deleteProject(id) { return this.request(`/projects/${id}`, 'DELETE'); }

    // Sub-resources
    addConnection(projectId, data) { return this.request(`/projects/${projectId}/connections`, 'POST', data); }
    updateConnection(id, data) { return this.request(`/connections/${id}`, 'PUT', data); }
    removeConnection(id) { return this.request(`/connections/${id}`, 'DELETE'); }
    openConnection(id) { return this.request(`/connections/${id}/open`, 'POST'); }

    addPath(projectId, data) { return this.request(`/projects/${projectId}/paths`, 'POST', data); }
    updatePath(id, data) { return this.request(`/paths/${id}`, 'PUT', data); }
    removePath(id) { return this.request(`/paths/${id}`, 'DELETE'); }
    openPath(id, ide) { return this.request(`/paths/${id}/open`, 'POST', { ide }); }

    addTask(projectId, data) { return this.request(`/projects/${projectId}/tasks`, 'POST', data); }
    updateTask(id, data) { return this.request(`/tasks/${id}`, 'PUT', data); }
    removeTask(id) { return this.request(`/tasks/${id}`, 'DELETE'); }
    getTaskContent(id) { return this.request(`/tasks/${id}/content`); }
    openTaskContext(id, ide) { return this.request(`/tasks/${id}/context/open`, 'POST', { ide }); }
    refreshProjectContext(id) { return this.request(`/projects/${id}/context/refresh`, 'POST'); }
}

const api = new ApiClient();
