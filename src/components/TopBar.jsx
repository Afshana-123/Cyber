'use client';
import { Search, Bell, Hexagon, Menu } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn btn-icon btn-ghost">
          <Menu size={20} />
        </button>
        <div className="topbar-search">
          <Search size={18} className="topbar-search-icon" />
          <input
            type="text"
            placeholder="Search projects, transactions, tenders..."
            className="topbar-search-input"
          />
          <span className="topbar-search-shortcut">⌘K</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-status">
          <span className="topbar-status-dot"></span>
          <Hexagon size={14} />
          <span className="topbar-status-text">Mainnet Live</span>
        </div>
        <button className="topbar-notification btn-icon">
          <Bell size={20} />
          <span className="topbar-notification-badge">3</span>
        </button>
        <div className="topbar-avatar">AS</div>
      </div>

      <style jsx>{`
        .topbar {
          position: fixed;
          top: 0;
          left: var(--sidebar-width);
          right: 0;
          height: var(--topbar-height);
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--color-slate-200);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-lg);
          z-index: 90;
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .topbar-menu-btn {
          display: none;
        }

        .topbar-search {
          position: relative;
          max-width: 480px;
          width: 100%;
        }

        .topbar-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-slate-400);
          pointer-events: none;
        }

        .topbar-search-input {
          width: 100%;
          padding: 10px 70px 10px 42px;
          background: var(--color-slate-50);
          border: 1.5px solid var(--color-slate-200);
          border-radius: var(--radius-md);
          font-size: 14px;
          color: var(--color-slate-900);
          transition: all 200ms ease;
        }

        .topbar-search-input::placeholder {
          color: var(--color-slate-400);
        }

        .topbar-search-input:focus {
          background: white;
          border-color: var(--color-primary-400);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .topbar-search-shortcut {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--color-slate-200);
          color: var(--color-slate-500);
          padding: 2px 8px;
          border-radius: 4px;
          font-family: var(--font-label);
          font-size: 11px;
          font-weight: 600;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .topbar-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: var(--color-emerald-50);
          border: 1px solid var(--color-emerald-100);
          border-radius: var(--radius-full);
          color: var(--color-emerald-700);
          font-family: var(--font-label);
          font-size: 12px;
          font-weight: 600;
        }

        .topbar-status-dot {
          width: 8px;
          height: 8px;
          background: var(--color-emerald-500);
          border-radius: 50%;
          animation: dotPulse 2s ease-in-out infinite;
        }

        .topbar-notification {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          color: var(--color-slate-600);
          transition: all 150ms ease;
        }

        .topbar-notification:hover {
          background: var(--color-slate-100);
          color: var(--color-slate-900);
        }

        .topbar-notification-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 18px;
          height: 18px;
          background: var(--color-red-600);
          color: white;
          border-radius: 50%;
          font-family: var(--font-label);
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .topbar-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--gradient-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-label);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 1023px) {
          .topbar { left: var(--sidebar-collapsed); }
          .topbar-menu-btn { display: flex; }
          .topbar-status-text { display: none; }
        }
        @media (max-width: 767px) {
          .topbar { left: 0; }
        }
      `}</style>
    </header>
  );
}
