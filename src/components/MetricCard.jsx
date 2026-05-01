'use client';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ icon: Icon, label, value, change, variant = 'neutral', delay = 0 }) {
  const isPositive = change >= 0;
  const variantColors = {
    neutral: { border: 'var(--color-slate-200)', bg: 'transparent' },
    success: { border: 'var(--color-emerald-500)', bg: 'var(--color-emerald-50)' },
    warning: { border: 'var(--color-amber-500)', bg: 'var(--color-amber-50)' },
    danger: { border: 'var(--color-red-600)', bg: 'var(--color-red-50)' },
  };
  const colors = variantColors[variant];

  return (
    <div className={`metric-card metric-${variant}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="metric-top">
        <div className="metric-icon-wrap">
          <Icon size={20} strokeWidth={1.5} />
        </div>
        <span className="metric-label">{label}</span>
      </div>
      <div className="metric-value">{value}</div>
      <div className={`metric-change ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{isPositive ? '+' : ''}{change}%</span>
        <span className="metric-change-label">vs last month</span>
      </div>
      <div className="metric-sparkline">
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

      <style jsx>{`
        .metric-card {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          padding: 20px 24px;
          box-shadow: var(--shadow-1);
          border: 1px solid rgba(203, 213, 225, 0.4);
          border-left: 4px solid ${colors.border};
          transition: all 200ms ease-out;
          animation: cardEnter 0.4s ease-out both;
          position: relative;
          overflow: hidden;
        }
        .metric-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: ${colors.bg};
          opacity: 0.3;
          pointer-events: none;
        }
        .metric-card:hover {
          box-shadow: var(--shadow-2);
          transform: translateY(-2px);
        }
        .metric-danger {
          animation: cardEnter 0.4s ease-out both, fraudPulse 3s ease-in-out infinite;
        }
        .metric-top {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          position: relative;
        }
        .metric-icon-wrap {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: ${variant === 'danger' ? 'var(--color-red-100)' : variant === 'success' ? 'var(--color-emerald-100)' : 'var(--color-primary-100)'};
          color: ${variant === 'danger' ? 'var(--color-red-600)' : variant === 'success' ? 'var(--color-emerald-600)' : 'var(--color-primary-700)'};
        }
        .metric-label {
          font-family: var(--font-label);
          font-size: 12px;
          font-weight: 600;
          color: var(--color-slate-500);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          position: relative;
        }
        .metric-value {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 700;
          color: var(--color-slate-900);
          margin-bottom: 8px;
          position: relative;
          letter-spacing: -0.02em;
        }
        .metric-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-label);
          font-size: 12px;
          font-weight: 600;
          position: relative;
        }
        .metric-change.positive { color: var(--color-emerald-600); }
        .metric-change.negative { color: var(--color-red-600); }
        .metric-change-label {
          color: var(--color-slate-400);
          font-weight: 400;
          margin-left: 4px;
        }
        .metric-sparkline {
          margin-top: 12px;
          height: 24px;
          position: relative;
        }
        .metric-sparkline svg {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}
