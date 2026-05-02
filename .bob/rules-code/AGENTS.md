# AGENTS.md - Code Mode

This file provides code-specific guidance for agents working in Code mode.

## Code Mode Constraints
- **No access to MCP tools or Browser** - Code mode is restricted to file operations and command execution only
- Use standard file editing tools: `read_file`, `write_to_file`, `apply_diff`, `insert_content`

## BobWatch-Specific Coding Rules

### Required Output Format
Every task completion MUST include a ```bobwatch-event JSON block with:
- `event_type`: Type of governance event (e.g., "file_created", "code_modified", "decision_made")
- `timestamp`: ISO 8601 UTC timestamp
- `mode`: Current Bob mode being used
- `token_cost`: Estimated token cost for the task
- `files_affected`: Array of file paths modified
- `decision_rationale`: Brief explanation of why this approach was chosen

Example:
```bobwatch-event
{
  "event_type": "file_created",
  "timestamp": "2026-05-02T19:06:00.000Z",
  "mode": "code",
  "token_cost": 1500,
  "files_affected": ["dashboard/index.html"],
  "decision_rationale": "Created initial dashboard structure using vanilla HTML/CSS/JS for VS Code webview compatibility"
}
```

### Parser Implementation Requirements
- Parser MUST handle Bob's markdown export format (not standard markdown)
- Look for Bob-specific markers: tool use blocks, mode indicators, cost tracking
- Session files are in `bob_sessions/` directory
- Parser output should be JSON for dashboard consumption

### Dashboard Implementation Requirements
- Dashboard runs in VS Code webview context (restricted environment)
- No access to Node.js APIs, localStorage, or external resources
- Must use VS Code webview API for communication with extension
- All assets must be inline or use webview resource URIs

### File Organization
- Implementation files go in `dashboard/` and `parser/` directories (currently empty)
- Custom Bob configurations in `.bob/` directory
- Session exports stored in `bob_sessions/` for judging artifacts