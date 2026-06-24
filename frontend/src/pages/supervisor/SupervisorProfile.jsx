import { User, Volume2, Bell, RefreshCw, LogOut, CheckCircle, Smartphone, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function SupervisorProfile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleSave = (e) => {
    e.preventDefault();
    toast("Préférences de profil mises à jour", "success");
  };

  const handleSync = () => {
    toast("Synchronisation des données en cours...", "info");
    setTimeout(() => {
      toast("Données synchronisées avec succès", "success");
    }, 1500);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(214, 211, 209, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-chalk)' }}>
          <User size={28} />
        </div>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 800, fontSize: '1.5rem' }}>Profil - {user?.name || 'Vincent K.'}</h2>
          <p style={{ margin: 0, color: 'var(--color-stone)' }}>Configuration personnelle et préférences d'alertes</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Identité */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <User size={40} color="var(--color-chalk)" />
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-white)' }}>{user?.name || 'Vincent K.'}</h3>
            <span style={{ background: 'var(--color-info)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>Shift Boss</span>
            
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'left', color: 'var(--color-chalk)', fontSize: '0.9rem', lineHeight: '1.8' }}>
              <div><strong style={{ color: 'var(--color-stone)' }}>Matricule :</strong> 4245</div>
              <div><strong style={{ color: 'var(--color-stone)' }}>Entreprise :</strong> Reliant Congo</div>
              <div><strong style={{ color: 'var(--color-stone)' }}>Site :</strong> MPAMA North</div>
            </div>
          </div>

          <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-white)' }}>📊 Statistiques</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--color-chalk)', fontSize: '0.9rem' }}>
              <span>Alertes traitées :</span>
              <strong style={{ color: 'var(--color-white)' }}>56</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--color-chalk)', fontSize: '0.9rem' }}>
              <span>Formulaires validés :</span>
              <strong style={{ color: 'var(--color-white)' }}>142</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-chalk)', fontSize: '0.9rem' }}>
              <span>Jours d'activité :</span>
              <strong style={{ color: 'var(--color-white)' }}>87</strong>
            </div>
          </div>

          <button onClick={handleSync} className="premium-button secondary" style={{ width: '100%', padding: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={18} /> SYNCHRONISER
          </button>

          <button onClick={logout} className="btn-danger" style={{ width: '100%', padding: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-md)', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-ruby)', cursor: 'pointer', fontWeight: 600 }}>
            <LogOut size={18} /> DÉCONNEXION
          </button>
        </div>

        {/* Paramètres */}
        <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Notifications */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-white)' }}>
                <Bell size={20} />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Notifications</h3>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" defaultChecked /> Push (Mobile)</label>
                <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" defaultChecked /> SMS</label>
                <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" defaultChecked /> Email</label>
              </div>
            </div>

            {/* Sons */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-white)' }}>
                <Volume2 size={20} />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Sons d'Alerte</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-danger)', fontWeight: 600, fontSize: '0.9rem' }}>Alerte Critique</span>
                  <select className="premium-input">
                    <option>Son 1 (Strident - Alarme usine)</option>
                    <option>Son 2 (Buzzer continu)</option>
                  </select>
                  <button type="button" onClick={() => toast("Lecture test...", "info")} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-stone)', background: 'transparent', color: 'var(--color-white)', cursor: 'pointer' }}><Volume2 size={16} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-warning)', fontWeight: 600, fontSize: '0.9rem' }}>Alerte Sérieuse</span>
                  <select className="premium-input">
                    <option>Son 2 (Intermittent rapide)</option>
                    <option>Son 3 (Bip long)</option>
                  </select>
                  <button type="button" onClick={() => toast("Lecture test...", "info")} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-stone)', background: 'transparent', color: 'var(--color-white)', cursor: 'pointer' }}><Volume2 size={16} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-info)', fontWeight: 600, fontSize: '0.9rem' }}>Alerte Mineure</span>
                  <select className="premium-input">
                    <option>Son 3 (Standard - Notification)</option>
                    <option>Son 4 (Discret)</option>
                  </select>
                  <button type="button" onClick={() => toast("Lecture test...", "info")} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-stone)', background: 'transparent', color: 'var(--color-white)', cursor: 'pointer' }}><Volume2 size={16} /></button>
                </div>
              </div>
            </div>

            {/* Escalade */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-white)' }}>
                <AlertTriangle size={20} />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Délais d'Escalade (Non-réponse)</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--color-stone)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Niveau 1</label>
                  <input type="number" className="premium-input" style={{ width: '100%' }} defaultValue="5" />
                  <span style={{ color: 'var(--color-chalk)', fontSize: '0.75rem' }}>minutes</span>
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--color-stone)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Niveau 2</label>
                  <input type="number" className="premium-input" style={{ width: '100%' }} defaultValue="10" />
                  <span style={{ color: 'var(--color-chalk)', fontSize: '0.75rem' }}>minutes</span>
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--color-stone)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Niveau 3</label>
                  <input type="number" className="premium-input" style={{ width: '100%' }} defaultValue="15" />
                  <span style={{ color: 'var(--color-chalk)', fontSize: '0.75rem' }}>minutes</span>
                </div>
              </div>
            </div>

            {/* Général */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--color-info)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Smartphone size={20} color="var(--color-info)" />
                <div>
                  <h4 style={{ margin: 0, color: 'var(--color-white)' }}>Mode Offline</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-chalk)' }}>Télécharger les données pour le sous-sol</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>

            <button type="submit" className="premium-button primary" style={{ padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', marginTop: '1rem' }}>
              <CheckCircle size={20} /> ENREGISTRER LES PRÉFÉRENCES
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
