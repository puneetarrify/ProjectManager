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
    authenticateConnection(projectId, data) { return this.request(`/projects/${projectId}/connections/authenticate`, 'POST', data); }
    soapLoginConnection(data) { return this.request('/connections/soap-login', 'POST', data); }
    updateConnection(id, data) { return this.request(`/connections/${id}`, 'PUT', data); }
    removeConnection(id) { return this.request(`/connections/${id}`, 'DELETE'); }
    openConnection(id) { return this.request(`/connections/${id}/open`, 'POST'); }
    testConnection(id) { return this.request(`/connections/${id}/test`, 'POST'); }

    addPath(projectId, data) { return this.request(`/projects/${projectId}/paths`, 'POST', data); }
    updatePath(id, data) { return this.request(`/paths/${id}`, 'PUT', data); }
    removePath(id) { return this.request(`/paths/${id}`, 'DELETE'); }
    openPath(id, ide) { return this.request(`/paths/${id}/open`, 'POST', { ide }); }

    addCredential(projectId, data) { return this.request(`/projects/${projectId}/credentials`, 'POST', data); }
    updateCredential(id, data) { return this.request(`/credentials/${id}`, 'PUT', data); }
    removeCredential(id) { return this.request(`/credentials/${id}`, 'DELETE'); }

    getGlobalCredentials() { return this.request('/global-credentials'); }
    addGlobalCredential(data) { return this.request('/global-credentials', 'POST', data); }
    updateGlobalCredential(id, data) { return this.request(`/global-credentials/${id}`, 'PUT', data); }
    removeGlobalCredential(id) { return this.request(`/global-credentials/${id}`, 'DELETE'); }

    addTask(projectId, data) { return this.request(`/projects/${projectId}/tasks`, 'POST', data); }
    updateTask(id, data) { return this.request(`/tasks/${id}`, 'PUT', data); }
    removeTask(id) { return this.request(`/tasks/${id}`, 'DELETE'); }
    getTaskContent(id) { return this.request(`/tasks/${id}/content`); }
    openTaskContext(id, ide) { return this.request(`/tasks/${id}/context/open`, 'POST', { ide }); }
    refreshProjectContext(id) { return this.request(`/projects/${id}/context/refresh`, 'POST'); }

    isSalesforceCredential(c) {
        if (!c || !c.password || !c.password.trim()) return false;
        
        // Security token is strong indicator of Salesforce credential
        if (c.security_token && c.security_token.trim().length > 0) return true;
        
        const loginUrl = (c.login_url || '').trim().toLowerCase();
        if (loginUrl.length > 0) {
            const sfDomains = ['salesforce.com', 'force.com', 'cloudforce.com', 'salesforce-setup.com', 'site.com'];
            return sfDomains.some(domain => loginUrl.includes(domain));
        }
        
        // If login_url is empty, check if label or username indicates non-Salesforce service
        const text = ((c.label || '') + ' ' + (c.username || '')).toLowerCase();
        const nonSfKeywords = [
            'formassembly', 'tfaforms', 'canva', 'reddit', 'github', 'gitlab', 
            'jira', 'confluence', 'aws', 'amazon', 'google', 'wordpress', 
            'copado', 'chat gpt', 'chatgpt', 'openai', 'bitbucket', 'mysql', 'postgres'
        ];
        if (nonSfKeywords.some(kw => text.includes(kw)) || /\bfa\b/i.test(text) || /\bfa\s*[-_]/i.test(text)) {
            return false;
        }
        
        // Default for empty login_url without explicit non-SF service is Salesforce
        return true;
    }
}

const api = new ApiClient();
