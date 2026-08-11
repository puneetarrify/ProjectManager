const express = require('express');
const router = express.Router();
const db = require('../db');
const { exec } = require('child_process');
const { loginAndConnectOrg } = require('../services/soapAuth');

// POST SOAP login to Salesforce CLI
router.post('/soap-login', async (req, res) => {
    try {
        const result = await loginAndConnectOrg(req.body);
        res.json({
            success: true,
            message: `Successfully authenticated ${result.alias} (${result.username}) via SOAP API`,
            ...result
        });
    } catch (err) {
        console.error('SOAP Login error:', err);
        res.status(400).json({ error: err.message || 'SOAP Login failed' });
    }
});

// POST open connection in browser
router.post('/:id/open', (req, res) => {
    const stmt = db.prepare('SELECT alias FROM sfdc_connections WHERE id = ?');
    const row = stmt.get(req.params.id);
    
    if (!row) {
        return res.status(404).json({ error: 'Connection not found' });
    }
    
    const command = `sf org open -o "${row.alias.trim()}"`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error opening SFDC connection:', error || stderr);
            let message = 'Failed to open SFDC connection in browser.';
            if ((stderr && stderr.includes('Bad_OAuth_Token')) || (stdout && stdout.includes('Bad_OAuth_Token'))) {
                message = 'Browser open is restricted for SOAP access-token sessions (Bad_OAuth_Token). CLI development commands remain active.';
            } else if (stderr) {
                message = `Failed to open connection: ${stderr.trim()}`;
            }
            return res.status(400).json({ error: message });
        }
        res.json({ success: true });
    });
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
            let errMsg = 'Connection configuration is not valid or session expired.';
            if (stdout) {
                try {
                    const parsed = JSON.parse(stdout);
                    if (parsed.message) errMsg = `Session invalid: ${parsed.message}`;
                } catch (e) {}
            }
            return res.status(400).json({ success: false, error: errMsg });
        }
        
        try {
            const details = JSON.parse(stdout);
            if (details.status === 0 && details.result) {
                if (details.result.connectedStatus && details.result.connectedStatus !== 'Connected') {
                    return res.status(400).json({ success: false, error: `Session status: ${details.result.connectedStatus}` });
                }
                return res.json({ success: true, message: 'Connection configuration is valid.' });
            } else {
                return res.status(400).json({ success: false, error: details.message || 'Connection configuration is not valid.' });
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
