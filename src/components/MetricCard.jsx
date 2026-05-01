'use client';
import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from './MetricCard.module.css';

export default function MetricCard({ icon: Icon, label, value, change, variant = 'neutral', delay = 0 }) {
  const isPositive = change >= 0;

  const borderClass = variant === 'success' ? styles.borderSuccess
    : variant === 'warning' ? styles.borderWarning
    : variant === 'danger' ? styles.borderDanger : '';

  const bgClass = variant === 'success' ? styles.bgSuccess
    : variant === 'warning' ? styles.bgWarning
    : variant === 'danger' ? styles.bgDanger : '';

  const iconClass = variant === 'success' ? styles.iconSuccess
    : variant === 'warning' ? styles.iconWarning
    : variant === 'danger' ? styles.iconDanger : styles.iconNeutral;

  return (
    <div className={`${styles.metricCard} ${borderClass}`} style={{ animationDelay: `${delay}ms` }}>
      {bgClass && <div className={`${styles.bgOverlay} ${bgClass}`}></div>}
      <div className={styles.metricTop}>
        <div className={`${styles.metricIconWrap} ${iconClass}`}>
          <Icon size={20} strokeWidth={1.5} />
        </div>
        <span className={styles.metricLabel}>{label}</span>
      </div>
      <div className={styles.metricValue}>{value}</div>
      <div className={`${styles.metricChange} ${isPositive ? styles.positive : styles.negative}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{isPositive ? '+' : ''}{change}%</span>
        <span className={styles.metricChangeLabel}>vs last month</span>
      </div>
      <div className={styles.metricSparkline}>
        <svg viewBox="0 0 120 24" preserveAspectRatio="none">
          <path
            d={variant === 'danger'
              ? 'M0,18 L15,14 L30,16 L45,12 L60,15 L75,8 L90,10 L105,4 L120,6'
              : 'M0,20 L15,18 L30,14 L45,16 L60,10 L75,12 L90,6 L105,8 L120,4'}
            fill="none"
            stroke={variant === 'danger' ? 'var(--color-red-500)' : 'var(--color-emerald-500)'}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
