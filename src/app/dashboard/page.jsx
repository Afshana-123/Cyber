'use client';
import { IndianRupee, FolderOpen, AlertTriangle, Activity } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import RiskGauge from '@/components/RiskGauge';
import FundFlowDiagram from '@/components/FundFlowDiagram';
import FraudAlertPanel from '@/components/FraudAlertPanel';
import LiveTransactions from '@/components/LiveTransactions';
import { metrics, fraudAlerts, transactions } from '@/data/mockData';

export default function DashboardPage() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Overview</h1>
          <p className="page-subtitle">Real-time ledger analytics and operational health.</p>
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
