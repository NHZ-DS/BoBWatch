const fs = require('fs').promises;
const path = require('path');

// Extract metadata from markdown content
function extractMetadata(content) {
  const taskMatch = content.match(/^#\s+(.+)$/m);
  const contextMatch = content.match(/Context Length:\s*([\d,]+)/i);
  const tokensMatch = content.match(/Tokens:\s*([\d,]+)/i);
  const costMatch = content.match(/API Cost:\s*\$?([\d.]+)/i);
  const cacheMatch = content.match(/Cache:\s*([\d,]+)/i);
  
  return {
    task_name: taskMatch ? taskMatch[1].trim() : 'Unknown Task',
    context_length: contextMatch ? parseInt(contextMatch[1].replace(/,/g, '')) : 0,
    tokens: tokensMatch ? parseInt(tokensMatch[1].replace(/,/g, '')) : 0,
    api_cost: costMatch ? parseFloat(costMatch[1]) : 0,
    cache_hits: cacheMatch ? parseInt(cacheMatch[1].replace(/,/g, '')) : 0
  };
}

// Extract bobwatch-event JSON blocks
function extractBobWatchEvents(content) {
  const events = [];
  const regex = /```bobwatch-event\s*\n([\s\S]*?)\n```/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    try {
      events.push(JSON.parse(match[1]));
    } catch (e) {
      console.warn('Failed to parse bobwatch-event:', e.message);
    }
  }
  
  return events;
}

// Parse single markdown file
async function parseFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const metadata = extractMetadata(content);
  const events = extractBobWatchEvents(content);
  
  return {
    file: path.basename(filePath),
    timestamp: (await fs.stat(filePath)).mtime.toISOString(),
    ...metadata,
    events,
    event_count: events.length
  };
}

// Parse all markdown files in directory
async function parseDirectory(dirPath) {
  const files = await fs.readdir(dirPath);
  const mdFiles = files.filter(f => f.endsWith('.md'));
  
  const sessions = [];
  for (const file of mdFiles) {
    try {
      const session = await parseFile(path.join(dirPath, file));
      sessions.push(session);
    } catch (error) {
      console.error(`Error parsing ${file}:`, error.message);
    }
  }
  
  return sessions;
}

// Generate session log with summary
function generateLog(sessions) {
  const summary = {
    total_sessions: sessions.length,
    total_tokens: sessions.reduce((sum, s) => sum + s.tokens, 0),
    total_cost: sessions.reduce((sum, s) => sum + s.api_cost, 0),
    total_events: sessions.reduce((sum, s) => sum + s.event_count, 0)
  };
  
  return { sessions, summary, generated_at: new Date().toISOString() };
}

// Main function: parse and write log
async function main(sessionsDir = './bob_sessions', outputPath = './.bobwatch/session-log.json') {
  const sessions = await parseDirectory(sessionsDir);
  const log = generateLog(sessions);
  
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(log, null, 2));
  
  console.log(`✓ Parsed ${sessions.length} sessions → ${outputPath}`);
  return log;
}

// Watch directory for changes
function watchDirectory(dirPath, callback) {
  const watcher = fs.watch(dirPath, { recursive: false }, async (eventType, filename) => {
    if (filename && filename.endsWith('.md')) {
      console.log(`File ${eventType}: ${filename}`);
      try {
        const log = await main(dirPath);
        callback(log);
      } catch (error) {
        console.error('Watch callback error:', error);
      }
    }
  });
  
  return watcher;
}

// Export functions
module.exports = { parseFile, parseDirectory, generateLog, main, watchDirectory };

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

// Made with Bob
