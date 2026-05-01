'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, FolderOpen, FileText, ArrowLeftRight,
  ShieldAlert, ClipboardList, Eye, Settings, HelpCircle,
  Hexagon, ChevronDown, Shield
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Projects', icon: FolderOpen, href: '/projects' },
  { label: 'Tenders', icon: FileText, href: '/tenders' },
  { label: 'Transactions', icon: ArrowLeftRight, href: '/transactions' },
  { label: 'Fraud Detection', icon: ShieldAlert, href: '/auditor', badge: 4 },
  { label: 'Audit Logs', icon: ClipboardList, href: '/audit-logs' },
  { label: 'Public View', icon: Eye, href: '/public' },
];

const systemItems = [
  { label: 'Security', icon: Shield, href: '#' },
  { label: 'Support', icon: HelpCircle, href: '#' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.sidebarLogo}>
        <div className={styles.sidebarLogoIcon}>
          <Hexagon size={28} strokeWidth={1.5} />
        </div>
        <div className={styles.sidebarLogoText}>
          <span className={styles.sidebarBrand}>ChainTrust</span>
          <span className={styles.sidebarTagline}>Institutional Ledger</span>
        </div>
      </div>

      {/* Main Nav */}
      <nav className={styles.sidebarNav}>
        <div className={styles.sidebarSectionLabel}>Overview</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href === '/dashboard' && pathname === '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? styles.sidebarItemActive : styles.sidebarItem}
            >
              <span className={styles.sidebarItemIcon}>
                <item.icon size={20} strokeWidth={1.5} />
              </span>
              <span className={styles.sidebarItemLabel}>{item.label}</span>
              {item.badge && (
                <span className={styles.sidebarBadge}>{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Nav */}
      <nav className={`${styles.sidebarNav} ${styles.sidebarSystem}`}>
        <div className={styles.sidebarSectionLabel}>System</div>
        {systemItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={styles.sidebarItem}
          >
            <span className={styles.sidebarItemIcon}>
              <item.icon size={20} strokeWidth={1.5} />
            </span>
            <span className={styles.sidebarItemLabel}>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className={styles.sidebarUser}>
        <div className={styles.sidebarAvatar}>AS</div>
        <div className={styles.sidebarUserInfo}>
          <span className={styles.sidebarUserName}>Arjun Singh</span>
          <span className={styles.sidebarUserRole}>
            Admin <ChevronDown size={14} />
          </span>
        </div>
      </div>
    </aside>
  );
}
