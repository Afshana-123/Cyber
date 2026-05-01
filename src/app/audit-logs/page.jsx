'use client';
import { ClipboardList, Filter, Download, Search, ShieldCheck, AlertTriangle, Info, Copy, ExternalLink } from 'lucide-react';
import { auditLogs } from '@/data/mockData';

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

      {/* Search */}
      <div style={{ maxWidth: '500px' }} className="section-gap">
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate-400)' }} />
          <input
            type="text"
            placeholder="Search logs by action, entity, or user..."
            style={{
              width: '100%',
              padding: '10px 16px 10px 42px',
              background: 'var(--bg-card)',
              border: '1.5px solid var(--color-slate-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              color: 'var(--color-slate-900)',
            }}
          />
        </div>
      </div>

      {/* Timeline-style Audit Log */}
      <div className="audit-timeline">
        {auditLogs.map((log, i) => {
          const sev = getSeverityStyle(log.severity);
          const SevIcon = sev.icon;
          return (
            <div key={log.id} className="audit-entry" style={{ animation: `cardEnter 0.3s ease-out ${i * 60}ms both` }}>
              <div className="audit-timeline-marker">
                <div className="audit-dot" style={{ background: sev.color }}></div>
                {i < auditLogs.length - 1 && <div className="audit-line"></div>}
              </div>
              <div className="audit-card card">
                <div className="audit-card-top">
                  <div className="audit-card-left">
                    <span className={`badge ${sev.cls}`}><SevIcon size={12} />{log.severity.toUpperCase()}</span>
                    <h4 className="audit-action">{log.action}</h4>
                  </div>
                  <span className="audit-time">{log.timestamp}</span>
                </div>
                <p className="audit-detail">{log.details}</p>
                <div className="audit-meta">
                  <span className="audit-entity mono">{log.entity}</span>
                  <span className="audit-user">{log.user}</span>
                  <span className="audit-hash">
                    <span className="mono">{log.blockHash}</span>
                    <button className="copy-btn-sm" title="Copy"><Copy size={11} /></button>
                    <button className="copy-btn-sm" title="View on chain"><ExternalLink size={11} /></button>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .audit-timeline {
          position: relative;
        }
        .audit-entry {
          display: flex;
          gap: 16px;
          margin-bottom: 4px;
        }
        .audit-timeline-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 20px;
          flex-shrink: 0;
          padding-top: 20px;
        }
        .audit-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
          z-index: 1;
        }
        .audit-line {
          width: 2px;
          flex: 1;
          background: var(--color-slate-200);
          margin-top: 4px;
        }
        .audit-card {
          flex: 1;
          padding: 16px 20px;
          margin-bottom: 0;
        }
        .audit-card:hover {
          transform: none;
        }
        .audit-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .audit-card-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .audit-action {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 600;
          color: var(--color-slate-900);
        }
        .audit-time {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--color-slate-400);
          white-space: nowrap;
        }
        .audit-detail {
          font-size: 13px;
          color: var(--color-slate-600);
          margin-bottom: 10px;
          line-height: 1.5;
        }
        .audit-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .audit-entity {
          font-size: 12px;
          padding: 2px 8px;
          background: var(--color-slate-100);
          border-radius: 4px;
          color: var(--color-slate-600);
        }
        .audit-user {
          font-size: 12px;
          color: var(--color-slate-500);
        }
        .audit-hash {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--color-slate-400);
        }
        .copy-btn-sm {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 3px;
          color: var(--color-slate-400);
          transition: all 150ms ease;
        }
        .copy-btn-sm:hover {
          background: var(--color-slate-100);
          color: var(--color-slate-700);
        }
      `}</style>
    </div>
  );
}
