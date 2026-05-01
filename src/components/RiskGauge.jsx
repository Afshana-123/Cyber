'use client';
import { useEffect, useState } from 'react';

export default function RiskGauge({ score = 67, label = 'Aggregate Risk Index' }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 270 degrees
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
    <div className="risk-gauge">
      <div className="gauge-header">
        <h3 className="heading-3">{label}</h3>
        <span className="badge badge-info">
          <span className="badge-dot"></span>
          Live
        </span>
      </div>
      <div className="gauge-visual">
        <svg viewBox="0 0 200 200" className="gauge-svg">
          {/* Background track */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="var(--color-slate-100)"
            strokeWidth="14"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform="rotate(135, 100, 100)"
          />
          {/* Score arc */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={animated ? offset : arcLength}
            strokeLinecap="round"
            transform="rotate(135, 100, 100)"
            className="gauge-arc"
          />
          {/* Gradient glow */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={animated ? offset : arcLength}
            strokeLinecap="round"
            transform="rotate(135, 100, 100)"
            opacity="0.2"
            filter="url(#glow)"
            className="gauge-arc"
          />
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
        <div className="gauge-center">
          <span className="gauge-score" style={{ color }}>{score}</span>
          <span className="gauge-risk-label">{getRiskLabel(score)}</span>
        </div>
      </div>
      <p className="gauge-detail body-sm" style={{ color: 'var(--color-slate-500)', textAlign: 'center', marginTop: '8px' }}>
        Risk elevated primarily due to nested subcontractor payments in Project Alpha.
      </p>

      <style jsx>{`
        .risk-gauge {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          padding: 24px;
          box-shadow: var(--shadow-1);
          border: 1px solid rgba(203, 213, 225, 0.4);
          animation: cardEnter 0.5s ease-out both;
          animation-delay: 200ms;
        }
        .gauge-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .gauge-visual {
          position: relative;
          width: 200px;
          height: 200px;
          margin: 0 auto;
        }
        .gauge-svg {
          width: 100%;
          height: 100%;
        }
        .gauge-arc {
          transition: stroke-dashoffset 1.2s ease-out;
        }
        .gauge-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }
        .gauge-score {
          font-family: var(--font-display);
          font-size: 48px;
          font-weight: 700;
          display: block;
          line-height: 1;
        }
        .gauge-risk-label {
          font-family: var(--font-label);
          font-size: 12px;
          font-weight: 600;
          color: var(--color-slate-500);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-top: 4px;
          display: block;
        }
      `}</style>
    </div>
  );
}
