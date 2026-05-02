'use client';
import { fundFlowNodes, fundFlowEdges } from '@/data/mockData';
import styles from './FundFlowDiagram.module.css';

export default function FundFlowDiagram() {
  const nodePositions = {
    govt: { x: 400, y: 40 },
    mot: { x: 150, y: 140 },
    mjs: { x: 400, y: 140 },
    mit: { x: 650, y: 140 },
    infra: { x: 80, y: 250 },
    lt: { x: 250, y: 250 },
    eco: { x: 480, y: 250 },
    sub1: { x: 80, y: 360 },
    sub2: { x: 250, y: 360 },
    workers: { x: 480, y: 360 },
  };

  const nodeStyles = {
    government: { fill: '#1e3a8a', stroke: '#3b82f6', textColor: '#fff' },
    ministry: { fill: '#2563eb', stroke: '#60a5fa', textColor: '#fff' },
    contractor: { fill: '#4f46e5', stroke: '#818cf8', textColor: '#fff' },
    vendor: { fill: '#f1f5f9', stroke: '#cbd5e1', textColor: '#334155' },
    beneficiary: { fill: '#10b981', stroke: '#34d399', textColor: '#fff' },
  };

  return (
    <div className={styles.fundFlow}>
      <div className={styles.header}>
        <h3 className="heading-3">Fund Flow Dynamics</h3>
        <div className={styles.controls}>
          <button className={`btn btn-sm btn-secondary ${styles.activeFilter}`}>By Ministry</button>
          <button className="btn btn-sm btn-ghost">By Project</button>
        </div>
      </div>
      <div className={styles.canvas}>
        <svg viewBox="0 0 800 420" className={styles.svg}>
          <defs>
            <marker id="arrow-verified" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6" fill="#10b981" />
            </marker>
            <marker id="arrow-flagged" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6" fill="#dc2626" />
            </marker>
          </defs>
          {fundFlowEdges.map((edge, i) => {
            const from = nodePositions[edge.from];
            const to = nodePositions[edge.to];
            if (!from || !to) return null;
            const midY = (from.y + to.y) / 2;
            return (
              <g key={i}>
                <path d={`M${from.x},${from.y + 20} C${from.x},${midY} ${to.x},${midY} ${to.x},${to.y - 20}`}
                  fill="none" stroke={edge.verified ? '#10b981' : '#dc2626'}
                  strokeWidth={Math.max(2, edge.amount / 2000)} strokeDasharray={edge.verified ? 'none' : '6 4'}
                  opacity={0.6} markerEnd={edge.verified ? 'url(#arrow-verified)' : 'url(#arrow-flagged)'} />
                {edge.verified && (
                  <path d={`M${from.x},${from.y + 20} C${from.x},${midY} ${to.x},${midY} ${to.x},${to.y - 20}`}
                    fill="none" stroke="#10b981" strokeWidth={Math.max(2, edge.amount / 2000)}
                    strokeDasharray="4 12" opacity={0.4} className={styles.animated} />
                )}
              </g>
            );
          })}
          {fundFlowNodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;
            const style = nodeStyles[node.type];
            const w = node.type === 'government' ? 140 : 120;
            const h = 40;
            return (
              <g key={node.id} className={styles.node}>
                {node.type === 'beneficiary' ? (
                  <circle cx={pos.x} cy={pos.y} r={30} fill={style.fill} stroke={style.stroke} strokeWidth={2} />
                ) : (
                  <rect x={pos.x - w / 2} y={pos.y - h / 2} width={w} height={h}
                    rx={node.type === 'contractor' ? 20 : 8} fill={style.fill} stroke={style.stroke} strokeWidth={2} />
                )}
                <text x={pos.x} y={pos.y - 2} textAnchor="middle" fill={style.textColor}
                  fontSize="10" fontFamily="var(--font-label)" fontWeight="600">
                  {node.label.length > 18 ? node.label.substring(0, 18) + '…' : node.label}
                </text>
                <text x={pos.x} y={pos.y + 12} textAnchor="middle" fill={style.textColor}
                  fontSize="9" fontFamily="var(--font-mono)" opacity="0.8">
                  {node.amount}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
