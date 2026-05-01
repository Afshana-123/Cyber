'use client';
import { FileText, Filter, Plus, Users, Calendar, IndianRupee, Award, Clock, CheckCircle, XCircle } from 'lucide-react';
import { tenders, formatCurrency } from '@/data/mockData';

export default function TendersPage() {
  const getStatusBadge = (status) => {
    const map = {
      open: { cls: 'badge-verified', text: 'Open' },
      evaluation: { cls: 'badge-pending', text: 'Evaluation' },
      awarded: { cls: 'badge-info', text: 'Awarded' },
      closed: { cls: 'badge-resolved', text: 'Closed' },
    };
    return map[status] || map.open;
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tenders Management</h1>
          <p className="page-subtitle">Manage procurement bids and tender evaluation.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm"><Filter size={16} /> Filter</button>
          <button className="btn btn-primary btn-sm"><Plus size={16} /> New Tender</button>
        </div>
      </div>

      {/* Summary */}
      <div className="tender-summary section-gap">
        <div className="tender-stat">
          <span className="tender-stat-icon" style={{ background: 'var(--color-emerald-100)', color: 'var(--color-emerald-700)' }}><CheckCircle size={18} /></span>
          <div>
            <span className="tender-stat-val">2</span>
            <span className="tender-stat-label">Open</span>
          </div>
        </div>
        <div className="tender-stat">
          <span className="tender-stat-icon" style={{ background: 'var(--color-amber-100)', color: 'var(--color-amber-600)' }}><Clock size={18} /></span>
          <div>
            <span className="tender-stat-val">1</span>
            <span className="tender-stat-label">Evaluation</span>
          </div>
        </div>
        <div className="tender-stat">
          <span className="tender-stat-icon" style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-700)' }}><Award size={18} /></span>
          <div>
            <span className="tender-stat-val">1</span>
            <span className="tender-stat-label">Awarded</span>
          </div>
        </div>
        <div className="tender-stat">
          <span className="tender-stat-icon" style={{ background: 'var(--color-slate-100)', color: 'var(--color-slate-600)' }}><XCircle size={18} /></span>
          <div>
            <span className="tender-stat-val">1</span>
            <span className="tender-stat-label">Closed</span>
          </div>
        </div>
      </div>

      {/* Tender Cards */}
      <div className="grid-2">
        {tenders.map((tender, i) => {
          const status = getStatusBadge(tender.status);
          return (
            <div key={tender.id} className="card tender-card" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="tender-card-header">
                <div>
                  <span className="mono" style={{ fontSize: '11px', color: 'var(--color-slate-400)' }}>{tender.id}</span>
                  <h3 className="tender-title">{tender.title}</h3>
                  <span className="tender-project">{tender.project}</span>
                </div>
                <span className={`badge ${status.cls}`}><span className="badge-dot"></span>{status.text}</span>
              </div>
              <div className="tender-card-body">
                <div className="tender-info-grid">
                  <div className="tender-info">
                    <IndianRupee size={14} />
                    <div>
                      <span className="tender-info-label">Budget</span>
                      <span className="tender-info-value">{formatCurrency(tender.budget)}</span>
                    </div>
                  </div>
                  <div className="tender-info">
                    <Calendar size={14} />
                    <div>
                      <span className="tender-info-label">Deadline</span>
                      <span className="tender-info-value">{tender.deadline}</span>
                    </div>
                  </div>
                  <div className="tender-info">
                    <Users size={14} />
                    <div>
                      <span className="tender-info-label">Bids</span>
                      <span className="tender-info-value">{tender.bids} received</span>
                    </div>
                  </div>
                  <div className="tender-info">
                    <IndianRupee size={14} />
                    <div>
                      <span className="tender-info-label">Bid Range</span>
                      <span className="tender-info-value">{formatCurrency(tender.lowestBid)} — {formatCurrency(tender.highestBid)}</span>
                    </div>
                  </div>
                </div>
                {tender.winner && (
                  <div className="tender-winner">
                    <Award size={14} />
                    <span>Awarded to <strong>{tender.winner}</strong></span>
                  </div>
                )}
              </div>
              <div className="tender-card-actions">
                <button className="btn btn-sm btn-secondary">View Details</button>
                {tender.status === 'open' && <button className="btn btn-sm btn-primary">Submit Bid</button>}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .tender-summary {
          display: flex;
          gap: 16px;
        }
        .tender-stat {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-card);
          border: 1px solid rgba(203,213,225,0.4);
          border-radius: var(--radius-lg);
          padding: 14px 20px;
          box-shadow: var(--shadow-1);
          flex: 1;
        }
        .tender-stat-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          flex-shrink: 0;
        }
        .tender-stat-val {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 700;
          display: block;
          line-height: 1;
        }
        .tender-stat-label {
          font-size: 12px;
          color: var(--color-slate-500);
        }
        .tender-card { cursor: pointer; }
        .tender-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px 20px 12px;
        }
        .tender-title {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 600;
          margin: 4px 0 2px;
          color: var(--color-slate-900);
        }
        .tender-project {
          font-size: 13px;
          color: var(--color-slate-500);
        }
        .tender-card-body {
          padding: 0 20px 16px;
        }
        .tender-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .tender-info {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: var(--color-slate-500);
        }
        .tender-info-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--color-slate-400);
        }
        .tender-info-value {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-slate-800);
        }
        .tender-winner {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding: 8px 12px;
          background: var(--color-primary-50);
          border-radius: var(--radius-sm);
          font-size: 13px;
          color: var(--color-primary-700);
        }
        .tender-card-actions {
          display: flex;
          gap: 8px;
          padding: 12px 20px;
          border-top: 1px solid var(--color-slate-100);
        }
      `}</style>
    </div>
  );
}
