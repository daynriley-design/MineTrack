import { useToast } from '../../contexts/ToastContext';
import { Wrench, AlertCircle } from 'lucide-react';

export default function MinerEquipment() {
  const { toast } = useToast();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    toast("Alerte panne transmise à la maintenance", "success");
    e.target.reset();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-warning)' }}>
          <Wrench size={24} />
        </div>
        <h3 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 700 }}>Signaler Panne Engin</h3>
      </div>

      <div style={{ background: 'rgba(41, 37, 36, 0.4)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'inset 0 0 20px rgba(245, 158, 11, 0.05)' }}>
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">ID Engin</label>
            <input type="text" className="form-input" placeholder="Ex: LHD-102" required />
          </div>
          
          <div className="form-group">
            <label className="form-label">Type de problème principal</label>
            <select className="form-select" required>
              <option value="">Sélectionner une catégorie...</option>
              <option value="mecanique">Mécanique (Moteur, Transmission...)</option>
              <option value="electrique">Électrique / Électronique</option>
              <option value="hydraulique">Hydraulique (Fuite, Pression...)</option>
              <option value="pneu">Pneumatique (Crevaison)</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Description des symptômes</label>
            <textarea className="form-textarea" rows="3" placeholder="Ex: Fuite d'huile sous le vérin de levage, perte de puissance..." required></textarea>
          </div>
          
          <button type="submit" style={{ 
            width: '100%', padding: '1rem', marginTop: '1rem', 
            background: 'linear-gradient(135deg, var(--color-warning), #D97706)', 
            color: 'white', border: 'none', borderRadius: 'var(--radius-md)', 
            fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)', transition: 'all 0.2s ease', textTransform: 'uppercase'
          }}>
            <AlertCircle size={20} />
            Demander une Intervention
          </button>
        </form>
      </div>

      {/* Mock Data History */}
      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ color: 'var(--color-stone)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Demandes d'intervention en cours</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { id: '1', engin: 'LHD-102', type: 'Hydraulique', status: 'En attente équipe', time: 'Il y a 1h' },
            { id: '2', engin: 'DT-401', type: 'Pneumatique', status: 'En cours de réparation', time: 'Il y a 3h' }
          ].map(record => (
            <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-warning)' }}>
              <div>
                <strong style={{ color: 'var(--color-white)', display: 'block' }}>{record.engin}</strong>
                <span style={{ color: 'var(--color-stone)', fontSize: '0.8rem' }}>{record.type} | Statut: <span style={{ color: 'var(--color-warning)' }}>{record.status}</span></span>
              </div>
              <span style={{ color: 'var(--color-chalk)', fontSize: '0.8rem', fontWeight: 600 }}>{record.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
