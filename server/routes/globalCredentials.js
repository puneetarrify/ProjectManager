const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all global credentials
router.get('/', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM global_credentials ORDER BY created_at DESC');
        res.json(stmt.all());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST add new global credentials
router.post('/', (req, res) => {
    const label = (req.body.label || '').trim();
    const username = (req.body.username || '').trim();
    const password = (req.body.password || '').trim();
    const security_token = (req.body.security_token || '').trim();
    const login_url = (req.body.login_url || '').trim();

    try {
        const stmt = db.prepare('INSERT INTO global_credentials (label, username, password, security_token, login_url) VALUES (?, ?, ?, ?, ?)');
        const info = stmt.run(label, username, password, security_token, login_url);
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update global credentials
router.put('/:id', (req, res) => {
    const label = (req.body.label || '').trim();
    const username = (req.body.username || '').trim();
    const password = (req.body.password || '').trim();
    const security_token = (req.body.security_token || '').trim();
    const login_url = (req.body.login_url || '').trim();

    try {
        const stmt = db.prepare('UPDATE global_credentials SET label = ?, username = ?, password = ?, security_token = ?, login_url = ? WHERE id = ?');
        const info = stmt.run(label, username, password, security_token, login_url, req.params.id);
        if (info.changes === 0) {
            return res.status(404).json({ error: 'Credentials not found' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE global credentials
router.delete('/:id', (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM global_credentials WHERE id = ?');
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
