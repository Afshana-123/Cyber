'use client';
import { ShieldCheck, AlertTriangle, Clock, Download, Filter, Search, Copy } from 'lucide-react';
import { transactions, formatCurrency } from '@/data/mockData';
import styles from './page.module.css';

export default function TransactionsPage() {
  const getStatusBadge = (status) => {
    const map = {
      verified: { cls: 'badge-verified', icon: ShieldCheck, text: 'Verified' },
      flagged: { cls: 'badge-flagged', icon: AlertTriangle, text: 'Flagged' },
      pending: { cls: 'badge-pending', icon: Clock, text: 'Pending' },
    };
    return map[status] || map.pending;
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">All blockchain-verified fund transfers across projects.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm"><Download size={16} /> Export</button>
          <button className="btn btn-secondary btn-sm"><Filter size={16} /> Filter</button>
        </div>
      </div>

      <div className={`${styles.summary} section-gap`}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>₹28,470 Cr</span>
          <span className={styles.statLabel}>Total Volume</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue} style={{ color: 'var(--color-emerald-600)' }}>1,247</span>
          <span className={styles.statLabel}>Verified</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue} style={{ color: 'var(--color-red-600)' }}>23</span>
          <span className={styles.statLabel}>Flagged</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue} style={{ color: 'var(--color-amber-600)' }}>8</span>
          <span className={styles.statLabel}>Pending</span>
        </div>
      </div>

      <div className={`${styles.searchBar} section-gap`}>
        <div className={styles.searchWrap}>
          <Search size={18} className={styles.searchIcon} />
          <input type="text" placeholder="Search by TXN ID, project, or entity..." className={styles.searchInput} />
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div className={styles.tableWrap}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Project</th>
                <th>Amount</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Block Hash</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, i) => {
                const status = getStatusBadge(txn.status);
                const StatusIcon = status.icon;
                return (
                  <tr key={txn.id} style={{ animation: `cardEnter 0.3s ease-out ${i * 50}ms both` }}>
                    <td className="mono-cell" style={{ fontWeight: 500 }}>{txn.id}</td>
                    <td style={{ fontWeight: 500 }}>{txn.project}</td>
                    <td className="amount-cell">{formatCurrency(txn.amount)}</td>
                    <td style={{ fontSize: '13px' }}>{txn.from}</td>
                    <td style={{ fontSize: '13px' }}>{txn.to}</td>
                    <td>
                      <span className={`badge ${status.cls}`}><StatusIcon size={12} />{status.text}</span>
                    </td>
                    <td>
                      <span className={styles.hashCell}>
                        <span className="mono-cell">{txn.hash}</span>
                        <button className={styles.copyBtn} title="Copy hash"><Copy size={12} /></button>
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-slate-500)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {txn.time}<br />
                      <span style={{ fontSize: '11px', color: 'var(--color-slate-400)' }}>{txn.date}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
