'use client';
import { ShieldCheck, AlertTriangle, Clock, ExternalLink, ArrowUpRight, Coins, ArrowDownLeft } from 'lucide-react';
import { formatTimestamp } from '@/lib/hooks';
import styles from './LiveTransactions.module.css';

export default function LiveTransactions({ transactions }) {
  const getEventBadge = (eventType) => {
    const map = {
      mint: { className: 'badge-info', icon: Coins, text: 'Mint' },
      allocate: { className: 'badge-verified', icon: ArrowUpRight, text: 'Allocate' },
      disburse: { className: 'badge-pending', icon: ArrowDownLeft, text: 'Disburse' },
      withdraw: { className: 'badge-flagged', icon: AlertTriangle, text: 'Withdraw' },
      return: { className: 'badge-verified', icon: ShieldCheck, text: 'Return' },
    };
    return map[eventType] || { className: 'badge-info', icon: Clock, text: eventType || 'Unknown' };
  };

  const txnList = transactions || [];

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
              <th>Event</th>
              <th>Amount</th>
              <th>Location</th>
              <th>District</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {txnList.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--color-slate-400)' }}>No transactions yet</td></tr>
            ) : txnList.slice(0, 6).map((txn, i) => {
              const badge = getEventBadge(txn.event_type);
              const BadgeIcon = badge.icon;
              return (
                <tr key={txn.id} style={{ animationDelay: `${i * 50}ms` }}>
                  <td>
                    <span className={`badge ${badge.className}`}>
                      <BadgeIcon size={12} />
                      {badge.text}
                    </span>
                  </td>
                  <td className="amount-cell">₹{txn.amount_cr} Cr</td>
                  <td style={{ fontSize: '13px' }}>{txn.location || '—'}</td>
                  <td style={{ fontSize: '13px', fontWeight: 500 }}>{txn.districts?.name || '—'}</td>
                  <td style={{ color: 'var(--color-slate-500)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                    {formatTimestamp(txn.timestamp)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
