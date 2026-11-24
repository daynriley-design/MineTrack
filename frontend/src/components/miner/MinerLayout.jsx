import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Pickaxe, LayoutDashboard, MapPin, ShieldCheck, AlertTriangle, Truck, Wrench, FileText, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import OfflineBanner from '../OfflineBanner';
import LanguageSwitcher from '../LanguageSwitcher';

export default function MinerLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path, colorVar) => ({
    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    color: isActive(path) ? 'var(--color-white)' : 'var(--color-ash)',
    background: isActive(path) ? 'rgba(17,18,20,0.05)' : 'transparent',
    textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s ease',
    borderLeft: isActive(path) ? `3px solid ${colorVar}` : '3px solid transparent'
  });

  const navItems = [
    { to: '/miner/dashboard',   label: 'Tableau de Bord',    icon: LayoutDashboard,  color: 'var(--color-ore)' },
    { to: '/miner/pegs',        label: 'Suivi PEG',          icon: MapPin,            color: 'var(--color-info)' },
    { to: '/miner/hse',         label: 'Déclaration HSE',    icon: ShieldCheck,       color: 'var(--color-emerald)' },
    { to: '/miner/production',  label: 'Production',         icon: Truck,             color: 'var(--color-gold)' },
    { to: '/miner/equipment',   label: 'Panne Engin',        icon: Wrench,            color: 'var(--color-warning)' },
    { to: '/miner/incident',    label: 'Signaler Incident',  icon: AlertTriangle,     color: 'var(--color-danger)' },
    { to: '/miner/report',      label: 'Mini-Rapport',       icon: FileText,          color: 'var(--color-chalk)' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-rock)' }}>
      
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: 'var(--color-rock-2)',
        borderRight: '1px solid var(--color-rock-3)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'linear-gradient(135deg, var(--color-ore), var(--color-gold))',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', boxShadow: '0 4px 15px rgba(238, 155, 95, 0.35)'
          }}>
            <Pickaxe size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-white)' }}>
              MineOps
            </h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-ore)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
              Opérateur Mineur
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-stone)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', marginTop: '1rem' }}>
            Menu Principal
          </p>

          {navItems.map(({ to, label, icon: Icon, color }) => (
            <Link key={to} to={to} className="sidebar-link" style={linkStyle(to, color)}>
              <Icon size={20} color={isActive(to) ? color : 'currentColor'} />
              {label}
              {to === '/miner/incident' && (
                <span style={{ marginLeft: 'auto', background: 'var(--color-danger)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, animation: 'pulse 2s infinite' }}>
                  URGENCE
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-rock-3)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <LanguageSwitcher style={{ width: '100%' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(238, 155, 95,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCircle size={20} color="var(--color-ore)" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-white)' }}>{user?.name || 'Opérateur'}</p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-ore)' }}>En service — MPAMA North</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-ruby)', border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
        <OfflineBanner />
        <Outlet />
      </main>
    </div>
  );
}
