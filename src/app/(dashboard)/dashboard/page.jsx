'use client';
import { IndianRupee, FolderOpen, AlertTriangle, Activity, Calendar, Zap, TrendingUp } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import RiskGauge from '@/components/RiskGauge';
import FundFlowDiagram from '@/components/FundFlowDiagram';
import FraudAlertPanel from '@/components/FraudAlertPanel';
import LiveTransactions from '@/components/LiveTransactions';
import { metrics, fraudAlerts, transactions } from '@/data/mockData';
import styles from './page.module.css';

export default function DashboardPage() {
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
            Your ledger is healthy — 3 new transactions require review.
          </p>
        </div>
        <div className={styles.welcomeRight}>
          <div className={styles.quickStat}>
            <div className={styles.quickStatIcon}>
              <Zap size={16} />
            </div>
            <div>
              <span className={styles.quickStatValue}>12</span>
              <span className={styles.quickStatLabel}>Pending</span>
            </div>
          </div>
          <div className={styles.quickStatDivider}></div>
          <div className={styles.quickStat}>
            <div className={`${styles.quickStatIcon} ${styles.quickStatIconGreen}`}>
              <TrendingUp size={16} />
            </div>
            <div>
              <span className={styles.quickStatValue}>98.2%</span>
              <span className={styles.quickStatLabel}>Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid-4 section-gap">
        <MetricCard
          icon={IndianRupee}
          label="Total Funds Tracked"
          value="₹28,470 Cr"
          change={metrics.totalFundsChange}
          variant="neutral"
          delay={0}
        />
        <MetricCard
          icon={FolderOpen}
          label="Active Projects"
          value="142"
          change={metrics.activeProjectsChange}
          variant="success"
          delay={100}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Flagged Transactions"
          value="23"
          change={metrics.flaggedTransactionsChange}
          variant="danger"
          delay={200}
        />
        <MetricCard
          icon={Activity}
          label="System Health Score"
          value="87/100"
          change={metrics.systemHealthChange}
          variant="success"
          delay={300}
        />
      </div>

      {/* Fund Flow + Risk Gauge */}
      <div className="split-60-40 section-gap">
        <FundFlowDiagram />
        <RiskGauge score={67} />
      </div>

      {/* Fraud Alerts + Live Transactions */}
      <div className="split-40-60 section-gap">
        <FraudAlertPanel alerts={fraudAlerts} />
        <LiveTransactions transactions={transactions} />
      </div>
    </div>
  );
}
