'use client';
import { useState } from 'react';
import {
  MessageSquareWarning, MapPin, Clock, Camera, Loader2,
  AlertTriangle, CheckCircle, Search, ExternalLink, X,
  Shield, Construction, ClipboardCheck, FileText, User, Scan
} from 'lucide-react';
import { useSupabase, timeAgo } from '@/lib/hooks';
import styles from './page.module.css';

const CATEGORY_MAP = {
  road_quality:        { icon: Construction,   label: 'Road Quality',       cls: 'catRoad' },
  poor_quality_material: { icon: Construction, label: 'Poor Quality Material', cls: 'catRoad' },
  ghost_project:       { icon: AlertTriangle,  label: 'Ghost Project',      cls: 'catGhost' },
  suspicious_activity: { icon: Shield,         label: 'Suspicious Activity', cls: 'catSuspicious' },
  inspection:          { icon: ClipboardCheck, label: 'Official Inspection', cls: 'catInspection' },
};

const ACCENT_MAP = {
  received: 'accentReceived',
  under_investigation: 'accentInvestigating',
  resolved: 'accentResolved',
};

const STATUS_CLS = {
  received: 'statusReceived',
  under_investigation: 'statusInvestigating',
  resolved: 'statusResolved',
};

export default function CitizenReportsPage() {
  const { data: reports, loading, refetch } = useSupabase('/api/reports');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updating, setUpdating] = useState(null);
  const [lightboxReport, setLightboxReport] = useState(null);

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

  const all = reports || [];
  const reportList = all.filter(r => {
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

  const totalReports = all.length;
  const receivedCount = all.filter(r => r.status === 'received').length;
  const investigatingCount = all.filter(r => r.status === 'under_investigation').length;
  const resolvedCount = all.filter(r => r.status === 'resolved').length;

  const getCat = (cat) =>
    CATEGORY_MAP[cat] || { icon: FileText, label: (cat || 'Other').replace(/_/g, ' '), cls: 'catDefault' };

  return (
    <div className="page-content">
      {/* Hero Header */}
      <div className={styles.heroHeader}>
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <h1><MessageSquareWarning size={26} /> Citizen Reports</h1>
            <p className={styles.heroSubtitle}>
              Anonymous field reports submitted by citizens via the TRACE mobile app — geo-tagged, timestamped, and linked to active government projects.
            </p>
          </div>
          <select className={styles.heroSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="received">Received</option>
            <option value="under_investigation">Under Investigation</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* KPI Stats — clickable to filter */}
      <div className={styles.kpiGrid}>
        <div
          className={`${styles.kpiCard} ${styles.kpiClickable} ${filterStatus === 'all' ? styles.kpiActive : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          <div className={`${styles.kpiIcon} ${styles.kpiIconTotal}`}><MessageSquareWarning size={22} /></div>
          <div className={styles.kpiInfo}><span className={styles.kpiValue}>{totalReports}</span><span className={styles.kpiLabel}>Total Reports</span></div>
        </div>
        <div
          className={`${styles.kpiCard} ${styles.kpiClickable} ${filterStatus === 'received' ? styles.kpiActive : ''}`}
          onClick={() => setFilterStatus('received')}
        >
          <div className={`${styles.kpiIcon} ${styles.kpiIconPending}`}><Clock size={22} /></div>
          <div className={styles.kpiInfo}><span className={styles.kpiValue}>{receivedCount}</span><span className={styles.kpiLabel}>Pending Review</span></div>
        </div>
        <div
          className={`${styles.kpiCard} ${styles.kpiClickable} ${filterStatus === 'under_investigation' ? styles.kpiActive : ''}`}
          onClick={() => setFilterStatus('under_investigation')}
        >
          <div className={`${styles.kpiIcon} ${styles.kpiIconInvestigating}`}><Scan size={22} /></div>
          <div className={styles.kpiInfo}><span className={styles.kpiValue}>{investigatingCount}</span><span className={styles.kpiLabel}>Investigating</span></div>
        </div>
        <div
          className={`${styles.kpiCard} ${styles.kpiClickable} ${filterStatus === 'resolved' ? styles.kpiActive : ''}`}
          onClick={() => setFilterStatus('resolved')}
        >
          <div className={`${styles.kpiIcon} ${styles.kpiIconResolved}`}><CheckCircle size={22} /></div>
          <div className={styles.kpiInfo}><span className={styles.kpiValue}>{resolvedCount}</span><span className={styles.kpiLabel}>Resolved</span></div>
        </div>
      </div>

      {/* Search */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={18} style={{ color: 'var(--color-slate-400)', flexShrink: 0 }} />
          <input className={styles.searchInput} type="text" placeholder="Search by category, description, or district..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <span className={styles.searchCount}>{reportList.length} found</span>}
        </div>
      </div>

      {/* Reports */}
      {reportList.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><MessageSquareWarning size={36} /></div>
          <p className={styles.emptyTitle}>No citizen reports found</p>
          <p className={styles.emptySubtitle}>Reports submitted from the TRACE mobile app will appear here automatically.</p>
        </div>
      ) : (
        <div className={styles.reportGrid}>
          {reportList.map((report, i) => {
            const status = report.status || 'received';
            const cat = getCat(report.category);
            const CatIcon = cat.icon;
            return (
              <div key={report.id} className={styles.reportCard} style={{ animationDelay: `${i * 70}ms` }}>
                <div className={`${styles.cardAccent} ${styles[ACCENT_MAP[status]] || styles.accentReceived}`} />
                <div className={styles.cardInner}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>
                      <span className={`${styles.categoryPill} ${styles[cat.cls]}`}><CatIcon size={13} /> {cat.label}</span>
                      <span className={styles.cardTimestamp}><Clock size={11} /> {timeAgo(report.created_at)}</span>
                    </div>
                    <div
                      className={styles.evidenceThumbnail}
                      onClick={() => report.photo_url ? setLightboxReport(report) : null}
                      title={report.photo_url ? 'Click to view photo' : ''}
                      style={report.photo_url ? { cursor: 'pointer' } : {}}
                    >
                      <Camera size={22} />
                      <span className={styles.evidenceLabel}>Photo</span>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.reportDescription}>{report.description || 'No description provided.'}</p>
                    <div className={styles.detailChips}>
                      <div className={styles.infoChip}>
                        <MapPin size={15} />
                        <span>{report.districts?.name || 'Unknown District'}{report.districts?.state ? `, ${report.districts.state}` : ''}</span>
                      </div>
                      {report.projects?.name && (
                        <div className={styles.linkedProjectChip}>
                          <AlertTriangle size={15} />
                          <span>Linked to: <strong>{report.projects.name}</strong></span>
                        </div>
                      )}
                      {report.gps_lat && report.gps_lng && (
                        <a className={styles.gpsChip} href={`https://www.google.com/maps?q=${report.gps_lat},${report.gps_lng}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={13} /> View on Map ({Number(report.gps_lat).toFixed(4)}, {Number(report.gps_lng).toFixed(4)})
                        </a>
                      )}
                    </div>
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={`${styles.sourceChip} ${report.type === 'citizen' ? styles.sourceCitizen : styles.sourceAuditor}`}>
                      {report.type === 'citizen' ? <><User size={12} /> Citizen</> : <><Scan size={12} /> Auditor</>}
                    </span>
                    {updating === report.id ? (
                      <Loader2 size={16} className="spin" style={{ color: 'var(--color-primary-500)' }} />
                    ) : (
                      <select className={`${styles.statusBadge} ${styles[STATUS_CLS[status]] || ''}`} value={status} onChange={(e) => handleStatusChange(report.id, e.target.value)}>
                        <option value="received">Received</option>
                        <option value="under_investigation">Investigating</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Photo Lightbox Modal ── */}
      {lightboxReport && (() => {
        const lbCat = getCat(lightboxReport.category);
        return (
          <div className={styles.lightboxOverlay} onClick={() => setLightboxReport(null)}>
            <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.lightboxClose} onClick={() => setLightboxReport(null)}>
                <X size={24} />
              </button>
              <img
                src={lightboxReport.photo_url}
                alt="Evidence photo"
                className={styles.lightboxImg}
              />
              <div className={styles.lightboxInfo}>
                <span className={styles.lightboxCategory}>
                  {lbCat.label}
                </span>
                <span className={styles.lightboxMeta}>
                  <MapPin size={13} /> {lightboxReport.districts?.name || 'Unknown'}
                  {lightboxReport.districts?.state ? `, ${lightboxReport.districts.state}` : ''}
                </span>
                <span className={styles.lightboxMeta}>
                  <Clock size={13} /> {timeAgo(lightboxReport.created_at)}
                </span>
                {lightboxReport.description && (
                  <p className={styles.lightboxDesc}>{lightboxReport.description}</p>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
