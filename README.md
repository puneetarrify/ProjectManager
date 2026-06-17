# Project Manager Application

A local-first web application for managing Salesforce projects, specifically mapping their associated Salesforce CLI connections, local workspace directories, and tasks. Built with a Node.js and Express backend, an SQLite database, and a custom, minimalist dark-themed interface using vanilla HTML, CSS, and JavaScript.

## Features

- **Project Management**: Create, update, and manage project profiles.
- **Salesforce Connection Mapping**: Link specific SFDC CLI connections/org aliases to their respective projects. Includes a quick "Open" button to launch connections in the browser.
- **Local Path Mapping**: Associate and save local file system paths for each project's workspace. Includes an "Open" button to launch directories directly in IntelliJ IDEA.
- **Task Tracking**: Create, map, and track tasks related to each project. Automatically generates task folders and `Task_context.md` boilerplate files for seamless AI (Antigravity) integration.
- **Sequential Dashboard Layout**: Projects, connections, paths, and active tasks are displayed in a clean, vertical flow.

## Tech Stack

- **Frontend**: Vanilla HTML, CSS (Custom Dark Theme), JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite (`better-sqlite3`)

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- IntelliJ IDEA (for the "Open in IntelliJ" feature)
- Salesforce CLI (if working with SFDC connections)

## Getting Started

### 1. Install Dependencies

Navigate to the project directory and install the required packages:

```bash
cd /home/kritik/CLI/ProjectManager
npm install
```

### 2. Database Setup

The SQLite database (`database.sqlite`) will be automatically created in the `data` directory the first time the server starts.

### 3. Running the Application

Start the backend server and frontend (served by Express):

```bash
node server/index.js
```

### 4. Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

## Directory Structure

- `public/`: Frontend assets (HTML, CSS, JS)
- `server/`: Backend code
  - `index.js`: Main Express server entry point
  - `db.js`: SQLite database initialization and models
  - `routes/`: API route handlers for projects, connections, paths, and tasks
- `data/`: Contains the SQLite database file
