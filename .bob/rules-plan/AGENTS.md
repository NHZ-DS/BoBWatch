# AGENTS.md - Plan Mode

This file provides plan mode-specific guidance for agents working in Plan mode.

## Plan Mode Purpose
- **Strategic planning and architecture design** - Plan mode is for high-level design and task breakdown
- No file modifications or code execution
- Focus on creating comprehensive implementation plans

## BobWatch-Specific Plan Rules

### Required Output Format
Every task completion MUST include a ```bobwatch-event JSON block with:
- `event_type`: "plan_created" or "architecture_designed"
- `timestamp`: ISO 8601 UTC timestamp
- `mode`: "plan"
- `token_cost`: Estimated token cost for the planning session
- `files_affected`: [] (empty array - plan mode doesn't modify files)
- `decision_rationale`: Why this architectural approach was chosen

### Critical Architectural Constraints

#### Parser Architecture
- Must handle Bob's non-standard markdown export format (not CommonMark)
- Bob exports include: tool use blocks, mode indicators, cost tracking, timestamps
- Parser output must be JSON for dashboard consumption
- Session files stored in `bob_sessions/` directory

#### Dashboard Architecture
- **VS Code webview context** - highly restricted JavaScript environment
- No Node.js APIs (no fs, path, process, etc.)
- No localStorage or sessionStorage
- No external resource loading (CDNs blocked)
- Must use VS Code webview API for extension communication
- All assets must be inline or use webview resource URIs

#### Integration Architecture
- No API interception needed - read Bob's existing markdown exports
- Parser runs in Node.js context (extension side)
- Dashboard runs in webview context (browser-like but restricted)
- Communication via VS Code message passing API

### Greenfield Project Considerations
- All implementation directories are currently empty
- Custom Bob mode definitions need creation (`.bob/custom_modes.yaml`)
- Logging rules need definition (`.bob/rules-bobwatch-logger/01-logging.md`)
- No existing code patterns to follow - establish conventions from scratch