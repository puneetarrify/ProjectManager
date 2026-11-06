const express = require('express');
const router = express.Router();
const db = require('../db');
const { exec } = require('child_process');
const { loginAndConnectOrg, performSoapLogin, authorizeAccessToken } = require('../services/soapAuth');

function openUrlInBrowser(url) {
    return new Promise((resolve, reject) => {
        let command;
        if (process.platform === 'darwin') {
            command = `open "${url}"`;
        } else if (process.platform === 'win32') {
            command = `start "" "${url}"`;
        } else {
            command = `xdg-open "${url}"`;
        }

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Error opening browser:', error || stderr);
                return reject(error);
            }
            resolve({ stdout, stderr });
        });
    });
}

function findCredentialsForConnection(conn) {
    let cred = null;
    const cleanUsername = (conn.username || '').trim();
    const cleanAlias = (conn.alias || '').trim();

    if (cleanUsername) {
        cred = db.prepare('SELECT * FROM project_credentials WHERE project_id = ? AND LOWER(username) = LOWER(?)').get(conn.project_id, cleanUsername);
    }
    if (!cred && cleanAlias) {
        cred = db.prepare('SELECT * FROM project_credentials WHERE project_id = ? AND LOWER(label) = LOWER(?)').get(conn.project_id, cleanAlias);
    }
    if (!cred && cleanUsername) {
        cred = db.prepare('SELECT * FROM global_credentials WHERE LOWER(username) = LOWER(?)').get(cleanUsername);
    }
    if (!cred && cleanAlias) {
        cred = db.prepare('SELECT * FROM global_credentials WHERE LOWER(label) = LOWER(?)').get(cleanAlias);
    }
    return cred;
}

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
router.post('/:id/open', async (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM sfdc_connections WHERE id = ?');
        const conn = stmt.get(req.params.id);

        if (!conn) {
            return res.status(404).json({ error: 'Connection not found' });
        }

        const alias = (conn.alias || '').trim();
        const username = (conn.username || '').trim();
        const orgType = conn.org_type || 'Production';

        let frontdoorUrl = null;

        // 1. Check if matching stored credentials exist to generate a fresh session via SOAP
        const cred = findCredentialsForConnection(conn);

        if (cred && cred.username && cred.password) {
            try {
                const soapResult = await performSoapLogin({
                    username: cred.username,
                    password: cred.password,
                    securityToken: cred.security_token || '',
                    loginUrl: cred.login_url || '',
                    orgType: orgType
                });

                if (soapResult && soapResult.instanceUrl && soapResult.sessionId) {
                    frontdoorUrl = `${soapResult.instanceUrl.replace(/\/$/, '')}/secur/frontdoor.jsp?sid=${encodeURIComponent(soapResult.sessionId)}`;

                    // Asynchronously refresh CLI auth in background so CLI commands stay valid
                    authorizeAccessToken({
                        sessionId: soapResult.sessionId,
                        instanceUrl: soapResult.instanceUrl,
                        alias: alias,
                        setDefault: false
                    }).catch(cliErr => {
                        console.warn('Background CLI token refresh notice:', cliErr.message);
                    });
                }
            } catch (soapErr) {
                console.warn('SOAP login attempt failed, falling back to CLI session:', soapErr.message);
            }
        }

        // 2. If no credentials or SOAP login failed, attempt standard `sf org open`
        if (!frontdoorUrl) {
            try {
                const openResult = await new Promise((resolve, reject) => {
                    exec(`sf org open -o "${alias}" --url-only --json`, (err, stdout, stderr) => {
                        if (err) return reject({ error: err, stdout, stderr });
                        try {
                            const parsed = JSON.parse(stdout);
                            if (parsed.status === 0 && parsed.result && parsed.result.url) {
                                return resolve(parsed.result.url);
                            }
                        } catch (e) {}
                        resolve(null);
                    });
                });

                if (openResult) {
                    frontdoorUrl = openResult;
                }
            } catch (cliErr) {
                console.log('sf org open --url-only failed, checking CLI access token...');
            }
        }

        // 3. Fallback: extract existing accessToken and instanceUrl from CLI auth store
        if (!frontdoorUrl) {
            try {
                const orgInfo = await new Promise((resolve, reject) => {
                    exec(`sf org display -o "${alias}" --json`, (err, stdout) => {
                        if (err) return reject(err);
                        try {
                            const parsed = JSON.parse(stdout);
                            if (parsed.status === 0 && parsed.result) {
                                return resolve(parsed.result);
                            }
                        } catch (e) {}
                        reject(new Error('Failed to parse sf org display output'));
                    });
                });

                const tokenInfo = await new Promise((resolve, reject) => {
                    exec(`sf org auth show-access-token -o "${alias}" --json`, (err, stdout) => {
                        if (err) return reject(err);
                        try {
                            const parsed = JSON.parse(stdout);
                            if (parsed.status === 0 && parsed.result && parsed.result.accessToken) {
                                return resolve(parsed.result.accessToken);
                            }
                        } catch (e) {}
                        reject(new Error('Failed to parse access token'));
                    });
                });

                if (orgInfo && orgInfo.instanceUrl && tokenInfo) {
                    frontdoorUrl = `${orgInfo.instanceUrl.replace(/\/$/, '')}/secur/frontdoor.jsp?sid=${encodeURIComponent(tokenInfo)}`;
                }
            } catch (tokenErr) {
                console.error('Failed to retrieve token from CLI:', tokenErr.message);
            }
        }

        if (!frontdoorUrl) {
            return res.status(400).json({
                error: `Unable to open org "${alias}". The session may have expired or is invalid. Please re-authenticate the connection.`
            });
        }

        let launched = false;
        try {
            await openUrlInBrowser(frontdoorUrl);
            launched = true;
        } catch (launchErr) {
            console.warn('Could not launch browser automatically via xdg-open/open:', launchErr.message);
            launched = false;
        }

        res.json({ success: true, url: frontdoorUrl, launched });
    } catch (err) {
        console.error('Error in open connection:', err);
        res.status(500).json({ error: err.message || 'Failed to open SFDC connection' });
    }
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
