/**
 * HTML Report Generator for Sharon
 * Creates timestamped HTML reports of test runs
 */

import fs from 'fs/promises';
import path from 'path';

export class HtmlReporter {
  constructor() {
    this.startTime = new Date();
    this.results = [];
    this.summary = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      duration: 0
    };
  }

  addResult(category, status, duration, output = '') {
    this.results.push({
      category,
      status,
      duration,
      output,
      timestamp: new Date()
    });

    this.summary.totalTests++;
    if (status === 'passed') {
      this.summary.passed++;
    } else {
      this.summary.failed++;
    }
  }

  setSummary(summary) {
    this.summary = { ...this.summary, ...summary };
  }

  generateHtml() {
    const endTime = new Date();
    const totalDuration = endTime - this.startTime;

    const timestamp = this.formatTimestamp(this.startTime);
    const successRate = this.summary.totalTests > 0
      ? Math.round((this.summary.passed / this.summary.totalTests) * 100)
      : 0;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sharon Test Report - ${timestamp}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa;
            color: #2d3748;
            line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 1.1em; }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
            border-left: 4px solid #3182ce;
        }
        .summary-card.passed { border-left-color: #38a169; }
        .summary-card.failed { border-left-color: #e53e3e; }
        .summary-card h3 { color: #4a5568; margin-bottom: 10px; }
        .summary-card .number { font-size: 2.5em; font-weight: bold; color: #2d3748; }
        .results {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .results-header {
            background: #4a5568;
            color: white;
            padding: 20px;
            font-size: 1.2em;
            font-weight: bold;
        }
        .test-result {
            padding: 20px;
            border-bottom: 1px solid #e2e8f0;
            transition: background-color 0.2s;
        }
        .test-result:hover { background-color: #f7fafc; }
        .test-result:last-child { border-bottom: none; }
        .test-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .test-name { font-weight: bold; font-size: 1.1em; }
        .status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
        }
        .status.passed { background: #c6f6d5; color: #22543d; }
        .status.failed { background: #fed7d7; color: #822727; }
        .test-duration { color: #718096; font-size: 0.9em; }
        .test-output {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 15px;
            margin-top: 10px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9em;
            color: #4a5568;
            white-space: pre-wrap;
            max-height: 300px;
            overflow-y: auto;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            color: #718096;
            font-size: 0.9em;
        }
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #38a169, #48bb78);
            width: ${successRate}%;
            transition: width 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Sharon Test Report</h1>
            <p>Planet Nine Ecosystem Test Results</p>
            <p><strong>${timestamp}</strong></p>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <p>${successRate}% Success Rate</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="number">${this.summary.totalTests}</div>
            </div>
            <div class="summary-card passed">
                <h3>Passed</h3>
                <div class="number">${this.summary.passed}</div>
            </div>
            <div class="summary-card failed">
                <h3>Failed</h3>
                <div class="number">${this.summary.failed}</div>
            </div>
            <div class="summary-card">
                <h3>Duration</h3>
                <div class="number">${Math.round(totalDuration / 1000)}s</div>
            </div>
        </div>

        <div class="results">
            <div class="results-header">
                Test Results
            </div>
            ${this.results.map(result => `
                <div class="test-result">
                    <div class="test-header">
                        <span class="test-name">${result.category}</span>
                        <div>
                            <span class="status ${result.status}">${result.status}</span>
                            <span class="test-duration">${result.duration}ms</span>
                        </div>
                    </div>
                    ${result.output ? `<div class="test-output">${this.escapeHtml(result.output)}</div>` : ''}
                </div>
            `).join('')}
        </div>

        <div class="footer">
            <p>Generated by Sharon - Planet Nine Test Framework</p>
            <p>Run completed at ${endTime.toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;
  }

  escapeHtml(text) {
    const div = { innerHTML: text };
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  formatTimestamp(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}-${hours}${minutes}`;
  }

  async saveReport(reportsDir = '/sharon/reports') {
    const timestamp = this.formatTimestamp(this.startTime);
    const filename = `sharon-test-report-${timestamp}.html`;
    const filepath = path.join(reportsDir, filename);

    const html = this.generateHtml();
    await fs.writeFile(filepath, html, 'utf8');

    return { filepath, filename, timestamp };
  }
}

export default HtmlReporter;