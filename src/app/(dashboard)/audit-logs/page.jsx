'use client';
import { Filter, Download, Search, AlertTriangle, Info, Copy, ExternalLink } from 'lucide-react';
import { auditLogs } from '@/data/mockData';
import styles from './page.module.css';

export default function AuditLogsPage() {
  const getSeverityStyle = (severity) => {
    const map = {
      info: { cls: 'badge-info', icon: Info, color: 'var(--color-primary-500)' },
      warning: { cls: 'badge-pending', icon: AlertTriangle, color: 'var(--color-amber-500)' },
      critical: { cls: 'badge-flagged', icon: AlertTriangle, color: 'var(--color-red-600)' },
    };
    return map[severity] || map.info;
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Immutable, blockchain-sealed audit trail of all system actions.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm"><Download size={16} /> Export</button>
          <button className="btn btn-secondary btn-sm"><Filter size={16} /> Filter</button>
        </div>
      </div>

      <div style={{ maxWidth: '500px' }} className="section-gap">
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate-400)' }} />
          <input type="text" placeholder="Search logs by action, entity, or user..."
            style={{ width: '100%', padding: '10px 16px 10px 42px', background: 'var(--bg-card)', border: '1.5px solid var(--color-slate-200)', borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--color-slate-900)', fontFamily: 'var(--font-body)' }} />
        </div>
      </div>

      <div className={styles.auditTimeline}>
        {auditLogs.map((log, i) => {
          const sev = getSeverityStyle(log.severity);
          const SevIcon = sev.icon;
          return (
            <div key={log.id} className={styles.auditEntry} style={{ animation: `cardEnter 0.3s ease-out ${i * 60}ms both` }}>
              <div className={styles.timelineMarker}>
                <div className={styles.dot} style={{ background: sev.color }}></div>
                {i < auditLogs.length - 1 && <div className={styles.line}></div>}
              </div>
              <div className={`${styles.auditCard} card`}>
                <div className={styles.cardTop}>
                  <div className={styles.cardLeft}>
                    <span className={`badge ${sev.cls}`}><SevIcon size={12} />{log.severity.toUpperCase()}</span>
                    <h4 className={styles.action}>{log.action}</h4>
                  </div>
                  <span className={styles.time}>{log.timestamp}</span>
                </div>
                <p className={styles.detail}>{log.details}</p>
                <div className={styles.meta}>
                  <span className={styles.entity}>{log.entity}</span>
                  <span className={styles.user}>{log.user}</span>
                  <span className={styles.hash}>
                    <span className={styles.hashText}>{log.blockHash}</span>
                    <button className={styles.copyBtn} title="Copy"><Copy size={11} /></button>
                    <button className={styles.copyBtn} title="View on chain"><ExternalLink size={11} /></button>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
