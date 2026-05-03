# Importing BobWatch into watsonx Orchestrate

This guide shows how to integrate BobWatch's governance API with IBM watsonx Orchestrate, enabling natural language queries about Bob's activities.

## Prerequisites

- Node.js installed
- BobWatch project with session data in `.bobwatch/session-log.json`
- Access to IBM watsonx Orchestrate

## Step 1: Start the API Server

Navigate to your BobWatch project directory and start the API server:

```bash
node watsonx-orchestrate/api-server.js
```

You should see:
```
BobWatch API running on http://localhost:3000
OpenAPI spec: http://localhost:3000/openapi.json
```

The server will continue running and serving requests. Keep this terminal open.

## Step 2: Add Tool to watsonx Orchestrate

1. Open IBM watsonx Orchestrate in your browser
2. Navigate to **Toolset** section
3. Click **Add tool**
4. Select **OpenAPI** as the tool type

## Step 3: Import OpenAPI Specification

In the OpenAPI import dialog:

1. **Method 1 - Direct URL:**
   - Paste: `http://localhost:3000/openapi.json`
   - Click **Import**

2. **Method 2 - Copy/Paste:**
   - Open `http://localhost:3000/openapi.json` in your browser
   - Copy the entire JSON specification
   - Paste into watsonx Orchestrate's OpenAPI import field
   - Click **Import**

The tool will be registered as "BobWatch API" with three endpoints:
- `GET /api/summary` - Get summary statistics
- `GET /api/sessions` - Get all sessions
- `GET /api/query` - Query sessions with filters

## Step 4: Query Bob's Activities

Once the tool is imported, you can ask your watsonx Orchestrate agent natural language questions:

### Example Queries

**"What did Bob do this session?"**
- Agent will call `/api/sessions` and summarize recent activities

**"How much did Bob's work cost?"**
- Agent will call `/api/summary` and report total API cost

**"Show me all code mode sessions"**
- Agent will call `/api/query?mode=code` and list code-related tasks

**"What files did Bob modify?"**
- Agent will parse sessions and extract files_modified arrays

**"Were there any flags raised?"**
- Agent will check for flag fields in events

## API Endpoints Reference

### GET /api/summary
Returns aggregated statistics across all sessions.

**Response:**
```json
{
  "total_sessions": 3,
  "total_tokens": 35690,
  "total_cost": 0.06,
  "total_events": 3
}
```

### GET /api/sessions
Returns all session data with events.

**Response:**
```json
[
  {
    "file": "session_001.md",
    "timestamp": "2026-05-03T06:11:29.214Z",
    "task_name": "Create BobWatch Technical Plan",
    "tokens": 15234,
    "api_cost": 0.02,
    "events": [...]
  }
]
```

### GET /api/query?mode={mode}
Filters sessions by Bob mode.

**Parameters:**
- `mode` (optional): Filter by mode (code, plan, advanced, orchestrator, ask)

**Example:**
```bash
curl "http://localhost:3000/api/query?mode=code"
```

## Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Verify `.bobwatch/session-log.json` exists (run parser first)

### watsonx can't reach API
- Ensure API server is running
- Check firewall settings allow localhost:3000
- Try using your machine's IP address instead of localhost

### No data returned
- Run the parser: `node parser/session-reader.js`
- Verify `bob_sessions/` contains .md files
- Check `.bobwatch/session-log.json` has data

## Advanced Usage

### Custom Port

Edit `api-server.js` and change:
```javascript
const PORT = 3000; // Change to your preferred port
```

### CORS Configuration

The API allows all origins by default. To restrict:
```javascript
res.setHeader('Access-Control-Allow-Origin', 'https://your-watsonx-domain.com');
```

### Production Deployment

For production use, consider:
- Using a process manager (PM2, systemd)
- Adding authentication
- Enabling HTTPS
- Rate limiting

## Next Steps

- Explore more complex queries combining multiple endpoints
- Create custom watsonx skills for specific governance workflows
- Set up automated alerts based on flag detection
- Integrate with other enterprise tools via watsonx Orchestrate

---

**Need Help?**
- Check the main [README.md](../README.md) for project overview
- Review [PLAN.md](../PLAN.md) for architecture details
- See [IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md) for development info