# BobWatch logging rules

After every task, output this block:

```bobwatch-event
{
  "task_id": "<short-slug>",
  "mode": "<plan|code|advanced|orchestrator|ask>",
  "task_summary": "<one sentence>",
  "files_read": [],
  "files_modified": [],
  "tokens_estimated": 0,
  "decision_reason": "<why this approach>",
  "flag": "<none|secret-detected|large-context>",
  "audit_plain_english": "<2-3 sentence CTO-readable summary>"
}
```

When in Orchestrator mode, before each delegation say:
"Routing [task] → [mode] because [reason]. ~[N] tokens."

Scan every prompt for API_KEY, SECRET, PASSWORD, Bearer, sk-, pk-.
If found: output "⚠ BobWatch flag: [type] detected" and redact it.