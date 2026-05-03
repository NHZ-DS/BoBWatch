# BobWatch Technical Implementation Plan

**Version:** 1.0  
**Date:** 2026-05-02  
**Mode:** Code  
**Estimated Total Token Cost:** ~45,000 tokens

---

## Executive Summary

BobWatch is a governance dashboard that parses IBM Bob's markdown session exports and renders real-time transparency data in VS Code. The system has four core components:

1. **Parser** - Extracts structured data from Bob's markdown exports
2. **Dashboard** - VS Code webview panel displaying governance metrics
3. **Extension** - VS Code extension orchestrating the system
4. **watsonx Integration** - REST API for enterprise orchestration queries

---

## Architecture Overview

```
bob_sessions/               → Bob exports markdown here
    ├── session_001.md
    └── session_002.md
         ↓
parser/session-reader.js   → Parses markdown + bobwatch-event blocks
         ↓
.bobwatch/session-log.json → Structured governance data
         ↓
extension/extension.js     → VS Code extension + file watcher
         ↓
dashboard/index.html       → Webview panel (HTML/CSS/JS)
         ↓
watsonx-orchestrate/       → REST API for external queries
    └── api-server.js
```

---

## Component 1: Parser (parser/session-reader.js)

### Purpose
Read Bob's markdown session exports and extract:
- Session metadata (task_id, tokens, api_cost, context_length, timestamp)
- Embedded `bobwatch-event` JSON blocks from Bob's responses
- Tool usage patterns and file modifications

### Key Functions

```javascript
// Main entry point
async function parseSessionDirectory(dirPath)
  → Returns: Array of parsed session objects

// Parse individual markdown file
async function parseSessionFile(filePath)
  → Returns: SessionData object

// Extract Bob's markdown metadata
function extractSessionMetadata(markdownContent)
  → Returns: { task_id, tokens, api_cost, context_length, timestamp }

// Find and parse bobwatch-event JSON blocks
function extractBobWatchEvents(markdownContent)
  → Returns: Array of event objects

// Detect tool usage patterns
function extractToolUsage(markdownContent)
  → Returns: { tool_name, frequency, files_affected }

// Aggregate all sessions into single log
async function generateSessionLog(sessionsArray)
  → Writes to: .bobwatch/session-log.json
```

### Input Format (Bob's Markdown Export)

```markdown
# Task Session Export

**Task ID:** create-dashboard-plan
**Timestamp:** 2026-05-02T20:04:00.000Z
**Context Length:** 15,234 tokens
**API Cost:** $0.02
**Cache Hits:** 12,450 tokens

## Messages

### User
Create a technical plan...

### Assistant
I'll create a comprehensive plan...

<read_file>
<args>...</args>
</read_file>

```bobwatch-event
{
  "task_id": "create-plan",
  "mode": "code",
  "tokens_estimated": 1500,
  ...
}
```
```

### Output Format (.bobwatch/session-log.json)

```json
{
  "sessions": [
    {
      "session_id": "session_001",
      "task_id": "create-dashboard-plan",
      "timestamp": "2026-05-02T20:04:00.000Z",
      "metadata": {
        "context_length": 15234,
        "tokens_used": 15234,
        "api_cost": 0.02,
        "cache_hits": 12450,
        "mode": "code"
      },
      "events": [
        {
          "event_type": "file_created",
          "timestamp": "2026-05-02T20:04:00.000Z",
          "files_affected": ["PLAN.md"],
          "decision_rationale": "...",
          "tokens_estimated": 1500
        }
      ],
      "tools_used": {
        "read_file": 3,
        "write_to_file": 1,
        "update_todo_list": 1
      },
      "files_modified": ["PLAN.md"],
      "flags": []
    }
  ],
  "summary": {
    "total_sessions": 1,
    "total_tokens": 15234,
    "total_cost": 0.02,
    "mode_breakdown": {
      "code": 1,
      "plan": 0,
      "advanced": 0
    }
  }
}
```

### Dependencies
- Node.js fs/promises module
- Path module for file operations
- No external npm packages required

### Token Cost Estimate: ~8,000 tokens
- Core parsing logic: ~3,000 tokens
- Regex patterns for markdown: ~1,500 tokens
- JSON aggregation: ~2,000 tokens
- Error handling: ~1,500 tokens

---

## Component 2: Dashboard (dashboard/index.html)

### Purpose
Single-file VS Code webview panel displaying real-time governance metrics.

### Key Sections

1. **Live Feed Panel** - Real-time stream of Bob's actions
2. **Token Cost Bar Chart** - Visual breakdown by session
3. **Mode Breakdown Pie Chart** - Usage distribution (code/plan/advanced)
4. **Audit Log Table** - Searchable history of all events
5. **Prompt Diff Viewer** - Before/after comparison of file changes
6. **Flags Raised Panel** - Security/complexity warnings

### Key Functions

```javascript
// Initialize dashboard
function initDashboard()
  → Sets up VS Code API message listener
  → Loads initial session-log.json data

// Render live feed
function renderLiveFeed(events)
  → Updates DOM with latest events
  → Auto-scrolls to newest entry

// Render token cost chart
function renderTokenChart(sessions)
  → Uses HTML5 Canvas for bar chart
  → No external charting library

// Render mode breakdown
function renderModeBreakdown(summary)
  → Simple CSS-based pie chart
  → Percentage calculations

// Render audit log table
function renderAuditLog(events)
  → Filterable/searchable table
  → Pagination for large datasets

// Render prompt diff
function renderPromptDiff(beforeContent, afterContent)
  → Side-by-side diff view
  → Highlights additions/deletions

// Handle VS Code API messages
function handleVSCodeMessage(message)
  → Receives updates from extension
  → Triggers re-render of affected panels
```

### VS Code Webview Constraints

```javascript
// Acquire VS Code API (must be called once)
const vscode = acquireVsCodeApi();

// Send message to extension
vscode.postMessage({
  command: 'refreshData'
});

// Receive messages from extension
window.addEventListener('message', event => {
  const message = event.data;
  // Handle message
});

// Persist state across panel reloads
vscode.setState({ lastViewedSession: 'session_001' });
const state = vscode.getState();
```

### HTML Structure

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BobWatch Dashboard</title>
  <style>
    /* All CSS inline - no external stylesheets */
    /* VS Code theme-aware colors using CSS variables */
  </style>
</head>
<body>
  <div id="dashboard">
    <header>
      <h1>🔍 BobWatch</h1>
      <div id="summary-stats"></div>
    </header>
    
    <div id="panels">
      <section id="live-feed"></section>
      <section id="token-chart"></section>
      <section id="mode-breakdown"></section>
      <section id="audit-log"></section>
      <section id="prompt-diff"></section>
      <section id="flags"></section>
    </div>
  </div>
  
  <script>
    /* All JavaScript inline - no external scripts */
  </script>
</body>
</html>
```

### Dependencies
- None (vanilla HTML/CSS/JS)
- VS Code webview API (provided by extension host)

### Token Cost Estimate: ~15,000 tokens
- HTML structure: ~2,000 tokens
- CSS styling: ~4,000 tokens
- JavaScript logic: ~7,000 tokens
- Chart rendering: ~2,000 tokens

---

## Component 3: Extension (extension/extension.js)

### Purpose
VS Code extension that:
- Registers BobWatch side panel webview
- Watches `bob_sessions/` for new markdown exports
- Triggers parser when files change
- Sends updates to dashboard webview

### Key Functions

```javascript
// Extension activation
function activate(context)
  → Registers commands and webview provider
  → Initializes file watcher
  → Returns extension API

// Deactivation cleanup
function deactivate()
  → Disposes file watcher
  → Cleans up resources

// Webview provider class
class BobWatchViewProvider implements vscode.WebviewViewProvider
  → resolveWebviewView(webviewView)
  → Loads dashboard/index.html
  → Sets up message handlers

// File watcher for bob_sessions/
function setupFileWatcher(context)
  → Watches bob_sessions/*.md
  → Triggers parseAndUpdate() on change

// Parse and update pipeline
async function parseAndUpdate()
  → Calls parser/session-reader.js
  → Generates .bobwatch/session-log.json
  → Sends update message to webview

// Message handler from webview
function handleWebviewMessage(message)
  → Handles commands from dashboard
  → Returns requested data
```

### Extension Manifest (package.json)

```json
{
  "name": "bobwatch",
  "displayName": "BobWatch",
  "description": "Real-time governance dashboard for IBM Bob",
  "version": "0.1.0",
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
        "title": "BobWatch: Refresh Dashboard"
      }
    ]
  }
}
```

### File Watcher Implementation

```javascript
const watcher = vscode.workspace.createFileSystemWatcher(
  new vscode.RelativePattern(
    vscode.workspace.workspaceFolders[0],
    'bob_sessions/*.md'
  )
);

watcher.onDidCreate(uri => parseAndUpdate());
watcher.onDidChange(uri => parseAndUpdate());
```

### Dependencies
- VS Code Extension API (vscode module)
- Node.js child_process for running parser
- Node.js fs for file operations

### Token Cost Estimate: ~10,000 tokens
- Extension activation: ~2,000 tokens
- Webview provider: ~3,000 tokens
- File watcher: ~2,000 tokens
- Message handling: ~2,000 tokens
- Package.json: ~1,000 tokens

---

## Component 4: watsonx Orchestrate Integration (watsonx-orchestrate/)

### Purpose
Simple REST API exposing session-log.json for watsonx Orchestrate queries.

### API Endpoints

```
GET /api/sessions
  → Returns all sessions from session-log.json

GET /api/sessions/:session_id
  → Returns specific session details

GET /api/summary
  → Returns aggregated summary statistics

GET /api/query?mode=code&cost_max=0.05
  → Query sessions with filters
```

### OpenAPI Specification (openapi.yaml)

```yaml
openapi: 3.0.0
info:
  title: BobWatch API
  version: 1.0.0
  description: Query IBM Bob's governance data

paths:
  /api/sessions:
    get:
      summary: Get all sessions
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
      parameters:
        - name: session_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Session object

  /api/summary:
    get:
      summary: Get summary statistics
      responses:
        '200':
          description: Summary object

  /api/query:
    get:
      summary: Query sessions with filters
      parameters:
        - name: mode
          in: query
          schema:
            type: string
            enum: [code, plan, advanced, orchestrator, ask]
        - name: cost_max
          in: query
          schema:
            type: number
        - name: date_from
          in: query
          schema:
            type: string
            format: date-time
      responses:
        '200':
          description: Filtered sessions

components:
  schemas:
    Session:
      type: object
      properties:
        session_id:
          type: string
        task_id:
          type: string
        timestamp:
          type: string
          format: date-time
        metadata:
          type: object
        events:
          type: array
```

### Server Implementation (api-server.js)

```javascript
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

// Load session log
async function loadSessionLog() {
  const logPath = path.join(__dirname, '../.bobwatch/session-log.json');
  const data = await fs.readFile(logPath, 'utf8');
  return JSON.parse(data);
}

// Request router
async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  if (url.pathname === '/api/sessions') {
    const log = await loadSessionLog();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(log.sessions));
  }
  // ... other endpoints
}

// Start server
const server = http.createServer(handleRequest);
server.listen(3000, () => {
  console.log('BobWatch API running on http://localhost:3000');
});
```

### Dependencies
- Node.js http module (built-in)
- Node.js fs/promises (built-in)
- No external npm packages required

### Token Cost Estimate: ~7,000 tokens
- OpenAPI spec: ~2,500 tokens
- Server implementation: ~3,000 tokens
- Query logic: ~1,500 tokens

---

## Complete File Structure

```
BobWatch/
├── .bob/
│   ├── custom_modes.yaml          # Custom Bob mode definitions
│   └── rules-bobwatch-logger/
│       └── 01-logging.md          # Logging rules
├── .bobwatch/
│   └── session-log.json           # Generated by parser (gitignored)
├── bob_sessions/
│   ├── session_001.md             # Bob's markdown exports
│   └── session_002.md
├── dashboard/
│   └── index.html                 # Single-file webview dashboard
├── extension/
│   └── extension.js               # VS Code extension entry point
├── parser/
│   └── session-reader.js          # Markdown parser
├── watsonx-orchestrate/
│   ├── api-server.js              # REST API server
│   └── openapi.yaml               # API specification
├── .gitignore
├── .bobrules                      # Project-wide Bob rules
├── AGENTS.md                      # Agent guidance
├── LICENSE
├── package.json                   # VS Code extension manifest
├── PLAN.md                        # This file
└── README.md
```

---

## Implementation Phases

### Phase 1: Parser Foundation (~8,000 tokens)
**Deliverables:**
- parser/session-reader.js with core parsing logic
- .bobwatch/session-log.json output format
- Unit tests for markdown parsing

**Success Criteria:**
- Successfully parses Bob's markdown exports
- Extracts bobwatch-event JSON blocks
- Generates valid session-log.json

### Phase 2: Dashboard UI (~15,000 tokens)
**Deliverables:**
- dashboard/index.html with all panels
- Inline CSS for VS Code theme compatibility
- JavaScript for data rendering

**Success Criteria:**
- Displays all 6 dashboard panels
- Handles VS Code webview API messages
- Responsive layout for side panel

### Phase 3: VS Code Extension (~10,000 tokens)
**Deliverables:**
- extension/extension.js with webview provider
- package.json extension manifest
- File watcher for bob_sessions/

**Success Criteria:**
- Extension activates in VS Code
- Dashboard appears in side panel
- Auto-updates when new sessions added

### Phase 4: watsonx Integration (~7,000 tokens)
**Deliverables:**
- watsonx-orchestrate/api-server.js
- watsonx-orchestrate/openapi.yaml
- Query endpoint with filters

**Success Criteria:**
- REST API serves session data
- OpenAPI spec validates
- watsonx Orchestrate can query Bob's actions

### Phase 5: Custom Bob Configuration (~5,000 tokens)
**Deliverables:**
- .bob/custom_modes.yaml with BobWatch mode
- .bob/rules-bobwatch-logger/01-logging.md
- Updated .bobrules with enhanced logging

**Success Criteria:**
- Bob outputs bobwatch-event blocks automatically
- Custom logging rules enforced
- Mode-specific behavior defined

---

## Dependency List

### Runtime Dependencies
- **Node.js** (v16+) - For parser and API server
- **VS Code** (v1.80+) - Extension host environment

### Development Dependencies
- None required (vanilla JavaScript implementation)

### Optional Dependencies
- **ESLint** - Code quality (if desired)
- **Prettier** - Code formatting (if desired)

### External Services
- None required (fully self-contained)

---

## Token Cost Summary

| Phase | Component | Estimated Tokens |
|-------|-----------|------------------|
| 1 | Parser (session-reader.js) | ~8,000 |
| 2 | Dashboard (index.html) | ~15,000 |
| 3 | Extension (extension.js) | ~10,000 |
| 4 | watsonx API (api-server.js) | ~7,000 |
| 5 | Bob Configuration | ~5,000 |
| **Total** | **All Components** | **~45,000** |

### Cost Breakdown by Activity
- **Reading/Analysis:** ~5,000 tokens (understanding Bob's export format)
- **Core Implementation:** ~30,000 tokens (writing code)
- **Testing/Debugging:** ~7,000 tokens (validation and fixes)
- **Documentation:** ~3,000 tokens (inline comments and README updates)

---

## Risk Mitigation

### Risk 1: Bob's Markdown Format Changes
**Mitigation:** Parser uses flexible regex patterns; version detection in parser

### Risk 2: VS Code Webview Security Restrictions
**Mitigation:** All assets inline; no external resources; CSP-compliant

### Risk 3: Large Session Files (>10MB)
**Mitigation:** Streaming parser; pagination in dashboard; archive old sessions

### Risk 4: bobwatch-event Block Not Present
**Mitigation:** Parser falls back to metadata-only mode; warns user

---

## Success Metrics

1. **Parser Accuracy:** 100% of valid markdown files parsed without errors
2. **Dashboard Responsiveness:** <100ms render time for 50 sessions
3. **Extension Stability:** No crashes during 8-hour development session
4. **API Performance:** <50ms response time for /api/sessions endpoint
5. **Token Efficiency:** Actual implementation within 10% of estimates

---

## Next Steps

1. **Immediate:** Implement Phase 1 (Parser) to validate markdown format assumptions
2. **Week 1:** Complete Phases 1-3 (Parser, Dashboard, Extension)
3. **Week 2:** Implement Phase 4 (watsonx API) and Phase 5 (Bob Configuration)
4. **Week 3:** Integration testing and documentation
5. **Week 4:** Demo to stakeholders; gather feedback

---

## Appendix: Bob's Markdown Export Format (Sample)

```markdown
# Task Session Export

**Task ID:** implement-parser
**Timestamp:** 2026-05-02T20:30:00.000Z
**Context Length:** 8,456 tokens
**API Cost:** $0.015
**Cache Hits:** 6,200 tokens
**Mode:** code

## Messages

### User
Implement the session parser...

### Assistant
I'll implement the parser with the following approach...

<read_file>
<args>
<file>
<path>bob_sessions/session_001.md</path>
</file>
</args>
</read_file>

[Tool execution results...]

```bobwatch-event
{
  "task_id": "implement-parser",
  "mode": "code",
  "task_summary": "Created session-reader.js parser for Bob's markdown exports",
  "files_read": ["bob_sessions/session_001.md"],
  "files_modified": ["parser/session-reader.js"],
  "tokens_estimated": 8000,
  "decision_reason": "Regex-based parsing for flexibility with format changes",
  "alternatives_skipped": "Markdown AST parser (too heavy for simple extraction)",
  "flag": "none",
  "audit_plain_english": "Built a parser that reads Bob's session files and extracts governance data. Uses regex patterns to handle format variations. Outputs structured JSON for dashboard consumption."
}
```

### User
Great! Now implement the dashboard...
```

---

**End of Technical Plan**