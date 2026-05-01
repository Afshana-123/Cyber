'use client';
import { Filter, MapPin, Calendar, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useSupabase, timeAgo } from '@/lib/hooks';
import styles from './page.module.css';

export default function ProjectsPage() {
  const { data: projects, loading } = useSupabase('/api/projects');

  const getStatusBadge = (status) => {
    const map = {
      clean: { cls: 'badge-verified', text: 'Clean' },
      flagged: { cls: 'badge-flagged', text: 'Flagged' },
      under_review: { cls: 'badge-pending', text: 'Under Review' },
      completed: { cls: 'badge-info', text: 'Completed' },
    };
    return map[status] || { cls: 'badge-info', text: status || 'Unknown' };
  };

  const getRiskColor = (score) => {
    if (score <= 30) return 'var(--color-emerald-500)';
    if (score <= 60) return 'var(--color-amber-500)';
    return 'var(--color-red-600)';
  };

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Loader2 size={32} className="spin" style={{ color: 'var(--color-primary-500)' }} />
      </div>
    );
  }

  const projectList = projects || [];
  const flaggedCount = projectList.filter(p => p.status === 'flagged').length;
  const cleanCount = projectList.filter(p => p.status === 'clean').length;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Track all government-funded projects and their risk scores.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm"><Filter size={16} /> Filter</button>
        </div>
      </div>

      <div className={`${styles.stats} section-gap`}>
        <div className={styles.statPill}><span className={styles.statNumber}>{projectList.length}</span> Total Projects</div>
        <div className={styles.statPill}><span className={styles.statNumber} style={{ color: 'var(--color-emerald-600)' }}>{cleanCount}</span> Clean</div>
        <div className={styles.statPill}><span className={styles.statNumber} style={{ color: 'var(--color-red-600)' }}>{flaggedCount}</span> Flagged</div>
      </div>

      {projectList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-slate-400)' }}>
          <p style={{ fontSize: '16px' }}>No projects found in database.</p>
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
    </div>
  );
}
