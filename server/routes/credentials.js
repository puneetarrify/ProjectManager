const express = require('express');
const router = express.Router();
const db = require('../db');

// PUT update specific credentials
router.put('/:id', (req, res) => {
    const { label, username, password, security_token, login_url } = req.body;
    
    try {
        const stmt = db.prepare(`
            UPDATE project_credentials 
            SET label = ?, username = ?, password = ?, security_token = ?, login_url = ?
            WHERE id = ?
        `);
        const info = stmt.run(label || '', username || '', password || '', security_token || '', login_url || '', req.params.id);
        
        if (info.changes === 0) {
            return res.status(404).json({ error: 'Credentials not found' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE specific credentials
router.delete('/:id', (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM project_credentials WHERE id = ?');
        const info = stmt.run(req.params.id);
        
        if (info.changes === 0) {
            return res.status(404).json({ error: 'Credentials not found' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
