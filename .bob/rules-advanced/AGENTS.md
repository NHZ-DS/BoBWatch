# AGENTS.md - Advanced Mode

This file provides advanced mode-specific guidance for agents working in Advanced mode.

## Advanced Mode Capabilities
- **Full access to MCP tools and Browser** - Advanced mode has access to all tools including external integrations
- Can use web search, API calls, and other MCP server capabilities
- Use for tasks requiring external data or complex integrations

## BobWatch-Specific Advanced Rules

### Required Output Format
Every task completion MUST include a ```bobwatch-event JSON block with:
- `event_type`: Type of governance event
- `timestamp`: ISO 8601 UTC timestamp
- `mode`: "advanced"
- `token_cost`: Estimated token cost for the task
- `files_affected`: Array of file paths modified
- `decision_rationale`: Brief explanation of why this approach was chosen
- `mcp_tools_used`: Array of MCP tools utilized (if any)

### When to Use Advanced Mode
- Researching VS Code webview API documentation
- Looking up Bob's markdown export format specifications
- Investigating governance dashboard best practices
- Fetching external libraries or dependencies information
- Any task requiring web search or external API access

### Parser Implementation with MCP
- Can use MCP tools to validate markdown parsing against Bob's actual export format
- May fetch example session files from external sources for testing
- Can research markdown parsing libraries and their compatibility

### Dashboard Implementation with MCP
- Can research VS Code webview API documentation online
- May fetch UI component libraries compatible with webview restrictions
- Can validate implementation approaches against VS Code extension guidelines