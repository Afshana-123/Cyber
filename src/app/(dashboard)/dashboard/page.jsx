'use client';
import { IndianRupee, FolderOpen, AlertTriangle, Activity, Calendar, Zap, TrendingUp, Loader2, Shield, Users } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import RiskGauge from '@/components/RiskGauge';
import FundFlowDiagram from '@/components/FundFlowDiagram';
import FraudAlertPanel from '@/components/FraudAlertPanel';
import LiveTransactions from '@/components/LiveTransactions';
import { useSupabase } from '@/lib/hooks';
import styles from './page.module.css';

export default function DashboardPage() {
  const { data: stats, loading: statsLoading } = useSupabase('/api/dashboard');
  const { data: alerts, loading: alertsLoading } = useSupabase('/api/fraud');
  const { data: transactions, loading: txnLoading } = useSupabase('/api/transactions');

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

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
            {stats ? `${stats.openAlerts} open alerts · ${stats.flaggedProjects} flagged projects · ₹${parseFloat(stats.missingCr).toFixed(2)} Cr missing funds` : 'Loading dashboard...'}
          </p>
        </div>
        <div className={styles.welcomeRight}>
          <div className={styles.quickStat}>
            <div className={styles.quickStatIcon}>
              <Zap size={16} />
            </div>
            <div>
              <span className={styles.quickStatValue}>{stats?.openAlerts ?? '—'}</span>
              <span className={styles.quickStatLabel}>Alerts</span>
            </div>
          </div>
          <div className={styles.quickStatDivider}></div>
          <div className={styles.quickStat}>
            <div className={`${styles.quickStatIcon} ${styles.quickStatIconGreen}`}>
              <TrendingUp size={16} />
            </div>
            <div>
              <span className={styles.quickStatValue}>{stats?.flaggedDistricts ?? '—'}</span>
              <span className={styles.quickStatLabel}>Flagged</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid-4 section-gap">
        <MetricCard
          icon={IndianRupee}
          label="Total Funds Allocated"
          value={stats ? `₹${parseFloat(stats.totalFundsCr).toFixed(2)} Cr` : '—'}
          change={0}
          variant="neutral"
          delay={0}
          href="/transactions"
        />
        <MetricCard
          icon={FolderOpen}
          label="Active Projects"
          value={stats?.totalProjects?.toString() ?? '—'}
          change={0}
          variant="success"
          delay={100}
          href="/projects"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Flagged Projects"
          value={stats?.flaggedProjects?.toString() ?? '—'}
          change={0}
          variant="danger"
          delay={200}
          href="/auditor"
        />
        <MetricCard
          icon={Activity}
          label="Average Risk Score"
          value={stats ? `${stats.avgRisk}/100` : '—'}
          change={0}
          variant={stats?.avgRisk > 50 ? 'danger' : 'success'}
          delay={300}
          href="/auditor"
        />
      </div>

      {/* Fund Flow + Risk Gauge */}
      <div className="split-60-40 section-gap">
        <FundFlowDiagram />
        <RiskGauge score={stats?.avgRisk ?? 0} />
      </div>

      {/* Fraud Alerts + Live Transactions */}
      <div className="split-40-60 section-gap">
        <FraudAlertPanel alerts={alerts || []} />
        <LiveTransactions transactions={transactions || []} />
      </div>
    </div>
  );
}
