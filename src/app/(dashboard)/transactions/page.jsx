'use client';
import { useState } from 'react';
import { ShieldCheck, AlertTriangle, Clock, Download, Filter, Search, Copy, Loader2, ArrowUpRight, ArrowDownLeft, Coins } from 'lucide-react';
import { useSupabase, formatTimestamp } from '@/lib/hooks';
import styles from './page.module.css';

export default function TransactionsPage() {
  const { data: transactions, loading } = useSupabase('/api/transactions');
  const [search, setSearch] = useState('');

  const getEventBadge = (eventType) => {
    const map = {
      mint: { cls: 'badge-info', icon: Coins, text: 'Mint' },
      allocate: { cls: 'badge-verified', icon: ArrowUpRight, text: 'Allocate' },
      disburse: { cls: 'badge-pending', icon: ArrowDownLeft, text: 'Disburse' },
      withdraw: { cls: 'badge-flagged', icon: AlertTriangle, text: 'Withdraw' },
      return: { cls: 'badge-verified', icon: ShieldCheck, text: 'Return' },
    };
    return map[eventType] || { cls: 'badge-info', icon: Clock, text: eventType || 'Unknown' };
  };

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Loader2 size={32} className="spin" style={{ color: 'var(--color-primary-500)' }} />
      </div>
    );
  }

  const txnList = transactions || [];
  const filtered = search
    ? txnList.filter(t =>
        t.event_type?.toLowerCase().includes(search.toLowerCase()) ||
        t.location?.toLowerCase().includes(search.toLowerCase()) ||
        t.entity_type?.toLowerCase().includes(search.toLowerCase()) ||
        t.tx_hash?.toLowerCase().includes(search.toLowerCase()) ||
        t.districts?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : txnList;

  const totalVolumeCr = txnList.reduce((sum, t) => sum + Number(t.amount_cr || 0), 0);
  const mintCount = txnList.filter(t => t.event_type === 'mint').length;
  const allocateCount = txnList.filter(t => t.event_type === 'allocate').length;
  const disburseCount = txnList.filter(t => t.event_type === 'disburse' || t.event_type === 'withdraw').length;

  const copyHash = (hash) => {
    navigator.clipboard.writeText(hash || '');
  };

  const exportCSV = () => {
    const headers = ['Event Type','Amount (Cr)','Entity','Location','District','TX Hash','Timestamp'];
    const rows = filtered.map(t => [
      t.event_type || '',
      Number(t.amount_cr || 0).toFixed(2),
      t.entity_type || '',
      t.location || '',
      t.districts?.name || '',
      t.tx_hash || '',
      t.timestamp || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">All fund movements tracked on the blockchain ledger.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm" onClick={exportCSV}><Download size={16} /> Export</button>
          <button className="btn btn-secondary btn-sm"><Filter size={16} /> Filter</button>
        </div>
      </div>

      <div className={`${styles.summary} section-gap`}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>₹{totalVolumeCr.toFixed(2)} Cr</span>
          <span className={styles.statLabel}>Total Volume</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue} style={{ color: 'var(--color-primary-600)' }}>{mintCount}</span>
          <span className={styles.statLabel}>Minted</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue} style={{ color: 'var(--color-emerald-600)' }}>{allocateCount}</span>
          <span className={styles.statLabel}>Allocated</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue} style={{ color: 'var(--color-amber-600)' }}>{disburseCount}</span>
          <span className={styles.statLabel}>Disbursed</span>
        </div>
      </div>

      <div className={`${styles.searchBar} section-gap`}>
        <div className={styles.searchWrap}>
          <Search size={18} className={styles.searchIcon} />
          <input type="text" placeholder="Search by event type, location, hash..." className={styles.searchInput}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div className={styles.tableWrap}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Amount</th>
                <th>Entity</th>
                <th>Location</th>
                <th>District</th>
                <th>TX Hash</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-slate-400)' }}>No transactions found</td></tr>
              ) : filtered.map((txn, i) => {
                const badge = getEventBadge(txn.event_type);
                const BadgeIcon = badge.icon;
                return (
                  <tr key={txn.id} style={{ animation: `cardEnter 0.3s ease-out ${i * 50}ms both` }}>
                    <td>
                      <span className={`badge ${badge.cls}`}><BadgeIcon size={12} />{badge.text}</span>
                    </td>
                    <td className="amount-cell">₹{txn.amount_cr} Cr</td>
                    <td style={{ fontSize: '13px' }}>
                      <span style={{ fontWeight: 500 }}>{txn.entity_type}</span>
                    </td>
                    <td style={{ fontSize: '13px' }}>{txn.location || '—'}</td>
                    <td style={{ fontSize: '13px', fontWeight: 500 }}>{txn.districts?.name || '—'}</td>
                    <td>
                      <span className={styles.hashCell}>
                        <span className="mono-cell">{txn.tx_hash ? txn.tx_hash.slice(0, 16) + '...' : '—'}</span>
                        <button className={styles.copyBtn} title="Copy hash" onClick={() => copyHash(txn.tx_hash)}><Copy size={12} /></button>
                      </span>
                    </td>
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
    </div>
  );
}
