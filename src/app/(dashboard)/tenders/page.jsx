'use client';
import { Plus, Filter, Calendar, MapPin, Clock, Users, TrendingDown, TrendingUp } from 'lucide-react';
import { tenders, formatCurrency } from '@/data/mockData';
import styles from './page.module.css';

export default function TendersPage() {
  const getStatusBadge = (status) => {
    const map = {
      open: { cls: 'badge-info', text: 'Open' },
      evaluation: { cls: 'badge-pending', text: 'Evaluation' },
      awarded: { cls: 'badge-verified', text: 'Awarded' },
      closed: { cls: 'badge-flagged', text: 'Closed' },
    };
    return map[status] || map.open;
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tenders</h1>
          <p className="page-subtitle">Manage procurement bids and vendor selection.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm"><Filter size={16} /> Filter</button>
          <button className="btn btn-primary btn-sm"><Plus size={16} /> New Tender</button>
        </div>
      </div>

      <div className="grid-3">
        {tenders.map((tender, i) => {
          const status = getStatusBadge(tender.status);
          return (
            <div key={tender.id} className={`card ${styles.tenderCard}`} style={{ animationDelay: `${i * 80}ms` }}>
              <div className={styles.cardTop}>
                <div className={styles.cardHeader}>
                  <span className={`badge ${status.cls}`}><span className="badge-dot"></span>{status.text}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-slate-400)' }}>{tender.id}</span>
                </div>
                <h3 className={styles.name}>{tender.title}</h3>
                <div className={styles.meta}>
                  <span className={styles.metaItem}><MapPin size={13} /> {tender.project}</span>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.budgetRow}>
                  <span className={styles.budgetLabel}>Budget</span>
                  <span className={styles.budgetValue}>{formatCurrency(tender.budget)}</span>
                </div>
                <div className={styles.bidStats}>
                  <div className={styles.bidStat}>
                    <Users size={14} />
                    <span>{tender.bids} Bids</span>
                  </div>
                  <div className={styles.bidStat}>
                    <TrendingDown size={14} style={{ color: 'var(--color-emerald-600)' }} />
                    <span>Low: {formatCurrency(tender.lowestBid)}</span>
                  </div>
                  <div className={styles.bidStat}>
                    <TrendingUp size={14} style={{ color: 'var(--color-red-500)' }} />
                    <span>High: {formatCurrency(tender.highestBid)}</span>
                  </div>
                </div>
                {tender.winner && (
                  <div className={styles.winnerRow}>
                    <span className={styles.winnerLabel}>✓ Awarded to</span>
                    <span className={styles.winnerName}>{tender.winner}</span>
                  </div>
                )}
                <div className={styles.bidDeadline}>
                  <Clock size={14} />
                  <span>Deadline: {tender.deadline}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
