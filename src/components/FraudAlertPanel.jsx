'use client';
import { useState } from 'react';
import { AlertTriangle, ChevronRight, Sparkles } from 'lucide-react';
import styles from './FraudAlertPanel.module.css';

export default function FraudAlertPanel({ alerts }) {
  const [expandedId, setExpandedId] = useState(null);

  const getSeverityFromRisk = (riskScore) => {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  };

  const getSeverityBadge = (severity) => {
    const map = { critical: 'badge-flagged', high: 'badge-flagged', medium: 'badge-pending', low: 'badge-resolved' };
    return map[severity] || 'badge-resolved';
  };

  const getSeverityBarClass = (severity) => {
    if (severity === 'critical' || severity === 'high') return styles.severityHigh;
    if (severity === 'medium') return styles.severityMedium;
    return styles.severityLow;
  };

  const timeAgo = (ts) => {
    if (!ts) return '';
    const now = new Date();
    const then = new Date(ts);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  };

  const activeAlerts = (alerts || []).filter(a => a.status !== 'resolved');

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <AlertTriangle size={20} className={styles.headerIcon} />
          <h3 className="heading-3">AI Fraud Alerts</h3>
          <span className="badge badge-flagged">
            <span className="badge-dot"></span>
            {activeAlerts.length} Active
          </span>
        </div>
      </div>

      <div className={styles.list}>
        {activeAlerts.length === 0 ? (
          <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--color-slate-400)' }}>
            No active fraud alerts — all clear ✓
          </div>
        ) : activeAlerts.map((alert) => {
          const severity = getSeverityFromRisk(alert.risk_score || 0);
          return (
            <div key={alert.id} className={styles.row}>
              <div className={styles.rowMain} onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}>
                <div className={styles.rowLeft}>
                  <div className={`${styles.severityBar} ${getSeverityBarClass(severity)}`}></div>
                  <div className={styles.content}>
                    <div className={styles.titleRow}>
                      <span className={styles.projectName}>{alert.title}</span>
                    </div>
                    <p className={styles.reason}>{alert.type} — {alert.districts?.name || 'Unknown'}</p>
                    <div className={styles.meta}>
                      <Sparkles size={12} />
                      <span>AI Detection Engine</span>
                      <span>·</span>
                      <span>{timeAgo(alert.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.rowRight}>
                  <div className={styles.score}>
                    <span className={styles.scoreValue}>{alert.risk_score}</span>
                    <span className={styles.scoreLabel}>Risk</span>
                  </div>
                  <span className={`badge ${getSeverityBadge(severity)}`}>
                    {severity.toUpperCase()}
                  </span>
                  <ChevronRight size={16} className={expandedId === alert.id ? styles.chevronRotated : styles.chevron} />
                </div>
              </div>

              {expandedId === alert.id && (
                <div className={styles.expanded}>
                  <p className={styles.detail}>{alert.description}</p>
                  <div className={styles.actions}>
                    <button className="btn btn-sm btn-primary">Investigate</button>
                    <button className="btn btn-sm btn-ghost">Dismiss</button>
                    <button className="btn btn-sm btn-danger">Escalate</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
