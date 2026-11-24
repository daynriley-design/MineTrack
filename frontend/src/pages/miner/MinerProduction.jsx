import { useToast } from '../../contexts/ToastContext';
import { Truck, Save } from 'lucide-react';

export default function MinerProduction() {
  const { toast } = useToast();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    toast("Voyage de production enregistré", "success");
    e.target.reset();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.5rem', background: 'rgba(238, 155, 95, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-ore)' }}>
          <Truck size={24} />
        </div>
        <h3 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 700 }}>Saisie Production</h3>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">Engin / Camion (Numéro ID)</label>
            <input type="text" className="form-input" placeholder="Ex: DT-405" required />
          </div>
          
          <div className="form-group">
            <label className="form-label">Tonnage estimé (t)</label>
            <input type="number" step="0.5" className="form-input" placeholder="0.0" required />
          </div>
          
          <div className="form-group">
            <label className="form-label">Type de matériau transporté</label>
            <select className="form-select" required>
              <option value="minerai">Minerai Haute Teneur</option>
              <option value="minerai_bas">Minerai Basse Teneur</option>
              <option value="stérile">Stérile (Waste)</option>
              <option value="remblai">Remblai</option>
            </select>
          </div>
          
          <button type="submit" style={{ 
            width: '100%', padding: '1rem', marginTop: '1rem', 
            background: 'linear-gradient(135deg, var(--color-ore), var(--color-ore-dark))', 
            color: 'white', border: 'none', borderRadius: 'var(--radius-md)', 
            fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(238, 155, 95, 0.3)', transition: 'all 0.2s ease'
          }}>
            <Save size={20} />
            Enregistrer le Voyage
          </button>
        </form>
      </div>

      {/* Mock Data History */}
      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ color: 'var(--color-stone)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Derniers Voyages (Aujourd'hui)</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { id: '1', engin: 'DT-405', type: 'Minerai Haute Teneur', tons: '32.5', time: '14:30' },
            { id: '2', engin: 'DT-402', type: 'Stérile (Waste)', tons: '30.0', time: '11:15' },
            { id: '3', engin: 'DT-405', type: 'Minerai Haute Teneur', tons: '31.8', time: '09:45' }
          ].map(record => (
            <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(17,18,20,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-ore)' }}>
              <div>
                <strong style={{ color: 'var(--color-white)', display: 'block' }}>{record.engin}</strong>
                <span style={{ color: 'var(--color-stone)', fontSize: '0.8rem' }}>{record.type} | {record.tons}t</span>
              </div>
              <span style={{ color: 'var(--color-chalk)', fontSize: '0.8rem', fontWeight: 600 }}>{record.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
