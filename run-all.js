const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

const projectRoot = __dirname;
const bobSessionsDir = path.join(projectRoot, 'bob_sessions');
const sessionLogPath = path.join(projectRoot, '.bobwatch', 'session-log.json');

// Demo session files content
const demoSessions = {
  'demo_orchestrator_session.md': `# BobWatch Build — Orchestrator Coordination
**Task ID:** bobwatch-orchestrator-build
**Timestamp:** 2026-05-03T01:00:00.000Z
**Context Length:** 18,432 tokens
**API Cost:** $0.046
**Cache Hits:** 14,200 tokens
**Mode:** orchestrator
## Summary
Coordinated full BobWatch build across 3 specialized agents.
\`\`\`bobwatch-event
{"task_id":"bobwatch-orchestrator","mode":"orchestrator","task_summary":"Orchestrated BobWatch build: delegated parser to Code mode, architecture to Plan mode, review to Ask mode","files_read":["PLAN.md","parser/session-reader.js","dashboard/index.html"],"files_modified":["parser/session-reader.js","extension/extension.js"],"tokens_estimated":18432,"decision_reason":"Orchestrator used to coordinate 3 agents — saved 38% tokens vs single model doing all tasks","flag":"none","audit_plain_english":"Bob spawned 3 sub-agents for BobWatch build. Code mode built the parser in 8400 tokens. Plan mode reviewed architecture gaps. Ask mode drafted the CTO summary. Total coordination overhead: 1200 tokens. Multi-agent routing saved an estimated 38% versus running all tasks through a single model."}
\`\`\``,

  'demo_code_session.md': `# Parser Implementation — Code Mode
**Task ID:** implement-session-parser
**Timestamp:** 2026-05-03T00:30:00.000Z
**Context Length:** 8,456 tokens
**API Cost:** $0.021
**Cache Hits:** 6,200 tokens
**Mode:** code
## Summary
Built session-reader.js with regex extraction for Bob markdown exports.
\`\`\`bobwatch-event
{"task_id":"implement-parser","mode":"code","task_summary":"Built parser/session-reader.js to extract governance data from Bob markdown exports","files_read":["PLAN.md","bob_sessions/test.md"],"files_modified":["parser/session-reader.js"],"tokens_estimated":8456,"decision_reason":"Regex parsing chosen over AST parser — zero npm dependencies, handles format variations gracefully","flag":"none","audit_plain_english":"Code mode wrote the core parser. Uses regex patterns to extract token counts, API costs, and bobwatch-event JSON blocks from Bob session markdown files. Outputs structured JSON to .bobwatch/session-log.json for dashboard consumption."}
\`\`\``,

  'demo_plan_session.md': `# Architecture Review — Plan Mode
**Task ID:** architecture-review
**Timestamp:** 2026-05-03T00:00:00.000Z
**Context Length:** 5,120 tokens
**API Cost:** $0.013
**Cache Hits:** 3,800 tokens
**Mode:** plan
## Summary
Designed 4-component BobWatch architecture. Identified parser-dashboard integration risk.
\`\`\`bobwatch-event
{"task_id":"architecture-review","mode":"plan","task_summary":"Designed BobWatch 4-component architecture: parser, dashboard, extension, watsonx API","files_read":["PLAN.md"],"files_modified":["PLAN.md","AGENTS.md"],"tokens_estimated":5120,"decision_reason":"Plan mode used before implementation to catch integration issues early — prevented 2 likely field name mismatches","flag":"none","audit_plain_english":"Plan mode reviewed the full BobWatch architecture. Identified that parser output field names must exactly match dashboard rendering expectations. Flagged missing error handling for empty bob_sessions directory. Both issues resolved before implementation began."}
\`\`\``,

  'demo_security_session.md': `# Security Scan — Ask Mode
**Task ID:** security-governance-review
**Timestamp:** 2026-05-03T00:15:00.000Z
**Context Length:** 3,200 tokens
**API Cost:** $0.008
**Cache Hits:** 2,100 tokens
**Mode:** ask
## Summary
Reviewed BobWatch for secret exposure risks. Found .env reference in test prompt.
\`\`\`bobwatch-event
{"task_id":"security-review","mode":"ask","task_summary":"Scanned BobWatch codebase for secret exposure and governance risks","files_read":["parser/session-reader.js",".bobrules"],"files_modified":[],"tokens_estimated":3200,"decision_reason":"Ask mode used for read-only security review — no file modification risk","flag":"secret-detected","audit_plain_english":"Ask mode performed security governance review. Detected one potential secret pattern in a test prompt (API_KEY reference). BobWatch flag system correctly identified and would have masked this before external model dispatch. System is functioning as designed for enterprise secret governance."}
\`\`\``
};

async function main() {
  console.log('🚀 Starting BobWatch setup...\n');

  // Step 1: Create bob_sessions directory
  if (!fs.existsSync(bobSessionsDir)) {
    fs.mkdirSync(bobSessionsDir, { recursive: true });
    console.log('✅ Created bob_sessions/ directory');
  }

  // Step 2: Create demo session files
  let filesCreated = 0;
  for (const [filename, content] of Object.entries(demoSessions)) {
    const filePath = path.join(bobSessionsDir, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesCreated++;
    }
  }
  if (filesCreated > 0) {
    console.log(`✅ Created ${filesCreated} demo session files`);
  }

  // Step 3: Run parser
  console.log('\n📊 Running parser...');
  const parserPath = path.join(projectRoot, 'parser', 'session-reader.js');
  
  await new Promise((resolve, reject) => {
    exec(`node "${parserPath}"`, { cwd: projectRoot }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Parser error:', error);
        reject(error);
      } else {
        console.log(stdout);
        resolve();
      }
    });
  });

  // Step 4: Read session-log.json for summary
  let summary = { total_sessions: 0, total_tokens: 0, total_cost: 0 };
  if (fs.existsSync(sessionLogPath)) {
    const data = JSON.parse(fs.readFileSync(sessionLogPath, 'utf8'));
    summary = data.summary || summary;
  }

  // Step 5: Start API server
  console.log('\n🌐 Starting watsonx API server...');
  const apiServerPath = path.join(projectRoot, 'watsonx-orchestrate', 'api-server.js');
  const apiProcess = spawn('node', [apiServerPath], {
    cwd: projectRoot,
    stdio: 'inherit'
  });

  // Give server time to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Step 6: Print summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ BobWatch ready!');
  console.log('📊 Sessions parsed:', summary.total_sessions);
  console.log('💰 Total cost: $' + (summary.total_cost || 0).toFixed(4));
  console.log('🔢 Total tokens:', (summary.total_tokens || 0).toLocaleString());
  console.log('🌐 API running: http://localhost:3000/api/summary');
  console.log('📁 Open dashboard/index.html in browser to preview');
  console.log('='.repeat(60));
  console.log('\nPress Ctrl+C to stop the API server');

  // Keep process alive
  process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down BobWatch...');
    apiProcess.kill();
    process.exit(0);
  });
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

// Made with Bob
