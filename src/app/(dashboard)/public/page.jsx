'use client';
import { useState, useEffect } from 'react';
import { Eye, Search, ShieldCheck, AlertTriangle, IndianRupee, FolderOpen, Activity, MapPin, ExternalLink, Hexagon } from 'lucide-react';
import { fetchProjects, formatCurrency } from '@/lib/apiClient';

export default function PublicPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const cleanCount = projects.filter(p => p.status === 'clean').length;
  const cleanPct = projects.length > 0 ? ((cleanCount / projects.length) * 100).toFixed(1) : '0';

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
            TRACE Transparency Portal
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', maxWidth: '600px' }}>
            Track how public funds are allocated and spent. Every transaction is
            blockchain-verified and immutable.
          </p>
          <div className="public-search-wrap">
            <Search size={18} />
            <input type="text" placeholder="Search projects..." className="public-search" />
          </div>
        </div>
        <div className="public-hero-stats">
          <div className="public-stat">
            <IndianRupee size={20} />
            <span className="public-stat-val">
              ₹{projects.reduce((s, p) => s + (p.contract_value_cr || 0), 0).toFixed(1)} Cr
            </span>
            <span className="public-stat-label">Tracked</span>
          </div>
          <div className="public-stat">
            <FolderOpen size={20} />
            <span className="public-stat-val">{projects.length}</span>
            <span className="public-stat-label">Projects</span>
          </div>
          <div className="public-stat">
            <ShieldCheck size={20} />
            <span className="public-stat-val">{cleanPct}%</span>
            <span className="public-stat-label">Clean</span>
          </div>
          <div className="public-stat">
            <Activity size={20} />
            <span className="public-stat-val">Live</span>
            <span className="public-stat-label">Backend</span>
          </div>
        </div>
      </div>

      {/* Public Project Explorer */}
      <div className="section-gap">
        <div className="section-header">
          <h2 className="heading-2">All Projects</h2>
        </div>
        {loading ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-slate-500)' }}>
            Loading projects...
          </div>
        ) : (
          <div className="grid-3">
            {projects.map((project, i) => (
              <div key={project.id} className="public-project-card card" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="public-project-top">
                  <div className="public-project-category">{project.status}</div>
                  <h3 className="public-project-name">{project.name}</h3>
                  <span className="public-project-loc"><MapPin size={13} /> {project.district_name || '—'}</span>
                </div>
                <div className="public-project-body">
                  <div className="public-project-budget">
                    <div className="public-budget-item">
                      <span className="public-budget-label">Contract Value</span>
                      <span className="public-budget-val">₹{project.contract_value_cr} Cr</span>
                    </div>
                    <div className="public-budget-item">
                      <span className="public-budget-label">Contractor</span>
                      <span className="public-budget-val">{project.contractor_name}</span>
                    </div>
                  </div>
                  <div className="public-project-trust">
                    {project.risk_score < 30 ? (
                      <><ShieldCheck size={14} style={{ color: 'var(--color-emerald-600)' }} />
                      <span>Risk Score: <strong>{project.risk_score}/100</strong> — Clean</span></>
                    ) : (
                      <><AlertTriangle size={14} style={{ color: 'var(--color-red-600)' }} />
                      <span>Risk Score: <strong>{project.risk_score}/100</strong> — Flagged</span></>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trust Banner */}
      <div className="trust-banner">
        <Hexagon size={24} style={{ color: 'var(--color-primary-400)' }} />
        <div>
          <h3 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600 }}>
            Every rupee tracked. Every transaction sealed.
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
            TRACE uses blockchain technology to ensure complete transparency in public fund management.
          </p>
        </div>
        <button className="btn btn-primary" style={{ background: 'white', color: 'var(--color-primary-900)', marginLeft: 'auto' }}>Learn More</button>
      </div>
    </div>
  );
}
