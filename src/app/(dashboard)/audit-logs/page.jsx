'use client';
import { Filter, Download, Search, AlertTriangle, Info, Copy, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useSupabase, formatTimestamp } from '@/lib/hooks';
import styles from './page.module.css';

export default function AuditLogsPage() {
  const { data: alerts, loading } = useSupabase('/api/fraud');
  const { data: transactions, loading: txnLoading } = useSupabase('/api/transactions');
  const [search, setSearch] = useState('');

  const isLoading = loading || txnLoading;

  if (isLoading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Loader2 size={32} className="spin" style={{ color: 'var(--color-primary-500)' }} />
      </div>
    );
  }

  // Build unified audit trail from alerts + transactions
  const alertEvents = (alerts || []).map(a => ({
    id: a.id,
    type: 'ALERT',
    action: a.type || 'fraud_alert',
    title: a.title,
    description: a.description,
    entity_type: a.entity_type,
    entity_id: a.entity_id,
    actor: 'AI Engine',
    risk_score: a.risk_score,
    district: a.districts?.name || '—',
    timestamp: a.created_at,
    severity: a.risk_score >= 80 ? 'critical' : a.risk_score >= 60 ? 'high' : a.risk_score >= 40 ? 'medium' : 'low',
  }));

  const txnEvents = (transactions || []).map(t => ({
    id: t.id,
    type: 'TRANSACTION',
    action: t.event_type,
    title: `${t.event_type} — ₹${t.amount_cr} Cr`,
    description: `Fund ${t.event_type} at ${t.location}`,
    entity_type: t.entity_type,
    entity_id: t.entity_id,
    actor: 'System',
    risk_score: 0,
    district: t.districts?.name || '—',
    timestamp: t.timestamp,
    severity: 'info',
  }));

  const allEvents = [...alertEvents, ...txnEvents]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const filtered = search
    ? allEvents.filter(e =>
        e.action?.toLowerCase().includes(search.toLowerCase()) ||
        e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase()) ||
        e.district?.toLowerCase().includes(search.toLowerCase()) ||
        e.actor?.toLowerCase().includes(search.toLowerCase())
      )
    : allEvents;

  const getSeverityStyle = (severity) => {
    const map = {
      critical: { cls: 'badge-flagged', icon: AlertTriangle, color: 'var(--color-red-600)' },
      high: { cls: 'badge-flagged', icon: AlertTriangle, color: 'var(--color-red-500)' },
      medium: { cls: 'badge-pending', icon: AlertTriangle, color: 'var(--color-amber-500)' },
      low: { cls: 'badge-resolved', icon: Info, color: 'var(--color-slate-400)' },
      info: { cls: 'badge-info', icon: Info, color: 'var(--color-primary-500)' },
    };
    return map[severity] || map.info;
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Trail</h1>
          <p className="page-subtitle">Immutable, blockchain-sealed trail of all system actions and alerts.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm"><Download size={16} /> Export</button>
          <button className="btn btn-secondary btn-sm"><Filter size={16} /> Filter</button>
        </div>
      </div>

      <div style={{ maxWidth: '500px' }} className="section-gap">
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate-400)' }} />
          <input type="text" placeholder="Search audit trail..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 16px 10px 42px', background: 'var(--bg-card)', border: '1.5px solid var(--color-slate-200)', borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--color-slate-900)', fontFamily: 'var(--font-body)' }} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-slate-400)' }}>
          <p style={{ fontSize: '16px' }}>No audit events found</p>
        </div>
      ) : (
        <div className={styles.auditTimeline}>
          {filtered.map((event, i) => {
            const sev = getSeverityStyle(event.severity);
            const SevIcon = sev.icon;
            return (
              <div key={event.id} className={styles.auditEntry} style={{ animation: `cardEnter 0.3s ease-out ${i * 60}ms both` }}>
                <div className={styles.timelineMarker}>
                  <div className={styles.dot} style={{ background: sev.color }}></div>
                  {i < filtered.length - 1 && <div className={styles.line}></div>}
                </div>
                <div className={`${styles.auditCard} card`}>
                  <div className={styles.cardTop}>
                    <div className={styles.cardLeft}>
                      <span className={`badge ${sev.cls}`}><SevIcon size={12} />{event.type}</span>
                      <h4 className={styles.action}>{event.title}</h4>
                    </div>
                    <span className={styles.time}>{formatTimestamp(event.timestamp)}</span>
                  </div>
                  <p className={styles.detail}>{event.description}</p>
                  <div className={styles.meta}>
                    <span className={styles.entity}>{event.entity_type}</span>
                    <span className={styles.user}>{event.actor}</span>
                    <span className={styles.entity}>{event.district}</span>
                    {event.risk_score > 0 && (
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-red-600)' }}>Risk: {event.risk_score}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
