'use client';
import { ShieldCheck, AlertTriangle, Clock, Download, Filter, Search, ExternalLink, Copy } from 'lucide-react';
import { transactions, formatCurrency } from '@/data/mockData';

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

      {/* Summary Pills */}
      <div className="txn-summary section-gap">
        <div className="txn-stat-card">
          <span className="txn-stat-value">₹28,470 Cr</span>
          <span className="txn-stat-label">Total Volume</span>
        </div>
        <div className="txn-stat-card">
          <span className="txn-stat-value" style={{ color: 'var(--color-emerald-600)' }}>1,247</span>
          <span className="txn-stat-label">Verified</span>
        </div>
        <div className="txn-stat-card">
          <span className="txn-stat-value" style={{ color: 'var(--color-red-600)' }}>23</span>
          <span className="txn-stat-label">Flagged</span>
        </div>
        <div className="txn-stat-card">
          <span className="txn-stat-value" style={{ color: 'var(--color-amber-600)' }}>8</span>
          <span className="txn-stat-label">Pending</span>
        </div>
      </div>

      {/* Search */}
      <div className="txn-search-bar section-gap">
        <div className="txn-search-wrap">
          <Search size={18} className="txn-search-icon" />
          <input type="text" placeholder="Search by TXN ID, project, or entity..." className="txn-search-input" />
        </div>
      </div>

      {/* Transaction Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="txn-table-wrap">
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
                      <span className={`badge ${status.cls}`}>
                        <StatusIcon size={12} />
                        {status.text}
                      </span>
                    </td>
                    <td>
                      <span className="hash-cell">
                        <span className="mono-cell">{txn.hash}</span>
                        <button className="copy-btn" title="Copy hash"><Copy size={12} /></button>
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

      <style jsx>{`
        .txn-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .txn-stat-card {
          background: var(--bg-card);
          border: 1px solid rgba(203,213,225,0.4);
          border-radius: var(--radius-lg);
          padding: 16px 20px;
          box-shadow: var(--shadow-1);
        }
        .txn-stat-value {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 700;
          display: block;
          color: var(--color-slate-900);
        }
        .txn-stat-label {
          font-family: var(--font-label);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--color-slate-500);
        }
        .txn-search-bar { max-width: 500px; }
        .txn-search-wrap {
          position: relative;
        }
        .txn-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-slate-400);
        }
        .txn-search-input {
          width: 100%;
          padding: 10px 16px 10px 42px;
          background: var(--bg-card);
          border: 1.5px solid var(--color-slate-200);
          border-radius: var(--radius-md);
          font-size: 14px;
          color: var(--color-slate-900);
        }
        .txn-search-input:focus {
          border-color: var(--color-primary-400);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .txn-table-wrap {
          overflow-x: auto;
        }
        .hash-cell {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .copy-btn {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          color: var(--color-slate-400);
          transition: all 150ms ease;
          flex-shrink: 0;
        }
        .copy-btn:hover {
          background: var(--color-slate-100);
          color: var(--color-slate-700);
        }
      `}</style>
    </div>
  );
}
