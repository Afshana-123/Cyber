'use client';
import { useState, useEffect } from 'react';
import { IndianRupee, FolderOpen, AlertTriangle, Activity, Calendar, Zap, TrendingUp } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import RiskGauge from '@/components/RiskGauge';
import FundFlowDiagram from '@/components/FundFlowDiagram';
import FraudAlertPanel from '@/components/FraudAlertPanel';
import LiveTransactions from '@/components/LiveTransactions';
import { fetchAlerts, fetchProjects, fetchDistricts } from '@/lib/apiClient';
import { transactions } from '@/data/mockData';
import styles from './page.module.css';

export default function DashboardPage() {
  const [alerts, setAlerts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAlerts().catch(() => []),
      fetchProjects().catch(() => []),
      fetchDistricts().catch(() => []),
    ]).then(([a, p, d]) => {
      setAlerts(a);
      setProjects(p);
      setDistricts(d);
      setLoading(false);
    });
  }, []);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const totalMissing = districts.reduce((s, d) => s + (d.missing_crore || 0), 0);
  const flaggedCount = alerts.length;
  const avgRisk = districts.length > 0
    ? Math.round(districts.reduce((s, d) => s + (d.risk_score || 0), 0) / districts.length)
    : 0;

  // Map backend alerts to the shape FraudAlertPanel expects
  const mappedAlerts = alerts.slice(0, 4).map(a => ({
    id: a.id,
    projectId: a.entity_id,
    projectName: a.title,
    riskScore: a.risk_score,
    severity: a.risk_score >= 75 ? 'critical' : a.risk_score >= 50 ? 'high' : a.risk_score >= 30 ? 'medium' : 'low',
    reason: a.type?.replace(/_/g, ' '),
    detail: a.description,
    flaggedBy: 'AI Engine',
    timeAgo: new Date(a.created_at).toLocaleDateString('en-IN'),
    signals: [],
  }));

  return (
    <div className="page-content">
      {/* Premium Welcome Header */}
      <div className={styles.welcomeHeader}>
        <div className={styles.welcomeLeft}>
          <div className={styles.welcomeGreeting}>
            <h1 className={styles.welcomeTitle}>{greeting}, Arjun</h1>
            <div className={styles.welcomeDate}>
              <Calendar size={14} />
              <span>{dateStr}</span>
            </div>
          </div>
          <p className={styles.welcomeSubtitle}>
            {loading ? 'Loading dashboard...' : `${flaggedCount} active alerts — ₹${totalMissing.toFixed(1)} Cr under investigation.`}
          </p>
        </div>
        <div className={styles.welcomeRight}>
          <div className={styles.quickStat}>
            <div className={styles.quickStatIcon}>
              <Zap size={16} />
            </div>
            <div>
              <span className={styles.quickStatValue}>{flaggedCount}</span>
              <span className={styles.quickStatLabel}>Alerts</span>
            </div>
          </div>
          <div className={styles.quickStatDivider}></div>
          <div className={styles.quickStat}>
            <div className={`${styles.quickStatIcon} ${styles.quickStatIconGreen}`}>
              <TrendingUp size={16} />
            </div>
            <div>
              <span className={styles.quickStatValue}>{projects.length}</span>
              <span className={styles.quickStatLabel}>Projects</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid-4 section-gap">
        <MetricCard
          icon={IndianRupee}
          label="Missing Funds"
          value={`₹${totalMissing.toFixed(1)} Cr`}
          change={0}
          variant="danger"
          delay={0}
        />
        <MetricCard
          icon={FolderOpen}
          label="Active Projects"
          value={`${projects.length}`}
          change={0}
          variant="success"
          delay={100}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Active Alerts"
          value={`${flaggedCount}`}
          change={0}
          variant="danger"
          delay={200}
        />
        <MetricCard
          icon={Activity}
          label="Avg District Risk"
          value={`${avgRisk}/100`}
          change={0}
          variant={avgRisk >= 50 ? 'danger' : 'success'}
          delay={300}
        />
      </div>

      {/* Fund Flow + Risk Gauge */}
      <div className="split-60-40 section-gap">
        <FundFlowDiagram />
        <RiskGauge score={avgRisk || 67} />
      </div>

      {/* Fraud Alerts + Live Transactions */}
      <div className="split-40-60 section-gap">
        <FraudAlertPanel alerts={mappedAlerts} />
        <LiveTransactions transactions={transactions} />
      </div>
    </div>
  );
}
