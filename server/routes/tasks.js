const express = require('express');
const router = express.Router();
const db = require('../db');

// GET task content (markdown file)
router.get('/:id/content', (req, res) => {
    const task = db.prepare('SELECT context_path FROM tasks WHERE id = ?').get(req.params.id);
    
    if (!task || !task.context_path) {
        return res.status(404).json({ error: 'Context path not found' });
    }
    
    const fs = require('fs');
    if (fs.existsSync(task.context_path)) {
        res.json({ content: fs.readFileSync(task.context_path, 'utf8') });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// PUT update specific task
router.put('/:id', (req, res) => {
    const { title, description, status, priority } = req.body;
    const stmt = db.prepare(`
        UPDATE tasks 
        SET title = ?, description = ?, status = ?, priority = ?, updated_at = datetime('now', 'localtime')
        WHERE id = ?
    `);
    const info = stmt.run(title, description, status, priority, req.params.id);
    
    if (info.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ success: true });
});

// DELETE a task
router.delete('/:id', (req, res) => {
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const info = stmt.run(req.params.id);
    
    if (info.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ success: true });
});

// POST open context file in IDE
router.post('/:id/context/open', (req, res) => {
    const { ide } = req.body;
    const stmt = db.prepare('SELECT context_path FROM tasks WHERE id = ?');
    const task = stmt.get(req.params.id);
    
    if (!task || !task.context_path) {
        return res.status(404).json({ error: 'Context path not found' });
    }
    
    const { exec } = require('child_process');
    const command = ide === 'antigravity'
        ? `antigravity "${task.context_path}" 2>/dev/null || antigravity-ide "${task.context_path}"`
        : `idea "${task.context_path}"`;
    
    exec(command, (error) => {
        if (error) {
            console.error('Error opening IDE:', error);
        }
    });
    
    res.json({ success: true });
});

module.exports = router;
