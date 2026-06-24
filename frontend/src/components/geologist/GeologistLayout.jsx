import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FlaskConical, Map as MapIcon, Hammer, FileText, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function GeologistLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const linkStyle = (path, colorVar) => ({
    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
    borderRadius: 'var(--radius-md)', 
    color: isActive(path) ? 'var(--color-white)' : 'var(--color-ash)',
    background: isActive(path) ? 'rgba(255,255,255,0.05)' : 'transparent',
    textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s ease',
    borderLeft: isActive(path) ? `3px solid ${colorVar}` : '3px solid transparent'
  });

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
            background: 'linear-gradient(135deg, var(--color-emerald), #059669)', 
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            color: 'white', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' 
          }}>
            <FlaskConical size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-white)' }}>
              GeoTrack
            </h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-emerald)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
              Géologie
            </span>
          </div>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-stone)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', marginTop: '1rem' }}>
            Menu Principal
          </p>

          <Link to="/geologist/dashboard" className="sidebar-link" style={linkStyle('/geologist/dashboard', 'var(--color-emerald)')}>
            <LayoutDashboard size={20} color={isActive('/geologist/dashboard') ? 'var(--color-emerald)' : 'currentColor'} />
            Tableau de Bord
          </Link>

          <Link to="/geologist/samples" className="sidebar-link" style={linkStyle('/geologist/samples', 'var(--color-info)')}>
            <FlaskConical size={20} color={isActive('/geologist/samples') ? 'var(--color-info)' : 'currentColor'} />
            Échantillonnage
          </Link>

          <Link to="/geologist/map" className="sidebar-link" style={linkStyle('/geologist/map', 'var(--color-gold)')}>
            <MapIcon size={20} color={isActive('/geologist/map') ? 'var(--color-gold)' : 'currentColor'} />
            Cartographie 3D
          </Link>

          <Link to="/geologist/geotech" className="sidebar-link" style={linkStyle('/geologist/geotech', 'var(--color-warning)')}>
            <Hammer size={20} color={isActive('/geologist/geotech') ? 'var(--color-warning)' : 'currentColor'} />
            Géotechnique
          </Link>
          
          <Link to="/geologist/report" className="sidebar-link" style={linkStyle('/geologist/report', 'var(--color-chalk)')}>
            <FileText size={20} color={isActive('/geologist/report') ? 'var(--color-chalk)' : 'currentColor'} />
            Mini-Rapport
          </Link>
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-rock-3)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCircle size={18} color="var(--color-chalk)" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-white)' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-emerald)' }}>Mode expert activé</p>
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
