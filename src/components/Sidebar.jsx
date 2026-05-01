'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, FolderOpen, FileText, ArrowLeftRight,
  ShieldAlert, ClipboardList, Eye, Settings, HelpCircle,
  Hexagon, ChevronDown, Shield
} from 'lucide-react';

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
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Hexagon size={28} strokeWidth={1.5} />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-brand">ChainTrust</span>
          <span className="sidebar-tagline">Institutional Ledger</span>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Overview</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href === '/dashboard' && pathname === '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} strokeWidth={1.5} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="sidebar-badge">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Nav */}
      <nav className="sidebar-nav sidebar-system">
        <div className="sidebar-section-label">System</div>
        {systemItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="sidebar-item"
          >
            <item.icon size={20} strokeWidth={1.5} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">AS</div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">Arjun Singh</span>
          <span className="sidebar-user-role">
            Admin <ChevronDown size={14} />
          </span>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: var(--sidebar-width);
          height: 100vh;
          background: var(--gradient-primary);
          display: flex;
          flex-direction: column;
          z-index: 100;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px 24px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .sidebar-logo-icon {
          color: rgba(255,255,255,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-logo-text {
          display: flex;
          flex-direction: column;
        }

        .sidebar-brand {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          color: white;
          letter-spacing: -0.01em;
        }

        .sidebar-tagline {
          font-family: var(--font-label);
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.02em;
        }

        .sidebar-nav {
          padding: 16px 12px;
          flex: 1;
        }

        .sidebar-system {
          flex: 0;
          padding-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .sidebar-section-label {
          font-family: var(--font-label);
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.35);
          padding: 8px 12px 8px;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          color: rgba(255,255,255,0.65);
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          transition: all 150ms ease;
          position: relative;
          margin-bottom: 2px;
        }

        .sidebar-item:hover {
          color: rgba(255,255,255,0.9);
          background: rgba(255,255,255,0.06);
        }

        .sidebar-item.active {
          color: white;
          background: rgba(255,255,255,0.12);
          font-weight: 600;
        }

        .sidebar-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 6px;
          bottom: 6px;
          width: 3px;
          background: white;
          border-radius: 0 3px 3px 0;
        }

        .sidebar-badge {
          margin-left: auto;
          background: var(--color-red-600);
          color: white;
          font-family: var(--font-label);
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 10px;
          min-width: 20px;
          text-align: center;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-top: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          transition: background 150ms ease;
        }

        .sidebar-user:hover {
          background: rgba(255,255,255,0.06);
        }

        .sidebar-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-label);
          font-size: 13px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .sidebar-user-info {
          display: flex;
          flex-direction: column;
        }

        .sidebar-user-name {
          color: white;
          font-size: 13px;
          font-weight: 600;
        }

        .sidebar-user-role {
          color: rgba(255,255,255,0.5);
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 2px;
        }
      `}</style>
    </aside>
  );
}
