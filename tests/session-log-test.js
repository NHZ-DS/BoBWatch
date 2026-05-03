const fs = require('fs');
const assert = require('assert');
const path = require('path');

const logPath = path.join(__dirname, '..', '.bobwatch', 'session-log.json');
assert(fs.existsSync(logPath), 'session-log.json must exist');
const data = JSON.parse(fs.readFileSync(logPath, 'utf8'));
assert(Array.isArray(data.sessions) && data.sessions.length > 0, 'Must have at least one session');
assert(data.sessions.some(s => s.tokens > 0), 'At least one session must have tokens > 0');
console.log('✓ All session log validation tests passed');

// Made with Bob
