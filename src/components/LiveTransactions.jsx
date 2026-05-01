'use client';
import { ShieldCheck, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/data/mockData';
import styles from './LiveTransactions.module.css';

export default function LiveTransactions({ transactions }) {
  const getStatusBadge = (status) => {
    const map = {
      verified: { className: 'badge-verified', icon: ShieldCheck, text: 'Verified' },
      flagged: { className: 'badge-flagged', icon: AlertTriangle, text: 'Flagged' },
      pending: { className: 'badge-pending', icon: Clock, text: 'Pending' },
    };
    return map[status] || map.pending;
  };

  return (
    <div className={styles.liveTxn}>
      <div className={styles.header}>
        <h3 className="heading-3">Live Ledger Stream</h3>
        <button className="btn btn-sm btn-secondary">
          View All <ExternalLink size={14} />
        </button>
      </div>
      <div className={styles.tableWrap}>
        <table className="data-table">
          <thead>
            <tr>
              <th>TXN ID</th>
              <th>Project</th>
              <th>Amount</th>
              <th>Flow</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 6).map((txn, i) => {
              const status = getStatusBadge(txn.status);
              const StatusIcon = status.icon;
              return (
                <tr key={txn.id} style={{ animationDelay: `${i * 50}ms` }}>
                  <td className="mono-cell">{txn.id}</td>
                  <td>{txn.project}</td>
                  <td className="amount-cell">{formatCurrency(txn.amount)}</td>
                  <td>
                    <span className={styles.flowCell}>
                      <span className={styles.flowFrom}>{txn.from}</span>
                      <span className={styles.flowArrow}>→</span>
                      <span className={styles.flowTo}>{txn.to}</span>
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${status.className}`}>
                      <StatusIcon size={12} />
                      {status.text}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-slate-500)', fontSize: '13px', whiteSpace: 'nowrap' }}>{txn.time}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
