const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all projects
router.get('/', (req, res) => {
    const stmt = db.prepare(`
        SELECT p.*,
            (SELECT count(*) FROM sfdc_connections WHERE project_id = p.id) as connection_count,
            (SELECT count(*) FROM local_paths WHERE project_id = p.id) as path_count,
            (SELECT count(*) FROM tasks WHERE project_id = p.id AND status NOT IN ('Done', 'Blocked')) as task_count
        FROM projects p
        ORDER BY p.updated_at DESC
    `);
    res.json(stmt.all());
});

// GET a single project with all relations
router.get('/:id', (req, res) => {
    const projectId = req.params.id;
    
    const projectStmt = db.prepare('SELECT * FROM projects WHERE id = ?');
    const project = projectStmt.get(projectId);
    
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const connectionsStmt = db.prepare('SELECT * FROM sfdc_connections WHERE project_id = ?');
    const pathsStmt = db.prepare('SELECT * FROM local_paths WHERE project_id = ?');
    
    let tasksStmt;
    if (req.query.showAll === 'true') {
        tasksStmt = db.prepare("SELECT * FROM tasks WHERE project_id = ? ORDER BY priority DESC, created_at DESC");
    } else {
        tasksStmt = db.prepare("SELECT * FROM tasks WHERE project_id = ? AND status NOT IN ('Done', 'Blocked') ORDER BY priority DESC, created_at DESC");
    }

    res.json({
        ...project,
        connections: connectionsStmt.all(projectId),
        paths: pathsStmt.all(projectId),
        tasks: tasksStmt.all(projectId)
    });
});

// POST new project
router.post('/', (req, res) => {
    const { name, description, status } = req.body;
    
    try {
        const stmt = db.prepare('INSERT INTO projects (name, description, status) VALUES (?, ?, ?)');
        const info = stmt.run(name, description, status || 'Active');
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            res.status(400).json({ error: 'Project name must be unique' });
        } else {
            throw err;
        }
    }
});

// PUT update project
router.put('/:id', (req, res) => {
    const { name, description, status } = req.body;
    const stmt = db.prepare(`
        UPDATE projects 
        SET name = ?, description = ?, status = ?, updated_at = datetime('now', 'localtime')
        WHERE id = ?
    `);
    const info = stmt.run(name, description, status, req.params.id);
    
    if (info.changes === 0) {
        return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true });
});

// DELETE project
router.delete('/:id', (req, res) => {
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    const info = stmt.run(req.params.id);
    
    if (info.changes === 0) {
        return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true });
});

// Sub-routes directly off projects for convenience

// POST add connection to project
router.post('/:id/connections', (req, res) => {
    const { alias, username, org_type, org_id } = req.body;
    const stmt = db.prepare('INSERT INTO sfdc_connections (project_id, alias, username, org_type, org_id) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(req.params.id, alias, username, org_type || 'Sandbox', org_id);
    res.status(201).json({ id: info.lastInsertRowid });
});

// POST add path to project
router.post('/:id/paths', (req, res) => {
    const { path, label } = req.body;
    const stmt = db.prepare('INSERT INTO local_paths (project_id, path, label) VALUES (?, ?, ?)');
    const info = stmt.run(req.params.id, path, label);
    res.status(201).json({ id: info.lastInsertRowid });
});

// POST add task to project
router.post('/:id/tasks', (req, res) => {
    const { title, description, status, priority } = req.body;
    const projectId = req.params.id;
    
    // Get Project details to create task context folder
    const project = db.prepare('SELECT name, description FROM projects WHERE id = ?').get(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    const stmt = db.prepare('INSERT INTO tasks (project_id, title, description, status, priority) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(projectId, title, description, status || 'To Do', priority || 'Medium');
    const taskId = info.lastInsertRowid;
    
    // Generate context files
    const fs = require('fs');
    const path = require('path');
    
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const projectDir = path.join('/home/kritik/CLI/Tasks', project.name);
    
    fs.mkdirSync(projectDir, { recursive: true });
    const contextPath = path.join(projectDir, 'Task_context.md');
    const taskFilePath = path.join(projectDir, `${sanitizedTitle}.md`);
    
    const connections = db.prepare('SELECT * FROM sfdc_connections WHERE project_id = ?').all(projectId);
    const localPaths = db.prepare('SELECT * FROM local_paths WHERE project_id = ?').all(projectId);
    
    let taskContent = `# Task Context\n\n## Task Overview\n**Title:** ${title}\n**Description:** ${description}\n**Priority:** ${priority || 'Medium'}\n**Status:** ${status || 'To Do'}\n\n`;
    taskContent += `## Project Context\n**Project Name:** ${project.name}\n**Description:** ${project.description}\n\n`;
    
    let contextContent = taskContent;
    
    contextContent += `## SFDC Connections\n`;
    connections.forEach(c => {
        contextContent += `- **Alias:** ${c.alias} | **Type:** ${c.org_type} | **Username:** ${c.username}\n`;
    });
    
    contextContent += `\n## Local Directory Paths\n`;
    localPaths.forEach(p => {
        contextContent += `- **Label:** ${p.label} | **Path:** ${p.path}\n`;
    });
    
    contextContent += `\n## Working Rules\n\n`;
    contextContent += `**File & Context Management:**\n`;
    contextContent += `- **Output Logs:** Save large CLI output files in \`Tasks/${project.name}/output/\` to avoid cluttering the chat. Summarize only the critical findings or actionable results in our conversation.\n`;
    contextContent += `- **Reference Material:** Store retrieved Salesforce metadata, original XML backups, or documentation in \`Tasks/${project.name}/retrieved/\`.\n`;
    contextContent += `- **Worklog Maintenance:** Continuously record decisions, progress, blockers, and handoff notes in the task-specific markdown file to ensure context is never lost.\n\n`;
    
    contextContent += `**Salesforce Development & Deployment:**\n`;
    contextContent += `- **State Verification:** Always retrieve or query the current state from the target Salesforce org before making changes. Never assume local files perfectly match the org.\n`;
    contextContent += `- **Safe Deployments:** Ask for explicit approval before deploying to *any* Salesforce org. For production, double-check that all approvals and pre-deployment checks are complete.\n`;
    contextContent += `- **Dry Runs First:** Use validation deployments (e.g., \`sf project deploy ... --dry-run\`) to catch issues fast and keep the process smooth.\n\n`;
    
    contextContent += `**Workflow Optimizations (Fast & Optimistic):**\n`;
    contextContent += `- **Incremental Steps:** Make small, isolated changes and verify them. This makes debugging fast and rollbacks easy.\n`;
    contextContent += `- **Data-Driven Debugging:** If an error occurs, analyze the explicit CLI error logs or Salesforce debug logs before guessing the root cause.\n`;
    
    fs.writeFileSync(contextPath, contextContent);
    fs.writeFileSync(taskFilePath, taskContent);
    
    // Update the task with the context path to the task-specific file
    db.prepare('UPDATE tasks SET context_path = ? WHERE id = ?').run(taskFilePath, taskId);
    
    res.status(201).json({ id: taskId, context_path: taskFilePath });
});

// POST refresh context file for the project
router.post('/:id/context/refresh', (req, res) => {
    const projectId = req.params.id;
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    const connections = db.prepare('SELECT * FROM sfdc_connections WHERE project_id = ?').all(projectId);
    const localPaths = db.prepare('SELECT * FROM local_paths WHERE project_id = ?').all(projectId);
    
    const fs = require('fs');
    const path = require('path');
    
    const projectDir = path.join('/home/kritik/CLI/Tasks', project.name);
    const contextFilePath = path.join(projectDir, 'Task_context.md');
    
    let existingNotes = '';
    const notesHeader = '## Working Rules';
    const oldNotesHeader = '## AI Context & Development Notes';
    if (fs.existsSync(contextFilePath)) {
        const existingContent = fs.readFileSync(contextFilePath, 'utf8');
        let notesIndex = existingContent.indexOf(notesHeader);
        if (notesIndex !== -1) {
            existingNotes = existingContent.substring(notesIndex + notesHeader.length).trim();
        } else {
            notesIndex = existingContent.indexOf(oldNotesHeader);
            if (notesIndex !== -1) {
                existingNotes = existingContent.substring(notesIndex + oldNotesHeader.length).trim();
            }
        }
    }
    
    let contextContent = `# Project Context\n\n**Project Name:** ${project.name}\n**Description:** ${project.description}\n\n`;
    
    contextContent += `## SFDC Connections\n`;
    connections.forEach(c => {
        contextContent += `- **Alias:** ${c.alias} | **Type:** ${c.org_type} | **Username:** ${c.username}\n`;
    });
    
    contextContent += `\n## Local Directory Paths\n`;
    localPaths.forEach(p => {
        contextContent += `- **Label:** ${p.label} | **Path:** ${p.path}\n`;
    });
    
    contextContent += `\n${notesHeader}\n`;
    if (existingNotes) {
        contextContent += existingNotes + '\n';
    } else {
        contextContent += `**File & Context Management:**\n`;
        contextContent += `- **Output Logs:** Save large CLI output files in \`Tasks/${project.name}/output/\` to avoid cluttering the chat. Summarize only the critical findings or actionable results in our conversation.\n`;
        contextContent += `- **Reference Material:** Store retrieved Salesforce metadata, original XML backups, or documentation in \`Tasks/${project.name}/retrieved/\`.\n`;
        contextContent += `- **Worklog Maintenance:** Continuously record decisions, progress, blockers, and handoff notes in the task-specific markdown file to ensure context is never lost.\n\n`;
        
        contextContent += `**Salesforce Development & Deployment:**\n`;
        contextContent += `- **State Verification:** Always retrieve or query the current state from the target Salesforce org before making changes. Never assume local files perfectly match the org.\n`;
        contextContent += `- **Safe Deployments:** Ask for explicit approval before deploying to *any* Salesforce org. For production, double-check that all approvals and pre-deployment checks are complete.\n`;
        contextContent += `- **Dry Runs First:** Use validation deployments (e.g., \`sf project deploy ... --dry-run\`) to catch issues fast and keep the process smooth.\n\n`;
        
        contextContent += `**Workflow Optimizations (Fast & Optimistic):**\n`;
        contextContent += `- **Incremental Steps:** Make small, isolated changes and verify them. This makes debugging fast and rollbacks easy.\n`;
        contextContent += `- **Data-Driven Debugging:** If an error occurs, analyze the explicit CLI error logs or Salesforce debug logs before guessing the root cause.\n`;
    }
    
    if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
    }
    fs.writeFileSync(contextFilePath, contextContent);
    
    res.json({ success: true });
});

module.exports = router;
