'use client';
import { useState } from 'react';
import { Bot, MapPin, Activity, CheckCircle, XCircle, AlertTriangle, Play, Loader2, Trophy, Hammer, ShieldAlert } from 'lucide-react';
import styles from './page.module.css';

export default function TendersSimulationPage() {
  const [phase, setPhase] = useState(0); // 0: Input, 1: Benchmarking, 2: Evaluating, 3: Awarded
  const [projectData, setProjectData] = useState({
    title: '4-Lane Highway Expansion, Sector 7',
    description: '12km road expansion including 2 flyovers and drainage systems.',
    location: 'Jhansi District'
  });

  const [benchmark, setBenchmark] = useState(null);
  
  // Mock Bidders Data
  const [bidders, setBidders] = useState([
    {
      id: 'B1',
      name: 'Apex Infra & Build',
      bidAmountCr: 32.0, // Low-ball
      successRate: 0.45,
      sentiment: 'Negative',
      alerts: ['Sub-standard material report (2023)', 'Delay penalties active'],
      status: 'pending', // pending, evaluating, rejected, awarded
      reason: ''
    },
    {
      id: 'B2',
      name: 'Global Roadways Ltd',
      bidAmountCr: 78.5, // Over-priced
      successRate: 0.92,
      sentiment: 'Positive',
      alerts: [],
      status: 'pending',
      reason: ''
    },
    {
      id: 'B3',
      name: 'Prime State Contractors',
      bidAmountCr: 48.2, // Optimal
      successRate: 0.88,
      sentiment: 'Positive',
      alerts: ['Minor delay (2021)'],
      status: 'pending',
      reason: ''
    },
    {
      id: 'B4',
      name: 'Rapid Build Co.',
      bidAmountCr: 51.5, // High but okay
      successRate: 0.70,
      sentiment: 'Neutral',
      alerts: [],
      status: 'pending',
      reason: ''
    }
  ]);

  const handleStartSimulation = () => {
    setPhase(1); // Benchmarking
    
    // Simulate AI calculating benchmark
    setTimeout(() => {
      setBenchmark({ low: 45.5, high: 52.0 });
      setPhase(2); // Evaluating
      
      // Simulate Bid Evaluation Process
      let updatedBidders = [...bidders];
      
      // We will stagger the evaluation of each bidder for visual effect
      updatedBidders = updatedBidders.map(b => ({ ...b, status: 'evaluating' }));
      setBidders([...updatedBidders]);
      
      setTimeout(() => {
        // Complete Evaluation
        updatedBidders = updatedBidders.map(b => {
          if (b.bidAmountCr < 45.5 * 0.8) {
            return { ...b, status: 'rejected', reason: 'Bid critically below AI benchmark. High risk of material compromise or ghosting.' };
          }
          if (b.bidAmountCr > 52.0 * 1.3) {
            return { ...b, status: 'rejected', reason: 'Bid exceeds benchmark significantly. High risk of fund siphoning.' };
          }
          if (b.successRate < 0.6) {
            return { ...b, status: 'rejected', reason: 'Poor historical delivery track record (<60%).' };
          }
          if (b.sentiment === 'Negative' || b.alerts.length > 1) {
            return { ...b, status: 'rejected', reason: 'Flagged by market intelligence network.' };
          }
          
          return { ...b, status: 'awarded', reason: 'Optimal bid inside benchmark range with strong delivery history.' };
        });
        
        // Ensure only one winner (best score)
        const passed = updatedBidders.filter(b => b.status === 'awarded');
        if (passed.length > 1) {
          // B3 is optimal in our mock
          updatedBidders = updatedBidders.map(b => 
            (b.status === 'awarded' && b.id !== 'B3') 
              ? { ...b, status: 'rejected', reason: 'Outscored by a more optimal bidder.' } 
              : b
          );
        }
        
        setBidders([...updatedBidders]);
        setPhase(3); // Done
      }, 3500);

    }, 2500);
  };

  const resetSimulation = () => {
    setPhase(0);
    setBenchmark(null);
    setBidders(bidders.map(b => ({ ...b, status: 'pending', reason: '' })));
  };

  return (
    <div className="page-content">
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bot size={28} style={{ color: 'var(--color-primary-500)' }} />
            AI Tender Allocation Simulation
          </h1>
          <p className="page-subtitle">Demonstrating how TRACE uses AI benchmarks to automatically prevent corruption during the bidding phase.</p>
        </div>
        {phase === 3 && (
          <button className="btn btn-outline" onClick={resetSimulation}>
            Run Again
          </button>
        )}
      </div>

      <div className={styles.container}>
        
        {/* Tracker */}
        <div className={styles.phaseTracker}>
          <div className={`${styles.phaseItem} ${phase >= 0 ? styles.active : ''} ${phase > 0 ? styles.done : ''}`}>
            <div className={styles.phaseIcon}>{phase > 0 ? <CheckCircle size={24} /> : <span>1</span>}</div>
            <span className={styles.phaseLabel}>Project Input</span>
          </div>
          <div className={`${styles.phaseDivider} ${phase >= 1 ? styles.active : ''}`}></div>
          <div className={`${styles.phaseItem} ${phase >= 1 ? styles.active : ''} ${phase > 1 ? styles.done : ''}`}>
            <div className={styles.phaseIcon}>{phase > 1 ? <CheckCircle size={24} /> : <Activity size={24} className={phase === 1 ? styles.loadingPulse : ''} />}</div>
            <span className={styles.phaseLabel}>AI Benchmarking</span>
          </div>
          <div className={`${styles.phaseDivider} ${phase >= 2 ? styles.active : ''}`}></div>
          <div className={`${styles.phaseItem} ${phase >= 2 ? styles.active : ''} ${phase > 2 ? styles.done : ''}`}>
            <div className={styles.phaseIcon}>{phase > 2 ? <CheckCircle size={24} /> : <ShieldAlert size={24} className={phase === 2 ? styles.loadingPulse : ''} />}</div>
            <span className={styles.phaseLabel}>Bid Evaluation</span>
          </div>
          <div className={`${styles.phaseDivider} ${phase >= 3 ? styles.active : ''}`}></div>
          <div className={`${styles.phaseItem} ${phase >= 3 ? styles.active : ''} ${phase === 3 ? styles.done : ''}`}>
            <div className={styles.phaseIcon}><Trophy size={24} /></div>
            <span className={styles.phaseLabel}>Tender Awarded</span>
          </div>
        </div>

        {/* Phase 0: Input */}
        {phase === 0 && (
          <div className={styles.setupCard}>
            <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Initiate New Infrastructure Project</h2>
            <div className={styles.setupForm}>
              <div className={styles.inputGroup}>
                <label>Project Title</label>
                <input type="text" value={projectData.title} onChange={e => setProjectData({...projectData, title: e.target.value})} />
              </div>
              <div className={styles.inputGroup}>
                <label>Description & Requirements</label>
                <input type="text" value={projectData.description} onChange={e => setProjectData({...projectData, description: e.target.value})} />
              </div>
              <div className={styles.inputGroup}>
                <label>Location</label>
                <input type="text" value={projectData.location} onChange={e => setProjectData({...projectData, location: e.target.value})} />
              </div>
            </div>
            <button className={styles.btnPrimary} onClick={handleStartSimulation}>
              <Play size={18} fill="currentColor" /> Initialize AI Allocation
            </button>
          </div>
        )}

        {/* Phase 1 & 2 & 3: Results */}
        {phase > 0 && (
          <>
            {/* Benchmark Block */}
            {phase === 1 ? (
              <div className={styles.benchmarkResult} style={{ background: 'var(--color-slate-100)', color: 'var(--color-slate-800)', border: '1px solid var(--color-slate-300)' }}>
                <div className={styles.benchmarkIcon} style={{ background: 'white', color: 'var(--color-primary-500)' }}>
                  <Loader2 size={32} className="spin" />
                </div>
                <div className={styles.benchmarkDetails}>
                  <h3 style={{ color: 'var(--color-slate-500)' }}>TRACE Intelligence Engine</h3>
                  <p style={{ color: 'var(--color-slate-800)', fontSize: '20px' }}>Calculating fair market benchmark based on terrain, labor rates, and materials...</p>
                </div>
              </div>
            ) : benchmark && (
              <div className={styles.benchmarkResult}>
                <div className={styles.benchmarkIcon}>
                  <CheckCircle size={32} />
                </div>
                <div className={styles.benchmarkDetails}>
                  <h3>AI Cost Benchmark Established</h3>
                  <p>₹{benchmark.low} Cr — ₹{benchmark.high} Cr</p>
                </div>
              </div>
            )}

            {/* Bidders Grid */}
            {(phase === 2 || phase === 3) && (
              <div>
                <h3 style={{ marginBottom: '16px', fontSize: '18px', color: 'var(--color-slate-700)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {phase === 2 ? <Loader2 size={18} className="spin" /> : <Hammer size={18} />}
                  {phase === 2 ? "AI is cross-referencing bids with past delivery records and market intelligence..." : "Final Tender Decision"}
                </h3>
                
                <div className={styles.biddersGrid}>
                  {bidders.map((bidder) => (
                    <div key={bidder.id} className={`${styles.bidderCard} ${styles[bidder.status]}`}>
                      <div className={styles.scanner}></div>
                      
                      {/* Overlays */}
                      {bidder.status === 'rejected' && (
                        <div className={styles.statusOverlay}>
                          <div className={styles.statusIcon}><XCircle size={28} /></div>
                          <div className={styles.statusTitle}>Bid Rejected</div>
                          <div className={styles.statusReason}>{bidder.reason}</div>
                        </div>
                      )}
                      
                      {bidder.status === 'awarded' && (
                        <div className={styles.statusOverlay}>
                          <div className={styles.statusIcon}><Trophy size={28} /></div>
                          <div className={styles.statusTitle}>Tender Awarded</div>
                          <div className={styles.statusReason}>{bidder.reason}</div>
                        </div>
                      )}

                      <div className={styles.bidderHeader}>
                        <div>
                          <h4 className={styles.bidderName}>{bidder.name}</h4>
                          <span className="badge badge-info"><MapPin size={10} style={{marginRight: '4px'}}/> Reg: UP State</span>
                        </div>
                        <div className={styles.bidAmount}>₹{bidder.bidAmountCr.toFixed(1)} Cr</div>
                      </div>

                      <div className={styles.metricRow}>
                        <div className={styles.metricLabel}>Delivery Success Rate</div>
                        <div className={styles.metricValue} style={{ color: bidder.successRate > 0.8 ? 'var(--color-emerald-600)' : 'var(--color-red-600)' }}>
                          {(bidder.successRate * 100).toFixed(0)}%
                        </div>
                      </div>

                      <div className={styles.metricRow}>
                        <div className={styles.metricLabel}>Market Sentiment</div>
                        <div className={styles.metricValue}>
                          <span className={`badge ${bidder.sentiment === 'Positive' ? 'badge-verified' : bidder.sentiment === 'Negative' ? 'badge-flagged' : 'badge-pending'}`}>
                            {bidder.sentiment}
                          </span>
                        </div>
                      </div>

                      <div className={styles.metricRow}>
                        <div className={styles.metricLabel}>Intelligence Alerts</div>
                        <div className={styles.metricValue}>
                          {bidder.alerts.length === 0 ? (
                            <span style={{ color: 'var(--color-emerald-600)', fontSize: '12px', fontWeight: 'bold' }}>Clean Record</span>
                          ) : (
                            <span style={{ color: 'var(--color-red-600)', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <AlertTriangle size={12} /> {bidder.alerts.length} Red Flags
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {bidder.alerts.length > 0 && (
                        <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--color-slate-500)', background: 'var(--color-slate-50)', padding: '8px', borderRadius: '4px' }}>
                          <strong>Last Alert:</strong> {bidder.alerts[0]}
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
