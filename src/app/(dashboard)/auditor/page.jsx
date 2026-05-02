'use client';
import { ShieldAlert, Sparkles, AlertTriangle, BarChart3, Network, Download, MapPin, Loader2, Users, IndianRupee } from 'lucide-react';
import RiskGauge from '@/components/RiskGauge';
import { useSupabase } from '@/lib/hooks';

export default function AuditorPage() {
  const { data: alerts, loading: alertsLoading } = useSupabase('/api/fraud');
  const { data: projects, loading: projLoading } = useSupabase('/api/projects');
  const { data: beneficiaries, loading: beneLoading } = useSupabase('/api/beneficiaries');
  const { data: transactions, loading: txnLoading } = useSupabase('/api/transactions');

  const isLoading = alertsLoading || projLoading || beneLoading || txnLoading;

  if (isLoading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Loader2 size={32} className="spin" style={{ color: 'var(--color-primary-500)' }} />
      </div>
    );
  }

  const alertList = alerts || [];
  const projList = projects || [];
  const beneList = beneficiaries || [];
  const txnList = transactions || [];

  const openAlerts = alertList.filter(a => a.status !== 'resolved');
  const flaggedProjects = projList.filter(p => p.status === 'flagged');
  const ghostBeneficiaries = beneList.filter(b => b.is_ghost);
  const ghostAmount = ghostBeneficiaries.reduce((s, b) => s + Number(b.amount_cr || 0), 0);
  const maxRisk = openAlerts.length > 0
    ? Math.max(...openAlerts.map(a => a.risk_score || 0))
    : 0;

  // Timeline from recent alerts
  const timelineNodes = openAlerts.slice(0, 4).map(alert => ({
    label: alert.title,
    date: new Date(alert.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    status: (alert.risk_score || 0) >= 80 ? 'critical' : (alert.risk_score || 0) >= 60 ? 'flagged' : 'verified',
  }));

  const topAlert = openAlerts[0];

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
            <span className="auditor-kpi-val">{openAlerts.length}</span>
            <span className="auditor-kpi-label">Open Alerts</span>
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
          <span className="auditor-kpi-icon" style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-700)' }}><Users size={20} /></span>
          <div>
            <span className="auditor-kpi-val">{ghostBeneficiaries.length}</span>
            <span className="auditor-kpi-label">Ghost Beneficiaries</span>
          </div>
        </div>
        <div className="auditor-kpi">
          <span className="auditor-kpi-icon" style={{ background: 'var(--color-emerald-100)', color: 'var(--color-emerald-700)' }}><IndianRupee size={20} /></span>
          <div>
            <span className="auditor-kpi-val">₹{ghostAmount} Cr</span>
            <span className="auditor-kpi-label">Ghost Siphoned</span>
          </div>
        </div>
      </div>

      {/* Timeline + Risk Gauge */}
      <div className="split-60-40 section-gap">
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-header">
            <h3 className="heading-3">Alert Timeline</h3>
            <span className="badge badge-info"><span className="badge-dot"></span>Live from Supabase</span>
          </div>
          <div className="card-body">
            <div className="timeline-visual">
              <div className="timeline-track">
                {timelineNodes.length > 0 ? timelineNodes.map((node, i) => (
                  <div key={i} className="timeline-node">
                    <div className={`timeline-dot timeline-${node.status}`}></div>
                    <span className="timeline-label">{node.label}</span>
                    <span className="timeline-date">{node.date}</span>
                  </div>
                )) : (
                  <p style={{ color: 'var(--color-slate-400)', padding: '20px' }}>No active alerts</p>
                )}
              </div>
            </div>

            {topAlert && (
              <div className="evidence-panel">
                <h4 className="heading-3" style={{ fontSize: '15px', marginBottom: '12px' }}>📄 Top Alert — {topAlert.title}</h4>
                <div className="evidence-tags">
                  <span className={`evidence-tag ${topAlert.type}`}>{topAlert.type?.toUpperCase()}</span>
                  <span className="evidence-tag info">Risk: {topAlert.risk_score}</span>
                  <span className={`evidence-tag ${topAlert.status}`}>{topAlert.status?.toUpperCase()}</span>
                </div>
                <div className="evidence-ai" style={{ marginTop: '12px' }}>
                  <span className="caption" style={{ color: 'var(--color-slate-500)' }}>Description</span>
                  <p style={{ fontSize: '13px', color: 'var(--color-slate-600)', marginTop: '4px', lineHeight: '1.6' }}>
                    {topAlert.description}
                  </p>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <span className="caption" style={{ color: 'var(--color-slate-500)' }}>District</span>
                  <p style={{ fontSize: '13px', color: 'var(--color-slate-700)', fontWeight: 500 }}>{topAlert.districts?.name || '—'}, {topAlert.districts?.state || ''}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <RiskGauge score={maxRisk} label="Highest Alert Risk" />
      </div>

      {/* All active alerts */}
      <div className="section-gap">
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--color-primary-500)' }} />
              <h3 className="heading-3">All Active Alerts</h3>
            </div>
          </div>
          <div className="card-body">
            {openAlerts.length === 0 ? (
              <p style={{ color: 'var(--color-slate-400)', textAlign: 'center', padding: '20px' }}>No active alerts — all clear ✓</p>
            ) : (
              <div className="ai-signals">
                {openAlerts.map((alert, i) => (
                  <div key={alert.id} className="ai-signal-row">
                    <span className="ai-signal-num">{'①②③④⑤⑥⑦⑧⑨⑩'[i] || (i + 1)}</span>
                    <div className="ai-signal-content">
                      <span className="ai-signal-text">{alert.title} — {alert.description}</span>
                      <div className="ai-confidence-bar">
                        <div className="ai-confidence-fill" style={{ width: `${alert.risk_score}%` }}></div>
                      </div>
                    </div>
                    <span className="ai-confidence-val">{alert.risk_score}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flagged Projects + Ghost Beneficiaries */}
      <div className="split-60-40 section-gap">
        <div className="card">
          <div className="card-header">
            <h3 className="heading-3">Flagged Projects</h3>
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Contractor</th>
                  <th>Contract (Cr)</th>
                  <th>Risk</th>
                  <th>Anomaly</th>
                </tr>
              </thead>
              <tbody>
                {flaggedProjects.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--color-slate-400)' }}>No flagged projects</td></tr>
                ) : flaggedProjects.map((proj) => (
                  <tr key={proj.id} style={{ background: 'var(--color-red-50)' }}>
                    <td style={{ fontWeight: 500 }}>{proj.name}</td>
                    <td style={{ fontSize: '13px' }}>{proj.contractor_name}</td>
                    <td className="amount-cell">₹{proj.contract_value_cr} Cr</td>
                    <td><span className="badge badge-flagged">{proj.risk_score}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--color-red-600)' }}>{proj.bid_anomaly_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="heading-3">Ghost Beneficiaries</h3>
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Scheme</th>
                  <th>Amount (Cr)</th>
                  <th>Signals</th>
                </tr>
              </thead>
              <tbody>
                {ghostBeneficiaries.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: 'var(--color-slate-400)' }}>No ghost beneficiaries detected</td></tr>
                ) : ghostBeneficiaries.slice(0, 6).map((bene) => (
                  <tr key={bene.id} style={{ background: 'var(--color-amber-50)' }}>
                    <td style={{ fontWeight: 500, fontSize: '13px' }}>{bene.schemes?.name || '—'}</td>
                    <td className="amount-cell">₹{bene.amount_cr} Cr</td>
                    <td style={{ fontSize: '12px', color: 'var(--color-slate-600)' }}>{bene.ghost_signals ? Object.entries(bene.ghost_signals).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(', ') : '—'}</td>
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
