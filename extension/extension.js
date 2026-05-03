const vscode = require('vscode');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const { parseSessionDirectory, generateSessionLog } = require('../parser/session-reader');

class BobWatchViewProvider {
  constructor(extensionUri) {
    this._extensionUri = extensionUri;
    this._view = null;
  }

  resolveWebviewView(webviewView) {
    this._view = webviewView;
    
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(this._extensionUri.fsPath, 'dashboard'))]
    };
    
    const htmlPath = path.join(this._extensionUri.fsPath, 'dashboard', 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // Fix resource URIs for VS Code webview
    const dashboardUri = webviewView.webview.asWebviewUri(
      vscode.Uri.file(path.join(this._extensionUri.fsPath, 'dashboard'))
    );
    html = html.replace(/src="/g, `src="${dashboardUri}/`);
    html = html.replace(/href="/g, `href="${dashboardUri}/`);
    
    webviewView.webview.html = html;
    
    console.log('[BobWatch] Webview loaded, sending initial data in 500ms...');
    
    // Send data after a short delay to ensure webview is ready
    setTimeout(() => {
      sendData(webviewView);
    }, 500);
    
    // Listen for messages from webview
    webviewView.webview.onDidReceiveMessage(message => {
      if (message.command === 'getData') {
        console.log('[BobWatch] Webview requested data refresh');
        sendData(webviewView);
      }
    });
  }
}

async function sendData(webviewView) {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    console.error('[BobWatch] No workspace folder found');
    return;
  }
  
  const sessionLogPath = path.join(workspaceRoot, '.bobwatch', 'session-log.json');
  
  console.log('[BobWatch] Attempting to load session data from:', sessionLogPath);
  
  // Check if session-log.json exists
  if (!fs.existsSync(sessionLogPath)) {
    console.log('[BobWatch] session-log.json not found, running parser...');
    
    // Run parser first
    const parserPath = path.join(workspaceRoot, 'parser', 'session-reader.js');
    if (fs.existsSync(parserPath)) {
      try {
        const { exec } = require('child_process');
        await new Promise((resolve, reject) => {
          exec(`node "${parserPath}"`, { cwd: workspaceRoot }, (error, stdout, stderr) => {
            if (error) {
              console.error('[BobWatch] Parser error:', error);
              reject(error);
            } else {
              console.log('[BobWatch] Parser output:', stdout);
              resolve();
            }
          });
        });
      } catch (error) {
        console.error('[BobWatch] Failed to run parser:', error);
        return;
      }
    }
  }
  
  // Now try to load the data
  if (fs.existsSync(sessionLogPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(sessionLogPath, 'utf8'));
      console.log('[BobWatch] Loaded session data:', data.summary);
      
      webviewView.webview.postMessage({
        command: 'updateData',
        data: data
      });
    } catch (error) {
      console.error('[BobWatch] Failed to read session-log.json:', error);
    }
  } else {
    console.log('[BobWatch] session-log.json still not found after parser run');
  }
}

async function parseAndUpdate() {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders[0];
    const sessionsDir = path.join(workspaceFolder.uri.fsPath, 'bob_sessions');
    const outputPath = path.join(workspaceFolder.uri.fsPath, '.bobwatch/session-log.json');
    
    const sessions = await parseSessionDirectory(sessionsDir);
    await generateSessionLog(sessions, outputPath);
    console.log(`BobWatch: Parsed ${sessions.length} sessions`);
  } catch (error) {
    console.error('BobWatch parse error:', error);
  }
}

function setupFileWatcher(provider) {
  const workspaceFolder = vscode.workspace.workspaceFolders[0];
  const pattern = new vscode.RelativePattern(workspaceFolder, 'bob_sessions/*.md');
  const watcher = vscode.workspace.createFileSystemWatcher(pattern);
  
  const update = async () => {
    await parseAndUpdate();
    provider.sendData();
  };
  
  watcher.onDidCreate(update);
  watcher.onDidChange(update);
  return watcher;
}

function activate(context) {
  console.log('BobWatch extension activated');
  
  const provider = new BobWatchViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('bobwatch.dashboard', provider)
  );
  
  context.subscriptions.push(setupFileWatcher(provider));
  parseAndUpdate();
  
  // Register "Run Parser" command
  let runParserCommand = vscode.commands.registerCommand('bobwatch.runParser', async () => {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
      vscode.window.showErrorMessage('No workspace folder open');
      return;
    }
    
    const parserPath = path.join(workspaceRoot, 'parser', 'session-reader.js');
    if (!fs.existsSync(parserPath)) {
      vscode.window.showErrorMessage('Parser not found at: ' + parserPath);
      return;
    }
    
    vscode.window.showInformationMessage('Running BobWatch parser...');
    
    const terminal = vscode.window.createTerminal('BobWatch Parser');
    terminal.show();
    terminal.sendText(`node "${parserPath}"`);
    
    // Refresh dashboard after 2 seconds
    setTimeout(() => {
      if (provider._view) {
        sendData(provider._view);
        vscode.window.showInformationMessage('BobWatch data refreshed');
      }
    }, 2000);
  });
  
  context.subscriptions.push(runParserCommand);
}

function deactivate() {}

module.exports = { activate, deactivate };

// Made with Bob
