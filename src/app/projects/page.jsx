'use client';
import { FolderOpen, Filter, Plus, Search, TrendingUp, TrendingDown, ShieldCheck, AlertTriangle, Clock, MapPin, Calendar } from 'lucide-react';
import { projects, formatCurrency } from '@/data/mockData';

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

      {/* Stats Bar */}
      <div className="projects-stats section-gap">
        <div className="stat-pill"><span className="stat-number">{projects.length}</span> Total Projects</div>
        <div className="stat-pill"><span className="stat-number" style={{ color: 'var(--color-emerald-600)' }}>4</span> On Track</div>
        <div className="stat-pill"><span className="stat-number" style={{ color: 'var(--color-red-600)' }}>2</span> At Risk</div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid-3">
        {projects.map((project, i) => {
          const status = getStatusBadge(project.status);
          const spent = project.spent / 10000000000;
          const budget = project.budget / 10000000000;
          const overspend = spent > budget;
          return (
            <div key={project.id} className="project-card card" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="project-card-top">
                <div className="project-card-header">
                  <span className={`badge ${status.cls}`}><span className="badge-dot"></span>{status.text}</span>
                  <span className="project-risk" style={{ color: getRiskColor(project.riskScore) }}>
                    Risk: {project.riskScore}
                  </span>
                </div>
                <h3 className="project-name">{project.name}</h3>
                <div className="project-meta">
                  <span><MapPin size={13} /> {project.state}</span>
                  <span><Calendar size={13} /> {project.category}</span>
                </div>
              </div>

              <div className="project-card-body">
                {/* Progress Ring */}
                <div className="project-progress-section">
                  <div className="progress-ring-wrap">
                    <svg viewBox="0 0 80 80" className="progress-ring">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-slate-100)" strokeWidth="6" />
                      <circle
                        cx="40" cy="40" r="34"
                        fill="none"
                        stroke={getRiskColor(100 - project.progress)}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 34}`}
                        strokeDashoffset={`${2 * Math.PI * 34 * (1 - project.progress / 100)}`}
                        transform="rotate(-90, 40, 40)"
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                      />
                    </svg>
                    <span className="progress-ring-text">{project.progress}%</span>
                  </div>
                  <div className="project-budget-info">
                    <div className="budget-row">
                      <span className="budget-label">Budget</span>
                      <span className="budget-value">₹{budget.toFixed(0)} Cr</span>
                    </div>
                    <div className="budget-row">
                      <span className="budget-label">Spent</span>
                      <span className="budget-value" style={{ color: overspend ? 'var(--color-red-600)' : 'inherit' }}>₹{spent.toFixed(0)} Cr</span>
                    </div>
                    {/* Budget bar */}
                    <div className="budget-bar-track">
                      <div
                        className="budget-bar-fill"
                        style={{
                          width: `${Math.min(100, (project.spent / project.budget) * 100)}%`,
                          background: overspend ? 'var(--color-red-500)' : 'var(--color-primary-500)'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="project-card-footer">
                  <span className="project-verified">
                    <ShieldCheck size={14} /> Verified {project.lastVerified}
                  </span>
                  <span className="project-contractor">{project.contractor}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .projects-stats {
          display: flex;
          gap: 12px;
        }
        .stat-pill {
          padding: 8px 16px;
          background: var(--bg-card);
          border: 1px solid var(--color-slate-200);
          border-radius: var(--radius-full);
          font-size: 13px;
          color: var(--color-slate-600);
        }
        .stat-number {
          font-weight: 700;
          font-family: var(--font-display);
          color: var(--color-slate-900);
        }
        .project-card {
          cursor: pointer;
          overflow: hidden;
        }
        .project-card-top {
          padding: 20px 20px 12px;
        }
        .project-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .project-risk {
          font-family: var(--font-label);
          font-size: 12px;
          font-weight: 600;
        }
        .project-name {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 600;
          color: var(--color-slate-900);
          margin-bottom: 6px;
        }
        .project-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: var(--color-slate-500);
        }
        .project-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .project-card-body {
          padding: 12px 20px 20px;
        }
        .project-progress-section {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }
        .progress-ring-wrap {
          position: relative;
          width: 72px;
          height: 72px;
          flex-shrink: 0;
        }
        .progress-ring {
          width: 100%;
          height: 100%;
        }
        .progress-ring-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 700;
          color: var(--color-slate-900);
        }
        .project-budget-info {
          flex: 1;
        }
        .budget-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 4px;
        }
        .budget-label { color: var(--color-slate-500); }
        .budget-value { font-weight: 600; }
        .budget-bar-track {
          height: 6px;
          background: var(--color-slate-100);
          border-radius: 3px;
          margin-top: 6px;
          overflow: hidden;
        }
        .budget-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 1s ease-out;
        }
        .project-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid var(--color-slate-100);
          font-size: 12px;
          color: var(--color-slate-500);
        }
        .project-verified {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--color-emerald-600);
        }
      `}</style>
    </div>
  );
}
