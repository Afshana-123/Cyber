'use client';
import { useEffect, useState } from 'react';
import styles from './RiskGauge.module.css';

export default function RiskGauge({ score = 67, label = 'Aggregate Risk Index' }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const offset = arcLength - (score / 100) * arcLength;

  const getColor = (s) => {
    if (s <= 30) return 'var(--color-emerald-500)';
    if (s <= 60) return 'var(--color-amber-500)';
    if (s <= 85) return '#f97316';
    return 'var(--color-red-600)';
  };

  const getRiskLabel = (s) => {
    if (s <= 30) return 'Low Risk';
    if (s <= 60) return 'Medium Risk';
    if (s <= 85) return 'High Risk';
    return 'Critical';
  };

  const color = getColor(score);

  return (
    <div className={styles.riskGauge}>
      <div className={styles.gaugeHeader}>
        <h3 className="heading-3">{label}</h3>
        <span className="badge badge-info">
          <span className="badge-dot"></span>
          Live
        </span>
      </div>
      <div className={styles.gaugeVisual}>
        <svg viewBox="0 0 200 200" className={styles.gaugeSvg}>
          <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--color-slate-100)" strokeWidth="14"
            strokeDasharray={`${arcLength} ${circumference}`} strokeDashoffset={0} strokeLinecap="round" transform="rotate(135, 100, 100)" />
          <circle cx="100" cy="100" r={radius} fill="none" stroke={color} strokeWidth="14"
            strokeDasharray={`${arcLength} ${circumference}`} strokeDashoffset={animated ? offset : arcLength}
            strokeLinecap="round" transform="rotate(135, 100, 100)" className={styles.gaugeArc} />
          <circle cx="100" cy="100" r={radius} fill="none" stroke={color} strokeWidth="14"
            strokeDasharray={`${arcLength} ${circumference}`} strokeDashoffset={animated ? offset : arcLength}
            strokeLinecap="round" transform="rotate(135, 100, 100)" opacity="0.2" filter="url(#glow)" className={styles.gaugeArc} />
          <defs>
            <filter id="glow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
        </svg>
        <div className={styles.gaugeCenter}>
          <span className={styles.gaugeScore} style={{ color }}>{score}</span>
          <span className={styles.gaugeRiskLabel}>{getRiskLabel(score)}</span>
        </div>
      </div>
      <p className={styles.gaugeDetail}>
        Risk elevated primarily due to nested subcontractor payments in Project Alpha.
      </p>
    </div>
  );
}
