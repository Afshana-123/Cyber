'use client';
import { useState } from 'react';
import { AlertTriangle, ChevronRight, Sparkles, X } from 'lucide-react';

export default function FraudAlertPanel({ alerts }) {
  const [expandedId, setExpandedId] = useState(null);

  const getSeverityBadge = (severity) => {
    const map = {
      critical: 'badge-flagged',
      high: 'badge-flagged',
      medium: 'badge-pending',
      low: 'badge-resolved',
    };
    return map[severity] || 'badge-resolved';
  };

  return (
    <div className="fraud-panel">
      <div className="fraud-header">
        <div className="fraud-header-left">
          <AlertTriangle size={20} className="fraud-header-icon" />
          <h3 className="heading-3">AI Fraud Anomalies</h3>
          <span className="badge badge-flagged">
            <span className="badge-dot"></span>
            {alerts.length} Active
          </span>
        </div>
      </div>

      <div className="fraud-list">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`fraud-row ${alert.severity === 'critical' ? 'fraud-critical' : ''} ${expandedId === alert.id ? 'expanded' : ''}`}
          >
            <div className="fraud-row-main" onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}>
              <div className="fraud-row-left">
                <div className="fraud-severity-bar" data-severity={alert.severity}></div>
                <div className="fraud-content">
                  <div className="fraud-title-row">
                    <span className="mono" style={{ color: 'var(--color-slate-500)', fontSize: '12px' }}>{alert.projectId}</span>
                    <span className="fraud-project-name">{alert.projectName}</span>
                  </div>
                  <p className="fraud-reason">{alert.reason}</p>
                  <div className="fraud-meta">
                    <Sparkles size={12} />
                    <span>Flagged by {alert.flaggedBy}</span>
                    <span>·</span>
                    <span>{alert.timeAgo}</span>
                  </div>
                </div>
              </div>
              <div className="fraud-row-right">
                <div className="fraud-score">
                  <span className="fraud-score-value">{alert.riskScore}</span>
                  <span className="fraud-score-label">Risk</span>
                </div>
                <span className={`badge ${getSeverityBadge(alert.severity)}`}>
                  {alert.severity.toUpperCase()}
                </span>
                <ChevronRight size={16} className={`fraud-chevron ${expandedId === alert.id ? 'rotated' : ''}`} />
              </div>
            </div>

            {expandedId === alert.id && (
              <div className="fraud-expanded">
                <p className="fraud-detail">{alert.detail}</p>
                <div className="fraud-signals">
                  <h4 className="caption" style={{ marginBottom: '8px', color: 'var(--color-slate-500)' }}>Detection Signals</h4>
                  {alert.signals.map((signal, i) => (
                    <div key={i} className="fraud-signal">
                      <span className="fraud-signal-num">①②③④⑤⑥⑦⑧⑨⑩"[i]</span>
                      <span className="fraud-signal-text">{signal.text}</span>
                      <span className="fraud-signal-conf">Confidence: {signal.confidence}%</span>
                    </div>
                  ))}
                </div>
                <div className="fraud-actions">
                  <button className="btn btn-sm btn-primary">Investigate</button>
                  <button className="btn btn-sm btn-ghost">Dismiss</button>
                  <button className="btn btn-sm btn-danger">Escalate</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .fraud-panel {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-1);
          border: 1px solid rgba(203, 213, 225, 0.4);
          animation: cardEnter 0.5s ease-out both;
          animation-delay: 300ms;
          overflow: hidden;
        }
        .fraud-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--color-slate-100);
        }
        .fraud-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .fraud-header-icon {
          color: var(--color-red-600);
        }
        .fraud-list {
          max-height: 400px;
          overflow-y: auto;
        }
        .fraud-row {
          border-bottom: 1px solid var(--color-slate-100);
          transition: background 150ms ease;
        }
        .fraud-row:last-child { border-bottom: none; }
        .fraud-row:hover { background: var(--color-primary-50); }
        .fraud-critical {
          animation: fraudPulse 3s ease-in-out infinite;
        }
        .fraud-row-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          cursor: pointer;
          gap: 16px;
        }
        .fraud-row-left {
          display: flex;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }
        .fraud-severity-bar {
          width: 3px;
          border-radius: 3px;
          flex-shrink: 0;
          align-self: stretch;
        }
        .fraud-severity-bar[data-severity="critical"],
        .fraud-severity-bar[data-severity="high"] { background: var(--color-red-600); }
        .fraud-severity-bar[data-severity="medium"] { background: var(--color-amber-500); }
        .fraud-severity-bar[data-severity="low"] { background: var(--color-slate-300); }
        .fraud-content { min-width: 0; }
        .fraud-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .fraud-project-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--color-slate-900);
        }
        .fraud-reason {
          font-size: 13px;
          color: var(--color-slate-600);
          margin-bottom: 4px;
        }
        .fraud-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--color-slate-400);
        }
        .fraud-row-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .fraud-score {
          text-align: center;
        }
        .fraud-score-value {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 700;
          color: var(--color-red-600);
          display: block;
          line-height: 1;
        }
        .fraud-score-label {
          font-family: var(--font-label);
          font-size: 10px;
          color: var(--color-slate-400);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .fraud-chevron {
          color: var(--color-slate-400);
          transition: transform 200ms ease;
        }
        .fraud-chevron.rotated { transform: rotate(90deg); }
        .fraud-expanded {
          padding: 0 24px 20px 40px;
          animation: slideUp 0.2s ease-out;
        }
        .fraud-detail {
          font-size: 13px;
          color: var(--color-slate-600);
          margin-bottom: 16px;
          line-height: 1.6;
        }
        .fraud-signals {
          margin-bottom: 16px;
        }
        .fraud-signal {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          font-size: 13px;
        }
        .fraud-signal-num {
          font-size: 14px;
          width: 20px;
        }
        .fraud-signal-text {
          flex: 1;
          color: var(--color-slate-700);
        }
        .fraud-signal-conf {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--color-slate-500);
          white-space: nowrap;
        }
        .fraud-actions {
          display: flex;
          gap: 8px;
        }
      `}</style>
    </div>
  );
}
