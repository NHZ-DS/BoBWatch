# BobWatch Implementation Guide

**Version:** 1.0  
**Date:** 2026-05-02  
**Mode:** Plan  
**Prerequisites:** Node.js v16+, VS Code v1.80+

---

## Quick Start

```bash
# 1. Clone and setup
cd BobWatch
npm init -y

# 2. Create directory structure
mkdir -p parser dashboard extension watsonx-orchestrate .bobwatch bob_sessions

# 3. Implement components in order (see phases below)

# 4. Test the extension
code --extensionDevelopmentHost=. .
```

---

## Phase 1: Parser Implementation (Day 1)

### Step 1.1: Create Parser File Structure

```bash
# Create parser directory and file
mkdir -p parser
touch parser/session-reader.js
```

### Step 1.2: Implement Core Parser Functions

**File:** [`parser/session-reader.js`](parser/session-reader.js)

```javascript
// Step 1: Import dependencies
const fs = require('fs').promises;
const path = require('path');

// Step 2: Define session metadata extraction
function extractSessionMetadata(markdownContent) {
  const metadata = {};
  
  // Extract Task ID
  const taskIdMatch = markdownContent.match(/\*\*Task ID:\*\*\s*(.+)/);
  if (taskIdMatch) metadata.task_id = taskIdMatch[1].trim();
  
  // Extract Timestamp
  const timestampMatch = markdownContent.match(/\*\*Timestamp:\*\*\s*(.+)/);
  if (timestampMatch) metadata.timestamp = timestampMatch[1].trim();
  
  // Extract Context Length
  const contextMatch = markdownContent.match(/\*\*Context Length:\*\*\s*([\d,]+)\s*tokens/);
  if (contextMatch) metadata.context_length = parseInt(contextMatch[1].replace(/,/g, ''));
  
  // Extract API Cost
  const costMatch = markdownContent.match(/\*\*API Cost:\*\*\s*\$?([\d.]+)/);
  if (costMatch) metadata.api_cost = parseFloat(costMatch[1]);
  
  // Extract Cache Hits
  const cacheMatch = markdownContent.match(/\*\*Cache Hits:\*\*\s*([\d,]+)\s*tokens/);
  if (cacheMatch) metadata.cache_hits = parseInt(cacheMatch[1].replace(/,/g, ''));
  
  // Extract Mode
  const modeMatch = markdownContent.match(/\*\*Mode:\*\*\s*(.+)/);
  if (modeMatch) metadata.mode = modeMatch[1].trim();
  
  return metadata;
}

// Step 3: Extract bobwatch-event JSON blocks
function extractBobWatchEvents(markdownContent) {
  const events = [];
  const eventRegex = /```bobwatch-event\s*\n([\s\S]*?)\n```/g;
  
  let match;
  while ((match = eventRegex.exec(markdownContent)) !== null) {
    try {
      const eventData = JSON.parse(match[1]);
      events.push(eventData);
    } catch (error) {
      console.warn('Failed to parse bobwatch-event block:', error.message);
    }
  }
  
  return events;
}

// Step 4: Extract tool usage patterns
function extractToolUsage(markdownContent) {
  const tools = {};
  const toolRegex = /<(\w+)>/g;
  
  let match;
  while ((match = toolRegex.exec(markdownContent)) !== null) {
    const toolName = match[1];
    tools[toolName] = (tools[toolName] || 0) + 1;
  }
  
  return tools;
}

// Step 5: Parse individual session file
async function parseSessionFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const filename = path.basename(filePath, '.md');
  
  const metadata = extractSessionMetadata(content);
  const events = extractBobWatchEvents(content);
  const tools = extractToolUsage(content);
  
  // Extract files modified from events
  const filesModified = new Set();
  events.forEach(event => {
    if (event.files_modified) {
      event.files_modified.forEach(file => filesModified.add(file));
    }
  });
  
  return {
    session_id: filename,
    task_id: metadata.task_id || 'unknown',
    timestamp: metadata.timestamp || new Date().toISOString(),
    metadata: {
      context_length: metadata.context_length || 0,
      tokens_used: metadata.context_length || 0,
      api_cost: metadata.api_cost || 0,
      cache_hits: metadata.cache_hits || 0,
      mode: metadata.mode || 'unknown'
    },
    events: events,
    tools_used: tools,
    files_modified: Array.from(filesModified),
    flags: events.filter(e => e.flag && e.flag !== 'none').map(e => e.flag)
  };
}

// Step 6: Parse entire directory
async function parseSessionDirectory(dirPath) {
  const files = await fs.readdir(dirPath);
  const markdownFiles = files.filter(f => f.endsWith('.md'));
  
  const sessions = [];
  for (const file of markdownFiles) {
    const filePath = path.join(dirPath, file);
    try {
      const session = await parseSessionFile(filePath);
      sessions.push(session);
    } catch (error) {
      console.error(`Failed to parse ${file}:`, error.message);
    }
  }
  
  return sessions;
}

// Step 7: Generate summary statistics
function generateSummary(sessions) {
  const summary = {
    total_sessions: sessions.length,
    total_tokens: 0,
    total_cost: 0,
    mode_breakdown: {}
  };
  
  sessions.forEach(session => {
    summary.total_tokens += session.metadata.tokens_used;
    summary.total_cost += session.metadata.api_cost;
    
    const mode = session.metadata.mode;
    summary.mode_breakdown[mode] = (summary.mode_breakdown[mode] || 0) + 1;
  });
  
  return summary;
}

// Step 8: Generate session log JSON
async function generateSessionLog(sessionsArray, outputPath) {
  const summary = generateSummary(sessionsArray);
  
  const log = {
    sessions: sessionsArray,
    summary: summary,
    generated_at: new Date().toISOString()
  };
  
  await fs.writeFile(outputPath, JSON.stringify(log, null, 2), 'utf8');
  return log;
}

// Step 9: Main execution function
async function main() {
  const sessionsDir = path.join(__dirname, '../bob_sessions');
  const outputPath = path.join(__dirname, '../.bobwatch/session-log.json');
  
  // Ensure output directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  
  // Parse all sessions
  const sessions = await parseSessionDirectory(sessionsDir);
  
  // Generate log file
  await generateSessionLog(sessions, outputPath);
  
  console.log(`Parsed ${sessions.length} sessions → ${outputPath}`);
}

// Export functions for use by extension
module.exports = {
  parseSessionFile,
  parseSessionDirectory,
  generateSessionLog,
  main
};

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
```

### Step 1.3: Test the Parser

```bash
# Create a test session file
cat > bob_sessions/test_session.md << 'EOF'
# Task Session Export

**Task ID:** test-task
**Timestamp:** 2026-05-02T20:00:00.000Z
**Context Length:** 1,234 tokens
**API Cost:** $0.01
**Cache Hits:** 800 tokens
**Mode:** code

## Messages

### User
Test message

### Assistant
Test response

<read_file>
<args>...</args>
</read_file>

```bobwatch-event
{
  "task_id": "test-task",
  "mode": "code",
  "tokens_estimated": 1000
}
```
EOF

# Run parser
node parser/session-reader.js

# Verify output
cat .bobwatch/session-log.json
```

**Expected Output:**
```json
{
  "sessions": [
    {
      "session_id": "test_session",
      "task_id": "test-task",
      "timestamp": "2026-05-02T20:00:00.000Z",
      "metadata": {
        "context_length": 1234,
        "tokens_used": 1234,
        "api_cost": 0.01,
        "cache_hits": 800,
        "mode": "code"
      },
      "events": [
        {
          "task_id": "test-task",
          "mode": "code",
          "tokens_estimated": 1000
        }
      ],
      "tools_used": {
        "read_file": 1
      },
      "files_modified": [],
      "flags": []
    }
  ],
  "summary": {
    "total_sessions": 1,
    "total_tokens": 1234,
    "total_cost": 0.01,
    "mode_breakdown": {
      "code": 1
    }
  },
  "generated_at": "2026-05-02T20:00:00.000Z"
}
```

---

## Phase 2: Dashboard Implementation (Day 2-3)

### Step 2.1: Create Dashboard HTML Structure

**File:** [`dashboard/index.html`](dashboard/index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
  <title>BobWatch Dashboard</title>
  <style>
    /* Step 1: Base styles with VS Code theme variables */
    :root {
      --bg-primary: var(--vscode-editor-background);
      --bg-secondary: var(--vscode-sideBar-background);
      --text-primary: var(--vscode-editor-foreground);
      --text-secondary: var(--vscode-descriptionForeground);
      --border-color: var(--vscode-panel-border);
      --accent-color: var(--vscode-focusBorder);
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      background: var(--bg-primary);
      color: var(--text-primary);
      padding: 16px;
    }
    
    /* Step 2: Header styles */
    header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color);
    }
    
    h1 {
      font-size: 24px;
      margin-bottom: 8px;
    }
    
    #summary-stats {
      display: flex;
      gap: 24px;
      margin-top: 12px;
    }
    
    .stat {
      display: flex;
      flex-direction: column;
    }
    
    .stat-label {
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }
    
    .stat-value {
      font-size: 20px;
      font-weight: bold;
    }
    
    /* Step 3: Panel grid layout */
    #panels {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 16px;
    }
    
    .panel {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 16px;
    }
    
    .panel-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    /* Step 4: Live feed styles */
    #live-feed {
      grid-column: 1 / -1;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .feed-item {
      padding: 8px;
      margin-bottom: 8px;
      border-left: 3px solid var(--accent-color);
      background: var(--bg-primary);
    }
    
    .feed-time {
      font-size: 11px;
      color: var(--text-secondary);
    }
    
    .feed-content {
      margin-top: 4px;
    }
    
    /* Step 5: Chart canvas */
    canvas {
      max-width: 100%;
      height: 200px;
    }
    
    /* Step 6: Audit log table */
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }
    
    th {
      font-weight: bold;
      color: var(--text-secondary);
      font-size: 12px;
    }
    
    /* Step 7: Flag badges */
    .flag-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: bold;
      background: #ff6b6b;
      color: white;
    }
  </style>
</head>
<body>
  <!-- Step 1: Header with summary stats -->
  <header>
    <h1>🔍 BobWatch</h1>
    <div id="summary-stats">
      <div class="stat">
        <span class="stat-label">Total Sessions</span>
        <span class="stat-value" id="total-sessions">0</span>
      </div>
      <div class="stat">
        <span class="stat-label">Total Tokens</span>
        <span class="stat-value" id="total-tokens">0</span>
      </div>
      <div class="stat">
        <span class="stat-label">Total Cost</span>
        <span class="stat-value" id="total-cost">$0.00</span>
      </div>
    </div>
  </header>
  
  <!-- Step 2: Dashboard panels -->
  <div id="panels">
    <!-- Panel 1: Live Feed -->
    <div class="panel" id="live-feed">
      <div class="panel-title">📡 Live Feed</div>
      <div id="feed-container"></div>
    </div>
    
    <!-- Panel 2: Token Cost Chart -->
    <div class="panel">
      <div class="panel-title">📊 Token Cost by Session</div>
      <canvas id="token-chart"></canvas>
    </div>
    
    <!-- Panel 3: Mode Breakdown -->
    <div class="panel">
      <div class="panel-title">🎯 Mode Breakdown</div>
      <canvas id="mode-chart"></canvas>
    </div>
    
    <!-- Panel 4: Audit Log -->
    <div class="panel" style="grid-column: 1 / -1;">
      <div class="panel-title">📋 Audit Log</div>
      <table id="audit-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Task ID</th>
            <th>Mode</th>
            <th>Files Modified</th>
            <th>Tokens</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody id="audit-body"></tbody>
      </table>
    </div>
    
    <!-- Panel 5: Flags Raised -->
    <div class="panel">
      <div class="panel-title">⚠️ Flags Raised</div>
      <div id="flags-container"></div>
    </div>
  </div>
  
  <script>
    // Step 1: Acquire VS Code API
    const vscode = acquireVsCodeApi();
    
    // Step 2: State management
    let sessionData = null;
    
    // Step 3: Initialize dashboard
    function initDashboard() {
      // Request initial data from extension
      vscode.postMessage({ command: 'getData' });
      
      // Listen for messages from extension
      window.addEventListener('message', event => {
        const message = event.data;
        if (message.command === 'updateData') {
          sessionData = message.data;
          renderDashboard();
        }
      });
    }
    
    // Step 4: Render all dashboard components
    function renderDashboard() {
      if (!sessionData) return;
      
      renderSummaryStats();
      renderLiveFeed();
      renderTokenChart();
      renderModeChart();
      renderAuditLog();
      renderFlags();
    }
    
    // Step 5: Render summary statistics
    function renderSummaryStats() {
      document.getElementById('total-sessions').textContent = sessionData.summary.total_sessions;
      document.getElementById('total-tokens').textContent = sessionData.summary.total_tokens.toLocaleString();
      document.getElementById('total-cost').textContent = '$' + sessionData.summary.total_cost.toFixed(2);
    }
    
    // Step 6: Render live feed
    function renderLiveFeed() {
      const container = document.getElementById('feed-container');
      container.innerHTML = '';
      
      // Get last 10 events across all sessions
      const allEvents = [];
      sessionData.sessions.forEach(session => {
        session.events.forEach(event => {
          allEvents.push({
            ...event,
            session_id: session.session_id,
            timestamp: session.timestamp
          });
        });
      });
      
      allEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      allEvents.slice(0, 10).forEach(event => {
        const item = document.createElement('div');
        item.className = 'feed-item';
        item.innerHTML = `
          <div class="feed-time">${new Date(event.timestamp).toLocaleString()}</div>
          <div class="feed-content">${event.task_summary || event.task_id}</div>
        `;
        container.appendChild(item);
      });
    }
    
    // Step 7: Render token cost bar chart
    function renderTokenChart() {
      const canvas = document.getElementById('token-chart');
      const ctx = canvas.getContext('2d');
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Get session data
      const sessions = sessionData.sessions.slice(-10); // Last 10 sessions
      const maxTokens = Math.max(...sessions.map(s => s.metadata.tokens_used));
      
      // Draw bars
      const barWidth = canvas.width / sessions.length;
      sessions.forEach((session, i) => {
        const barHeight = (session.metadata.tokens_used / maxTokens) * canvas.height * 0.8;
        const x = i * barWidth;
        const y = canvas.height - barHeight;
        
        ctx.fillStyle = '#007acc';
        ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
        
        // Draw label
        ctx.fillStyle = '#cccccc';
        ctx.font = '10px sans-serif';
        ctx.fillText(session.session_id.slice(-3), x + 5, canvas.height - 5);
      });
    }
    
    // Step 8: Render mode breakdown pie chart
    function renderModeChart() {
      const canvas = document.getElementById('mode-chart');
      const ctx = canvas.getContext('2d');
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const modes = sessionData.summary.mode_breakdown;
      const total = Object.values(modes).reduce((a, b) => a + b, 0);
      
      const colors = {
        code: '#007acc',
        plan: '#68217a',
        advanced: '#ff6b6b',
        orchestrator: '#ffa500',
        ask: '#4caf50'
      };
      
      let startAngle = 0;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 20;
      
      Object.entries(modes).forEach(([mode, count]) => {
        const sliceAngle = (count / total) * 2 * Math.PI;
        
        ctx.fillStyle = colors[mode] || '#cccccc';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        
        // Draw label
        const labelAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(mode, labelX, labelY);
        
        startAngle += sliceAngle;
      });
    }
    
    // Step 9: Render audit log table
    function renderAuditLog() {
      const tbody = document.getElementById('audit-body');
      tbody.innerHTML = '';
      
      sessionData.sessions.forEach(session => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${new Date(session.timestamp).toLocaleString()}</td>
          <td>${session.task_id}</td>
          <td>${session.metadata.mode}</td>
          <td>${session.files_modified.join(', ') || 'None'}</td>
          <td>${session.metadata.tokens_used.toLocaleString()}</td>
          <td>$${session.metadata.api_cost.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
      });
    }
    
    // Step 10: Render flags
    function renderFlags() {
      const container = document.getElementById('flags-container');
      container.innerHTML = '';
      
      const allFlags = [];
      sessionData.sessions.forEach(session => {
        session.flags.forEach(flag => {
          allFlags.push({
            flag: flag,
            session_id: session.session_id,
            timestamp: session.timestamp
          });
        });
      });
      
      if (allFlags.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No flags raised</p>';
        return;
      }
      
      allFlags.forEach(item => {
        const badge = document.createElement('div');
        badge.className = 'flag-badge';
        badge.textContent = `${item.flag} (${item.session_id})`;
        container.appendChild(badge);
      });
    }
    
    // Initialize on load
    initDashboard();
  </script>
</body>
</html>
```

### Step 2.2: Test Dashboard Locally

```bash
# Create a simple test HTML file
cat > test-dashboard.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title>Dashboard Test</title>
</head>
<body>
  <iframe src="dashboard/index.html" width="100%" height="800px"></iframe>
  <script>
    // Mock VS Code API
    window.acquireVsCodeApi = () => ({
      postMessage: (msg) => console.log('Message:', msg),
      setState: (state) => console.log('State:', state),
      getState: () => ({})
    });
  </script>
</body>
</html>
EOF

# Open in browser
open test-dashboard.html  # macOS
# or
start test-dashboard.html  # Windows
```

---

## Phase 3: VS Code Extension Implementation (Day 4)

### Step 3.1: Create Extension Structure

```bash
# Create extension directory
mkdir -p extension

# Initialize package.json
npm init -y
```

### Step 3.2: Configure package.json

**File:** [`package.json`](package.json)

```json
{
  "name": "bobwatch",
  "displayName": "BobWatch",
  "description": "Real-time governance dashboard for IBM Bob",
  "version": "0.1.0",
  "publisher": "your-publisher-name",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": ["Other"],
  "activationEvents": [
    "onView:bobwatch.dashboard"
  ],
  "main": "./extension/extension.js",
  "contributes": {
    "views": {
      "explorer": [
        {
          "type": "webview",
          "id": "bobwatch.dashboard",
          "name": "BobWatch"
        }
      ]
    },
    "commands": [
      {
        "command": "bobwatch.refresh",
        "title": "BobWatch: Refresh Dashboard",
        "icon": "$(refresh)"
      }
    ]
  },
  "scripts": {
    "parse": "node parser/session-reader.js"
  }
}
```

### Step 3.3: Implement Extension Entry Point

**File:** [`extension/extension.js`](extension/extension.js)

```javascript
const vscode = require('vscode');
const fs = require('fs').promises;
const path = require('path');
const { parseSessionDirectory, generateSessionLog } = require('../parser/session-reader');

// Step 1: Extension activation
function activate(context) {
  console.log('BobWatch extension activated');
  
  // Register webview provider
  const provider = new BobWatchViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('bobwatch.dashboard', provider)
  );
  
  // Register refresh command
  context.subscriptions.push(
    vscode.commands.registerCommand('bobwatch.refresh', async () => {
      await parseAndUpdate(context);
      provider.refresh();
    })
  );
  
  // Setup file watcher
  setupFileWatcher(context, provider);
  
  // Initial parse
  parseAndUpdate(context);
}

// Step 2: Webview provider class
class BobWatchViewProvider {
  constructor(extensionUri) {
    this._extensionUri = extensionUri;
    this._view = null;
  }
  
  resolveWebviewView(webviewView) {
    this._view = webviewView;
    
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };
    
    // Load dashboard HTML
    webviewView.webview.html = this._getHtmlContent(webviewView.webview);
    
    // Handle messages from webview
    webviewView.webview.onDidReceiveMessage(async message => {
      if (message.command === 'getData') {
        await this.sendData();
      }
    });
  }
  
  async sendData() {
    if (!this._view) return;
    
    try {
      const workspaceFolder = vscode.workspace.workspaceFolders[0];
      const logPath = path.join(workspaceFolder.uri.fsPath, '.bobwatch', 'session-log.json');
      const data = await fs.readFile(logPath, 'utf8');
      
      this._view.webview.postMessage({
        command: 'updateData',
        data: JSON.parse(data)
      });
    } catch (error) {
      console.error('Failed to load session data:', error);
    }
  }
  
  refresh() {
    this.sendData();
  }
  
  _getHtmlContent(webview) {
    const dashboardPath = path.join(__dirname, '../dashboard/index.html');
    let html = require('fs').readFileSync(dashboardPath, 'utf8');
    
    // Replace any resource URIs if needed
    return html;
  }
}

// Step 3: File watcher setup
function setupFileWatcher(context, provider) {
  const workspaceFolder = vscode.workspace.workspaceFolders[0];
  const pattern = new vscode.RelativePattern(workspaceFolder, 'bob_sessions/*.md');
  
  const watcher = vscode.workspace.createFileSystemWatcher(pattern);
  
  watcher.onDidCreate(async uri => {
    console.log('New session file detected:', uri.fsPath);
    await parseAndUpdate(context);
    provider.refresh();
  });
  
  watcher.onDidChange(async uri => {
    console.log('Session file changed:', uri.fsPath);
    await parseAndUpdate(context);
    provider.refresh();
  });
  
  context.subscriptions.push(watcher);
}

// Step 4: Parse and update pipeline
async function parseAndUpdate(context) {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders[0];
    const sessionsDir = path.join(workspaceFolder.uri.fsPath, 'bob_sessions');
    const outputPath = path.join(workspaceFolder.uri.fsPath, '.bobwatch', 'session-log.json');
    
    // Parse sessions
    const sessions = await parseSessionDirectory(sessionsDir);
    
    // Generate log
    await generateSessionLog(sessions, outputPath);
    
    console.log(`Parsed ${sessions.length} sessions`);
  } catch (error) {
    console.error('Parse and update failed:', error);
    vscode.window.showErrorMessage(`BobWatch: ${error.message}`);
  }
}

// Step 5: Extension deactivation
function deactivate() {
  console.log('BobWatch extension deactivated');
}

module.exports = {
  activate,
  deactivate
};
```

### Step 3.4: Test Extension in VS Code

```bash
# Open VS Code in extension development mode
code --extensionDevelopmentHost=. .

# In the new VS Code window:
# 1. Open the Explorer sidebar
# 2. Look for "BobWatch" panel
# 3. Add a test session file to bob_sessions/
# 4. Watch the dashboard update automatically
```

---

## Phase 4: watsonx Orchestrate Integration (Day 5)

### Step 4.1: Create API Server

**File:** [`watsonx-orchestrate/api-server.js`](watsonx-orchestrate/api-server.js)

```javascript
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');

// Configuration
const PORT = 3000;
const LOG_PATH = path.join(__dirname, '../.bobwatch/session-log.json');

// Load session log
async function loadSessionLog() {
  try {
    const data = await fs.readFile(LOG_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load session log:', error);
    return { sessions: [], summary: {} };
  }
}

// Request handler
async function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  try {
    const log = await loadSessionLog();
    
    // Route: GET /api/sessions
    if (pathname === '/api/sessions') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(log.sessions));
      return;
    }
    
    // Route: GET /api/sessions/:session_id
    if (pathname.startsWith('/api/sessions/')) {
      const sessionId = pathname.split('/')[3];
      const session = log.sessions.find(s => s.session_id === sessionId);
      
      if (session) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(session));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Session not found' }));
      }
      return;
    }
    
    // Route: GET /api/summary
    if (pathname === '/api/summary') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(log.summary));
      return;
    }
    
    // Route: GET /api/query
    if (pathname === '/api/query') {
      let filtered = log.sessions;
      
      // Filter by mode
      if (query.mode) {
        filtered = filtered.filter(s => s.metadata.mode === query.mode);
      }
      
      // Filter by max cost
      if (query.cost_max) {
        const maxCost = parseFloat(query.cost_max);
        filtered = filtered.filter(s => s.metadata.api_cost <= maxCost);
      }
      
      // Filter by date
      if (query.date_from) {
        const fromDate = new Date(query.date_from);
        filtered = filtered.filter(s => new Date(s.timestamp) >= fromDate);
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(filtered));
      return;
    }
    
    // Route: GET /openapi.yaml
    if (pathname === '/openapi.yaml') {
      const spec = await fs.readFile(path.join(__dirname, 'openapi.yaml'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/yaml' });
      res.end(spec);
      return;
    }
    
    // 404 for unknown routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    
  } catch (error) {
    console.error('Request error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

// Start server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`BobWatch API running on http://localhost:${PORT}`);
  console.log(`OpenAPI spec: http://localhost:${PORT}/openapi.yaml`);
});
```

### Step 4.2: Create OpenAPI Specification

**File:** [`watsonx-orchestrate/openapi.yaml`](watsonx-orchestrate/openapi.yaml)

```yaml
openapi: 3.0.0
info:
  title: BobWatch API
  version: 1.0.0
  description: Query IBM Bob's governance data for watsonx Orchestrate integration

servers:
  - url: http://localhost:3000
    description: Local development server

paths:
  /api/sessions:
    get:
      summary: Get all sessions
      description: Returns all Bob task sessions with full metadata
      operationId: getAllSessions
      responses:
        '200':
          description: Array of session objects
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Session'

  /api/sessions/{session_id}:
    get:
      summary: Get specific session
      description: Returns details for a single session by ID
      operationId: getSessionById
      parameters:
        - name: session_id
          in: path
          required: true
          description: Unique session identifier
          schema:
            type: string
      responses:
        '200':
          description: Session object
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Session'
        '404':
          description: Session not found

  /api/summary:
    get:
      summary: Get summary statistics
      description: Returns aggregated statistics across all sessions
      operationId: getSummary
      responses:
        '200':
          description: Summary object
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Summary'

  /api/query:
    get:
      summary: Query sessions with filters
      description: Filter sessions by mode, cost, or date range
      operationId: querySessions
      parameters:
        - name: mode
          in: query
          description: Filter by Bob mode
          schema:
            type: string
            enum: [code, plan, advanced, orchestrator, ask]
        - name: cost_max
          in: query
          description: Maximum API cost filter
          schema:
            type: number
            format: float
        - name: date_from
          in: query
          description: Filter sessions from this date onwards
          schema:
            type: string
            format: date-time
      responses:
        '200':
          description: Filtered sessions
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Session'

components:
  schemas:
    Session:
      type: object
      properties:
        session_id:
          type: string
          description: Unique session identifier
        task_id:
          type: string
          description: Task identifier from Bob
        timestamp:
          type: string
          format: date-time
          description: Session start time
        metadata:
          $ref: '#/components/schemas/Metadata'
        events:
          type: array
          items:
            $ref: '#/components/schemas/Event'
        tools_used:
          type: object
          additionalProperties:
            type: integer
        files_modified:
          type: array
          items:
            type: string
        flags:
          type: array
          items:
            type: string

    Metadata:
      type: object
      properties:
        context_length:
          type: integer
        tokens_used:
          type: integer
        api_cost:
          type: number
          format: float
        cache_hits:
          type: integer
        mode:
          type: string

    Event:
      type: object
      properties:
        task_id:
          type: string
        mode:
          type: string
        task_summary:
          type: string
        files_read:
          type: array
          items:
            type: string
        files_modified:
          type: array
          items:
            type: string
        tokens_estimated:
          type: integer
        decision_reason:
          type: string
        alternatives_skipped:
          type: string
        flag:
          type: string
        audit_plain_english:
          type: string

    Summary:
      type: object
      properties:
        total_sessions:
          type: integer
        total_tokens:
          type: integer
        total_cost:
          type: number
          format: float
        mode_breakdown:
          type: object
          additionalProperties:
            type: integer
```

### Step 4.3: Test API Server

```bash
# Start the server
node watsonx-orchestrate/api-server.js

# Test endpoints
curl http://localhost:3000/api/sessions
curl http://localhost:3000/api/summary
curl "http://localhost:3000/api/query?mode=code&cost_max=0.05"
curl http://localhost:3000/openapi.yaml
```

---

## Phase 5: Integration Testing (Day 6)

### Step 5.1: End-to-End Test Workflow

```bash
# 1. Create test session
cat > bob_sessions/integration_test.md << 'EOF'
# Task Session Export

**Task ID:** integration-test
**Timestamp:** 2026-05-02T20:00:00.000Z
**Context Length:** 5,000 tokens
**API Cost:** $0.03
**Cache Hits:** 3,000 tokens
**Mode:** code

## Messages

### User
Test the integration

### Assistant
Running integration test...

<read_file>
<args>...</args>
</read_file>

```bobwatch-event
{
  "task_id": "integration-test",
  "mode": "code",
  "task_summary": "Tested BobWatch integration",
  "files_read": ["test.js"],
  "files_modified": ["output.json"],
  "tokens_estimated": 5000,
  "decision_reason": "Integration testing",
  "alternatives_skipped": "None",
  "flag": "none",
  "audit_plain_english": "Verified all BobWatch components work together"
}
```
EOF

# 2. Run parser
node parser/session-reader.js

# 3. Verify output
cat .bobwatch/session-log.json

# 4. Start API server
node watsonx-orchestrate/api-server.js &

# 5. Test API
curl http://localhost:3000/api/sessions | jq

# 6. Open VS Code extension
code --extensionDevelopmentHost=. .

# 7. Verify dashboard displays data
```

### Step 5.2: Validation Checklist

- [ ] Parser successfully reads markdown files
- [ ] Parser extracts all metadata fields
- [ ] Parser finds bobwatch-event JSON blocks
- [ ] session-log.json is valid JSON
- [ ] Dashboard loads in VS Code webview
- [ ] Dashboard displays all 6 panels
- [ ] File watcher triggers on new sessions
- [ ] API server responds to all endpoints
- [ ] OpenAPI spec validates
- [ ] watsonx can query the API

---

## Troubleshooting Guide

### Issue: Parser fails to read files

```bash
# Check file permissions
ls -la bob_sessions/

# Verify Node.js version
node --version  # Should be v16+

# Run parser with debug output
node parser/session-reader.js 2>&1 | tee parser.log
```

### Issue: Dashboard doesn't load

```bash
# Check VS Code console
# View → Output → Select "BobWatch" from dropdown

# Verify HTML file exists
ls -la dashboard/index.html

# Test HTML syntax
npx html-validate dashboard/index.html
```

### Issue: Extension doesn't activate

```bash
# Check package.json syntax
npx jsonlint package.json

# Verify activation events
grep -A 5 "activationEvents" package.json

# Check VS Code extension host logs
# Help → Toggle Developer Tools → Console
```

### Issue: API server connection refused

```bash
# Check if port is in use
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Test with different port
PORT=3001 node watsonx-orchestrate/api-server.js

# Verify firewall settings
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Security audit (no secrets in code)
- [ ] Performance tested with 100+ sessions

### VS Code Extension Publishing

```bash
# Install vsce
npm install -g @vscode/vsce

# Package extension
vsce package

# Publish to marketplace
vsce publish
```

### API Server Deployment

```bash
# Option 1: Local deployment
npm install -g pm2
pm2 start watsonx-orchestrate/api-server.js --name bobwatch-api

# Option 2: Docker deployment
docker build -t bobwatch-api .
docker run -p 3000:3000 bobwatch-api
```

---

## Maintenance Guide

### Regular Tasks

**Daily:**
- Monitor parser logs for errors
- Check API server uptime
- Review flagged sessions

**Weekly:**
- Archive old session files (>30 days)
- Update token cost estimates
- Review dashboard performance

**Monthly:**
- Update dependencies
- Review and optimize queries
- Backup session-log.json

### Updating Components

**Parser Updates:**
```bash
# Edit parser/session-reader.js
# Test with existing sessions
node parser/session-reader.js
# Verify output format unchanged
```

**Dashboard Updates:**
```bash
# Edit dashboard/index.html
# Test in browser first
open test-dashboard.html
# Then test in VS Code extension
```

**API Updates:**
```bash
# Edit watsonx-orchestrate/api-server.js
# Update openapi.yaml if endpoints change
# Restart server
pm2 restart bobwatch-api
```

---

## Success Metrics

Track these metrics to measure BobWatch effectiveness:

1. **Parser Accuracy:** % of sessions successfully parsed
2. **Dashboard Load Time:** Time to render 50 sessions
3. **API Response Time:** Average response time for queries
4. **Extension Stability:** Uptime without crashes
5. **User Adoption:** Number of active users
6. **Token Visibility:** % of sessions with bobwatch-event blocks

---

## Next Steps

After completing all phases:

1. **Demo to stakeholders** - Show live dashboard with real sessions
2. **Gather feedback** - Collect user input on features
3. **Iterate** - Implement requested improvements
4. **Scale** - Optimize for larger session volumes
5. **Integrate** - Connect with other governance tools

---

**End of Implementation Guide**