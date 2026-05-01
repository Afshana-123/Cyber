'use client';
import { useState, useEffect } from 'react';
import { Search, MapPin, AlertTriangle, ShieldCheck } from 'lucide-react';
import { fetchProjects } from '@/lib/apiClient';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.contractor_name?.toLowerCase().includes(search.toLowerCase())
  );

  const riskBadge = (score) => {
    if (score >= 66) return { label: 'Critical', cls: 'badge-critical' };
    if (score >= 36) return { label: 'Watch', cls: 'badge-warning' };
    return { label: 'Clean', cls: 'badge-verified' };
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">All tracked infrastructure projects with live risk scoring.</p>
        </div>
      </div>

      <div className="section-gap">
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={18} style={{ color: 'var(--color-slate-400)' }} />
          <input
            type="text"
            placeholder="Search projects or contractors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none', outline: 'none', width: '100%', fontSize: '14px',
              background: 'transparent', color: 'var(--color-slate-700)',
            }}
          />
        </div>
      </div>

      <div className="section-gap">
        {loading ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-slate-500)' }}>
            Loading projects...
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Contractor</th>
                  <th>District</th>
                  <th>Value (₹ Cr)</th>
                  <th>Risk Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const badge = riskBadge(p.risk_score);
                  return (
                    <tr key={p.id} style={{ animation: `cardEnter 0.3s ease-out ${i * 50}ms both` }}>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td>{p.contractor_name}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {p.district_name || '—'}
                        </span>
                      </td>
                      <td className="amount-cell">₹{p.contract_value_cr} Cr</td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: p.risk_score >= 66 ? 'var(--color-red-600)' :
                                 p.risk_score >= 36 ? 'var(--color-amber-600)' : 'var(--color-emerald-600)',
                        }}>
                          {p.risk_score}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${badge.cls}`}>
                          {p.status === 'flagged' && <AlertTriangle size={12} />}
                          {p.status === 'clean' && <ShieldCheck size={12} />}
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
