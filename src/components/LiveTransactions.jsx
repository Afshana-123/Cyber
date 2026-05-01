'use client';
import { ShieldCheck, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/data/mockData';

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
    <div className="live-txn">
      <div className="live-txn-header">
        <h3 className="heading-3">Live Ledger Stream</h3>
        <button className="btn btn-sm btn-secondary">
          View All <ExternalLink size={14} />
        </button>
      </div>
      <div className="live-txn-table-wrap">
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
                    <span className="flow-cell">
                      <span className="flow-from">{txn.from}</span>
                      <span className="flow-arrow">→</span>
                      <span className="flow-to">{txn.to}</span>
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

      <style jsx>{`
        .live-txn {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-1);
          border: 1px solid rgba(203, 213, 225, 0.4);
          animation: cardEnter 0.5s ease-out both;
          animation-delay: 400ms;
          overflow: hidden;
        }
        .live-txn-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--color-slate-100);
        }
        .live-txn-table-wrap {
          overflow-x: auto;
        }
        .flow-cell {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
        }
        .flow-from { color: var(--color-slate-700); font-weight: 500; }
        .flow-arrow { color: var(--color-primary-500); font-weight: 700; }
        .flow-to { color: var(--color-slate-600); }
      `}</style>
    </div>
  );
}
