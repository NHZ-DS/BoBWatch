/**
 * BobWatch Dashboard Enhancements
 * Integrates advanced features into the existing dashboard
 */

// Load the advanced features module
const advancedFeatures = new BobWatchAdvancedFeatures();

// Enhanced dashboard state
const dashboardState = {
  currentView: 'overview',
  insights: [],
  predictions: {},
  anomalies: [],
  comparisons: null,
  searchQuery: ''
};

/**
 * Initialize enhanced dashboard features
 */
function initEnhancedDashboard() {
  // Add insights panel to dashboard
  addInsightsPanel();
  
  // Add predictions panel
  addPredictionsPanel();
  
  // Add anomalies alert
  addAnomaliesAlert();
  
  // Add export functionality
  addExportButton();
  
  // Add keyboard shortcuts
  setupKeyboardShortcuts();
  
  // Add search functionality
  addSearchBar();
  
  console.log('✨ BobWatch enhanced features initialized');
}

/**
 * Add AI Insights Panel
 */
function addInsightsPanel() {
  const auditLog = document.getElementById('audit-log');
  if (!auditLog) return;
  
  const insightsPanel = document.createElement('div');
  insightsPanel.id = 'insights-panel';
  insightsPanel.className = 'panel';
  insightsPanel.style.marginBottom = '24px';
  insightsPanel.innerHTML = `
    <div class="panel-header">
      <div class="panel-title">
        <span>💡</span>
        <span>AI Insights & Recommendations</span>
      </div>
      <a href="#" class="panel-action" onclick="toggleInsights(); return false;">
        <span id="insights-toggle">Show</span>
      </a>
    </div>
    <div id="insights-content" style="display: none; padding: 16px;">
      <div id="insights-list"></div>
    </div>
  `;
  
  auditLog.parentNode.insertBefore(insightsPanel, auditLog);
}

/**
 * Add Predictions Panel
 */
function addPredictionsPanel() {
  const metricsGrid = document.querySelector('.metrics-grid');
  if (!metricsGrid) return;
  
  const predictionsCard = document.createElement('div');
  predictionsCard.className = 'metric-card';
  predictionsCard.style.gridColumn = 'span 2';
  predictionsCard.innerHTML = `
    <span class="metric-icon">🔮</span>
    <div class="metric-label">Cost Predictions</div>
    <div id="predictions-summary" style="font-size: 12px; margin-top: 8px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>Next Session:</span>
        <strong id="pred-next">$0.00</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>Daily Est:</span>
        <strong id="pred-daily">$0.00</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>Monthly Est:</span>
        <strong id="pred-monthly">$0.00</strong>
      </div>
    </div>
    <div class="metric-change" id="pred-confidence">--</div>
  `;
  
  metricsGrid.appendChild(predictionsCard);
}

/**
 * Add Anomalies Alert
 */
function addAnomaliesAlert() {
  const header = document.querySelector('.header-content');
  if (!header) return;
  
  const alertBadge = document.createElement('div');
  alertBadge.id = 'anomalies-badge';
  alertBadge.style.cssText = `
    padding: 6px 12px;
    background: rgba(244, 67, 54, 0.2);
    color: #f44336;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    display: none;
    cursor: pointer;
  `;
  alertBadge.onclick = () => showAnomaliesModal();
  
  header.appendChild(alertBadge);
}

/**
 * Add Export Button
 */
function addExportButton() {
  const panelActions = document.querySelectorAll('.panel-action');
  if (panelActions.length === 0) return;
  
  const exportBtn = document.createElement('a');
  exportBtn.href = '#';
  exportBtn.className = 'panel-action';
  exportBtn.innerHTML = '📥 Export';
  exportBtn.onclick = (e) => {
    e.preventDefault();
    showExportModal();
  };
  
  panelActions[0].parentNode.appendChild(exportBtn);
}

/**
 * Setup Keyboard Shortcuts
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+R or Cmd+R - Refresh
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      refreshData();
    }
    
    // Ctrl+E or Cmd+E - Export
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      showExportModal();
    }
    
    // Ctrl+I or Cmd+I - Toggle Insights
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      toggleInsights();
    }
    
    // Escape - Close modals
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });
  
  console.log('⌨️ Keyboard shortcuts enabled: Ctrl+R (refresh), Ctrl+E (export), Ctrl+I (insights)');
}

/**
 * Add Search Bar
 */
function addSearchBar() {
  const auditLog = document.getElementById('audit-log');
  if (!auditLog) return;
  
  const searchContainer = document.createElement('div');
  searchContainer.style.cssText = 'margin-bottom: 16px;';
  searchContainer.innerHTML = `
    <input 
      type="text" 
      id="audit-search" 
      placeholder="🔍 Search audit log..."
      style="
        width: 100%;
        padding: 10px 12px;
        background: var(--vscode-input-background, #3c3c3c);
        border: 1px solid var(--vscode-input-border, #3c3c3c);
        border-radius: 4px;
        color: var(--vscode-input-foreground, #cccccc);
        font-size: 13px;
      "
    />
  `;
  
  auditLog.parentNode.insertBefore(searchContainer, auditLog);
  
  document.getElementById('audit-search').addEventListener('input', (e) => {
    dashboardState.searchQuery = e.target.value.toLowerCase();
    filterAuditLog();
  });
}

/**
 * Update dashboard with enhanced features
 */
function updateEnhancedDashboard(sessionData) {
  if (!sessionData || !sessionData.sessions) return;
  
  // Generate insights
  dashboardState.insights = advancedFeatures.generateInsights(sessionData.sessions);
  updateInsightsPanel();
  
  // Generate predictions
  dashboardState.predictions = advancedFeatures.predictCosts(sessionData.sessions);
  updatePredictionsPanel();
  
  // Detect anomalies
  dashboardState.anomalies = advancedFeatures.detectAnomalies(sessionData.sessions);
  updateAnomaliesBadge();
  
  // Generate comparisons
  dashboardState.comparisons = advancedFeatures.compareAnalytics(sessionData.sessions, 'mode');
}

/**
 * Update Insights Panel
 */
function updateInsightsPanel() {
  const insightsList = document.getElementById('insights-list');
  if (!insightsList) return;
  
  if (dashboardState.insights.length === 0) {
    insightsList.innerHTML = '<p style="color: var(--vscode-descriptionForeground); text-align: center; padding: 20px;">No insights available yet. Add more sessions for AI analysis.</p>';
    return;
  }
  
  const insightsHTML = dashboardState.insights.map(insight => `
    <div style="
      background: var(--vscode-editor-background, #1e1e1e);
      border-left: 4px solid ${getSeverityColor(insight.severity)};
      padding: 12px;
      margin-bottom: 12px;
      border-radius: 4px;
    ">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
        <strong style="font-size: 13px;">${insight.title}</strong>
        <span style="
          font-size: 10px;
          padding: 3px 8px;
          background: ${getSeverityColor(insight.severity)}22;
          color: ${getSeverityColor(insight.severity)};
          border-radius: 10px;
          text-transform: uppercase;
          font-weight: 600;
        ">${insight.severity}</span>
      </div>
      <p style="font-size: 12px; color: var(--vscode-descriptionForeground); margin-bottom: 8px; line-height: 1.5;">
        ${insight.message}
      </p>
      <div style="font-size: 11px; color: var(--vscode-descriptionForeground); padding-top: 8px; border-top: 1px solid var(--vscode-panel-border);">
        <div style="margin-bottom: 4px;">💡 <strong>Impact:</strong> ${insight.impact}</div>
        <div>🎯 <strong>Action:</strong> ${insight.action}</div>
      </div>
    </div>
  `).join('');
  
  insightsList.innerHTML = insightsHTML;
}

/**
 * Update Predictions Panel
 */
function updatePredictionsPanel() {
  const pred = dashboardState.predictions;
  
  const nextEl = document.getElementById('pred-next');
  const dailyEl = document.getElementById('pred-daily');
  const monthlyEl = document.getElementById('pred-monthly');
  const confidenceEl = document.getElementById('pred-confidence');
  
  if (nextEl) nextEl.textContent = `$${pred.nextSession?.toFixed(4) || '0.00'}`;
  if (dailyEl) dailyEl.textContent = `$${pred.daily?.toFixed(2) || '0.00'}`;
  if (monthlyEl) monthlyEl.textContent = `$${pred.monthly?.toFixed(2) || '0.00'}`;
  if (confidenceEl) {
    confidenceEl.textContent = `${pred.confidence || 0}% confidence • ${pred.trend || 'stable'}`;
    confidenceEl.className = 'metric-change';
  }
}

/**
 * Update Anomalies Badge
 */
function updateAnomaliesBadge() {
  const badge = document.getElementById('anomalies-badge');
  if (!badge) return;
  
  if (dashboardState.anomalies.length > 0) {
    badge.textContent = `⚠️ ${dashboardState.anomalies.length} Anomalies Detected`;
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }
}

/**
 * Toggle Insights Panel
 */
function toggleInsights() {
  const content = document.getElementById('insights-content');
  const toggle = document.getElementById('insights-toggle');
  
  if (content.style.display === 'none') {
    content.style.display = 'block';
    toggle.textContent = 'Hide';
  } else {
    content.style.display = 'none';
    toggle.textContent = 'Show';
  }
}

/**
 * Show Anomalies Modal
 */
function showAnomaliesModal() {
  const modal = createModal('Detected Anomalies', generateAnomaliesHTML());
  document.body.appendChild(modal);
}

/**
 * Show Export Modal
 */
function showExportModal() {
  const exportHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <button onclick="exportData('json')" style="
        padding: 12px;
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        text-align: left;
        font-size: 13px;
      ">
        📄 Export as JSON
      </button>
      <button onclick="exportData('csv')" style="
        padding: 12px;
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        text-align: left;
        font-size: 13px;
      ">
        📊 Export as CSV
      </button>
      <button onclick="exportData('report')" style="
        padding: 12px;
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        text-align: left;
        font-size: 13px;
      ">
        📋 Generate Executive Report
      </button>
      <button onclick="exportData('markdown')" style="
        padding: 12px;
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        text-align: left;
        font-size: 13px;
      ">
        📝 Export as Markdown
      </button>
    </div>
  `;
  
  const modal = createModal('Export Dashboard Data', exportHTML);
  document.body.appendChild(modal);
}

/**
 * Export Data
 */
function exportData(format) {
  if (!window.sessionData) {
    alert('No data available to export');
    return;
  }
  
  let content, filename, mimeType;
  
  switch(format) {
    case 'json':
      content = JSON.stringify(window.sessionData, null, 2);
      filename = 'bobwatch-export.json';
      mimeType = 'application/json';
      break;
      
    case 'csv':
      content = convertToCSV(window.sessionData.sessions);
      filename = 'bobwatch-export.csv';
      mimeType = 'text/csv';
      break;
      
    case 'report':
      content = generateExecutiveReport();
      filename = 'bobwatch-report.txt';
      mimeType = 'text/plain';
      break;
      
    case 'markdown':
      content = generateMarkdownReport();
      filename = 'bobwatch-report.md';
      mimeType = 'text/markdown';
      break;
  }
  
  downloadFile(content, filename, mimeType);
  closeAllModals();
}

/**
 * Convert to CSV
 */
function convertToCSV(sessions) {
  const headers = ['Session ID', 'Task ID', 'Timestamp', 'Mode', 'Tokens', 'API Cost', 'Cache Hits', 'Events'];
  const rows = sessions.map(s => [
    s.session_id || s.file || '',
    s.task_id || s.metadata?.task_id || '',
    s.timestamp || '',
    s.metadata?.mode || s.mode || '',
    s.metadata?.tokens_used || s.tokens || 0,
    s.metadata?.api_cost || s.api_cost || 0,
    s.metadata?.cache_hits || s.cache_hits || 0,
    s.events?.length || 0
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

/**
 * Generate Executive Report
 */
function generateExecutiveReport() {
  const data = window.sessionData;
  const insights = dashboardState.insights;
  const predictions = dashboardState.predictions;
  const anomalies = dashboardState.anomalies;
  
  return `
BobWatch Executive Report
Generated: ${new Date().toISOString()}

═══════════════════════════════════════════════════════════

EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════════

Total Sessions: ${data.summary.total_sessions}
Total Tokens: ${data.summary.total_tokens.toLocaleString()}
Total Cost: $${data.summary.total_cost.toFixed(4)}
Average Cost per Session: $${(data.summary.total_cost / data.summary.total_sessions).toFixed(4)}

═══════════════════════════════════════════════════════════

COST PREDICTIONS
═══════════════════════════════════════════════════════════

Next Session: $${predictions.nextSession?.toFixed(4) || '0.00'}
Daily Estimate: $${predictions.daily?.toFixed(2) || '0.00'}
Monthly Estimate: $${predictions.monthly?.toFixed(2) || '0.00'}
Trend: ${predictions.trend || 'stable'} (${predictions.trendPercentage?.toFixed(1) || '0'}%)
Confidence: ${predictions.confidence || 0}%

═══════════════════════════════════════════════════════════

KEY INSIGHTS (${insights.length})
═══════════════════════════════════════════════════════════

${insights.map((insight, i) => `
${i + 1}. [${insight.severity.toUpperCase()}] ${insight.title}
   
   ${insight.message}
   
   💡 Impact: ${insight.impact}
   🎯 Action: ${insight.action}
`).join('\n')}

═══════════════════════════════════════════════════════════

ANOMALIES DETECTED (${anomalies.length})
═══════════════════════════════════════════════════════════

${anomalies.length > 0 ? anomalies.map((anomaly, i) => `
${i + 1}. [${anomaly.severity.toUpperCase()}] ${anomaly.type.replace(/-/g, ' ').toUpperCase()}
   ${anomaly.message}
   Session: ${anomaly.session}
`).join('\n') : 'No anomalies detected.'}

═══════════════════════════════════════════════════════════

RECOMMENDATIONS
═══════════════════════════════════════════════════════════

1. Review high-cost sessions for optimization opportunities
2. Improve cache hit rate through consistent context management
3. Address recurring flag patterns to prevent future issues
4. Consider mode selection strategy for better efficiency
5. Monitor anomalies and investigate root causes

═══════════════════════════════════════════════════════════

Generated by BobWatch - AI Governance Dashboard
  `.trim();
}

/**
 * Generate Markdown Report
 */
function generateMarkdownReport() {
  const data = window.sessionData;
  const insights = dashboardState.insights;
  const predictions = dashboardState.predictions;
  
  return `
# BobWatch Report

**Generated:** ${new Date().toISOString()}

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Sessions | ${data.summary.total_sessions} |
| Total Tokens | ${data.summary.total_tokens.toLocaleString()} |
| Total Cost | $${data.summary.total_cost.toFixed(4)} |
| Avg Cost/Session | $${(data.summary.total_cost / data.summary.total_sessions).toFixed(4)} |

## Cost Predictions

| Period | Estimated Cost | Confidence |
|--------|---------------|------------|
| Next Session | $${predictions.nextSession?.toFixed(4) || '0.00'} | ${predictions.confidence || 0}% |
| Daily | $${predictions.daily?.toFixed(2) || '0.00'} | - |
| Monthly | $${predictions.monthly?.toFixed(2) || '0.00'} | - |

**Trend:** ${predictions.trend || 'stable'} (${predictions.trendPercentage?.toFixed(1) || '0'}%)

## Key Insights

${insights.map((insight, i) => `
### ${i + 1}. ${insight.title}

**Severity:** ${insight.severity.toUpperCase()}

${insight.message}

- **Impact:** ${insight.impact}
- **Action:** ${insight.action}
`).join('\n')}

## Recommendations

1. Review high-cost sessions for optimization opportunities
2. Improve cache hit rate through consistent context management
3. Address recurring flag patterns to prevent future issues
4. Consider mode selection strategy for better efficiency

---

*Generated by BobWatch - AI Governance Dashboard*
  `.trim();
}

/**
 * Download File
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log(`✅ Exported: ${filename}`);
}

/**
 * Filter Audit Log
 */
function filterAuditLog() {
  const query = dashboardState.searchQuery;
  const items = document.querySelectorAll('.audit-item');
  
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(query) ? 'block' : 'none';
  });
}

/**
 * Generate Anomalies HTML
 */
function generateAnomaliesHTML() {
  if (dashboardState.anomalies.length === 0) {
    return '<p style="text-align: center; padding: 20px; color: var(--vscode-descriptionForeground);">No anomalies detected. All systems normal.</p>';
  }
  
  return dashboardState.anomalies.map(anomaly => `
    <div style="
      background: var(--vscode-editor-background);
      border-left: 4px solid ${getSeverityColor(anomaly.severity)};
      padding: 12px;
      margin-bottom: 12px;
      border-radius: 4px;
    ">
      <div style="font-size: 10px; text-transform: uppercase; color: var(--vscode-descriptionForeground); margin-bottom: 4px;">
        ${anomaly.type.replace(/-/g, ' ')}
      </div>
      <div style="font-size: 13px; font-weight: 600; margin-bottom: 4px;">
        ${anomaly.message}
      </div>
      <div style="font-size: 11px; color: var(--vscode-descriptionForeground);">
        Session: ${anomaly.session}
      </div>
    </div>
  `).join('');
}

/**
 * Create Modal
 */
function createModal(title, content) {
  const modal = document.createElement('div');
  modal.className = 'bobwatch-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  modal.innerHTML = `
    <div style="
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 8px;
      padding: 24px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: 700;">${title}</h2>
        <button onclick="this.closest('.bobwatch-modal').remove()" style="
          background: none;
          border: none;
          color: var(--vscode-foreground);
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
        ">×</button>
      </div>
      <div>${content}</div>
    </div>
  `;
  
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
  
  return modal;
}

/**
 * Close All Modals
 */
function closeAllModals() {
  document.querySelectorAll('.bobwatch-modal').forEach(modal => modal.remove());
}

/**
 * Get Severity Color
 */
function getSeverityColor(severity) {
  const colors = {
    critical: '#f44336',
    high: '#f44336',
    medium: '#ff9800',
    low: '#2196f3',
    info: '#4caf50'
  };
  return colors[severity] || '#858585';
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEnhancedDashboard);
} else {
  initEnhancedDashboard();
}

// Export functions for global access
window.toggleInsights = toggleInsights;
window.showAnomaliesModal = showAnomaliesModal;
window.showExportModal = showExportModal;
window.exportData = exportData;
window.updateEnhancedDashboard = updateEnhancedDashboard;

console.log('🚀 BobWatch Dashboard Enhancements Loaded');

// Made with Bob
