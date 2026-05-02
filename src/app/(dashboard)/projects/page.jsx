'use client';
import { useState } from 'react';
import { Filter, MapPin, Calendar, Loader2, AlertTriangle, ShieldCheck, Plus, X, Search } from 'lucide-react';
import { useSupabase, timeAgo } from '@/lib/hooks';
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
              <div key={project.id} className={`card ${styles.projectCard}`} style={{ animationDelay: `${i * 80}ms` }}>
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

      {/* New Project Modal */}
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
