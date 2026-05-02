'use client';
import { useState, useMemo, Suspense, lazy } from 'react';
import { Eye, Search, ShieldCheck, AlertTriangle, IndianRupee, FolderOpen, Activity, MapPin, Hexagon, Loader2, Users, List, Map, Filter, X, ChevronDown, Calendar, Building2, TrendingUp } from 'lucide-react';
import { useSupabase, formatTimestamp } from '@/lib/hooks';
import styles from './page.module.css';

const ProjectMap = lazy(() => import('@/components/ProjectMap'));

export default function PublicPage() {
  const { data: stats, loading: statsLoading } = useSupabase('/api/dashboard');
  const { data: projects, loading: projLoading } = useSupabase('/api/projects');
  const { data: transactions, loading: txnLoading } = useSupabase('/api/transactions');

  // View toggle state
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [selectedProject, setSelectedProject] = useState(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const isLoading = statsLoading || projLoading || txnLoading;

  const projectList = projects || [];
  const txnList = transactions || [];

  // Extract unique districts and statuses for filter dropdowns
  const uniqueDistricts = [...new Set(projectList.map(p => p.districts?.name).filter(Boolean))].sort();
  const uniqueStatuses = [...new Set(projectList.map(p => p.status).filter(Boolean))];

  // Filtered + sorted projects
  const filteredProjects = useMemo(() => {
    let result = [...projectList];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.contractor_name?.toLowerCase().includes(q) ||
        p.districts?.name?.toLowerCase().includes(q) ||
        p.districts?.state?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    // Risk filter
    if (riskFilter !== 'all') {
      if (riskFilter === 'low') result = result.filter(p => (p.risk_score || 0) <= 30);
      else if (riskFilter === 'medium') result = result.filter(p => (p.risk_score || 0) > 30 && (p.risk_score || 0) <= 60);
      else if (riskFilter === 'high') result = result.filter(p => (p.risk_score || 0) > 60);
    }

    // District filter
    if (districtFilter !== 'all') {
      result = result.filter(p => p.districts?.name === districtFilter);
    }

    // Sort
    if (sortBy === 'name') result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    else if (sortBy === 'risk_high') result.sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));
    else if (sortBy === 'risk_low') result.sort((a, b) => (a.risk_score || 0) - (b.risk_score || 0));
    else if (sortBy === 'value_high') result.sort((a, b) => Number(b.contract_value_cr || 0) - Number(a.contract_value_cr || 0));
    else if (sortBy === 'value_low') result.sort((a, b) => Number(a.contract_value_cr || 0) - Number(b.contract_value_cr || 0));

    return result;
  }, [projectList, searchQuery, statusFilter, riskFilter, districtFilter, sortBy]);

  const activeFilterCount = [statusFilter !== 'all', riskFilter !== 'all', districtFilter !== 'all'].filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Loader2 size={32} className="spin" style={{ color: 'var(--color-primary-500)' }} />
      </div>
    );
  }

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setRiskFilter('all');
    setDistrictFilter('all');
    setSortBy('name');
  };

  const getRiskColor = (score) => {
    if (score <= 30) return 'var(--color-emerald-500)';
    if (score <= 60) return 'var(--color-amber-500)';
    return 'var(--color-red-600)';
  };

  return (
    <div className="page-content">
      {/* Public Header */}
      <div className="public-hero section-gap">
        <div className="public-hero-content">
          <div className="public-hero-badge">
            <Eye size={16} />
            <span>Public Access — Read-Only</span>
          </div>
          <h1 className="display-lg" style={{ color: 'white', marginBottom: '8px' }}>
            ChainTrust Transparency Portal
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', maxWidth: '600px' }}>
            Track how public funds are allocated and spent. Every transaction is 
            blockchain-verified and immutable.
          </p>
          <div className="public-search-wrap">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search projects, contractors, or districts..."
              className="public-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ color: 'rgba(255,255,255,0.6)', display: 'flex' }}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="public-hero-stats">
          <div className="public-stat">
            <IndianRupee size={20} />
            <span className="public-stat-val">₹{parseFloat(stats?.totalFundsCr || 0).toFixed(2)} Cr</span>
            <span className="public-stat-label">Allocated</span>
          </div>
          <div className="public-stat">
            <FolderOpen size={20} />
            <span className="public-stat-val">{stats?.totalProjects ?? 0}</span>
            <span className="public-stat-label">Projects</span>
          </div>
          <div className="public-stat">
            <ShieldCheck size={20} />
            <span className="public-stat-val">{txnList.length}</span>
            <span className="public-stat-label">Transactions</span>
          </div>
          <div className="public-stat">
            <Activity size={20} />
            <span className="public-stat-val">Live</span>
            <span className="public-stat-label">Supabase</span>
          </div>
        </div>
      </div>

      {/* Project Explorer Header with Toggle + Filter */}
      <div className="section-gap">
        <div className={styles.explorerHeader}>
          <div className={styles.explorerLeft}>
            <h2 className="heading-2">All Projects</h2>
            <span className={styles.resultCount}>
              {filteredProjects.length} of {projectList.length} projects
            </span>
          </div>

          <div className={styles.explorerControls}>
            {/* Filter Toggle */}
            <button
              className={`${styles.controlBtn} ${showFilters ? styles.controlBtnActive : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={15} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className={styles.filterBadge}>{activeFilterCount}</span>
              )}
            </button>

            {/* View Toggle */}
            <div className={styles.viewToggle}>
              <button
                className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.toggleBtnActive : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List size={16} />
                <span>List</span>
              </button>
              <button
                className={`${styles.toggleBtn} ${viewMode === 'map' ? styles.toggleBtnActive : ''}`}
                onClick={() => setViewMode('map')}
                title="Map View"
              >
                <Map size={16} />
                <span>Map</span>
              </button>
            </div>

            <span className="badge badge-verified"><span className="badge-dot"></span>Live Data</span>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGrid}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Status</label>
                <div className={styles.selectWrap}>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="all">All Statuses</option>
                    {uniqueStatuses.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className={styles.selectIcon} />
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Risk Level</label>
                <div className={styles.selectWrap}>
                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="all">All Levels</option>
                    <option value="low">Low (0-30)</option>
                    <option value="medium">Medium (31-60)</option>
                    <option value="high">High (61-100)</option>
                  </select>
                  <ChevronDown size={14} className={styles.selectIcon} />
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>District</label>
                <div className={styles.selectWrap}>
                  <select
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="all">All Districts</option>
                    {uniqueDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className={styles.selectIcon} />
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Sort By</label>
                <div className={styles.selectWrap}>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="risk_high">Risk (High → Low)</option>
                    <option value="risk_low">Risk (Low → High)</option>
                    <option value="value_high">Value (High → Low)</option>
                    <option value="value_low">Value (Low → High)</option>
                  </select>
                  <ChevronDown size={14} className={styles.selectIcon} />
                </div>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className={styles.filterActions}>
                <button className={styles.clearBtn} onClick={clearAllFilters}>
                  <X size={14} />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          filteredProjects.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Search size={40} style={{ color: 'var(--color-slate-300)', marginBottom: '12px' }} />
              <p style={{ fontSize: '16px', color: 'var(--color-slate-500)', fontWeight: 500 }}>No projects match your filters</p>
              <p style={{ fontSize: '13px', color: 'var(--color-slate-400)', marginTop: '4px' }}>Try adjusting your search or filter criteria</p>
              {activeFilterCount > 0 && (
                <button className={styles.clearBtnInline} onClick={clearAllFilters}>Clear filters</button>
              )}
            </div>
          ) : (
            <div className="grid-3">
              {filteredProjects.map((project, i) => {
                const contractValue = Number(project.contract_value_cr || 0);
                return (
                  <div key={project.id} className="public-project-card card" style={{ animationDelay: `${i * 100}ms`, cursor: 'pointer' }} onClick={() => setSelectedProject(project)}>
                    <div className="public-project-top">
                      <div className="public-project-category">{project.status}</div>
                      <h3 className="public-project-name">{project.name}</h3>
                      <span className="public-project-loc"><MapPin size={13} /> {project.districts?.name || 'India'}, {project.districts?.state || ''}</span>
                    </div>
                    <div className="public-project-body">
                      <div className="public-project-budget">
                        <div className="public-budget-item">
                          <span className="public-budget-label">Contract Value</span>
                          <span className="public-budget-val">₹{contractValue.toFixed(2)} Cr</span>
                        </div>
                        <div className="public-budget-item">
                          <span className="public-budget-label">Contractor</span>
                          <span style={{ fontSize: '13px', fontWeight: 500 }}>{project.contractor_name}</span>
                        </div>
                      </div>
                      <div className="public-project-trust">
                        {project.risk_score > 50 ? (
                          <AlertTriangle size={14} style={{ color: 'var(--color-red-600)' }} />
                        ) : (
                          <ShieldCheck size={14} style={{ color: 'var(--color-emerald-600)' }} />
                        )}
                        <span>Risk Score: <strong style={{ color: getRiskColor(project.risk_score) }}>{project.risk_score}/100</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Map View */}
        {viewMode === 'map' && (
          <Suspense fallback={
            <div className={styles.mapLoading}>
              <Loader2 size={28} className="spin" style={{ color: 'var(--color-primary-500)' }} />
              <span>Loading interactive map...</span>
            </div>
          }>
            <ProjectMap projects={filteredProjects} />
          </Suspense>
        )}
      </div>

      {/* Public Transaction Ledger */}
      <div className="section-gap">
        <div className="section-header">
          <h2 className="heading-2">Recent Transactions</h2>
          <span className="badge badge-verified"><span className="badge-dot"></span>Blockchain Verified</span>
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Amount</th>
                <th>Location</th>
                <th>District</th>
                <th>TX Hash</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {txnList.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-slate-400)' }}>No transactions yet</td></tr>
              ) : txnList.slice(0, 8).map((txn, i) => (
                <tr key={txn.id} style={{ animation: `cardEnter 0.3s ease-out ${i * 50}ms both` }}>
                  <td>
                    <span className={`badge ${txn.event_type === 'mint' ? 'badge-info' : txn.event_type === 'allocate' ? 'badge-verified' : 'badge-pending'}`}>
                      {txn.event_type}
                    </span>
                  </td>
                  <td className="amount-cell">₹{parseFloat(txn.amount_cr || 0).toFixed(2)} Cr</td>
                  <td style={{ fontSize: '13px' }}>{txn.location || '—'}</td>
                  <td style={{ fontSize: '13px', fontWeight: 500 }}>{txn.districts?.name || '—'}</td>
                  <td><span className="mono-cell">{txn.tx_hash ? txn.tx_hash.slice(0, 16) + '...' : '—'}</span></td>
                  <td style={{ fontSize: '12px', color: 'var(--color-slate-500)' }}>{formatTimestamp(txn.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust Banner */}
      <div className="trust-banner">
        <Hexagon size={24} style={{ color: 'var(--color-primary-400)' }} />
        <div>
          <h3 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600 }}>
            Every rupee tracked. Every transaction sealed.
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
            ChainTrust uses blockchain technology to ensure complete transparency in public fund management.
          </p>
        </div>
        <button className="btn btn-primary" style={{ background: 'white', color: 'var(--color-primary-900)', marginLeft: 'auto' }}>Learn More</button>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className={styles.modalOverlay} onClick={() => setSelectedProject(null)}>
          <div className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.detailHeader} style={{ '--risk-color': getRiskColor(selectedProject.risk_score) }}>
              <div className={styles.detailHeaderContent}>
                <div className={styles.detailHeaderTop}>
                  <span className={`badge ${selectedProject.risk_score > 50 ? 'badge-flagged' : 'badge-verified'}`}>
                    {selectedProject.status || 'Active'}
                  </span>
                  <button className={styles.modalClose} onClick={() => setSelectedProject(null)}>
                    <X size={20} />
                  </button>
                </div>
                <h2 className={styles.detailTitle}>{selectedProject.name}</h2>
                <div className={styles.detailLocation}>
                  <MapPin size={14} />
                  <span>{selectedProject.districts?.name || 'India'}{selectedProject.districts?.state ? `, ${selectedProject.districts.state}` : ''}</span>
                </div>
              </div>
              <div className={styles.detailRiskBadge}>
                <svg className={styles.detailRiskRing} viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="42" fill="rgba(0,0,0,0.25)" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                  <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="4"
                    strokeDasharray={`${(selectedProject.risk_score / 100) * 264} 264`}
                    strokeLinecap="round" transform="rotate(-90 48 48)" />
                </svg>
                <div className={styles.detailRiskCenter}>
                  <span className={styles.detailRiskValue}>{selectedProject.risk_score || 0}</span>
                  <span className={styles.detailRiskLabel}>Risk</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className={styles.detailBody}>
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}><IndianRupee size={15} /> Financial Overview</h4>
                <div className={styles.detailGrid}>
                  <div className={styles.detailStat}>
                    <span className={styles.detailStatLabel}>Contract Value</span>
                    <span className={styles.detailStatValue}>₹{Number(selectedProject.contract_value_cr || 0).toFixed(2)} Cr</span>
                  </div>
                  <div className={styles.detailStat}>
                    <span className={styles.detailStatLabel}>Risk Score</span>
                    <span className={styles.detailStatValue} style={{ color: getRiskColor(selectedProject.risk_score) }}>{selectedProject.risk_score || 0}/100</span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}><Building2 size={15} /> Project Details</h4>
                <div className={styles.detailInfoList}>
                  <div className={styles.detailInfoRow}>
                    <span className={styles.detailInfoLabel}>Contractor</span>
                    <span className={styles.detailInfoValue}>{selectedProject.contractor_name || '—'}</span>
                  </div>
                  <div className={styles.detailInfoRow}>
                    <span className={styles.detailInfoLabel}>District</span>
                    <span className={styles.detailInfoValue}>{selectedProject.districts?.name || '—'}</span>
                  </div>
                  <div className={styles.detailInfoRow}>
                    <span className={styles.detailInfoLabel}>State</span>
                    <span className={styles.detailInfoValue}>{selectedProject.districts?.state || '—'}</span>
                  </div>
                  <div className={styles.detailInfoRow}>
                    <span className={styles.detailInfoLabel}>Status</span>
                    <span className={styles.detailInfoValue}>{selectedProject.status || '—'}</span>
                  </div>
                  <div className={styles.detailInfoRow}>
                    <span className={styles.detailInfoLabel}>Project ID</span>
                    <span className={styles.detailInfoValue} style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{selectedProject.id}</span>
                  </div>
                </div>
              </div>

              {selectedProject.risk_score > 50 && (
                <div className={styles.detailSection}>
                  <h4 className={styles.detailSectionTitle}><AlertTriangle size={15} style={{ color: 'var(--color-red-500)' }} /> Risk Indicators</h4>
                  <div className={styles.riskFlag}>
                    <AlertTriangle size={16} />
                    <span>This project has an elevated risk score of <strong>{selectedProject.risk_score}/100</strong>. Enhanced monitoring and audit procedures are active.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={styles.detailFooter}>
              <span style={{ fontSize: '12px', color: 'var(--color-slate-400)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={14} /> Public read-only view
              </span>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedProject(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
