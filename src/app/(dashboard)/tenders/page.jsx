'use client';
import { Filter, MapPin, Users, TrendingDown, TrendingUp, Loader2, IndianRupee, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useSupabase } from '@/lib/hooks';
import styles from './page.module.css';

export default function TendersPage() {
  const { data: schemes, loading } = useSupabase('/api/schemes');
  const { data: beneficiaries } = useSupabase('/api/beneficiaries');

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Loader2 size={32} className="spin" style={{ color: 'var(--color-primary-500)' }} />
      </div>
    );
  }

  const schemeList = schemes || [];
  const beneList = beneficiaries || [];

  const getStatusBadge = (status) => {
    const map = {
      clean: { cls: 'badge-verified', text: 'Clean' },
      flagged: { cls: 'badge-flagged', text: 'Flagged' },
      under_review: { cls: 'badge-pending', text: 'Under Review' },
    };
    return map[status] || { cls: 'badge-info', text: status || 'Unknown' };
  };

  const getRiskColor = (score) => {
    if (score <= 30) return 'var(--color-emerald-500)';
    if (score <= 60) return 'var(--color-amber-500)';
    return 'var(--color-red-600)';
  };

  const totalAllocated = schemeList.reduce((s, i) => s + Number(i.allocated_crore || 0), 0);
  const totalMissing = schemeList.reduce((s, i) => s + Number(i.missing_crore || 0), 0);
  const ghostCount = beneList.filter(b => b.is_ghost).length;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Schemes & Beneficiaries</h1>
          <p className="page-subtitle">Government schemes with fund allocation, utilization, and ghost beneficiary detection.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm"><Filter size={16} /> Filter</button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid-4 section-gap">
        <div className="auditor-kpi">
          <span className="auditor-kpi-icon" style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-700)' }}><IndianRupee size={20} /></span>
          <div>
            <span className="auditor-kpi-val">₹{totalAllocated.toFixed(2)} Cr</span>
            <span className="auditor-kpi-label">Allocated</span>
          </div>
        </div>
        <div className="auditor-kpi">
          <span className="auditor-kpi-icon" style={{ background: 'var(--color-red-100)', color: 'var(--color-red-600)' }}><AlertTriangle size={20} /></span>
          <div>
            <span className="auditor-kpi-val">₹{totalMissing.toFixed(2)} Cr</span>
            <span className="auditor-kpi-label">Missing Funds</span>
          </div>
        </div>
        <div className="auditor-kpi">
          <span className="auditor-kpi-icon" style={{ background: 'var(--color-amber-100)', color: 'var(--color-amber-600)' }}><Users size={20} /></span>
          <div>
            <span className="auditor-kpi-val">{ghostCount}</span>
            <span className="auditor-kpi-label">Ghost Beneficiaries</span>
          </div>
        </div>
        <div className="auditor-kpi">
          <span className="auditor-kpi-icon" style={{ background: 'var(--color-emerald-100)', color: 'var(--color-emerald-700)' }}><ShieldCheck size={20} /></span>
          <div>
            <span className="auditor-kpi-val">{schemeList.length}</span>
            <span className="auditor-kpi-label">Total Schemes</span>
          </div>
        </div>
      </div>

      {schemeList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-slate-400)' }}>
          <p style={{ fontSize: '16px' }}>No schemes found</p>
        </div>
      ) : (
        <div className="grid-3">
          {schemeList.map((scheme, i) => {
            const status = getStatusBadge(scheme.status);
            const allocated = Number(scheme.allocated_crore || 0);
            const withdrawn = Number(scheme.withdrawn_crore || 0);
            const returned = Number(scheme.returned_crore || 0);
            const missing = Number(scheme.missing_crore || 0);
            const utilizationPct = allocated > 0 ? Math.round((withdrawn / allocated) * 100) : 0;
            const schemeBenes = beneList.filter(b => b.scheme_id === scheme.id);
            const schemeGhosts = schemeBenes.filter(b => b.is_ghost).length;

            return (
              <div key={scheme.id} className={`card ${styles.tenderCard}`} style={{ animationDelay: `${i * 80}ms` }}>
                <div className={styles.cardTop}>
                  <div className={styles.cardHeader}>
                    <span className={`badge ${status.cls}`}><span className="badge-dot"></span>{status.text}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: getRiskColor(scheme.risk_score) }}>Risk: {scheme.risk_score}</span>
                  </div>
                  <h3 className={styles.name}>{scheme.name}</h3>
                  <div className={styles.meta}>
                    <span className={styles.metaItem}><MapPin size={13} /> {scheme.districts?.name || 'N/A'}</span>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.bidStats}>
                    <div className={styles.bidStat}>
                      <IndianRupee size={14} style={{ color: 'var(--color-primary-600)' }} />
                      <span>Allocated: ₹{allocated.toFixed(2)} Cr</span>
                    </div>
                    <div className={styles.bidStat}>
                      <TrendingDown size={14} style={{ color: 'var(--color-amber-600)' }} />
                      <span>Withdrawn: ₹{withdrawn.toFixed(2)} Cr</span>
                    </div>
                    <div className={styles.bidStat}>
                      <TrendingUp size={14} style={{ color: 'var(--color-emerald-600)' }} />
                      <span>Returned: ₹{returned.toFixed(2)} Cr</span>
                    </div>
                  </div>

                  {/* Utilization bar */}
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-slate-500)', marginBottom: '4px' }}>
                      <span>Utilization</span>
                      <span>{utilizationPct}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--color-slate-100)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '3px', transition: 'width 1s ease-out',
                        width: `${Math.min(100, utilizationPct)}%`,
                        background: utilizationPct > 80 ? 'var(--color-red-500)' : utilizationPct > 50 ? 'var(--color-amber-500)' : 'var(--color-emerald-500)'
                      }}></div>
                    </div>
                  </div>

                  {missing > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', padding: '8px 12px', background: 'var(--color-red-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-red-100)' }}>
                      <AlertTriangle size={14} style={{ color: 'var(--color-red-600)' }} />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-red-700)' }}>₹{missing.toFixed(2)} Cr Missing</span>
                    </div>
                  )}

                  {schemeGhosts > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', padding: '8px 12px', background: 'var(--color-amber-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-amber-100)' }}>
                      <Users size={14} style={{ color: 'var(--color-amber-600)' }} />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-amber-700)' }}>{schemeGhosts} Ghost Beneficiaries</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-slate-100)', fontSize: '12px', color: 'var(--color-slate-500)' }}>
                    <span>Return Rate: {parseFloat(scheme.return_rate || 0).toFixed(2)}%</span>
                    <span>{schemeBenes.length} beneficiaries</span>
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
