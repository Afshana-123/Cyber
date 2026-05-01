'use client';
import { Eye, Search, ShieldCheck, AlertTriangle, IndianRupee, FolderOpen, Activity, MapPin, ExternalLink, Hexagon } from 'lucide-react';
import { projects, transactions, formatCurrency } from '@/data/mockData';

export default function PublicPage() {
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
            <span className="public-stat-val">₹28,470 Cr</span>
            <span className="public-stat-label">Tracked</span>
          </div>
          <div className="public-stat">
            <FolderOpen size={20} />
            <span className="public-stat-val">142</span>
            <span className="public-stat-label">Projects</span>
          </div>
          <div className="public-stat">
            <ShieldCheck size={20} />
            <span className="public-stat-val">98.2%</span>
            <span className="public-stat-label">Verified</span>
          </div>
          <div className="public-stat">
            <Activity size={20} />
            <span className="public-stat-val">Live</span>
            <span className="public-stat-label">Mainnet</span>
          </div>
        </div>
      </div>

      {/* Public Project Explorer */}
      <div className="section-gap">
        <div className="section-header">
          <h2 className="heading-2">Featured Projects</h2>
          <button className="btn btn-sm btn-secondary">View All Projects</button>
        </div>
        <div className="grid-3">
          {projects.slice(0, 3).map((project, i) => (
            <div key={project.id} className="public-project-card card" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="public-project-top">
                <div className="public-project-category">{project.category}</div>
                <h3 className="public-project-name">{project.name}</h3>
                <span className="public-project-loc"><MapPin size={13} /> {project.state}</span>
              </div>
              <div className="public-project-body">
                <div className="public-project-progress">
                  <div className="public-progress-track">
                    <div
                      className="public-progress-fill"
                      style={{
                        width: `${project.progress}%`,
                        background: project.progress > 75 ? 'var(--color-emerald-500)' :
                                    project.progress > 40 ? 'var(--color-primary-500)' : 'var(--color-amber-500)'
                      }}
                    ></div>
                  </div>
                  <span className="public-progress-text">{project.progress}% Complete</span>
                </div>
                <div className="public-project-budget">
                  <div className="public-budget-item">
                    <span className="public-budget-label">Budget</span>
                    <span className="public-budget-val">₹{(project.budget / 10000000000).toFixed(0)} Cr</span>
                  </div>
                  <div className="public-budget-item">
                    <span className="public-budget-label">Spent</span>
                    <span className="public-budget-val">₹{(project.spent / 10000000000).toFixed(0)} Cr</span>
                  </div>
                </div>
                <div className="public-project-trust">
                  <ShieldCheck size={14} style={{ color: 'var(--color-emerald-600)' }} />
                  <span>Transparency Score: <strong>{project.transparencyScore}/100</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Public Transaction Ledger */}
      <div className="section-gap">
        <div className="section-header">
          <h2 className="heading-2">Recent Verified Transactions</h2>
          <span className="badge badge-verified"><span className="badge-dot"></span>Blockchain Verified</span>
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>TXN ID</th>
                <th>Project</th>
                <th>Amount</th>
                <th>From → To</th>
                <th>Status</th>
                <th>Block</th>
              </tr>
            </thead>
            <tbody>
              {transactions.filter(t => t.status === 'verified').slice(0, 5).map((txn, i) => (
                <tr key={txn.id} style={{ animation: `cardEnter 0.3s ease-out ${i * 50}ms both` }}>
                  <td className="mono-cell">{txn.id}</td>
                  <td style={{ fontWeight: 500 }}>{txn.project}</td>
                  <td className="amount-cell">{formatCurrency(txn.amount)}</td>
                  <td style={{ fontSize: '13px' }}>
                    {txn.from} <span style={{ color: 'var(--color-primary-500)', fontWeight: 700 }}>→</span> {txn.to}
                  </td>
                  <td><span className="badge badge-verified"><ShieldCheck size={12} />Verified</span></td>
                  <td className="mono-cell" style={{ fontSize: '12px' }}>
                    #{txn.blockNumber}
                    <ExternalLink size={12} style={{ marginLeft: '4px', cursor: 'pointer', color: 'var(--color-primary-500)' }} />
                  </td>
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
