'use client';
import { Hexagon, ArrowRight, ShieldCheck, Fingerprint, FileCheck, BarChart3, Users, Lock, Sparkles, Eye } from 'lucide-react';
import styles from './page.module.css';
import ScrollReveal from '@/components/ScrollReveal';
import AnimatedCounter from '@/components/AnimatedCounter';

export default function LandingPage() {
  return (
    <div className={styles.landingPage}>
      {/* Floating Particles */}
      <div className={styles.particles}>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
      </div>

      {/* ─── Navbar ─── */}
      <nav className={styles.navbar}>
        <a href="/" className={styles.navLogo}>
          <span className={styles.navLogoIcon}><Hexagon size={28} /></span>
          <span className={styles.navBrand}>ChainTrust</span>
        </a>
        <ul className={styles.navLinks}>
          <li><a href="/dashboard" className={styles.navLink}>Dashboard</a></li>
          <li><a href="/projects" className={styles.navLink}>Projects</a></li>
          <li><a href="/public" className={styles.navLink}>Public View</a></li>
        </ul>
        <div className={styles.navActions}>
          <a href="/dashboard" className={styles.btnPrimary} style={{ padding: '10px 24px', fontSize: '14px' }}>
            Launch App <ArrowRight size={16} className={styles.btnArrow} />
          </a>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow}></div>
        <div className={styles.heroGlow2}></div>
        <div className={styles.heroGlow3}></div>

        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot}></span>
          Mainnet Active
        </div>

        <h1 className={styles.heroTitle}>
          Restoring Public Trust Through{' '}
          <span className={styles.heroHighlight}>Radical Transparency</span>
        </h1>

        <p className={styles.heroSubtitle}>
          The institutional ledger combining AI-driven fraud detection with 
          immutable blockchain records to track public funds from allocation 
          to execution.
        </p>

        <div className={styles.heroCTAs}>
          <a href="/public" className={styles.btnPrimary}>
            View Public Portal <ArrowRight size={18} className={styles.btnArrow} />
          </a>
          <a href="/dashboard" className={styles.btnSecondaryOutline}>
            Request Demo
          </a>
        </div>
      </section>

      {/* ─── Metrics Bar ─── */}
      <div className={styles.metricsBar}>
        <div className={styles.metricItem}>
          <span className={styles.metricNumber}>
            <AnimatedCounter prefix="₹" suffix=" Cr" value={28470} duration={2200} />
          </span>
          <span className={styles.metricLabel}>Tracked Funds</span>
          <span className={`${styles.metricTag} ${styles.metricTagGreen}`}>
            <ShieldCheck size={12} /> Verified
          </span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricNumber}>
            <AnimatedCounter value={142} duration={1800} />
          </span>
          <span className={styles.metricLabel}>Active Projects</span>
          <span className={`${styles.metricTag} ${styles.metricTagBlue}`}>
            <Sparkles size={12} /> Growing
          </span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricNumber}>
            <AnimatedCounter suffix="%" value={99.9} duration={2000} decimals={1} />
          </span>
          <span className={styles.metricLabel}>Audit Accuracy</span>
          <span className={`${styles.metricTag} ${styles.metricTagGreen}`}>
            <ShieldCheck size={12} /> AI-Powered
          </span>
        </div>
      </div>

      {/* ─── Divider ─── */}
      <div className={styles.sectionDivider}></div>

      {/* ─── Features ─── */}
      <section className={styles.features}>
        <ScrollReveal>
          <span className={styles.sectionLabel}>Core Capabilities</span>
          <h2 className={styles.sectionTitle}>The Foundation of Trust</h2>
          <p className={styles.sectionSubtitle}>
            Built on rigorous technological standards to ensure every rupee is accounted for.
          </p>
        </ScrollReveal>

        <div className={styles.featureGrid}>
          <ScrollReveal delay={0}>
            <div className={styles.featureCard}>
              <div className={`${styles.featureIconWrap} ${styles.featureIconBlue}`}>
                <Lock size={24} />
              </div>
              <h3 className={styles.featureTitle}>Immutable Ledger</h3>
              <p className={styles.featureDesc}>
                Cryptographically secure records ensure that once data is written, it cannot be 
                altered or deleted by any single entity. Every transaction carries a verifiable 
                blockchain hash.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <div className={styles.featureCard}>
              <div className={`${styles.featureIconWrap} ${styles.featureIconRed}`}>
                <Sparkles size={24} />
              </div>
              <h3 className={styles.featureTitle}>AI Fraud Detection</h3>
              <p className={styles.featureDesc}>
                Continuous monitoring of transaction patterns to flag anomalies and high-risk 
                vendor behavior before funds are dispersed. Real-time risk scoring with 
                explainable AI signals.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className={styles.featureCard}>
              <div className={`${styles.featureIconWrap} ${styles.featureIconAmber}`}>
                <Eye size={24} />
              </div>
              <h3 className={styles.featureTitle}>Real-time Citizen Access</h3>
              <p className={styles.featureDesc}>
                A simplified public portal allowing citizens to track local project funding 
                and execution milestones directly. Full transparency from allocation to 
                completion.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className={styles.sectionDivider}></div>

      {/* ─── Architecture ─── */}
      <section className={styles.architecture}>
        <div className={styles.archContent}>
          <ScrollReveal>
            <span className={styles.sectionLabel}>Technical Architecture</span>
            <h2 className={styles.sectionTitle}>Trust by Design</h2>
            <p className={styles.sectionSubtitle}>
              Four pillars of institutional-grade security and transparency.
            </p>
          </ScrollReveal>

          <div className={styles.archGrid}>
            <ScrollReveal delay={0}>
              <div className={styles.archCard}>
                <div className={styles.archIconWrap}><Fingerprint size={24} /></div>
                <h3 className={styles.archTitle}>Multi-Sig Approval</h3>
                <p className={styles.archDesc}>
                  Every transaction requires multi-party cryptographic signatures to prevent unilateral fund diversion.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={120}>
              <div className={styles.archCard}>
                <div className={styles.archIconWrap}><FileCheck size={24} /></div>
                <h3 className={styles.archTitle}>Smart Contracts</h3>
                <p className={styles.archDesc}>
                  Automated milestone-based fund release via audited smart contracts tied to verified project progress.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={240}>
              <div className={styles.archCard}>
                <div className={styles.archIconWrap}><BarChart3 size={24} /></div>
                <h3 className={styles.archTitle}>Anomaly Engine</h3>
                <p className={styles.archDesc}>
                  ML-driven detection of bid-rigging, phantom vendors, and circular fund flows across 40+ risk signals.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={360}>
              <div className={styles.archCard}>
                <div className={styles.archIconWrap}><Users size={24} /></div>
                <h3 className={styles.archTitle}>Role-Based Access</h3>
                <p className={styles.archDesc}>
                  Granular RBAC ensures admins, auditors, and citizens see precisely what they need — nothing more.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className={styles.ctaSection}>
        <ScrollReveal>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Ready to Build Trust?</h2>
            <p className={styles.ctaSubtitle}>
              Join the growing network of institutions leveraging blockchain transparency for public accountability.
            </p>
            <div className={styles.ctaActions}>
              <a href="/dashboard" className={styles.btnWhite}>
                Get Started <ArrowRight size={16} />
              </a>
              <a href="/public" className={styles.btnGhost}>
                View Public Portal
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ─── Footer ─── */}
      <footer className={styles.footer}>
        <div className={styles.footerLeft}>
          <Hexagon size={18} style={{ color: 'var(--color-primary-600)' }} />
          <span className={styles.footerBrand}>ChainTrust</span>
          <span className={styles.footerCopyright}>© 2026 All rights reserved.</span>
        </div>
        <div className={styles.footerLinks}>
          <a href="#" className={styles.footerLink}>Privacy</a>
          <a href="#" className={styles.footerLink}>Terms</a>
          <a href="#" className={styles.footerLink}>Documentation</a>
          <a href="#" className={styles.footerLink}>Contact</a>
        </div>
      </footer>
    </div>
  );
}
