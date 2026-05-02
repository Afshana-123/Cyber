'use client';
import { useState } from 'react';
import { Filter, MapPin, Calendar, Loader2, AlertTriangle, ShieldCheck, Plus, X, Search, IndianRupee, Users, BarChart3, FileText, Clock, ExternalLink, TrendingUp, Shield, Activity } from 'lucide-react';
import { useSupabase, timeAgo, formatTimestamp } from '@/lib/hooks';
import styles from './page.module.css';

const INITIAL_FORM = {
  name: '',
  district_id: '',
  contractor_name: '',
  contract_value_cr: '',
  benchmark_low_cr: '',
  benchmark_high_cr: '',
  bids_received: '',
};

export default function ProjectsPage() {
  const { data: projects, loading, refetch } = useSupabase('/api/projects');
  const { data: districts } = useSupabase('/api/districts');
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [search, setSearch] = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.district_id) {
      setFormError('Project name and district are required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create project');
      }
      setForm(INITIAL_FORM);
      setShowModal(false);
      refetch();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'flagged': return { text: 'Flagged', cls: 'badge-flagged' };
      case 'frozen': return { text: 'Frozen', cls: 'badge-flagged' };
      case 'clean': return { text: 'Clean', cls: 'badge-resolved' };
      default: return { text: status || 'Unknown', cls: 'badge-pending' };
    }
  };

  const getRiskColor = (score) => {
    if (score >= 70) return 'var(--color-red-600)';
    if (score >= 40) return 'var(--color-amber-500)';
    return 'var(--color-emerald-500)';
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    if (score >= 20) return 'Low';
    return 'Minimal';
  };

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Loader2 size={32} className="spin" style={{ color: 'var(--color-primary-500)' }} />
      </div>
    );
  }

  const projectList = (projects || []).filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.contractor_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.districts?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Track all government-funded projects and their risk scores.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm"><Filter size={16} /> Filter</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={16} /> New Project</button>
        </div>
      </div>

      {/* Search */}
      <div className="section-gap">
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={18} style={{ color: 'var(--color-slate-400)' }} />
          <input
            type="text"
            placeholder="Search projects, contractors, or districts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none', outline: 'none', width: '100%', fontSize: '14px',
              background: 'transparent', color: 'var(--color-slate-700)',
            }}
          />
        </div>
      </div>

      {projectList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-slate-400)' }}>
          <p style={{ fontSize: '16px' }}>No projects found.</p>
        </div>
      ) : (
        <div className="grid-3">
          {projectList.map((project, i) => {
            const status = getStatusBadge(project.status);
            const contractValue = Number(project.contract_value_cr || 0);
            const benchmarkHigh = Number(project.benchmark_high_cr || 0);
            const anomalyPct = Number(project.bid_anomaly_pct || 0);
            return (
              <div
                key={project.id}
                className={`card ${styles.projectCard}`}
                style={{ animationDelay: `${i * 80}ms` }}
                onClick={() => setSelectedProject(project)}
              >
                <div className={styles.cardTop}>
                  <div className={styles.cardHeader}>
                    <span className={`badge ${status.cls}`}><span className="badge-dot"></span>{status.text}</span>
                    <span className={styles.risk} style={{ color: getRiskColor(project.risk_score) }}>Risk: {project.risk_score}</span>
                  </div>
                  <h3 className={styles.name}>{project.name}</h3>
                  <div className={styles.meta}>
                    <span className={styles.metaItem}><MapPin size={13} /> {project.districts?.name || 'N/A'}, {project.districts?.state || ''}</span>
                    <span className={styles.metaItem}><Calendar size={13} /> Phase {project.phase}</span>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.progressSection}>
                    <div className={styles.ringWrap}>
                      <svg viewBox="0 0 80 80" className={styles.ring}>
                        <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-slate-100)" strokeWidth="6" />
                        <circle cx="40" cy="40" r="34" fill="none" stroke={getRiskColor(project.risk_score)} strokeWidth="6"
                          strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 34}`}
                          strokeDashoffset={`${2 * Math.PI * 34 * (1 - project.risk_score / 100)}`}
                          transform="rotate(-90, 40, 40)" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                      </svg>
                      <span className={styles.ringText}>{project.risk_score}</span>
                    </div>
                    <div className={styles.budgetInfo}>
                      <div className={styles.budgetRow}>
                        <span className={styles.budgetLabel}>Contract Value</span>
                        <span className={styles.budgetValue}>₹{contractValue} Cr</span>
                      </div>
                      <div className={styles.budgetRow}>
                        <span className={styles.budgetLabel}>Benchmark</span>
                        <span className={styles.budgetValue}>₹{project.benchmark_low_cr}–{benchmarkHigh} Cr</span>
                      </div>
                      <div className={styles.barTrack}>
                        <div className={styles.barFill} style={{
                          width: `${Math.min(100, anomalyPct)}%`,
                          background: anomalyPct > 50 ? 'var(--color-red-500)' : anomalyPct > 20 ? 'var(--color-amber-500)' : 'var(--color-emerald-500)'
                        }}></div>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--color-slate-500)' }}>Bid Anomaly: {anomalyPct}%</span>
                    </div>
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.verified}>
                      {project.status === 'flagged' ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />}
                      {' '}{project.contractor_name}
                    </span>
                    <span>{project.bids_received} bids</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════ PROJECT DETAIL MODAL ═══════════════ */}
      {selectedProject && (() => {
        const p = selectedProject;
        const status = getStatusBadge(p.status);
        const riskLevel = getRiskLevel(p.risk_score);
        const riskColor = getRiskColor(p.risk_score);
        const contractValue = Number(p.contract_value_cr || 0);
        const benchmarkLow = Number(p.benchmark_low_cr || 0);
        const benchmarkHigh = Number(p.benchmark_high_cr || 0);
        const anomalyPct = Number(p.bid_anomaly_pct || 0);
        const overBenchmark = benchmarkHigh > 0 ? ((contractValue - benchmarkHigh) / benchmarkHigh * 100).toFixed(1) : 0;

        return (
          <div className={styles.modalOverlay} onClick={() => setSelectedProject(null)}>
            <div className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
              {/* Header with risk gradient */}
              <div className={styles.detailHeader} style={{ '--risk-color': riskColor }}>
                <div className={styles.detailHeaderContent}>
                  <div className={styles.detailHeaderTop}>
                    <span className={`badge ${status.cls}`} style={{ fontSize: '11px' }}>
                      <span className="badge-dot"></span>{status.text}
                    </span>
                    <button className={styles.modalClose} onClick={() => setSelectedProject(null)} style={{ color: 'white' }}>
                      <X size={20} />
                    </button>
                  </div>
                  <h2 className={styles.detailTitle}>{p.name}</h2>
                  <div className={styles.detailLocation}>
                    <MapPin size={14} />
                    <span>{p.districts?.name || 'N/A'}, {p.districts?.state || ''}</span>
                    <span className={styles.detailDivider}>•</span>
                    <Calendar size={14} />
                    <span>Phase {p.phase}</span>
                    {p.phase2_frozen && (
                      <>
                        <span className={styles.detailDivider}>•</span>
                        <Shield size={14} />
                        <span>Phase 2 Frozen</span>
                      </>
                    )}
                  </div>
                </div>
                {/* Risk Gauge Overlay */}
                <div className={styles.detailRiskBadge}>
                  <svg viewBox="0 0 100 100" className={styles.detailRiskRing}>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="6"
                      strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - (p.risk_score || 0) / 100)}`}
                      transform="rotate(-90, 50, 50)" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                  </svg>
                  <div className={styles.detailRiskCenter}>
                    <span className={styles.detailRiskValue}>{p.risk_score}</span>
                    <span className={styles.detailRiskLabel}>{riskLevel}</span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className={styles.detailBody}>
                {/* Financial Overview Grid */}
                <div className={styles.detailSection}>
                  <h4 className={styles.detailSectionTitle}>
                    <IndianRupee size={16} /> Financial Overview
                  </h4>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailStat}>
                      <span className={styles.detailStatLabel}>Contract Value</span>
                      <span className={styles.detailStatValue}>₹{contractValue} Cr</span>
                    </div>
                    <div className={styles.detailStat}>
                      <span className={styles.detailStatLabel}>Benchmark Range</span>
                      <span className={styles.detailStatValue}>₹{benchmarkLow}–{benchmarkHigh} Cr</span>
                    </div>
                    <div className={styles.detailStat}>
                      <span className={styles.detailStatLabel}>Bids Received</span>
                      <span className={styles.detailStatValue}>{p.bids_received || 0}</span>
                    </div>
                    <div className={styles.detailStat}>
                      <span className={styles.detailStatLabel}>Over Benchmark</span>
                      <span className={styles.detailStatValue} style={{ color: Number(overBenchmark) > 0 ? 'var(--color-red-600)' : 'var(--color-emerald-600)' }}>
                        {Number(overBenchmark) > 0 ? '+' : ''}{overBenchmark}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bid Anomaly Analysis */}
                <div className={styles.detailSection}>
                  <h4 className={styles.detailSectionTitle}>
                    <BarChart3 size={16} /> Bid Anomaly Analysis
                  </h4>
                  <div className={styles.anomalyBar}>
                    <div className={styles.anomalyBarLabels}>
                      <span>Anomaly Score</span>
                      <span style={{ fontWeight: 700, color: anomalyPct > 50 ? 'var(--color-red-600)' : anomalyPct > 20 ? 'var(--color-amber-600)' : 'var(--color-emerald-600)' }}>
                        {anomalyPct}%
                      </span>
                    </div>
                    <div className={styles.barTrack} style={{ height: '10px', borderRadius: '5px' }}>
                      <div className={styles.barFill} style={{
                        width: `${Math.min(100, anomalyPct)}%`,
                        height: '100%',
                        borderRadius: '5px',
                        background: anomalyPct > 50
                          ? 'linear-gradient(90deg, var(--color-red-400), var(--color-red-600))'
                          : anomalyPct > 20
                            ? 'linear-gradient(90deg, var(--color-amber-400), var(--color-amber-600))'
                            : 'linear-gradient(90deg, var(--color-emerald-400), var(--color-emerald-600))',
                        transition: 'width 1s ease-out',
                      }}></div>
                    </div>
                    <div className={styles.anomalyScale}>
                      <span>0%</span>
                      <span style={{ color: 'var(--color-emerald-500)' }}>Low</span>
                      <span style={{ color: 'var(--color-amber-500)' }}>Medium</span>
                      <span style={{ color: 'var(--color-red-500)' }}>High</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Contractor & Project Info */}
                <div className={styles.detailSection}>
                  <h4 className={styles.detailSectionTitle}>
                    <Users size={16} /> Contractor & Project Details
                  </h4>
                  <div className={styles.detailInfoList}>
                    <div className={styles.detailInfoRow}>
                      <span className={styles.detailInfoLabel}>Contractor</span>
                      <span className={styles.detailInfoValue}>{p.contractor_name || '—'}</span>
                    </div>
                    <div className={styles.detailInfoRow}>
                      <span className={styles.detailInfoLabel}>District</span>
                      <span className={styles.detailInfoValue}>{p.districts?.name || '—'}, {p.districts?.state || ''}</span>
                    </div>
                    <div className={styles.detailInfoRow}>
                      <span className={styles.detailInfoLabel}>Current Phase</span>
                      <span className={styles.detailInfoValue}>Phase {p.phase}</span>
                    </div>
                    <div className={styles.detailInfoRow}>
                      <span className={styles.detailInfoLabel}>Status</span>
                      <span className={styles.detailInfoValue}>
                        <span className={`badge ${status.cls}`} style={{ fontSize: '11px' }}>{status.text}</span>
                      </span>
                    </div>
                    <div className={styles.detailInfoRow}>
                      <span className={styles.detailInfoLabel}>Created</span>
                      <span className={styles.detailInfoValue}>{formatTimestamp(p.created_at)}</span>
                    </div>
                    <div className={styles.detailInfoRow}>
                      <span className={styles.detailInfoLabel}>Project ID</span>
                      <span className={styles.detailInfoValue} style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-slate-400)' }}>
                        {p.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Risk Indicators */}
                {(p.status === 'flagged' || p.status === 'frozen' || p.risk_score >= 60) && (
                  <div className={styles.detailSection}>
                    <h4 className={styles.detailSectionTitle} style={{ color: 'var(--color-red-600)' }}>
                      <AlertTriangle size={16} /> Risk Indicators
                    </h4>
                    <div className={styles.riskIndicators}>
                      {anomalyPct > 50 && (
                        <div className={styles.riskFlag}>
                          <TrendingUp size={14} />
                          <span>Bid is {anomalyPct}% above benchmark — potential overbilling</span>
                        </div>
                      )}
                      {p.bids_received <= 2 && (
                        <div className={styles.riskFlag}>
                          <Users size={14} />
                          <span>Only {p.bids_received} bid(s) received — limited competition</span>
                        </div>
                      )}
                      {p.risk_score >= 70 && (
                        <div className={styles.riskFlag}>
                          <Activity size={14} />
                          <span>AI risk score {p.risk_score}/100 — requires immediate review</span>
                        </div>
                      )}
                      {p.phase2_frozen && (
                        <div className={styles.riskFlag}>
                          <Shield size={14} />
                          <span>Phase 2 funding frozen pending investigation</span>
                        </div>
                      )}
                      {contractValue > benchmarkHigh && benchmarkHigh > 0 && (
                        <div className={styles.riskFlag}>
                          <IndianRupee size={14} />
                          <span>Contract ₹{contractValue} Cr exceeds benchmark ceiling of ₹{benchmarkHigh} Cr</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className={styles.detailFooter}>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedProject(null)}>Close</button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary btn-sm"><FileText size={14} /> Audit Trail</button>
                  <button className="btn btn-primary btn-sm"><ExternalLink size={14} /> Full Report</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══════════════ CREATE PROJECT MODAL ═══════════════ */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create New Project</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalBody}>
              {formError && <div className={styles.formError}>{formError}</div>}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Project Name *</label>
                <input className={styles.formInput} name="name" value={form.name} onChange={handleChange} placeholder="e.g. NH-44 Bridge Construction" required />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>District *</label>
                <select className={styles.formInput} name="district_id" value={form.district_id} onChange={handleChange} required>
                  <option value="">Select district...</option>
                  {(districts || []).map(d => (
                    <option key={d.id} value={d.id}>{d.name}, {d.state}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Contractor Name</label>
                <input className={styles.formInput} name="contractor_name" value={form.contractor_name} onChange={handleChange} placeholder="e.g. ABC Infra Pvt Ltd" />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Contract Value (Cr)</label>
                  <input className={styles.formInput} name="contract_value_cr" type="number" step="0.01" min="0" value={form.contract_value_cr} onChange={handleChange} placeholder="0.00" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Bids Received</label>
                  <input className={styles.formInput} name="bids_received" type="number" min="0" value={form.bids_received} onChange={handleChange} placeholder="0" />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Benchmark Low (Cr)</label>
                  <input className={styles.formInput} name="benchmark_low_cr" type="number" step="0.01" min="0" value={form.benchmark_low_cr} onChange={handleChange} placeholder="0.00" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Benchmark High (Cr)</label>
                  <input className={styles.formInput} name="benchmark_high_cr" type="number" step="0.01" min="0" value={form.benchmark_high_cr} onChange={handleChange} placeholder="0.00" />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? <><Loader2 size={16} className="spin" /> Creating...</> : <><Plus size={16} /> Create Project</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
