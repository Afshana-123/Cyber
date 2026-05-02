'use client';
import { useState } from 'react';
import { MessageSquareWarning, MapPin, Clock, Camera, Loader2, AlertTriangle, CheckCircle, Search, Eye, Filter, ExternalLink, Shield, FileWarning, Construction, ClipboardCheck, FileText } from 'lucide-react';
import { useSupabase, timeAgo } from '@/lib/hooks';
import styles from './page.module.css';

const CATEGORY_CONFIG = {
  road_quality: { icon: Construction, label: 'Road Quality', emoji: '🛣️' },
  ghost_project: { icon: FileWarning, label: 'Ghost Project', emoji: '👻' },
  suspicious_activity: { icon: Shield, label: 'Suspicious Activity', emoji: '🔍' },
  inspection: { icon: ClipboardCheck, label: 'Inspection', emoji: '📋' },
};

const STATUS_CONFIG = {
  received: { label: 'Received', cardClass: 'statusReceived' },
  under_investigation: { label: 'Investigating', cardClass: 'statusInvestigating' },
  resolved: { label: 'Resolved', cardClass: 'statusResolved' },
};

export default function CitizenReportsPage() {
  const { data: reports, loading, refetch } = useSupabase('/api/reports');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updating, setUpdating] = useState(null);

  const handleStatusChange = async (reportId, newStatus) => {
    setUpdating(reportId);
    try {
      const res = await fetch('/api/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reportId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update');
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Loader2 size={32} className="spin" style={{ color: 'var(--color-primary-500)' }} />
      </div>
    );
  }

  const reportList = (reports || [])
    .filter(r => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          r.category?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.districts?.name?.toLowerCase().includes(q)
        );
      }
      return true;
    });

  const totalReports = (reports || []).length;
  const receivedCount = (reports || []).filter(r => r.status === 'received').length;
  const investigatingCount = (reports || []).filter(r => r.status === 'under_investigation').length;
  const resolvedCount = (reports || []).filter(r => r.status === 'resolved').length;

  const getCat = (cat) => CATEGORY_CONFIG[cat] || { icon: FileText, label: (cat || 'other').replace(/_/g, ' '), emoji: '📝' };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquareWarning size={24} style={{ color: 'var(--color-primary-500)' }} />
            Citizen Reports
          </h1>
          <p className="page-subtitle">Anonymous reports submitted by citizens from the TRACE mobile app.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            className="btn btn-secondary btn-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >
            <option value="all">All Status</option>
            <option value="received">Received</option>
            <option value="under_investigation">Under Investigation</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-4 section-gap">
        <div className="auditor-kpi">
          <span className="auditor-kpi-icon" style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-700)' }}>
            <MessageSquareWarning size={20} />
          </span>
          <div>
            <span className="auditor-kpi-val">{totalReports}</span>
            <span className="auditor-kpi-label">Total Reports</span>
          </div>
        </div>
        <div className="auditor-kpi">
          <span className="auditor-kpi-icon" style={{ background: 'var(--color-amber-100)', color: 'var(--color-amber-600)' }}>
            <Clock size={20} />
          </span>
          <div>
            <span className="auditor-kpi-val">{receivedCount}</span>
            <span className="auditor-kpi-label">Pending Review</span>
          </div>
        </div>
        <div className="auditor-kpi">
          <span className="auditor-kpi-icon" style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-700)' }}>
            <Eye size={20} />
          </span>
          <div>
            <span className="auditor-kpi-val">{investigatingCount}</span>
            <span className="auditor-kpi-label">Investigating</span>
          </div>
        </div>
        <div className="auditor-kpi">
          <span className="auditor-kpi-icon" style={{ background: 'var(--color-emerald-100)', color: 'var(--color-emerald-700)' }}>
            <CheckCircle size={20} />
          </span>
          <div>
            <span className="auditor-kpi-val">{resolvedCount}</span>
            <span className="auditor-kpi-label">Resolved</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="section-gap">
        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={18} style={{ color: 'var(--color-slate-400)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by category, description, or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none', outline: 'none', width: '100%', fontSize: '14px',
              background: 'transparent', color: 'var(--color-slate-700)',
              fontFamily: 'var(--font-body)',
            }}
          />
          {search && (
            <span style={{ fontSize: '12px', color: 'var(--color-slate-400)', whiteSpace: 'nowrap' }}>
              {reportList.length} result{reportList.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Reports List */}
      {reportList.length === 0 ? (
        <div className="card">
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <MessageSquareWarning size={32} />
            </div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-slate-700)', marginBottom: '6px' }}>
              No citizen reports found
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-slate-400)' }}>
              Reports submitted from the TRACE mobile app will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid-3">
          {reportList.map((report, i) => {
            const statusClass = report.status || 'received';
            const statusConf = STATUS_CONFIG[statusClass] || STATUS_CONFIG.received;
            const cat = getCat(report.category);
            const CatIcon = cat.icon;

            return (
              <div
                key={report.id}
                className={`card ${styles.reportCard} ${styles[statusConf.cardClass]}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={styles.reportHeader}>
                  <div className={styles.reportMeta}>
                    <span className={`${styles.categoryBadge} ${styles[report.category] || styles.other}`}>
                      <CatIcon size={13} />
                      {cat.label}
                    </span>
                    <span className={styles.reportTime}>
                      <Clock size={11} />
                      {timeAgo(report.created_at)}
                    </span>
                  </div>
                  <div className={styles.photoThumb}>
                    <Camera size={20} />
                  </div>
                </div>

                <div className={styles.reportBody}>
                  <p className={styles.reportDescription}>
                    {report.description || 'No description provided.'}
                  </p>

                  <div className={styles.reportInfoRow}>
                    <MapPin size={14} />
                    <span>{report.districts?.name || 'Unknown District'}{report.districts?.state ? `, ${report.districts.state}` : ''}</span>
                  </div>

                  {report.projects?.name && (
                    <div className={styles.linkedProject}>
                      <AlertTriangle size={14} />
                      <span>Linked: <strong>{report.projects.name}</strong></span>
                    </div>
                  )}

                  {report.gps_lat && report.gps_lng && (
                    <a
                      className={styles.gpsLink}
                      href={`https://www.google.com/maps?q=${report.gps_lat},${report.gps_lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={12} />
                      View on Map ({Number(report.gps_lat).toFixed(4)}, {Number(report.gps_lng).toFixed(4)})
                    </a>
                  )}
                </div>

                <div className={styles.reportFooter}>
                  <span className={styles.sourceTag}>
                    {report.type === 'citizen' ? '👤 Citizen' : '🔍 Auditor'}
                  </span>
                  {updating === report.id ? (
                    <Loader2 size={16} className="spin" style={{ color: 'var(--color-primary-500)' }} />
                  ) : (
                    <select
                      className={`${styles.statusSelect} ${styles[statusClass]}`}
                      value={report.status || 'received'}
                      onChange={(e) => handleStatusChange(report.id, e.target.value)}
                    >
                      <option value="received">Received</option>
                      <option value="under_investigation">Investigating</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
