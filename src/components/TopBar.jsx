'use client';
import { Search, Bell, Hexagon } from 'lucide-react';
import styles from './TopBar.module.css';

export default function TopBar({ collapsed = false }) {
  return (
    <header 
      className={styles.topbar}
      style={{ left: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)' }}
    >
      <div className={styles.topbarLeft}>
        <div className={styles.topbarSearch}>
          <Search size={18} className={styles.topbarSearchIcon} />
          <input
            type="text"
            placeholder="Search projects, transactions, tenders..."
            className={styles.topbarSearchInput}
          />
          <span className={styles.topbarSearchShortcut}>⌘K</span>
        </div>
      </div>

      <div className={styles.topbarRight}>
        <div className={styles.topbarStatus}>
          <span className={styles.topbarStatusDot}></span>
          <Hexagon size={14} />
          <span>Mainnet Live</span>
        </div>
        <button className={styles.topbarNotification}>
          <Bell size={20} />
          <span className={styles.topbarNotificationBadge}>3</span>
        </button>
        <div className={styles.topbarAvatar}>AS</div>
      </div>
    </header>
  );
}
