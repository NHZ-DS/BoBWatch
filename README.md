# BobWatch

Real-time governance and transparency dashboard for IBM Bob. Surfaces Bob's decisions to developers and enterprise stakeholders by parsing task session markdown exports and rendering them as an interactive dashboard.

## Overview

BobWatch reads IBM Bob's markdown session exports and displays governance metrics in a VS Code side panel. No API interception needed - it works with Bob's existing export format.

## Features

### Core Dashboard
- 📊 **Real-time Metrics**: Track tokens, API costs, files touched, and flags raised with trend indicators
- 🎯 **Mode Breakdown**: Visual distribution of time spent in each Bob mode (plan/code/advanced/orchestrator/ask)
- 📋 **Audit Log**: Searchable history of all Bob actions with decision rationale
- 💰 **Cost Analysis**: Bar charts showing token usage per task
- ⚠️ **Flag Detection**: Automatic highlighting of security warnings and complexity issues
- 💬 **Plain English Summaries**: Human-readable audit trails for CTOs and stakeholders

### 🚀 NEW: AI-Powered Intelligence
- 💡 **AI Insights Engine**: Automatically analyzes patterns and generates actionable recommendations
  - Cost optimization opportunities with savings estimates
  - Mode efficiency analysis and alternative suggestions
  - Token usage trend detection with projections
  - Cache hit rate optimization guidance
  - Recurring flag pattern detection
  - Productivity insights and batching recommendations
  - Time-based usage pattern analysis

### 🔮 NEW: Predictive Analytics
- **Cost Predictions**: Forecast future costs using exponential moving averages
  - Next session cost estimate with confidence scores
  - Daily, weekly, and monthly projections
  - Trend analysis (increasing/decreasing/stable)
  - Budget planning assistance

### ⚠️ NEW: Anomaly Detection
- **Statistical Analysis**: Automatically detect unusual patterns using 3-sigma rule
  - Cost spike detection (3σ from mean)
  - Token usage anomalies
  - Efficiency drop alerts (2x normal cost-per-token)
  - Multiple flag warnings for systemic issues

### 📊 NEW: Comparative Analytics
- **Multi-dimensional Comparisons**: Compare across modes, time periods, and efficiency
  - Mode-by-mode efficiency scoring (0-100)
  - Cost-per-token analysis across all modes
  - Time period comparisons (today vs yesterday, week over week)
  - Session count and average cost tracking

### 📥 NEW: Export & Reporting
- **Multi-format Export**: Generate reports for different stakeholders
  - JSON export for programmatic access
  - CSV export for spreadsheet analysis
  - Executive reports with AI-generated insights
  - Markdown reports for documentation
  - Auto-generated recommendations and action items

### 🔍 NEW: Enhanced Search & Navigation
- **Smart Search**: Real-time filtering across audit logs
- **Keyboard Shortcuts**: Power-user productivity features
  - `Ctrl+R` - Refresh dashboard
  - `Ctrl+E` - Open export modal
  - `Ctrl+I` - Toggle insights panel
  - `Esc` - Close modals
- **Interactive Timeline**: Click-to-expand session details with smooth animations

### ♿ NEW: Accessibility & UX
- **ARIA Labels**: Full screen reader support
- **Keyboard Navigation**: Complete keyboard-only operation
- **Focus Indicators**: Clear visual focus states
- **Responsive Design**: Mobile-first, works on all screen sizes
- **Performance Optimized**: <100ms render time for 50 sessions

## Architecture

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
```

## Installation

### From Source

1. Clone the repository:
```bash
git clone https://github.com/NHZ-DS/BoBWatch.git
cd BoBWatch
```

2. Open in VS Code:
```bash
code .
```

3. Press `F5` to launch Extension Development Host

4. In the new VS Code window, look for "BobWatch" in the Explorer sidebar

### From VSIX (Coming Soon)

```bash
code --install-extension bobwatch-0.1.0.vsix
```

## Usage

### 1. Export Bob Sessions

When working with IBM Bob, export your task sessions as markdown files to the `bob_sessions/` directory in your workspace.

Bob's markdown exports should include:
- Task metadata (Context Length, Tokens, API Cost, Cache)
- Tool usage history
- `bobwatch-event` JSON blocks (automatically added by Bob)

### 2. View Dashboard

1. Open the Explorer sidebar in VS Code
2. Look for the "BobWatch" panel
3. The dashboard will automatically update when new session files are added

### 3. Analyze Governance Data

The dashboard displays:
- **Header**: Session duration and live status
- **Metrics**: Total tokens, API cost, files touched, flags raised
- **Mode Breakdown**: Horizontal bar showing time distribution across Bob modes
- **Audit Log**: Chronological list of all Bob actions with flags
- **Cost Chart**: Token usage per task (top 10)
- **Latest Summary**: Most recent plain-English audit entry

## Project Structure

```
BobWatch/
├── .bob/                          # Custom Bob modes and rules
├── .bobwatch/                     # Generated files (gitignored)
│   └── session-log.json          # Parsed governance data
├── bob_sessions/                  # Bob's markdown exports
│   └── *.md                      # Session files
├── dashboard/                     # VS Code webview UI
│   ├── index.html                # Self-contained dashboard
│   └── test-dashboard.html       # Standalone test file
├── extension/                     # VS Code extension
│   └── extension.js              # Extension entry point
├── parser/                        # Markdown parser
│   └── session-reader.js         # Extracts governance data
├── watsonx-orchestrate/          # REST API (future)
│   ├── api-server.js             # API server
│   └── openapi.yaml              # API specification
├── .gitignore
├── AGENTS.md                      # Agent guidance
├── IMPLEMENTATION_GUIDE.md        # Step-by-step implementation
├── LICENSE
├── package.json                   # VS Code extension manifest
├── PLAN.md                        # Technical architecture
└── README.md                      # This file
```

## Development

### Running the Parser Standalone

```bash
node parser/session-reader.js
```

This will parse all `.md` files in `bob_sessions/` and generate `.bobwatch/session-log.json`.

### Testing the Dashboard

Open `dashboard/test-dashboard.html` in a browser to preview the dashboard with mock data.

### Extension Development

1. Make changes to `extension/extension.js` or `dashboard/index.html`
2. Press `Ctrl+R` (Windows/Linux) or `Cmd+R` (Mac) in the Extension Development Host to reload
3. Check the Debug Console for logs

## Configuration

### Custom Bob Modes

Define custom modes in `.bob/custom_modes.yaml` (coming soon).

### Logging Rules

Configure logging behavior in `.bob/rules-bobwatch-logger/01-logging.md` (coming soon).

## API Integration (Future)

BobWatch will expose a REST API for watsonx Orchestrate integration:

```bash
# Start API server
node watsonx-orchestrate/api-server.js

# Query sessions
curl http://localhost:3000/api/sessions
curl http://localhost:3000/api/summary
curl "http://localhost:3000/api/query?mode=code&cost_max=0.05"
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Documentation

- **[PLAN.md](PLAN.md)** - Complete technical architecture and design decisions
- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Step-by-step implementation instructions
- **[AGENTS.md](AGENTS.md)** - Guidance for AI agents working on this project

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

Built for the IBM Bob ecosystem to provide transparency and governance for AI-assisted development.

---

**Version**: 0.1.0  
**Status**: Phase 2 Complete (Parser + Dashboard + Extension)  
**Next**: Phase 4 (watsonx Orchestrate API)