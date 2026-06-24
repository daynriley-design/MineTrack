import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, LayoutDashboard, AlertTriangle, Map, LogOut, ShieldAlert, ShieldCheck, FileText, CircleDollarSign, Package, Users, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function SupervisorLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-rock)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '260px', 
        background: 'var(--color-rock-2)', 
        borderRight: '1px solid var(--color-rock-3)',
        padding: '1.5rem', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '40px', height: '40px', 
            background: 'linear-gradient(135deg, var(--color-gold), #B45309)', 
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            color: 'white', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)' 
          }}>
            <Eye size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-white)' }}>
              SupTrack
            </h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
              Supervision
            </span>
          </div>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-stone)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', marginTop: '1rem' }}>
            Menu Principal
          </p>

          <Link to="/supervisor/dashboard" className="sidebar-link" style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius-md)', color: isActive('/supervisor/dashboard') ? 'var(--color-white)' : 'var(--color-ash)',
            background: isActive('/supervisor/dashboard') ? 'rgba(255,255,255,0.05)' : 'transparent',
            textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s ease'
          }}>
            <LayoutDashboard size={20} color={isActive('/supervisor/dashboard') ? 'var(--color-gold)' : 'currentColor'} />
            Centre de Contrôle
          </Link>

          <Link to="/supervisor/alerts" className="sidebar-link" style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius-md)', color: isActive('/supervisor/alerts') ? 'var(--color-white)' : 'var(--color-ash)',
            background: isActive('/supervisor/alerts') ? 'rgba(255,255,255,0.05)' : 'transparent',
            textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle size={20} color={isActive('/supervisor/alerts') ? 'var(--color-danger)' : 'currentColor'} />
              Alertes
            </div>
            <span style={{ background: 'var(--color-danger)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
              3
            </span>
          </Link>

          <Link to="/supervisor/map" className="sidebar-link" style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius-md)', color: isActive('/supervisor/map') ? 'var(--color-white)' : 'var(--color-ash)',
            background: isActive('/supervisor/map') ? 'rgba(255,255,255,0.05)' : 'transparent',
            textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s ease'
          }}>
            <Map size={20} color={isActive('/supervisor/map') ? 'var(--color-info)' : 'currentColor'} />
            Carte Interactive
          </Link>

          <Link to="/supervisor/hse-validation" className="sidebar-link" style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius-md)', color: isActive('/supervisor/hse-validation') ? 'var(--color-white)' : 'var(--color-ash)',
            background: isActive('/supervisor/hse-validation') ? 'rgba(255,255,255,0.05)' : 'transparent',
            textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s ease'
          }}>
            <ShieldCheck size={20} color={isActive('/supervisor/hse-validation') ? 'var(--color-emerald)' : 'currentColor'} />
            Validation HSE
          </Link>

          <Link to="/supervisor/reports" className="sidebar-link" style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius-md)', color: isActive('/supervisor/reports') ? 'var(--color-white)' : 'var(--color-ash)',
            background: isActive('/supervisor/reports') ? 'rgba(255,255,255,0.05)' : 'transparent',
            textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s ease'
          }}>
            <FileText size={20} color={isActive('/supervisor/reports') ? 'var(--color-info)' : 'currentColor'} />
            Rapports
          </Link>

          <Link to="/supervisor/erp" className="sidebar-link" style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius-md)', color: isActive('/supervisor/erp') ? 'var(--color-white)' : 'var(--color-ash)',
            background: isActive('/supervisor/erp') ? 'rgba(255,255,255,0.05)' : 'transparent',
            textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s ease'
          }}>
            <CircleDollarSign size={20} color={isActive('/supervisor/erp') ? 'var(--color-gold)' : 'currentColor'} />
            ERP / Finances
          </Link>

          <Link to="/supervisor/stocks" className="sidebar-link" style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius-md)', color: isActive('/supervisor/stocks') ? 'var(--color-white)' : 'var(--color-ash)',
            background: isActive('/supervisor/stocks') ? 'rgba(255,255,255,0.05)' : 'transparent',
            textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s ease'
          }}>
            <Package size={20} color={isActive('/supervisor/stocks') ? 'var(--color-ore)' : 'currentColor'} />
            Gestion Stocks
          </Link>

          <Link to="/supervisor/users" className="sidebar-link" style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius-md)', color: isActive('/supervisor/users') ? 'var(--color-white)' : 'var(--color-ash)',
            background: isActive('/supervisor/users') ? 'rgba(255,255,255,0.05)' : 'transparent',
            textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s ease'
          }}>
            <Users size={20} color={isActive('/supervisor/users') ? 'var(--color-purple)' : 'currentColor'} />
            Utilisateurs
          </Link>

          <Link to="/supervisor/profile" className="sidebar-link" style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius-md)', color: isActive('/supervisor/profile') ? 'var(--color-white)' : 'var(--color-ash)',
            background: isActive('/supervisor/profile') ? 'rgba(255,255,255,0.05)' : 'transparent',
            textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s ease'
          }}>
            <User size={20} color={isActive('/supervisor/profile') ? 'var(--color-stone)' : 'currentColor'} />
            Profil
          </Link>
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-rock-3)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={18} color="var(--color-chalk)" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-white)' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-stone)' }}>En service</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ 
            width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-ruby)', border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s ease'
          }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}>
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
