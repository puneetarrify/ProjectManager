const express = require('express');
const router = express.Router();
const db = require('../db');
const { exec } = require('child_process');

// POST open connection in browser
router.post('/:id/open', (req, res) => {
    const stmt = db.prepare('SELECT alias FROM sfdc_connections WHERE id = ?');
    const row = stmt.get(req.params.id);
    
    if (!row) {
        return res.status(404).json({ error: 'Connection not found' });
    }
    
    const command = `sfdx force:org:open -u "${row.alias.trim()}"`;
    
    exec(command, (error) => {
        if (error) {
            console.error('Error opening SFDC connection:', error);
        }
    });
    
    res.json({ success: true });
});

// POST test connection
router.post('/:id/test', (req, res) => {
    const stmt = db.prepare('SELECT alias FROM sfdc_connections WHERE id = ?');
    const row = stmt.get(req.params.id);
    
    if (!row) {
        return res.status(404).json({ error: 'Connection not found' });
    }
    
    const command = `sf org display -o "${row.alias.trim()}" --json`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error testing SFDC connection:', error);
            return res.status(400).json({ success: false, error: 'Connection configuration is not valid.' });
        }
        
        try {
            const details = JSON.parse(stdout);
            if (details.status === 0) {
                return res.json({ success: true, message: 'Connection configuration is valid.' });
            } else {
                return res.status(400).json({ success: false, error: 'Connection configuration is not valid.' });
            }
        } catch (e) {
            return res.status(400).json({ success: false, error: 'Connection configuration is not valid.' });
        }
    });
});

// PUT update connection
router.put('/:id', (req, res) => {
    const { alias, username, org_type } = req.body;
    if (!alias || !org_type) {
        return res.status(400).json({ error: 'Alias and org_type are required' });
    }
    const stmt = db.prepare('UPDATE sfdc_connections SET alias = ?, username = ?, org_type = ? WHERE id = ?');
    const info = stmt.run(alias, username, org_type, req.params.id);
    if (info.changes === 0) {
        return res.status(404).json({ error: 'Connection not found' });
    }
    res.json({ success: true });
});

// DELETE specific connection
router.delete('/:id', (req, res) => {
    const stmt = db.prepare('DELETE FROM sfdc_connections WHERE id = ?');
    const info = stmt.run(req.params.id);
    
    if (info.changes === 0) {
        return res.status(404).json({ error: 'Connection not found' });
    }
    res.json({ success: true });
});

module.exports = router;
