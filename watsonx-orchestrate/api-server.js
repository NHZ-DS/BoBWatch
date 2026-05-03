const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const LOG_PATH = path.join(__dirname, '../.bobwatch/session-log.json');

const OPENAPI_SPEC = {
  openapi: '3.0.0',
  info: { title: 'BobWatch API', version: '1.0.0', description: 'Query IBM Bob governance data' },
  servers: [{ url: 'http://localhost:3000' }],
  paths: {
    '/api/summary': { get: { summary: 'Get summary statistics', responses: { '200': { description: 'Summary object' } } } },
    '/api/sessions': { get: { summary: 'Get all sessions', responses: { '200': { description: 'Sessions array' } } } },
    '/api/query': { get: { summary: 'Query sessions', parameters: [{ name: 'mode', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Filtered sessions' } } } }
  }
};

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'));
  } catch (e) {
    return { sessions: [], summary: {} };
  }
}

http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (parsedUrl.pathname === '/api/summary') {
    const data = loadData();
    res.writeHead(200);
    res.end(JSON.stringify(data.summary));
  } else if (parsedUrl.pathname === '/api/sessions') {
    const data = loadData();
    res.writeHead(200);
    res.end(JSON.stringify(data.sessions));
  } else if (parsedUrl.pathname === '/api/query') {
    const data = loadData();
    let filtered = data.sessions;
    if (parsedUrl.query.mode) {
      filtered = filtered.filter(s => s.events?.some(e => e.mode === parsedUrl.query.mode));
    }
    res.writeHead(200);
    res.end(JSON.stringify(filtered));
  } else if (parsedUrl.pathname === '/openapi.json') {
    res.writeHead(200);
    res.end(JSON.stringify(OPENAPI_SPEC, null, 2));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
}).listen(PORT, () => {
  console.log(`BobWatch API running on http://localhost:${PORT}`);
  console.log(`OpenAPI spec: http://localhost:${PORT}/openapi.json`);
});

// Made with Bob
