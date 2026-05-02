'use client';
import { useState, useCallback } from 'react';
import { AlertTriangle, ChevronRight, Sparkles, Search, Shield, XCircle, ArrowUpCircle, CheckCircle2, Loader2, X, Eye, Clock } from 'lucide-react';
import styles from './FraudAlertPanel.module.css';

export default function FraudAlertPanel({ alerts, onAlertUpdated }) {
  const [expandedId, setExpandedId] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { alertId, action, alert }
  const [toasts, setToasts] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [updatedStatuses, setUpdatedStatuses] = useState({}); // id -> newStatus

  // ── Severity helpers ──
  const getSeverityFromRisk = (riskScore) => {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  };

  const getSeverityBadge = (severity) => {
    const map = { critical: 'badge-flagged', high: 'badge-flagged', medium: 'badge-pending', low: 'badge-resolved' };
    return map[severity] || 'badge-resolved';
  };

  const getSeverityBarClass = (severity) => {
    if (severity === 'critical' || severity === 'high') return styles.severityHigh;
    if (severity === 'medium') return styles.severityMedium;
    return styles.severityLow;
  };

  const timeAgo = (ts) => {
    if (!ts) return '';
    const now = new Date();
    const then = new Date(ts);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  };

  // ── Toast system ──
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Action handler ──
  const handleAction = useCallback(async (alertId, action, alert) => {
    setProcessingId(alertId);
    setActionType(action);
    setConfirmModal(null);

    try {
      const res = await fetch(`/api/fraud/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Action failed');
      }

      // Update local state
      const statusMap = { investigate: 'investigating', dismiss: 'dismissed', escalate: 'escalated', resolve: 'resolved' };
      setUpdatedStatuses(prev => ({ ...prev, [alertId]: statusMap[action] }));

      // If dismissed or resolved, hide after animation
      if (action === 'dismiss' || action === 'resolve') {
        setTimeout(() => {
          setDismissedIds(prev => new Set([...prev, alertId]));
        }, 600);
      }

      // Close expanded
      if (expandedId === alertId) {
        setExpandedId(null);
      }

      // Toast messages
      const messages = {
        investigate: `🔍 Investigation started for "${alert.title}"`,
        dismiss: `✓ Alert "${alert.title}" dismissed`,
        escalate: `🚨 Alert "${alert.title}" escalated to senior auditor`,
        resolve: `✅ Alert "${alert.title}" marked as resolved`,
      };
      showToast(messages[action], action === 'escalate' ? 'warning' : 'success');

      // Notify parent to refresh data
      if (onAlertUpdated) onAlertUpdated();

    } catch (err) {
      showToast(`Failed: ${err.message}`, 'error');
    } finally {
      setProcessingId(null);
      setActionType(null);
    }
  }, [expandedId, showToast, onAlertUpdated]);

  // ── Confirm modal trigger ──
  const openConfirm = (alertId, action, alert) => {
    // Investigate doesn't need confirmation
    if (action === 'investigate') {
      handleAction(alertId, action, alert);
      return;
    }
    setConfirmModal({ alertId, action, alert });
  };

  // ── Filter visible alerts ──
  const activeAlerts = (alerts || [])
    .filter(a => a.status !== 'resolved' && !dismissedIds.has(a.id));

  // ── Action configs ──
  const actionConfig = {
    dismiss: {
      icon: XCircle,
      title: 'Dismiss Alert',
      desc: 'This will mark the alert as a false positive. It can be restored later from the audit log.',
      btnClass: styles.btnDismissConfirm,
      btnText: 'Yes, Dismiss',
    },
    escalate: {
      icon: ArrowUpCircle,
      title: 'Escalate Alert',
      desc: 'This will flag the alert as critical and notify the senior auditor team for immediate review.',
      btnClass: styles.btnEscalateConfirm,
      btnText: 'Escalate Now',
    },
    resolve: {
      icon: CheckCircle2,
      title: 'Resolve Alert',
      desc: 'Mark this investigation as complete. The alert will be archived in audit logs.',
      btnClass: styles.btnResolveConfirm,
      btnText: 'Mark Resolved',
    },
  };

  return (
    <>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <AlertTriangle size={20} className={styles.headerIcon} />
            <h3 className="heading-3">AI Fraud Alerts</h3>
            <span className="badge badge-flagged">
              <span className="badge-dot"></span>
              {activeAlerts.length} Active
            </span>
          </div>
        </div>

        <div className={styles.list}>
          {activeAlerts.length === 0 ? (
            <div className={styles.emptyState}>
              <CheckCircle2 size={28} style={{ color: 'var(--color-emerald-500)' }} />
              <span>No active fraud alerts — all clear ✓</span>
            </div>
          ) : activeAlerts.map((alert) => {
            const severity = getSeverityFromRisk(alert.risk_score || 0);
            const currentStatus = updatedStatuses[alert.id] || alert.status;
            const isProcessing = processingId === alert.id;
            const isInvestigating = currentStatus === 'investigating';
            const isEscalated = currentStatus === 'escalated';

            return (
              <div
                key={alert.id}
                className={`${styles.row} ${isProcessing ? styles.rowProcessing : ''} ${isEscalated ? styles.rowEscalated : ''} ${isInvestigating ? styles.rowInvestigating : ''}`}
              >
                <div className={styles.rowMain} onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}>
                  <div className={styles.rowLeft}>
                    <div className={`${styles.severityBar} ${getSeverityBarClass(severity)}`}></div>
                    <div className={styles.content}>
                      <div className={styles.titleRow}>
                        <span className={styles.projectName}>{alert.title}</span>
                        {isInvestigating && (
                          <span className={styles.statusTag} data-status="investigating">
                            <Eye size={10} />
                            Investigating
                          </span>
                        )}
                        {isEscalated && (
                          <span className={styles.statusTag} data-status="escalated">
                            <ArrowUpCircle size={10} />
                            Escalated
                          </span>
                        )}
                      </div>
                      <p className={styles.reason}>{alert.type} — {alert.districts?.name || 'Unknown'}</p>
                      <div className={styles.meta}>
                        <Sparkles size={12} />
                        <span>AI Detection Engine</span>
                        <span>·</span>
                        <span>{timeAgo(alert.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.rowRight}>
                    <div className={styles.score}>
                      <span className={styles.scoreValue}>{alert.risk_score}</span>
                      <span className={styles.scoreLabel}>Risk</span>
                    </div>
                    <span className={`badge ${getSeverityBadge(severity)}`}>
                      {severity.toUpperCase()}
                    </span>
                    <ChevronRight size={16} className={expandedId === alert.id ? styles.chevronRotated : styles.chevron} />
                  </div>
                </div>

                {expandedId === alert.id && (
                  <div className={styles.expanded}>
                    <p className={styles.detail}>{alert.description}</p>

                    {/* Alert metadata */}
                    <div className={styles.alertMeta}>
                      <div className={styles.alertMetaItem}>
                        <span className={styles.alertMetaLabel}>Type</span>
                        <span className={styles.alertMetaValue}>{alert.type?.replace(/_/g, ' ')}</span>
                      </div>
                      <div className={styles.alertMetaItem}>
                        <span className={styles.alertMetaLabel}>District</span>
                        <span className={styles.alertMetaValue}>{alert.districts?.name || '—'}, {alert.districts?.state || ''}</span>
                      </div>
                      <div className={styles.alertMetaItem}>
                        <span className={styles.alertMetaLabel}>Status</span>
                        <span className={styles.alertMetaValue} style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                          {currentStatus}
                        </span>
                      </div>
                      <div className={styles.alertMetaItem}>
                        <span className={styles.alertMetaLabel}>Detected</span>
                        <span className={styles.alertMetaValue}>
                          {alert.created_at ? new Date(alert.created_at).toLocaleString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          }) : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className={styles.actions}>
                      {!isInvestigating && !isEscalated && (
                        <button
                          className={`${styles.btnAction} ${styles.btnInvestigate}`}
                          onClick={(e) => { e.stopPropagation(); openConfirm(alert.id, 'investigate', alert); }}
                          disabled={isProcessing}
                        >
                          {isProcessing && actionType === 'investigate' ? (
                            <Loader2 size={14} className="spin" />
                          ) : (
                            <Search size={14} />
                          )}
                          Investigate
                        </button>
                      )}

                      {isInvestigating && (
                        <button
                          className={`${styles.btnAction} ${styles.btnResolve}`}
                          onClick={(e) => { e.stopPropagation(); openConfirm(alert.id, 'resolve', alert); }}
                          disabled={isProcessing}
                        >
                          {isProcessing && actionType === 'resolve' ? (
                            <Loader2 size={14} className="spin" />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          Mark Resolved
                        </button>
                      )}

                      {!isEscalated && (
                        <button
                          className={`${styles.btnAction} ${styles.btnDismiss}`}
                          onClick={(e) => { e.stopPropagation(); openConfirm(alert.id, 'dismiss', alert); }}
                          disabled={isProcessing}
                        >
                          {isProcessing && actionType === 'dismiss' ? (
                            <Loader2 size={14} className="spin" />
                          ) : (
                            <XCircle size={14} />
                          )}
                          Dismiss
                        </button>
                      )}

                      {!isInvestigating && !isEscalated && (
                        <button
                          className={`${styles.btnAction} ${styles.btnEscalate}`}
                          onClick={(e) => { e.stopPropagation(); openConfirm(alert.id, 'escalate', alert); }}
                          disabled={isProcessing}
                        >
                          {isProcessing && actionType === 'escalate' ? (
                            <Loader2 size={14} className="spin" />
                          ) : (
                            <ArrowUpCircle size={14} />
                          )}
                          Escalate
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Confirmation Modal ── */}
      {confirmModal && (() => {
        const cfg = actionConfig[confirmModal.action];
        const IconComp = cfg.icon;
        return (
          <div className={styles.modalOverlay} onClick={() => setConfirmModal(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <button className={styles.modalClose} onClick={() => setConfirmModal(null)}>
                <X size={18} />
              </button>
              <div className={styles.modalIcon}>
                <IconComp size={24} />
              </div>
              <h4 className={styles.modalTitle}>{cfg.title}</h4>
              <p className={styles.modalDesc}>{cfg.desc}</p>
              <div className={styles.modalAlertPreview}>
                <strong>{confirmModal.alert.title}</strong>
                <span>Risk Score: {confirmModal.alert.risk_score} · {confirmModal.alert.districts?.name || 'Unknown'}</span>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.btnCancel} onClick={() => setConfirmModal(null)}>
                  Cancel
                </button>
                <button
                  className={cfg.btnClass}
                  onClick={() => handleAction(confirmModal.alertId, confirmModal.action, confirmModal.alert)}
                >
                  {cfg.btnText}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Toast Notifications ── */}
      {toasts.length > 0 && (
        <div className={styles.toastContainer}>
          {toasts.map((toast) => (
            <div key={toast.id} className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
              <span>{toast.message}</span>
              <button className={styles.toastClose} onClick={() => removeToast(toast.id)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
