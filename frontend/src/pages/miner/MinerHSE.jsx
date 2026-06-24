import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSharedData } from '../../contexts/SharedDataContext';
import { ShieldCheck, CheckCircle } from 'lucide-react';

export default function MinerHSE() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addHSEDeclaration } = useSharedData();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newDeclaration = {
      id: `HSE-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      author: user?.name || 'Mineur',
      peg: '10L-XC5SS (Saisie Manuelle)',
      status: 'En attente'
    };
    addHSEDeclaration(newDeclaration);
    toast("Déclaration HSE envoyée au Superviseur", "success");
    e.target.reset();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-emerald)' }}>
          <ShieldCheck size={24} />
        </div>
        <h3 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 700 }}>Déclaration HSE</h3>
      </div>

      <div style={{ background: 'rgba(41, 37, 36, 0.4)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <label className="form-checkbox-label">
            <input type="checkbox" className="form-checkbox" required /> 
            Face sécurisée (purgée de tout bloc instable)
          </label>
          
          <label className="form-checkbox-label">
            <input type="checkbox" className="form-checkbox" required /> 
            Ventilation primaire et secondaire actives
          </label>
          
          <label className="form-checkbox-label">
            <input type="checkbox" className="form-checkbox" required /> 
            Niveaux de gaz vérifiés (CO, NO2) dans les normes
          </label>
          
          <label className="form-checkbox-label">
            <input type="checkbox" className="form-checkbox" required /> 
            Arrosage effectué (abattage des poussières)
          </label>

          <button type="submit" style={{ 
            width: '100%', padding: '1rem', marginTop: '1rem', 
            background: 'linear-gradient(135deg, var(--color-emerald), #047857)', 
            color: 'white', border: 'none', borderRadius: 'var(--radius-md)', 
            fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', transition: 'all 0.2s ease'
          }}>
            <CheckCircle size={20} />
            Certifier la zone sécurisée
          </button>
        </form>
      </div>

      {/* Mock Data History */}
      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ color: 'var(--color-stone)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Dernières Déclarations</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { id: '1', peg: '10L-XC5SS', status: 'Sécurisé', time: 'Il y a 4h', color: 'var(--color-emerald)' },
            { id: '2', peg: '10L-XC4N', status: 'Sécurisé', time: 'Hier', color: 'var(--color-emerald)' }
          ].map(record => (
            <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${record.color}` }}>
              <div>
                <strong style={{ color: 'var(--color-white)', display: 'block' }}>{record.peg}</strong>
                <span style={{ color: record.color, fontSize: '0.8rem', fontWeight: 600 }}>{record.status}</span>
              </div>
              <span style={{ color: 'var(--color-chalk)', fontSize: '0.8rem' }}>{record.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
