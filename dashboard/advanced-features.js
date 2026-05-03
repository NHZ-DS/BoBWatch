/**
 * BobWatch Advanced Features Module
 * AI-powered insights, predictions, and analytics
 */

class BobWatchAdvancedFeatures {
  constructor() {
    this.sessionData = null;
    this.insights = [];
    this.predictions = {};
    this.anomalies = [];
  }

  /**
   * AI-Powered Insights Engine
   * Analyzes patterns and generates actionable recommendations
   */
  generateInsights(sessions) {
    const insights = [];
    
    if (!sessions || sessions.length === 0) return insights;

    // 1. Cost Optimization Insights
    const avgCost = sessions.reduce((sum, s) => sum + s.api_cost, 0) / sessions.length;
    const highCostSessions = sessions.filter(s => s.api_cost > avgCost * 1.5);
    
    if (highCostSessions.length > 0) {
      insights.push({
        type: 'cost-optimization',
        severity: 'medium',
        title: '💰 Cost Optimization Opportunity',
        message: `${highCostSessions.length} sessions exceeded average cost by 50%+. Consider breaking down complex tasks or using cache more effectively.`,
        impact: `Potential savings: $${(highCostSessions.reduce((sum, s) => sum + s.api_cost, 0) * 0.3).toFixed(4)}`,
        action: 'Review high-cost sessions for optimization opportunities'
      });
    }

    // 2. Mode Efficiency Analysis
    const modeStats = this.analyzeModeEfficiency(sessions);
    const inefficientMode = Object.entries(modeStats)
      .sort((a, b) => b[1].costPerToken - a[1].costPerToken)[0];
    
    if (inefficientMode && inefficientMode[1].sessions > 2) {
      insights.push({
        type: 'mode-efficiency',
        severity: 'low',
        title: '🎯 Mode Efficiency Insight',
        message: `${inefficientMode[0]} mode has higher cost-per-token ratio. Consider using ${this.suggestAlternativeMode(inefficientMode[0])} for similar tasks.`,
        impact: `Avg cost per 1K tokens: $${(inefficientMode[1].costPerToken * 1000).toFixed(4)}`,
        action: 'Evaluate mode selection strategy'
      });
    }

    // 3. Token Usage Patterns
    const tokenTrend = this.analyzeTokenTrend(sessions);
    if (tokenTrend.increasing && tokenTrend.rate > 0.2) {
      insights.push({
        type: 'token-trend',
        severity: 'high',
        title: '📈 Token Usage Increasing',
        message: `Token usage increased by ${(tokenTrend.rate * 100).toFixed(1)}% over recent sessions. This may indicate growing task complexity.`,
        impact: `Projected monthly increase: $${(tokenTrend.projectedCost).toFixed(2)}`,
        action: 'Review task scoping and context management'
      });
    }

    // 4. Cache Hit Rate Analysis
    const cacheRate = this.analyzeCacheEfficiency(sessions);
    if (cacheRate < 0.3) {
      insights.push({
        type: 'cache-optimization',
        severity: 'medium',
        title: '⚡ Low Cache Hit Rate',
        message: `Only ${(cacheRate * 100).toFixed(1)}% cache hit rate. Improve by maintaining consistent context and file references.`,
        impact: `Potential savings: $${(sessions.reduce((sum, s) => sum + s.api_cost, 0) * 0.2).toFixed(4)}`,
        action: 'Optimize prompt structure for better caching'
      });
    }

    // 5. Flag Pattern Detection
    const flagPatterns = this.detectFlagPatterns(sessions);
    if (flagPatterns.recurring.length > 0) {
      insights.push({
        type: 'flag-pattern',
        severity: 'high',
        title: '⚠️ Recurring Issues Detected',
        message: `${flagPatterns.recurring.length} flag types appear repeatedly. Address root causes to prevent future occurrences.`,
        impact: `Affected sessions: ${flagPatterns.affectedCount}`,
        action: 'Review and resolve recurring flag patterns'
      });
    }

    // 6. Productivity Insights
    const productivity = this.analyzeProductivity(sessions);
    if (productivity.filesPerSession < 2) {
      insights.push({
        type: 'productivity',
        severity: 'low',
        title: '📊 Productivity Insight',
        message: `Average ${productivity.filesPerSession.toFixed(1)} files modified per session. Consider batching related changes.`,
        impact: `Efficiency score: ${productivity.score}/100`,
        action: 'Group related file modifications'
      });
    }

    // 7. Time-based Patterns
    const timePatterns = this.analyzeTimePatterns(sessions);
    if (timePatterns.peakHours.length > 0) {
      insights.push({
        type: 'time-pattern',
        severity: 'info',
        title: '⏰ Usage Pattern Detected',
        message: `Peak activity during ${timePatterns.peakHours.join(', ')}. ${timePatterns.recommendation}`,
        impact: `${timePatterns.sessionsInPeak} sessions during peak hours`,
        action: 'Optimize scheduling for complex tasks'
      });
    }

    return insights;
  }

  /**
   * Real-time Cost Prediction
   * Predicts future costs based on current trends
   */
  predictCosts(sessions) {
    if (!sessions || sessions.length < 3) {
      return {
        nextSession: 0,
        daily: 0,
        weekly: 0,
        monthly: 0,
        confidence: 0
      };
    }

    // Use exponential moving average for prediction
    const recentSessions = sessions.slice(-10);
    const weights = recentSessions.map((_, i) => Math.exp(i / recentSessions.length));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    const weightedAvgCost = recentSessions.reduce((sum, s, i) => 
      sum + (s.api_cost * weights[i]), 0) / totalWeight;

    // Calculate trend
    const trend = this.calculateTrend(recentSessions.map(s => s.api_cost));
    
    // Predict with trend adjustment
    const nextSession = weightedAvgCost * (1 + trend);
    const avgSessionsPerDay = this.estimateSessionsPerDay(sessions);
    
    return {
      nextSession: Math.max(0, nextSession),
      daily: nextSession * avgSessionsPerDay,
      weekly: nextSession * avgSessionsPerDay * 7,
      monthly: nextSession * avgSessionsPerDay * 30,
      confidence: Math.min(95, sessions.length * 10), // Higher confidence with more data
      trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
      trendPercentage: Math.abs(trend * 100)
    };
  }

  /**
   * Anomaly Detection
   * Identifies unusual patterns in session data
   */
  detectAnomalies(sessions) {
    const anomalies = [];
    
    if (!sessions || sessions.length < 5) return anomalies;

    // Calculate statistical baselines
    const costs = sessions.map(s => s.api_cost);
    const tokens = sessions.map(s => s.tokens);
    
    const costMean = this.mean(costs);
    const costStdDev = this.stdDev(costs, costMean);
    const tokenMean = this.mean(tokens);
    const tokenStdDev = this.stdDev(tokens, tokenMean);

    sessions.forEach((session, index) => {
      // Cost anomalies (3 sigma rule)
      if (Math.abs(session.api_cost - costMean) > 3 * costStdDev) {
        anomalies.push({
          type: 'cost-spike',
          severity: session.api_cost > costMean ? 'high' : 'low',
          session: session.file,
          message: `Unusual cost: $${session.api_cost.toFixed(4)} (${((session.api_cost / costMean - 1) * 100).toFixed(0)}% ${session.api_cost > costMean ? 'above' : 'below'} average)`,
          timestamp: session.timestamp
        });
      }

      // Token anomalies
      if (Math.abs(session.tokens - tokenMean) > 3 * tokenStdDev) {
        anomalies.push({
          type: 'token-spike',
          severity: 'medium',
          session: session.file,
          message: `Unusual token usage: ${session.tokens.toLocaleString()} tokens (${((session.tokens / tokenMean - 1) * 100).toFixed(0)}% ${session.tokens > tokenMean ? 'above' : 'below'} average)`,
          timestamp: session.timestamp
        });
      }

      // Efficiency anomalies (cost per token)
      const costPerToken = session.api_cost / session.tokens;
      const avgCostPerToken = costMean / tokenMean;
      if (costPerToken > avgCostPerToken * 2) {
        anomalies.push({
          type: 'efficiency-drop',
          severity: 'medium',
          session: session.file,
          message: `Low efficiency: $${(costPerToken * 1000).toFixed(4)} per 1K tokens (2x normal rate)`,
          timestamp: session.timestamp
        });
      }

      // Flag anomalies
      if (session.events) {
        const flagCount = session.events.filter(e => e.flag && e.flag !== 'none').length;
        if (flagCount > 2) {
          anomalies.push({
            type: 'multiple-flags',
            severity: 'high',
            session: session.file,
            message: `${flagCount} flags raised in single session - review for systemic issues`,
            timestamp: session.timestamp
          });
        }
      }
    });

    return anomalies.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Comparative Analytics
   * Compare sessions, modes, and time periods
   */
  compareAnalytics(sessions, comparisonType = 'mode') {
    if (!sessions || sessions.length === 0) return null;

    switch (comparisonType) {
      case 'mode':
        return this.compareModes(sessions);
      case 'time':
        return this.compareTimePeriods(sessions);
      case 'efficiency':
        return this.compareEfficiency(sessions);
      default:
        return null;
    }
  }

  compareModes(sessions) {
    const modeGroups = {};
    
    sessions.forEach(session => {
      const mode = session.mode || 'unknown';
      if (!modeGroups[mode]) {
        modeGroups[mode] = {
          sessions: [],
          totalCost: 0,
          totalTokens: 0,
          totalEvents: 0,
          flags: 0
        };
      }
      
      modeGroups[mode].sessions.push(session);
      modeGroups[mode].totalCost += session.api_cost;
      modeGroups[mode].totalTokens += session.tokens;
      modeGroups[mode].totalEvents += session.event_count || 0;
      
      if (session.events) {
        modeGroups[mode].flags += session.events.filter(e => e.flag && e.flag !== 'none').length;
      }
    });

    // Calculate metrics for each mode
    const comparison = Object.entries(modeGroups).map(([mode, data]) => ({
      mode,
      sessionCount: data.sessions.length,
      avgCost: data.totalCost / data.sessions.length,
      avgTokens: data.totalTokens / data.sessions.length,
      costPerToken: data.totalCost / data.totalTokens,
      avgEvents: data.totalEvents / data.sessions.length,
      flagRate: data.flags / data.sessions.length,
      totalCost: data.totalCost,
      efficiency: this.calculateEfficiencyScore(data)
    }));

    return comparison.sort((a, b) => b.sessionCount - a.sessionCount);
  }

  compareTimePeriods(sessions) {
    const now = new Date();
    const periods = {
      today: [],
      yesterday: [],
      thisWeek: [],
      lastWeek: [],
      thisMonth: [],
      lastMonth: []
    };

    sessions.forEach(session => {
      const sessionDate = new Date(session.timestamp);
      const daysDiff = Math.floor((now - sessionDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) periods.today.push(session);
      if (daysDiff === 1) periods.yesterday.push(session);
      if (daysDiff < 7) periods.thisWeek.push(session);
      if (daysDiff >= 7 && daysDiff < 14) periods.lastWeek.push(session);
      if (daysDiff < 30) periods.thisMonth.push(session);
      if (daysDiff >= 30 && daysDiff < 60) periods.lastMonth.push(session);
    });

    return Object.entries(periods).map(([period, sessions]) => ({
      period,
      sessionCount: sessions.length,
      totalCost: sessions.reduce((sum, s) => sum + s.api_cost, 0),
      totalTokens: sessions.reduce((sum, s) => sum + s.tokens, 0),
      avgCost: sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.api_cost, 0) / sessions.length : 0
    }));
  }

  // Helper methods
  analyzeModeEfficiency(sessions) {
    const modeStats = {};
    sessions.forEach(s => {
      const mode = s.mode || 'unknown';
      if (!modeStats[mode]) {
        modeStats[mode] = { sessions: 0, totalCost: 0, totalTokens: 0 };
      }
      modeStats[mode].sessions++;
      modeStats[mode].totalCost += s.api_cost;
      modeStats[mode].totalTokens += s.tokens;
    });

    Object.keys(modeStats).forEach(mode => {
      modeStats[mode].costPerToken = modeStats[mode].totalCost / modeStats[mode].totalTokens;
    });

    return modeStats;
  }

  suggestAlternativeMode(currentMode) {
    const alternatives = {
      'code': 'plan (for design) or ask (for questions)',
      'plan': 'code (for implementation)',
      'advanced': 'code (if MCP not needed)',
      'orchestrator': 'code (for simpler tasks)',
      'ask': 'plan (for strategic thinking)'
    };
    return alternatives[currentMode] || 'a more efficient mode';
  }

  analyzeTokenTrend(sessions) {
    if (sessions.length < 3) return { increasing: false, rate: 0 };
    
    const recent = sessions.slice(-5);
    const older = sessions.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, s) => sum + s.tokens, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, s) => sum + s.tokens, 0) / older.length : recentAvg;
    
    const rate = (recentAvg - olderAvg) / olderAvg;
    const projectedCost = rate > 0 ? (recentAvg * rate * 0.000002 * 30) : 0;
    
    return {
      increasing: rate > 0.1,
      rate,
      projectedCost
    };
  }

  analyzeCacheEfficiency(sessions) {
    const totalTokens = sessions.reduce((sum, s) => sum + s.tokens, 0);
    const totalCache = sessions.reduce((sum, s) => sum + (s.cache_hits || 0), 0);
    return totalCache / totalTokens;
  }

  detectFlagPatterns(sessions) {
    const flagCounts = {};
    let affectedCount = 0;

    sessions.forEach(session => {
      if (session.events) {
        const hasFlags = session.events.some(e => e.flag && e.flag !== 'none');
        if (hasFlags) affectedCount++;
        
        session.events.forEach(event => {
          if (event.flag && event.flag !== 'none') {
            flagCounts[event.flag] = (flagCounts[event.flag] || 0) + 1;
          }
        });
      }
    });

    const recurring = Object.entries(flagCounts)
      .filter(([_, count]) => count > 2)
      .map(([flag, count]) => ({ flag, count }));

    return { recurring, affectedCount };
  }

  analyzeProductivity(sessions) {
    const totalFiles = sessions.reduce((sum, s) => {
      if (s.events) {
        return sum + s.events.reduce((fileSum, e) => 
          fileSum + (e.files_affected?.length || 0), 0);
      }
      return sum;
    }, 0);

    const filesPerSession = totalFiles / sessions.length;
    const score = Math.min(100, Math.floor(filesPerSession * 30 + 40));

    return { filesPerSession, score };
  }

  analyzeTimePatterns(sessions) {
    const hourCounts = new Array(24).fill(0);
    
    sessions.forEach(session => {
      const hour = new Date(session.timestamp).getHours();
      hourCounts[hour]++;
    });

    const maxCount = Math.max(...hourCounts);
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(h => h.count === maxCount && maxCount > 1)
      .map(h => `${h.hour}:00-${h.hour + 1}:00`);

    const sessionsInPeak = maxCount * peakHours.length;
    const recommendation = peakHours.length > 0 
      ? 'Consider scheduling complex tasks during off-peak hours for better resource availability'
      : 'Usage is evenly distributed';

    return { peakHours, sessionsInPeak, recommendation };
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, v) => sum + v, 0);
    const sumXY = values.reduce((sum, v, i) => sum + (i * v), 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgY = sumY / n;
    
    return slope / avgY; // Normalized trend
  }

  estimateSessionsPerDay(sessions) {
    if (sessions.length < 2) return 1;
    
    const timestamps = sessions.map(s => new Date(s.timestamp).getTime());
    const timeSpan = Math.max(...timestamps) - Math.min(...timestamps);
    const days = timeSpan / (1000 * 60 * 60 * 24);
    
    return days > 0 ? sessions.length / days : 1;
  }

  mean(values) {
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  stdDev(values, mean) {
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  calculateEfficiencyScore(data) {
    const costEfficiency = 1 / (data.totalCost / data.sessions.length + 0.001);
    const eventEfficiency = (data.totalEvents / data.sessions.length) / 10;
    const flagPenalty = data.flags / data.sessions.length;
    
    return Math.min(100, Math.floor((costEfficiency * 40 + eventEfficiency * 40 - flagPenalty * 20)));
  }
}

// Export for use in dashboard
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BobWatchAdvancedFeatures;
}

// Made with Bob
