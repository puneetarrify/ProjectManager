const express = require('express');
const router = express.Router();
const db = require('../db');
const { exec } = require('child_process');

// POST open path in intellij or antigravity
router.post('/:id/open', (req, res) => {
    const { ide } = req.body;
    const stmt = db.prepare('SELECT path FROM local_paths WHERE id = ?');
    const row = stmt.get(req.params.id);
    
    if (!row) {
        return res.status(404).json({ error: 'Path not found' });
    }
    
    const command = ide === 'antigravity'
        ? `antigravity "${row.path}" 2>/dev/null || antigravity-ide "${row.path}"`
        : `idea "${row.path}"`;
    
    exec(command, (error) => {
        if (error) {
            console.error('Error opening IDE:', error);
        }
    });
    
    res.json({ success: true });
});

// PUT update path
router.put('/:id', (req, res) => {
    const { label, path } = req.body;
    if (!label || !path) {
        return res.status(400).json({ error: 'Label and path are required' });
    }
    const stmt = db.prepare('UPDATE local_paths SET label = ?, path = ? WHERE id = ?');
    const info = stmt.run(label, path, req.params.id);
    if (info.changes === 0) {
        return res.status(404).json({ error: 'Path not found' });
    }
    res.json({ success: true });
});
router.delete('/:id', (req, res) => {
    const stmt = db.prepare('DELETE FROM local_paths WHERE id = ?');
    const info = stmt.run(req.params.id);
    
    if (info.changes === 0) {
        return res.status(404).json({ error: 'Path not found' });
    }
    res.json({ success: true });
});

module.exports = router;
