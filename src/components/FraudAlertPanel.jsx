'use client';
import { useState } from 'react';
import { AlertTriangle, ChevronRight, Sparkles } from 'lucide-react';
import styles from './FraudAlertPanel.module.css';

export default function FraudAlertPanel({ alerts }) {
  const [expandedId, setExpandedId] = useState(null);

  const getSeverityBadge = (severity) => {
    const map = { critical: 'badge-flagged', high: 'badge-flagged', medium: 'badge-pending', low: 'badge-resolved' };
    return map[severity] || 'badge-resolved';
  };

  const getSeverityBarClass = (severity) => {
    if (severity === 'critical' || severity === 'high') return styles.severityHigh;
    if (severity === 'medium') return styles.severityMedium;
    return styles.severityLow;
  };

  const circleNums = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <AlertTriangle size={20} className={styles.headerIcon} />
          <h3 className="heading-3">AI Fraud Anomalies</h3>
          <span className="badge badge-flagged">
            <span className="badge-dot"></span>
            {alerts.length} Active
          </span>
        </div>
      </div>

      <div className={styles.list}>
        {alerts.map((alert) => (
          <div key={alert.id} className={styles.row}>
            <div className={styles.rowMain} onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}>
              <div className={styles.rowLeft}>
                <div className={`${styles.severityBar} ${getSeverityBarClass(alert.severity)}`}></div>
                <div className={styles.content}>
                  <div className={styles.titleRow}>
                    <span className={styles.projectId}>{alert.projectId}</span>
                    <span className={styles.projectName}>{alert.projectName}</span>
                  </div>
                  <p className={styles.reason}>{alert.reason}</p>
                  <div className={styles.meta}>
                    <Sparkles size={12} />
                    <span>Flagged by {alert.flaggedBy}</span>
                    <span>·</span>
                    <span>{alert.timeAgo}</span>
                  </div>
                </div>
              </div>
              <div className={styles.rowRight}>
                <div className={styles.score}>
                  <span className={styles.scoreValue}>{alert.riskScore}</span>
                  <span className={styles.scoreLabel}>Risk</span>
                </div>
                <span className={`badge ${getSeverityBadge(alert.severity)}`}>
                  {alert.severity.toUpperCase()}
                </span>
                <ChevronRight size={16} className={expandedId === alert.id ? styles.chevronRotated : styles.chevron} />
              </div>
            </div>

            {expandedId === alert.id && (
              <div className={styles.expanded}>
                <p className={styles.detail}>{alert.detail}</p>
                <div className={styles.signals}>
                  <h4 className={styles.signalsLabel}>Detection Signals</h4>
                  {alert.signals.map((signal, i) => (
                    <div key={i} className={styles.signal}>
                      <span className={styles.signalNum}>{circleNums[i]}</span>
                      <span className={styles.signalText}>{signal.text}</span>
                      <span className={styles.signalConf}>Confidence: {signal.confidence}%</span>
                    </div>
                  ))}
                </div>
                <div className={styles.actions}>
                  <button className="btn btn-sm btn-primary">Investigate</button>
                  <button className="btn btn-sm btn-ghost">Dismiss</button>
                  <button className="btn btn-sm btn-danger">Escalate</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
