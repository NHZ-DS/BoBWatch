# AGENTS.md - Ask Mode

This file provides ask mode-specific guidance for agents working in Ask mode.

## Ask Mode Purpose
- **Information gathering and clarification** - Ask mode is for understanding requirements and context
- No file modifications or code execution
- Focus on asking targeted questions to gather necessary information

## BobWatch-Specific Ask Rules

### Required Output Format
Every task completion MUST include a ```bobwatch-event JSON block with:
- `event_type`: "question_asked" or "clarification_requested"
- `timestamp`: ISO 8601 UTC timestamp
- `mode`: "ask"
- `token_cost`: Estimated token cost for the interaction
- `files_affected`: [] (empty array - ask mode doesn't modify files)
- `decision_rationale`: Why this question was necessary

### When to Use Ask Mode
- Clarifying dashboard UI/UX requirements
- Understanding governance event schema details
- Confirming parser input/output format expectations
- Gathering stakeholder preferences for dashboard features
- Validating assumptions about Bob's markdown export format

### Critical Questions for BobWatch
- What specific governance events should be tracked?
- What dashboard visualizations are most valuable?
- How should session data be aggregated or filtered?
- What level of detail should be shown in the UI?
- Are there specific compliance or audit requirements?

### Documentation Context
- Project is greenfield - no existing implementation to reference
- Empty directories indicate awaiting implementation decisions
- Custom Bob modes and logging rules need definition
- Session export format needs clarification from actual Bob exports