'use client';
import { Eye, Search, ShieldCheck, AlertTriangle, IndianRupee, FolderOpen, Activity, MapPin, Hexagon, Loader2, Users } from 'lucide-react';
import { useSupabase, formatTimestamp } from '@/lib/hooks';

export default function PublicPage() {
  const { data: stats, loading: statsLoading } = useSupabase('/api/dashboard');
  const { data: projects, loading: projLoading } = useSupabase('/api/projects');
  const { data: transactions, loading: txnLoading } = useSupabase('/api/transactions');

  const isLoading = statsLoading || projLoading || txnLoading;

  if (isLoading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Loader2 size={32} className="spin" style={{ color: 'var(--color-primary-500)' }} />
      </div>
    );
  }

  const projectList = projects || [];
  const txnList = transactions || [];

  const getRiskColor = (score) => {
    if (score <= 30) return 'var(--color-emerald-500)';
    if (score <= 60) return 'var(--color-amber-500)';
    return 'var(--color-red-600)';
  };

  return (
    <div className="page-content">
      {/* Public Header */}
      <div className="public-hero section-gap">
        <div className="public-hero-content">
          <div className="public-hero-badge">
            <Eye size={16} />
            <span>Public Access — Read-Only</span>
          </div>
          <h1 className="display-lg" style={{ color: 'white', marginBottom: '8px' }}>
            ChainTrust Transparency Portal
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', maxWidth: '600px' }}>
            Track how public funds are allocated and spent. Every transaction is 
            blockchain-verified and immutable.
          </p>
          <div className="public-search-wrap">
            <Search size={18} />
            <input type="text" placeholder="Search projects or transactions..." className="public-search" />
          </div>
        </div>
        <div className="public-hero-stats">
          <div className="public-stat">
            <IndianRupee size={20} />
            <span className="public-stat-val">₹{parseFloat(stats?.totalFundsCr || 0).toFixed(2)} Cr</span>
            <span className="public-stat-label">Allocated</span>
          </div>
          <div className="public-stat">
            <FolderOpen size={20} />
            <span className="public-stat-val">{stats?.totalProjects ?? 0}</span>
            <span className="public-stat-label">Projects</span>
          </div>
          <div className="public-stat">
            <ShieldCheck size={20} />
            <span className="public-stat-val">{txnList.length}</span>
            <span className="public-stat-label">Transactions</span>
          </div>
          <div className="public-stat">
            <Activity size={20} />
            <span className="public-stat-val">Live</span>
            <span className="public-stat-label">Supabase</span>
          </div>
        </div>
      </div>

      {/* Public Project Explorer */}
      <div className="section-gap">
        <div className="section-header">
          <h2 className="heading-2">All Projects</h2>
          <span className="badge badge-verified"><span className="badge-dot"></span>Live Data</span>
        </div>
        <div className="grid-3">
          {projectList.map((project, i) => {
            const contractValue = Number(project.contract_value_cr || 0);
            return (
              <div key={project.id} className="public-project-card card" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="public-project-top">
                  <div className="public-project-category">{project.status}</div>
                  <h3 className="public-project-name">{project.name}</h3>
                  <span className="public-project-loc"><MapPin size={13} /> {project.districts?.name || 'India'}, {project.districts?.state || ''}</span>
                </div>
                <div className="public-project-body">
                  <div className="public-project-budget">
                    <div className="public-budget-item">
                      <span className="public-budget-label">Contract Value</span>
                      <span className="public-budget-val">₹{contractValue.toFixed(2)} Cr</span>
                    </div>
                    <div className="public-budget-item">
                      <span className="public-budget-label">Contractor</span>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{project.contractor_name}</span>
                    </div>
                  </div>
                  <div className="public-project-trust">
                    {project.risk_score > 50 ? (
                      <AlertTriangle size={14} style={{ color: 'var(--color-red-600)' }} />
                    ) : (
                      <ShieldCheck size={14} style={{ color: 'var(--color-emerald-600)' }} />
                    )}
                    <span>Risk Score: <strong style={{ color: getRiskColor(project.risk_score) }}>{project.risk_score}/100</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Public Transaction Ledger */}
      <div className="section-gap">
        <div className="section-header">
          <h2 className="heading-2">Recent Transactions</h2>
          <span className="badge badge-verified"><span className="badge-dot"></span>Blockchain Verified</span>
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Amount</th>
                <th>Location</th>
                <th>District</th>
                <th>TX Hash</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {txnList.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-slate-400)' }}>No transactions yet</td></tr>
              ) : txnList.slice(0, 8).map((txn, i) => (
                <tr key={txn.id} style={{ animation: `cardEnter 0.3s ease-out ${i * 50}ms both` }}>
                  <td>
                    <span className={`badge ${txn.event_type === 'mint' ? 'badge-info' : txn.event_type === 'allocate' ? 'badge-verified' : 'badge-pending'}`}>
                      {txn.event_type}
                    </span>
                  </td>
                  <td className="amount-cell">₹{parseFloat(txn.amount_cr || 0).toFixed(2)} Cr</td>
                  <td style={{ fontSize: '13px' }}>{txn.location || '—'}</td>
                  <td style={{ fontSize: '13px', fontWeight: 500 }}>{txn.districts?.name || '—'}</td>
                  <td><span className="mono-cell">{txn.tx_hash ? txn.tx_hash.slice(0, 16) + '...' : '—'}</span></td>
                  <td style={{ fontSize: '12px', color: 'var(--color-slate-500)' }}>{formatTimestamp(txn.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust Banner */}
      <div className="trust-banner">
        <Hexagon size={24} style={{ color: 'var(--color-primary-400)' }} />
        <div>
          <h3 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600 }}>
            Every rupee tracked. Every transaction sealed.
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
            ChainTrust uses blockchain technology to ensure complete transparency in public fund management.
          </p>
        </div>
        <button className="btn btn-primary" style={{ background: 'white', color: 'var(--color-primary-900)', marginLeft: 'auto' }}>Learn More</button>
      </div>
    </div>
  );
}
