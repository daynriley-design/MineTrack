import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, MapPin, Activity, Drill, Zap, Factory,
  Truck, Users, ShieldAlert, FlaskConical, Wrench, DollarSign,
  FileBarChart2, LogOut, Menu, X, Pickaxe
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    await logout();
    toast(t('user.logout_success'), 'success');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'MT';

  const roleLabel = {
    admin: t('user.role_admin'),
    supervisor: t('user.role_supervisor'),
    operator: t('user.role_operator'),
    geologist: t('user.role_geologist'),
  }[user?.role] || user?.role;

  const navSections = [
    {
      label: t('nav.main'),
      items: [
        { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
      ]
    },
    {
      label: t('nav.operations'),
      items: [
        { to: '/pegs', label: t('nav.pegs'), icon: MapPin },
        { to: '/work-progress', label: t('nav.progress'), icon: Activity },
        { to: '/drilling', label: t('nav.drilling'), icon: Drill },
        { to: '/blasting', label: t('nav.blasting'), icon: Zap },
        { to: '/production', label: t('nav.production'), icon: Factory },
      ]
    },
    {
      label: t('nav.resources'),
      items: [
        { to: '/equipment', label: t('nav.equipment'), icon: Truck },
        { to: '/labor', label: t('nav.labor'), icon: Users },
        { to: '/hse', label: t('nav.hse'), icon: ShieldAlert },
      ]
    },
    {
      label: t('nav.tech_finance'),
      items: [
        { to: '/geology', label: t('nav.geology'), icon: FlaskConical },
        { to: '/support', label: t('nav.support'), icon: Wrench },
        { to: '/financial', label: t('nav.financial'), icon: DollarSign },
        { to: '/reports', label: t('nav.reports'), icon: FileBarChart2 },
      ]
    }
  ];

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 150 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon"><Pickaxe size={24} color="white" /></div>
          <div className="brand-text">
            <h2>{t('header.title')}</h2>
            <span>{t('header.subtitle')}</span>
          </div>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            style={{ marginLeft: 'auto', display: 'none' }}
            onClick={() => setSidebarOpen(false)}
            id="sidebar-close-btn"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.label}>
              <div className="nav-section-label">{section.label}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card" onClick={handleLogout} title={t('user.logout')}>
            <div className="user-avatar">{initials}</div>
            <div className="user-info" style={{ flex: 1, overflow: 'hidden' }}>
              <h4 style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </h4>
              <span>{roleLabel}</span>
            </div>
            <LogOut size={14} style={{ color: 'var(--color-stone)', flexShrink: 0 }} />
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setSidebarOpen(true)}
              style={{ display: 'none' }}
              id="sidebar-open-btn"
            >
              <Menu size={20} />
            </button>

            <div>
              <div className="header-title">{t('header.title')}</div>
              <div className="header-subtitle">{t('header.subtitle')}</div>
            </div>
          </div>

          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <select
              value={i18n.resolvedLanguage || i18n.language || 'fr'}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              style={{
                background: 'var(--color-rock-2)',
                color: 'var(--color-chalk)',
                border: '1px solid var(--color-rock-3)',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="sw">Swahili</option>
              <option value="ln">Lingala</option>
              <option value="lu">Tshiluba</option>
              <option value="kg">Kikongo</option>
            </select>

            <div className="header-stat">
              <span className="dot dot-green"></span>
              <span className="hide-mobile">{t('header.online')}</span>
            </div>
            <div className="header-stat">
              <span className="dot dot-orange"></span>
              <span className="hide-mobile">{t('header.live')}</span>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Responsive CSS override */}
      <style>{`
        @media (max-width: 768px) {
          #sidebar-open-btn { display: flex !important; }
          #sidebar-close-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
