'use client';
import { useState, useEffect } from 'react';
import { ShieldAlert, Sparkles, AlertTriangle, BarChart3, Network, Download } from 'lucide-react';
import RiskGauge from '@/components/RiskGauge';
import { fetchAlerts, fetchProjects } from '@/lib/apiClient';

export default function AuditorPage() {
  const [alerts, setAlerts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAlerts().catch(() => []),
      fetchProjects().catch(() => []),
    ]).then(([a, p]) => {
      setAlerts(a);
      setProjects(p);
      setLoading(false);
    });
  }, []);

  const flaggedProjects = projects.filter(p => p.status === 'flagged' || p.risk_score >= 60);
  const totalFlaggedAmount = flaggedProjects.reduce((s, p) => s + (p.contract_value_cr || 0), 0);
  const topAlert = alerts[0];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Auditor Analytics</h1>
          <p className="page-subtitle">Deep-dive investigation tools for fraud detection and forensic analysis.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm"><Download size={16} /> Export Report</button>
          <button className="btn btn-primary btn-sm"><ShieldAlert size={16} /> Escalate</button>
        </div>
      </div>

      {/* Auditor KPIs */}
      <div className="grid-4 section-gap">
        <div className="auditor-kpi">
          <span className="auditor-kpi-icon" style={{ background: 'var(--color-red-100)', color: 'var(--color-red-600)' }}><AlertTriangle size={20} /></span>
          <div>
            <span className="auditor-kpi-val">{alerts.length}</span>
            <span className="auditor-kpi-label">Active Alerts</span>
          </div>
        </div>
        <div className="auditor-kpi">
          <span className="auditor-kpi-icon" style={{ background: 'var(--color-amber-100)', color: 'var(--color-amber-600)' }}><Sparkles size={20} /></span>
          <div>
            <span className="auditor-kpi-val">{flaggedProjects.length}</span>
            <span className="auditor-kpi-label">Flagged Projects</span>
          </div>
        </div>
        <div className="auditor-kpi">
          <span className="auditor-kpi-icon" style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-700)' }}><Network size={20} /></span>
          <div>
            <span className="auditor-kpi-val">{projects.length}</span>
            <span className="auditor-kpi-label">Total Projects</span>
          </div>
        </div>
        <div className="auditor-kpi">
          <span className="auditor-kpi-icon" style={{ background: 'var(--color-emerald-100)', color: 'var(--color-emerald-700)' }}><BarChart3 size={20} /></span>
          <div>
            <span className="auditor-kpi-val">₹{totalFlaggedAmount.toFixed(1)} Cr</span>
            <span className="auditor-kpi-label">Flagged Amount</span>
          </div>
        </div>
      </div>

      {/* Immutable Timeline + Risk Gauge */}
      <div className="split-60-40 section-gap">
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-header">
            <h3 className="heading-3">Active Alerts Timeline</h3>
            <span className="badge badge-info"><span className="badge-dot"></span>Live from Supabase</span>
          </div>
          <div className="card-body">
            {loading ? (
              <p style={{ color: 'var(--color-slate-500)', padding: '20px' }}>Loading alerts...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {alerts.slice(0, 5).map((a, i) => (
                  <div key={a.id} style={{
                    padding: '14px', borderRadius: '12px',
                    background: a.risk_score >= 75 ? 'var(--color-red-50)' : a.risk_score >= 50 ? 'var(--color-amber-50)' : 'var(--color-slate-50)',
                    border: `1px solid ${a.risk_score >= 75 ? 'var(--color-red-200)' : a.risk_score >= 50 ? 'var(--color-amber-200)' : 'var(--color-slate-200)'}`,
                    animation: `cardEnter 0.3s ease-out ${i * 80}ms both`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-slate-800)' }}>{a.title}</span>
                      <span style={{
                        fontWeight: 700, fontSize: '13px',
                        color: a.risk_score >= 75 ? 'var(--color-red-600)' : 'var(--color-amber-600)',
                      }}>Risk: {a.risk_score}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--color-slate-600)', margin: 0 }}>{a.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <RiskGauge score={topAlert?.risk_score || 67} label="Top Alert Risk" />
      </div>

      {/* Flagged Projects Table */}
      <div className="section-gap">
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-header">
            <h3 className="heading-3">Flagged Projects</h3>
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Contractor</th>
                  <th>Value (₹ Cr)</th>
                  <th>Risk</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {flaggedProjects.map((p, i) => (
                  <tr key={p.id} style={{ background: p.risk_score >= 70 ? 'var(--color-red-50)' : undefined }}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td>{p.contractor_name}</td>
                    <td className="amount-cell">₹{p.contract_value_cr} Cr</td>
                    <td style={{ color: p.risk_score >= 66 ? 'var(--color-red-600)' : 'var(--color-amber-600)', fontWeight: 600 }}>{p.risk_score}</td>
                    <td><span className={`badge ${p.status === 'flagged' ? 'badge-critical' : 'badge-warning'}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
