const https = require('https');
const { URL } = require('url');
const { exec } = require('child_process');
const db = require('../db');

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function getSoapEndpoint(loginUrl, orgType) {
    if (loginUrl && loginUrl.trim()) {
        let trimmed = loginUrl.trim();
        if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
            trimmed = 'https://' + trimmed;
        }
        try {
            const urlObj = new URL(trimmed);
            return `${urlObj.origin}/services/Soap/u/58.0`;
        } catch (e) {
            // Fallback
        }
    }
    if (orgType === 'Sandbox') {
        return 'https://test.salesforce.com/services/Soap/u/58.0';
    }
    return 'https://login.salesforce.com/services/Soap/u/58.0';
}

function performSoapLogin({ username, password, securityToken = '', loginUrl = '', orgType = 'Production' }) {
    const cleanUsername = (username || '').trim();
    const cleanPassword = (password || '').trim();
    const cleanSecurityToken = (securityToken || '').trim();
    const cleanLoginUrl = (loginUrl || '').trim();
    const cleanOrgType = (orgType || 'Production').trim();

    return new Promise((resolve, reject) => {
        if (!cleanUsername || !cleanPassword) {
            return reject(new Error('Username and password are required for SOAP login'));
        }

        const endpoint = getSoapEndpoint(cleanLoginUrl, cleanOrgType);
        const urlObj = new URL(endpoint);
        const combinedPassword = cleanPassword + cleanSecurityToken;

        const soapXml = `<?xml version="1.0" encoding="utf-8" ?>
<env:Envelope xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">
  <env:Body>
    <n1:login xmlns:n1="urn:partner.soap.sforce.com">
      <n1:username>${escapeXml(cleanUsername)}</n1:username>
      <n1:password>${escapeXml(combinedPassword)}</n1:password>
    </n1:login>
  </env:Body>
</env:Envelope>`;

        const req = https.request({
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml; charset=UTF-8',
                'SOAPAction': 'login',
                'Content-Length': Buffer.byteLength(soapXml)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const faultMatch = data.match(/<faultstring>(.*?)<\/faultstring>/s);
                if (faultMatch) {
                    return reject(new Error(`Salesforce SOAP Login Failed: ${faultMatch[1].trim()}`));
                }

                const sessionMatch = data.match(/<sessionId>(.*?)<\/sessionId>/);
                const serverUrlMatch = data.match(/<serverUrl>(.*?)<\/serverUrl>/);

                if (!sessionMatch || !serverUrlMatch) {
                    return reject(new Error('Failed to parse sessionId or serverUrl from Salesforce response'));
                }

                const sessionId = sessionMatch[1];
                let instanceUrl;
                try {
                    instanceUrl = new URL(serverUrlMatch[1]).origin;
                } catch (err) {
                    return reject(new Error(`Invalid serverUrl returned: ${serverUrlMatch[1]}`));
                }

                resolve({ sessionId, instanceUrl, serverUrl: serverUrlMatch[1] });
            });
        });

        req.on('error', (err) => {
            reject(new Error(`SOAP HTTP Request Error: ${err.message}`));
        });

        req.write(soapXml);
        req.end();
    });
}

function authorizeAccessToken({ sessionId, instanceUrl, alias, setDefault = true }) {
    return new Promise((resolve, reject) => {
        const cleanAlias = alias.trim();
        const cmd = `sf org login access-token --instance-url "${instanceUrl}" --alias "${cleanAlias}" --no-prompt${setDefault ? ' --set-default' : ''}`;

        exec(cmd, { env: { ...process.env, SF_ACCESS_TOKEN: sessionId } }, (error, stdout, stderr) => {
            if (error) {
                console.error('sf org login access-token error:', stderr || error.message);
                return reject(new Error(`Salesforce CLI Auth Error: ${stderr || error.message}`));
            }

            const displayCmd = `sf org display -o "${cleanAlias}" --json`;
            exec(displayCmd, (dispErr, dispStdout) => {
                let finalUsername = '';
                let orgId = '';

                if (!dispErr && dispStdout) {
                    try {
                        const parsed = JSON.parse(dispStdout);
                        if (parsed.result) {
                            finalUsername = parsed.result.username || '';
                            orgId = parsed.result.id || parsed.result.orgId || '';
                        }
                    } catch (e) {
                        console.error('Failed to parse sf org display json:', e);
                    }
                }

                resolve({ alias: cleanAlias, username: finalUsername, orgId, instanceUrl });
            });
        });
    });
}

function saveOrUpdateConnection({ projectId, alias, username, orgType, orgId }) {
    const existing = db.prepare('SELECT id FROM sfdc_connections WHERE project_id = ? AND LOWER(alias) = LOWER(?)').get(projectId, alias.trim());

    if (existing) {
        db.prepare('UPDATE sfdc_connections SET username = ?, org_type = ?, org_id = ? WHERE id = ?')
            .run(username || '', orgType || 'Production', orgId || '', existing.id);
        return existing.id;
    } else {
        const info = db.prepare('INSERT INTO sfdc_connections (project_id, alias, username, org_type, org_id) VALUES (?, ?, ?, ?, ?)')
            .run(projectId, alias.trim(), username || '', orgType || 'Production', orgId || '');
        return info.lastInsertRowid;
    }
}

async function loginAndConnectOrg(params) {
    const { projectId, credentialId, set_default = true } = params;
    let alias = (params.alias || '').trim();
    let { username, password, security_token, login_url, org_type } = params;

    if (credentialId) {
        let cred = db.prepare('SELECT * FROM project_credentials WHERE id = ?').get(credentialId);
        if (!cred) {
            cred = db.prepare('SELECT * FROM global_credentials WHERE id = ?').get(credentialId);
        }
        if (cred) {
            username = username || cred.username;
            password = password || cred.password;
            security_token = security_token || cred.security_token;
            login_url = login_url || cred.login_url;
        }
    }

    username = (username || '').trim();
    password = (password || '').trim();
    security_token = (security_token || '').trim();
    login_url = (login_url || '').trim();
    org_type = (org_type || '').trim();

    if (!org_type) {
        if (login_url && login_url.includes('test.salesforce.com')) {
            org_type = 'Sandbox';
        } else {
            org_type = 'Production';
        }
    }

    const soapResult = await performSoapLogin({
        username,
        password,
        securityToken: security_token,
        loginUrl: login_url,
        orgType: org_type
    });

    const cliResult = await authorizeAccessToken({
        sessionId: soapResult.sessionId,
        instanceUrl: soapResult.instanceUrl,
        alias: alias || 'TIB_PROD',
        setDefault: set_default
    });

    const connectionId = saveOrUpdateConnection({
        projectId: projectId || 3,
        alias: cliResult.alias,
        username: cliResult.username || username,
        orgType: org_type,
        orgId: cliResult.orgId
    });

    return {
        connectionId,
        alias: cliResult.alias,
        username: cliResult.username || username,
        instanceUrl: cliResult.instanceUrl,
        orgId: cliResult.orgId,
        orgType: org_type
    };
}

module.exports = {
    performSoapLogin,
    authorizeAccessToken,
    saveOrUpdateConnection,
    loginAndConnectOrg
};
