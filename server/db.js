const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/projects.db');
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize Schema
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT DEFAULT '',
        status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'On Hold', 'Completed', 'Archived')),
        sfdc_username TEXT DEFAULT '',
        sfdc_password TEXT DEFAULT '',
        sfdc_security_token TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime')),
        last_visited_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);
  
  try {
      db.exec("ALTER TABLE projects ADD COLUMN last_visited_at TEXT;");
      db.exec("UPDATE projects SET last_visited_at = updated_at WHERE last_visited_at IS NULL;");
  } catch (err) {
      // Ignore column already exists error
  }

  try {
      db.exec("ALTER TABLE projects ADD COLUMN sfdc_username TEXT DEFAULT '';");
  } catch (err) {}

  try {
      db.exec("ALTER TABLE projects ADD COLUMN sfdc_password TEXT DEFAULT '';");
  } catch (err) {}

  try {
      db.exec("ALTER TABLE projects ADD COLUMN sfdc_security_token TEXT DEFAULT '';");
  } catch (err) {}

  try {
      db.exec("ALTER TABLE global_credentials ADD COLUMN login_url TEXT DEFAULT '';");
  } catch (err) {}

  try {
      db.exec("ALTER TABLE project_credentials ADD COLUMN login_url TEXT DEFAULT '';");
  } catch (err) {}
  
  db.exec(`

    CREATE TABLE IF NOT EXISTS sfdc_connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        alias TEXT NOT NULL,
        username TEXT DEFAULT '',
        org_type TEXT DEFAULT 'Sandbox' CHECK(org_type IN ('Production', 'Sandbox', 'DevHub', 'Scratch')),
        org_id TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS local_paths (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        path TEXT NOT NULL,
        label TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        status TEXT DEFAULT 'To Do' CHECK(status IN ('To Do', 'In Progress', 'Done', 'Blocked')),
        priority TEXT DEFAULT 'Medium' CHECK(priority IN ('Low', 'Medium', 'High', 'Critical')),
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_credentials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        label TEXT DEFAULT '',
        username TEXT DEFAULT '',
        password TEXT DEFAULT '',
        security_token TEXT DEFAULT '',
        login_url TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS global_credentials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        label TEXT NOT NULL,
        username TEXT DEFAULT '',
        password TEXT DEFAULT '',
        security_token TEXT DEFAULT '',
        login_url TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    UPDATE project_credentials SET 
        username = TRIM(username), 
        password = TRIM(password), 
        security_token = TRIM(security_token), 
        login_url = TRIM(login_url), 
        label = TRIM(label);

    UPDATE global_credentials SET 
        username = TRIM(username), 
        password = TRIM(password), 
        security_token = TRIM(security_token), 
        login_url = TRIM(login_url), 
        label = TRIM(label);
  `);
  console.log('Database initialized successfully.');
}

initDb();

module.exports = db;
