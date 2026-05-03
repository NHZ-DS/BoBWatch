# BobWatch Testing Guide for Beginners

This guide will help you test BobWatch step-by-step, even if you're new to coding!

## Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js installed (check by running `node --version` in terminal)
- ✅ VS Code installed
- ✅ BobWatch project folder open in VS Code

---

## Test 1: Parser (Reads Bob's Session Files)

### Step 1.1: Check if test session file exists

Open terminal in VS Code (View → Terminal) and run:

```bash
dir bob_sessions
```

You should see `test_session_001.md` in the list.

### Step 1.2: Run the parser

```bash
node parser/session-reader.js
```

**Expected output:**
```
✓ Parsed 1 sessions → ./.bobwatch/session-log.json
```

### Step 1.3: Verify the output file was created

```bash
dir .bobwatch
```

You should see `session-log.json` file.

### Step 1.4: Check the content

```bash
type .bobwatch\session-log.json
```

You should see JSON data with:
- `sessions` array
- `summary` object with `total_tokens`, `total_cost`, etc.

**✅ If you see this, the parser works!**

---

## Test 2: Dashboard (Visual Interface)

### Step 2.1: Open dashboard test file in browser

1. Right-click on `dashboard/test-dashboard.html` in VS Code Explorer
2. Select "Open with Live Server" (if you have Live Server extension)
   
   OR
   
3. Double-click `dashboard/test-dashboard.html` to open in your default browser

### Step 2.2: What you should see

The dashboard should display:

1. **Header**: "🔍 BobWatch" with session duration
2. **4 Metric Cards**:
   - Total Tokens: 35,690
   - API Cost: $0.06
   - Files Touched: 3
   - Flags Raised: 1

3. **Mode Breakdown**: Colored bar showing different modes
4. **Audit Log**: List of 3 tasks with details
5. **Cost per Task**: Bar chart showing token usage
6. **Latest Audit Summary**: Text description

### Step 2.3: Check browser console for errors

1. Press `F12` to open Developer Tools
2. Click "Console" tab
3. Look for any red error messages

**✅ If you see the dashboard with data and no errors, it works!**

---

## Test 3: VS Code Extension (Side Panel)

### Step 3.1: Open Extension Development Host

1. In VS Code, press `F5` (or Run → Start Debugging)
2. A new VS Code window will open (this is the Extension Development Host)
3. Wait for it to fully load

### Step 3.2: Find BobWatch panel

In the new window:
1. Click the Explorer icon (📁) in the left sidebar
2. Scroll down in the Explorer
3. Look for "BOBWATCH" section

### Step 3.3: Check if dashboard loads

You should see the BobWatch dashboard inside VS Code's sidebar.

**Common Issues:**
- If you don't see BOBWATCH section, close the Extension Development Host and press F5 again
- If you see errors, check the Debug Console (View → Debug Console)

**✅ If you see the dashboard in VS Code sidebar, the extension works!**

---

## Test 4: API Server (For watsonx Integration)

### Step 4.1: Start the API server

In VS Code terminal, run:

```bash
node watsonx-orchestrate/api-server.js
```

**Expected output:**
```
BobWatch API running on http://localhost:3000
OpenAPI spec: http://localhost:3000/openapi.json
```

**Note:** Keep this terminal running for the next steps.

### Step 4.2: Test API endpoints

Open a NEW terminal (Terminal → New Terminal) and test each endpoint:

**Test 1: Get summary**
```bash
curl http://localhost:3000/api/summary
```

**Expected:** JSON with `total_sessions`, `total_tokens`, `total_cost`

**Test 2: Get all sessions**
```bash
curl http://localhost:3000/api/sessions
```

**Expected:** JSON array with session objects

**Test 3: Query by mode**
```bash
curl "http://localhost:3000/api/query?mode=code"
```

**Expected:** JSON array with only code mode sessions

**Test 4: Get OpenAPI spec**
```bash
curl http://localhost:3000/openapi.json
```

**Expected:** JSON with OpenAPI specification

### Step 4.3: Test in browser

Open your browser and visit:
- http://localhost:3000/api/summary
- http://localhost:3000/api/sessions
- http://localhost:3000/openapi.json

You should see JSON data displayed.

**✅ If all endpoints return JSON data, the API works!**

---

## Troubleshooting Common Issues

### Issue 1: "node is not recognized"

**Solution:** Install Node.js from https://nodejs.org/

### Issue 2: Parser shows "no such file or directory"

**Solution:** Make sure you're in the BobWatch project folder:
```bash
cd "d:/IBM Bob/BoBWatch"
```

### Issue 3: Dashboard shows empty state

**Solution:** 
1. Run the parser first: `node parser/session-reader.js`
2. Make sure `bob_sessions/test_session_001.md` exists
3. Check if `.bobwatch/session-log.json` was created

### Issue 4: Extension doesn't appear in VS Code

**Solution:**
1. Close the Extension Development Host window
2. In main VS Code, press `Ctrl+Shift+P`
3. Type "Reload Window" and press Enter
4. Press `F5` again

### Issue 5: API returns empty data

**Solution:**
1. Stop the API server (Ctrl+C)
2. Run parser: `node parser/session-reader.js`
3. Start API again: `node watsonx-orchestrate/api-server.js`

### Issue 6: Port 3000 already in use

**Solution:**
1. Find what's using port 3000:
   ```bash
   netstat -ano | findstr :3000
   ```
2. Kill that process or change the port in `api-server.js`

---

## Quick Visual Test Checklist

Use this checklist to verify everything works:

### Parser ✅
- [ ] Command runs without errors
- [ ] Creates `.bobwatch/session-log.json`
- [ ] JSON file contains session data

### Dashboard ✅
- [ ] Opens in browser
- [ ] Shows 4 metric cards with numbers
- [ ] Shows colored mode breakdown bar
- [ ] Shows audit log with 3 entries
- [ ] Shows cost chart with bars
- [ ] No errors in browser console (F12)

### Extension ✅
- [ ] Extension Development Host opens
- [ ] BOBWATCH section appears in Explorer
- [ ] Dashboard loads in sidebar
- [ ] Shows same data as browser version
- [ ] No errors in Debug Console

### API ✅
- [ ] Server starts on port 3000
- [ ] `/api/summary` returns JSON
- [ ] `/api/sessions` returns array
- [ ] `/api/query?mode=code` filters correctly
- [ ] `/openapi.json` returns spec
- [ ] Browser can access all endpoints

---

## Next Steps After Testing

If all tests pass:
1. ✅ BobWatch is working correctly!
2. You can add more session files to `bob_sessions/`
3. Run parser again to update the dashboard
4. Use the VS Code extension for real-time monitoring

If some tests fail:
1. Check the Troubleshooting section above
2. Look at error messages carefully
3. Make sure all files are in the correct locations
4. Try running tests in order (Parser → Dashboard → Extension → API)

---

## Getting Help

If you're still stuck:
1. Check the error message in the terminal
2. Look at the browser console (F12) for errors
3. Review the main [README.md](README.md) for setup instructions
4. Check [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for detailed steps

---

**Remember:** Testing is done step-by-step. If one test fails, fix it before moving to the next!