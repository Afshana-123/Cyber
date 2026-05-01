'use client';
import { ShieldAlert, Sparkles, AlertTriangle, BarChart3, Network, Download, Filter, TrendingUp, MapPin } from 'lucide-react';
import RiskGauge from '@/components/RiskGauge';
import { fraudAlerts, transactions, projects } from '@/data/mockData';

export default function AuditorPage() {
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
            <span className="auditor-kpi-val">4</span>
            <span className="auditor-kpi-label">Active Alerts</span>
          </div>
        </div>
        <div className="auditor-kpi">
          <span className="auditor-kpi-icon" style={{ background: 'var(--color-amber-100)', color: 'var(--color-amber-600)' }}><Sparkles size={20} /></span>
          <div>
            <span className="auditor-kpi-val">12</span>
            <span className="auditor-kpi-label">AI Signals</span>
          </div>
        </div>
        <div className="auditor-kpi">
          <span className="auditor-kpi-icon" style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-700)' }}><Network size={20} /></span>
          <div>
            <span className="auditor-kpi-val">3</span>
            <span className="auditor-kpi-label">Linked Entities</span>
          </div>
        </div>
        <div className="auditor-kpi">
          <span className="auditor-kpi-icon" style={{ background: 'var(--color-emerald-100)', color: 'var(--color-emerald-700)' }}><BarChart3 size={20} /></span>
          <div>
            <span className="auditor-kpi-val">₹63.4 Cr</span>
            <span className="auditor-kpi-label">Flagged Amount</span>
          </div>
        </div>
      </div>

      {/* Immutable Timeline + Risk Gauge */}
      <div className="split-60-40 section-gap">
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-header">
            <h3 className="heading-3">Immutable Action Timeline</h3>
            <span className="badge badge-info"><span className="badge-dot"></span>Blockchain Sealed</span>
          </div>
          <div className="card-body">
            <div className="timeline-visual">
              <div className="timeline-track">
                {[
                  { label: 'Contract Signed', date: 'Jun 2', status: 'verified' },
                  { label: 'First Payment', date: 'Jun 15', status: 'verified' },
                  { label: 'AI Flag Raised', date: 'Jul 3', status: 'flagged' },
                  { label: 'Escalated to CBI', date: 'Jul 5', status: 'critical' },
                ].map((node, i) => (
                  <div key={i} className="timeline-node">
                    <div className={`timeline-dot timeline-${node.status}`}></div>
                    <span className="timeline-label">{node.label}</span>
                    <span className="timeline-date">{node.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence Panel */}
            <div className="evidence-panel">
              <h4 className="heading-3" style={{ fontSize: '15px', marginBottom: '12px' }}>📄 Evidence Pack — TXN-8821941</h4>
              <div className="evidence-tags">
                <span className="evidence-tag verified">Multi-sig approved</span>
                <span className="evidence-tag flagged">AI Flagged</span>
                <span className="evidence-tag critical">CBI Notified</span>
                <span className="evidence-tag info">Blockchain Sealed</span>
              </div>
              <div className="evidence-hash" style={{ marginTop: '12px' }}>
                <span className="caption" style={{ color: 'var(--color-slate-500)' }}>Transaction Hash</span>
                <span className="mono" style={{ fontSize: '13px', color: 'var(--color-slate-700)' }}>0x3fa2b7c8d9e1f...8b91</span>
              </div>
              <div className="evidence-ai" style={{ marginTop: '12px' }}>
                <span className="caption" style={{ color: 'var(--color-slate-500)' }}>AI Analysis</span>
                <p style={{ fontSize: '13px', color: 'var(--color-slate-600)', marginTop: '4px', lineHeight: '1.6' }}>
                  "Bid price 340% above market median for identical scope in 3 neighboring districts. 
                  Same vendor awarded 8 contracts in 90 days through the same approving official."
                </p>
              </div>
            </div>
          </div>
        </div>
        <RiskGauge score={87} label="Case Risk Score" />
      </div>

      {/* AI Explainability Panel */}
      <div className="section-gap">
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--color-primary-500)' }} />
              <h3 className="heading-3">Explainable AI — Why was this flagged?</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="ai-signals">
              {fraudAlerts[0].signals.map((signal, i) => (
                <div key={i} className="ai-signal-row">
                  <span className="ai-signal-num">{'①②③④⑤'[i]}</span>
                  <div className="ai-signal-content">
                    <span className="ai-signal-text">{signal.text}</span>
                    <div className="ai-confidence-bar">
                      <div className="ai-confidence-fill" style={{ width: `${signal.confidence}%` }}></div>
                    </div>
                  </div>
                  <span className="ai-confidence-val">{signal.confidence}%</span>
                </div>
              ))}
            </div>
            <div className="ai-combined" style={{ marginTop: '20px' }}>
              <span className="caption" style={{ color: 'var(--color-slate-500)' }}>Combined Risk Score</span>
              <span className="ai-combined-score">91/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drill-Down: Corruption Heatmap placeholder */}
      <div className="split-60-40 section-gap">
        <div className="card">
          <div className="card-header">
            <h3 className="heading-3">Spending Velocity Analysis</h3>
          </div>
          <div className="card-body">
            <div className="spending-chart">
              <svg viewBox="0 0 600 200" style={{ width: '100%' }}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary-500)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--color-primary-500)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,180 L60,160 L120,140 L180,150 L240,100 L300,120 L360,60 L420,80 L480,40 L540,50 L600,30"
                  fill="none" stroke="var(--color-primary-500)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M0,180 L60,160 L120,140 L180,150 L240,100 L300,120 L360,60 L420,80 L480,40 L540,50 L600,30 L600,200 L0,200 Z"
                  fill="url(#spendGrad)" />
                {/* Grid lines */}
                {[0, 50, 100, 150, 200].map(y => (
                  <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="var(--color-slate-100)" strokeWidth="1" />
                ))}
              </svg>
              <div className="chart-labels">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map(m => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="heading-3">Bid Comparison</h3>
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Contractor</th>
                  <th>Bid Amount</th>
                  <th>vs Benchmark</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Infra Corp Ltd', bid: '₹142 Cr', diff: '+340%', flagged: true },
                  { name: 'BuildWell Inc', bid: '₹38 Cr', diff: '-5%', flagged: false },
                  { name: 'Metro Systems', bid: '₹41 Cr', diff: '+3%', flagged: false },
                  { name: 'RoadKing Pvt', bid: '₹39 Cr', diff: '-2%', flagged: false },
                ].map((row, i) => (
                  <tr key={i} style={{ background: row.flagged ? 'var(--color-red-50)' : undefined }}>
                    <td style={{ fontWeight: 500 }}>{row.name}</td>
                    <td className="amount-cell">{row.bid}</td>
                    <td style={{ color: row.flagged ? 'var(--color-red-600)' : 'var(--color-emerald-600)', fontWeight: 600 }}>{row.diff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auditor-kpi {
          display: flex;
          align-items: center;
          gap: 14px;
          background: var(--bg-card);
          border: 1px solid rgba(203,213,225,0.4);
          border-radius: var(--radius-lg);
          padding: 18px 20px;
          box-shadow: var(--shadow-1);
          animation: cardEnter 0.4s ease-out both;
        }
        .auditor-kpi-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          flex-shrink: 0;
        }
        .auditor-kpi-val {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 700;
          display: block;
          line-height: 1;
          color: var(--color-slate-900);
        }
        .auditor-kpi-label {
          font-size: 12px;
          color: var(--color-slate-500);
        }
        .timeline-visual {
          margin-bottom: 24px;
        }
        .timeline-track {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          position: relative;
          padding: 20px 0;
        }
        .timeline-track::before {
          content: '';
          position: absolute;
          top: 29px;
          left: 20px;
          right: 20px;
          height: 3px;
          background: var(--color-slate-200);
          z-index: 0;
        }
        .timeline-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 1;
          gap: 6px;
        }
        .timeline-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: var(--shadow-1);
        }
        .timeline-verified { background: var(--color-emerald-500); }
        .timeline-flagged { background: var(--color-amber-500); }
        .timeline-critical { background: var(--color-red-600); animation: fraudPulse 2s ease-in-out infinite; }
        .timeline-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-slate-700);
          text-align: center;
        }
        .timeline-date {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--color-slate-400);
        }
        .evidence-panel {
          background: var(--color-slate-50);
          border-radius: var(--radius-md);
          padding: 20px;
          border: 1px solid var(--color-slate-200);
        }
        .evidence-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .evidence-tag {
          padding: 4px 12px;
          border-radius: var(--radius-sm);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .evidence-tag.verified { background: var(--color-emerald-100); color: var(--color-emerald-700); }
        .evidence-tag.flagged { background: var(--color-amber-100); color: var(--color-amber-600); }
        .evidence-tag.critical { background: var(--color-red-100); color: var(--color-red-700); }
        .evidence-tag.info { background: var(--color-primary-100); color: var(--color-primary-700); }
        .ai-signals {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ai-signal-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ai-signal-num {
          font-size: 18px;
          width: 24px;
          text-align: center;
          flex-shrink: 0;
        }
        .ai-signal-content {
          flex: 1;
        }
        .ai-signal-text {
          font-size: 14px;
          color: var(--color-slate-700);
          display: block;
          margin-bottom: 6px;
        }
        .ai-confidence-bar {
          height: 6px;
          background: var(--color-slate-100);
          border-radius: 3px;
          overflow: hidden;
        }
        .ai-confidence-fill {
          height: 100%;
          background: var(--color-primary-500);
          border-radius: 3px;
          transition: width 1s ease-out;
        }
        .ai-confidence-val {
          font-family: var(--font-mono);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-primary-700);
          width: 50px;
          text-align: right;
          flex-shrink: 0;
        }
        .ai-combined {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: var(--color-primary-50);
          border-radius: var(--radius-md);
        }
        .ai-combined-score {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 700;
          color: var(--color-red-600);
        }
        .chart-labels {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 11px;
          color: var(--color-slate-400);
        }
      `}</style>
    </div>
  );
}
