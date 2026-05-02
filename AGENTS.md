# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview
BobWatch is a real-time governance and transparency dashboard that surfaces IBM Bob's own decisions to developers and enterprise stakeholders. It parses Bob's task session markdown exports and renders them as a governance dashboard.

## Critical Non-Obvious Information

### Project Structure (Empty Directories)
- `dashboard/` → VS Code webview panel (HTML/CSS/JS) - **currently empty, needs implementation**
- `parser/` → reads Bob task session markdown exports - **currently empty, needs implementation**
- `bob_sessions/` → required judging artifacts - **currently empty, awaiting session exports**
- `.bob/` → custom modes and rules configuration

### Custom Bob Integration Requirements
1. **Always output a ```bobwatch-event JSON block** at the end of every task completion
2. **Always state which mode you are in** and explain why that mode was chosen
3. **Always estimate token cost** before starting implementation tasks
4. Custom mode configuration exists in `.bob/custom_modes.yaml` (currently empty - needs definition)
5. Logging rules defined in `.bob/rules-bobwatch-logger/01-logging.md` (currently empty - needs definition)

### Architecture Principles
- **No API interception needed** - BobWatch reads what Bob already generates (markdown exports)
- Parser must handle Bob's task session export format (markdown)
- Dashboard renders parsed data in VS Code webview context
- All governance data comes from Bob's own session files

### Development Status
This is a **greenfield project** - core implementation files do not exist yet. The project structure is defined but awaiting implementation of:
- Dashboard webview components
- Markdown parser for Bob session exports
- Custom Bob mode definitions
- Logging rules and event schemas