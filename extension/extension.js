const vscode = require('vscode');
const fs = require('fs').promises;
const path = require('path');
const { parseSessionDirectory, generateSessionLog } = require('../parser/session-reader');

class BobWatchViewProvider {
  constructor(extensionUri) {
    this._extensionUri = extensionUri;
    this._view = null;
  }

  resolveWebviewView(webviewView) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    
    this._loadDashboard(webviewView.webview);
    webviewView.webview.onDidReceiveMessage(msg => {
      if (msg.command === 'getData') this.sendData();
    });
  }

  async _loadDashboard(webview) {
    const htmlPath = path.join(__dirname, '../dashboard/index.html');
    let html = await fs.readFile(htmlPath, 'utf8');
    webview.html = html;
  }

  async sendData() {
    if (!this._view) return;
    try {
      const workspaceFolder = vscode.workspace.workspaceFolders[0];
      const logPath = path.join(workspaceFolder.uri.fsPath, '.bobwatch/session-log.json');
      const data = JSON.parse(await fs.readFile(logPath, 'utf8'));
      this._view.webview.postMessage({ type: 'update', data });
    } catch (error) {
      console.error('Failed to send data:', error);
    }
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
}

function deactivate() {}

module.exports = { activate, deactivate };

// Made with Bob
