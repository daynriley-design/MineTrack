import { User, Volume2, Bell, RefreshCw, LogOut, CheckCircle, Smartphone, FlaskConical } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function GeologistProfile() {
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
        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-emerald)' }}>
          <User size={28} />
        </div>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 800, fontSize: '1.5rem' }}>Profil - {user?.name || 'Géologue'}</h2>
          <p style={{ margin: 0, color: 'var(--color-stone)' }}>Informations personnelles et préférences</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>

        {/* Identité */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <FlaskConical size={40} color="var(--color-emerald)" />
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-white)' }}>{user?.name || 'Géologue'}</h3>
            <span style={{ background: 'var(--color-emerald)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>Géologue</span>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(17,18,20,0.05)', textAlign: 'left', color: 'var(--color-chalk)', fontSize: '0.9rem', lineHeight: '1.8' }}>
              <div><strong style={{ color: 'var(--color-stone)' }}>Email :</strong> {user?.email || '—'}</div>
              <div><strong style={{ color: 'var(--color-stone)' }}>Entreprise :</strong> Reliant Congo</div>
              <div><strong style={{ color: 'var(--color-stone)' }}>Site :</strong> MPAMA North</div>
            </div>
          </div>

          <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-white)' }}>📊 Statistiques</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--color-chalk)', fontSize: '0.9rem' }}>
              <span>Échantillons prélevés :</span>
              <strong style={{ color: 'var(--color-white)' }}>124</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--color-chalk)', fontSize: '0.9rem' }}>
              <span>Rapports envoyés :</span>
              <strong style={{ color: 'var(--color-white)' }}>38</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-chalk)', fontSize: '0.9rem' }}>
              <span>Jours d'activité :</span>
              <strong style={{ color: 'var(--color-white)' }}>64</strong>
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

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-white)' }}>
                <Bell size={20} />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Notifications</h3>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(17,18,20,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" defaultChecked /> Push (Mobile)</label>
                <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" defaultChecked /> Email</label>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-white)' }}>
                <Volume2 size={20} />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Son des notifications</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr auto', gap: '1rem', alignItems: 'center', background: 'rgba(17,18,20,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <select className="premium-input">
                  <option>Son standard</option>
                  <option>Son discret</option>
                </select>
                <button type="button" onClick={() => toast("Lecture test...", "info")} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-stone)', background: 'transparent', color: 'var(--color-white)', cursor: 'pointer' }}><Volume2 size={16} /></button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--color-emerald)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Smartphone size={20} color="var(--color-emerald)" />
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
