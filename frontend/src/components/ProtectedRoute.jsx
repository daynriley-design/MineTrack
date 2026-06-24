import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-rock)' }}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p style={{ color: 'var(--color-stone)' }}>Chargement…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role if they try to access something they shouldn't
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'supervisor') return <Navigate to="/supervisor/dashboard" replace />;
    if (user.role === 'geologist') return <Navigate to="/geologist/dashboard" replace />;
    if (user.role === 'operator') return <Navigate to="/miner/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  // If root is accessed, redirect to the default dashboard for their role
  if (location.pathname === '/') {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'supervisor') return <Navigate to="/supervisor/dashboard" replace />;
    if (user.role === 'geologist') return <Navigate to="/geologist/dashboard" replace />;
    if (user.role === 'operator') return <Navigate to="/miner/dashboard" replace />;
  }

  return children || null;
}
