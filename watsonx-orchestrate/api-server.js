const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const LOG_PATH = path.resolve(process.cwd(), 'data/session-log.json');
const DASHBOARD_PATH = path.resolve(process.cwd(), 'dashboard/index.html');

// CORS helper function
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const OPENAPI_SPEC = {
  openapi: '3.0.0',
  info: { title: 'BobWatch API', version: '1.0.0', description: 'Query IBM Bob governance data' },
  servers: [{ url: '/' }],
  paths: {
    '/api/summary': { get: { summary: 'Get summary statistics', responses: { '200': { description: 'Summary object' } } } },
    '/api/sessions': { get: { summary: 'Get all sessions', responses: { '200': { description: 'Sessions array' } } } },
    '/api/query': { get: { summary: 'Query sessions', parameters: [{ name: 'mode', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Filtered sessions' } } } }
  }
};

function loadData() {
  try {
    const data = fs.readFileSync(LOG_PATH, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error(`Error loading data from ${LOG_PATH}:`, e.message);
    return { sessions: [], summary: {} };
  }
}

http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Serve dashboard at root
  if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/index.html') {
    res.setHeader('Content-Type', 'text/html');
    try {
      const html = fs.readFileSync(DASHBOARD_PATH, 'utf8');
      res.writeHead(200);
      res.end(html);
    } catch (e) {
      console.error('Error loading dashboard:', e);
      res.writeHead(500);
      res.end('Error loading dashboard');
    }
    return;
  }

  // Set CORS headers for all responses
  setCORSHeaders(res);
  res.setHeader('Content-Type', 'application/json');

  // Health endpoint
  if (parsedUrl.pathname === '/api/health' && req.method === 'GET') {
    const data = loadData();
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      sessions: data.sessions?.length || 0,
      last_updated: data.generated_at || null
    }));
    return;
  }

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
  console.log(`BobWatch API running on port ${PORT}`);
});


// Made with Bob
