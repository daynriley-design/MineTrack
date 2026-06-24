import { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { Siren, AlertTriangle } from 'lucide-react';

export default function MinerIncident() {
  const { toast } = useToast();
  const [data, setData] = useState({ title: '', severity: 'high', location: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast("ALERTE ENVOYÉE AU SUPERVISEUR", "success");
    setData({ title: '', severity: 'high', location: '' });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)' }}>
          <Siren size={24} />
        </div>
        <h3 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 700 }}>Signaler un Incident</h3>
      </div>

      <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">Type d'incident</label>
            <select className="form-select" value={data.title} onChange={e => setData({...data, title: e.target.value})} required>
              <option value="">Sélectionner une catégorie...</option>
              <option value="Éboulement">Éboulement de terrain</option>
              <option value="Présence de gaz">Présence de gaz toxique</option>
              <option value="Blessure">Blessure d'un travailleur</option>
              <option value="Incendie">Incendie / Fumée</option>
              <option value="Autre">Autre danger grave</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Niveau de gravité</label>
            <select className="form-select" value={data.severity} onChange={e => setData({...data, severity: e.target.value})} style={{ 
              color: data.severity === 'critical' ? 'var(--color-ruby)' : 'var(--color-warning)',
              fontWeight: 600
            }}>
              <option value="high">Urgent (Intervention rapide requise)</option>
              <option value="critical">CRITIQUE (Danger de mort / Arrêt immédiat)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Localisation exacte</label>
            <input type="text" className="form-input" placeholder="Ex: Niveau 3, Galerie Ouest" value={data.location} onChange={e => setData({...data, location: e.target.value})} required />
          </div>
          
          <button type="submit" style={{ 
            width: '100%', padding: '1.25rem', marginTop: '1.5rem', 
            background: 'linear-gradient(135deg, var(--color-danger), #991B1B)', 
            color: 'white', border: 'none', borderRadius: 'var(--radius-md)', 
            fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer',
            display: 'flex', justifyItems: 'center', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)', textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            <AlertTriangle size={24} />
            Déclencher l'alerte
          </button>
        </form>
      </div>
    </div>
  );
}
