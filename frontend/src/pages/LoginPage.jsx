import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Pickaxe, Eye, EyeOff, WifiOff, LogIn, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('operator');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let user;
      if (isLogin) {
        const res = await login({ email: email.trim(), password: password.trim() });
        user = res.user || res; // depending on auth context implementation
      } else {
        const res = await register({ email: email.trim(), password: password.trim(), name, role });
        user = res.user || res;
      }
      
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'supervisor') navigate('/supervisor/dashboard');
      else navigate('/miner/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Erreur de connexion ou d'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-layout">
      {/* Image Side - Hidden on small screens */}
      <div className="auth-image-pane">
        <img src="/login-bg.png" alt="MineTrack Digital Operations" />
        <div className="auth-image-overlay"></div>
      </div>

      {/* Form Side */}
      <div className="auth-form-pane">
        <div className="auth-card">
          
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Pickaxe size={28} strokeWidth={2.5} />
            </div>
            <div className="auth-logo-text">
              <h1>Minetrack</h1>
              <span>Enterprise Operations</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ color: 'var(--color-ruby)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="auth-input-group">
                <label>Nom complet</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Ex: Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="auth-input-group">
              <label>Identifiant (Email ou Matricule)</label>
              <input
                type="text"
                className="auth-input"
                placeholder="Ex: miner@reliant.cd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-input-group">
              <label>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-stone)', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="auth-input-group">
                <label>Rôle (Pour la démo)</label>
                <select className="auth-input" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="operator">Mineur / Opérateur</option>
                  <option value="supervisor">Superviseur</option>
                  <option value="geologist">Géologue</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            )}

            <button type="submit" className="auth-button" disabled={loading}>
              {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
              {loading ? "Traitement..." : isLogin ? "Connexion Sécurisée" : "Créer le compte"}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--color-ore)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
              >
                {isLogin ? "Créer un nouveau compte" : "J'ai déjà un compte"}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', color: 'var(--color-stone)', fontSize: '0.75rem', gap: '0.25rem', alignItems: 'center' }}>
               <WifiOff size={12} />
               <span>Mode hors-ligne synchronisé activé</span>
            </div>
          </form>

          {/* Demo Accounts Panel */}
          {isLogin && (
            <div className="auth-demo-accounts">
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-chalk)' }}>Accès Démonstration (Rôles)</p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.75rem' }}>Utilisez <strong>daynriley@gmail.com</strong> avec le mot de passe correspondant au rôle souhaité :</p>
              <div className="demo-role-grid">
                <div className="demo-role">
                  <strong>Superviseur</strong>
                  <span>123</span>
                </div>
                <div className="demo-role">
                  <strong>Géologue</strong>
                  <span>1234</span>
                </div>
                <div className="demo-role" style={{ gridColumn: 'span 2' }}>
                  <strong>Mineur / Opérateur</strong>
                  <span>12345</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
