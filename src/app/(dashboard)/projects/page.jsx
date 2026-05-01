'use client';
import { Filter, Plus, ShieldCheck, MapPin, Calendar } from 'lucide-react';
import { projects } from '@/data/mockData';
import styles from './page.module.css';

export default function ProjectsPage() {
  const getStatusBadge = (status) => {
    const map = {
      planning: { cls: 'badge-info', text: 'Planning' },
      execution: { cls: 'badge-pending', text: 'Execution' },
      audit: { cls: 'badge-flagged', text: 'Audit' },
      complete: { cls: 'badge-verified', text: 'Complete' },
    };
    return map[status] || map.planning;
  };

  const getRiskColor = (score) => {
    if (score <= 30) return 'var(--color-emerald-500)';
    if (score <= 60) return 'var(--color-amber-500)';
    return 'var(--color-red-600)';
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Track all government-funded projects and their progress.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm"><Filter size={16} /> Filter</button>
          <button className="btn btn-primary btn-sm"><Plus size={16} /> New Project</button>
        </div>
      </div>

      <div className={`${styles.stats} section-gap`}>
        <div className={styles.statPill}><span className={styles.statNumber}>{projects.length}</span> Total Projects</div>
        <div className={styles.statPill}><span className={styles.statNumber} style={{ color: 'var(--color-emerald-600)' }}>4</span> On Track</div>
        <div className={styles.statPill}><span className={styles.statNumber} style={{ color: 'var(--color-red-600)' }}>2</span> At Risk</div>
      </div>

      <div className="grid-3">
        {projects.map((project, i) => {
          const status = getStatusBadge(project.status);
          const spent = project.spent / 10000000000;
          const budget = project.budget / 10000000000;
          const overspend = spent > budget;
          return (
            <div key={project.id} className={`card ${styles.projectCard}`} style={{ animationDelay: `${i * 80}ms` }}>
              <div className={styles.cardTop}>
                <div className={styles.cardHeader}>
                  <span className={`badge ${status.cls}`}><span className="badge-dot"></span>{status.text}</span>
                  <span className={styles.risk} style={{ color: getRiskColor(project.riskScore) }}>Risk: {project.riskScore}</span>
                </div>
                <h3 className={styles.name}>{project.name}</h3>
                <div className={styles.meta}>
                  <span className={styles.metaItem}><MapPin size={13} /> {project.state}</span>
                  <span className={styles.metaItem}><Calendar size={13} /> {project.category}</span>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.progressSection}>
                  <div className={styles.ringWrap}>
                    <svg viewBox="0 0 80 80" className={styles.ring}>
                      <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-slate-100)" strokeWidth="6" />
                      <circle cx="40" cy="40" r="34" fill="none" stroke={getRiskColor(100 - project.progress)} strokeWidth="6"
                        strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 34}`}
                        strokeDashoffset={`${2 * Math.PI * 34 * (1 - project.progress / 100)}`}
                        transform="rotate(-90, 40, 40)" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                    </svg>
                    <span className={styles.ringText}>{project.progress}%</span>
                  </div>
                  <div className={styles.budgetInfo}>
                    <div className={styles.budgetRow}>
                      <span className={styles.budgetLabel}>Budget</span>
                      <span className={styles.budgetValue}>₹{budget.toFixed(0)} Cr</span>
                    </div>
                    <div className={styles.budgetRow}>
                      <span className={styles.budgetLabel}>Spent</span>
                      <span className={styles.budgetValue} style={{ color: overspend ? 'var(--color-red-600)' : 'inherit' }}>₹{spent.toFixed(0)} Cr</span>
                    </div>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{
                        width: `${Math.min(100, (project.spent / project.budget) * 100)}%`,
                        background: overspend ? 'var(--color-red-500)' : 'var(--color-primary-500)'
                      }}></div>
                    </div>
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.verified}><ShieldCheck size={14} /> Verified {project.lastVerified}</span>
                  <span>{project.contractor}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
