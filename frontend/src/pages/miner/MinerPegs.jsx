import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { MapPin, Save } from 'lucide-react';
import { pegAdvancesAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

export default function MinerPegs() {
  const [formData, setFormData] = useState({ peg_id: '', shift: 'day', drilled_meters: '', blasted_holes: '', mucked_tonnage: '' });
  const [history, setHistory] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadHistory = () => {
    pegAdvancesAPI.list().then(res => {
      const items = Array.isArray(res.data) ? res.data : res.data?.items || [];
      setHistory(items.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 5));
    }).catch(() => {});
  };

  useEffect(() => { loadHistory(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await pegAdvancesAPI.create({
        peg_id: formData.peg_id,
        shift: formData.shift,
        date: new Date().toISOString().slice(0, 10),
        drilled_meters: parseFloat(formData.drilled_meters) || 0,
        blasted_holes: parseInt(formData.blasted_holes) || 0,
        mucked_tonnage: parseFloat(formData.mucked_tonnage) || 0,
        notes: `Saisi par ${user?.name || user?.email || 'Mineur'}`,
      });
      toast("Avancement enregistré avec succès", "success");
      setFormData({ peg_id: '', shift: 'day', drilled_meters: '', blasted_holes: '', mucked_tonnage: '' });
      loadHistory();
    } catch {
      toast("Erreur : l'avancement n'a pas pu être enregistré", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-info)' }}>
          <MapPin size={24} />
        </div>
        <h3 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 700 }}>Avancement PEG</h3>
      </div>
      
      <div style={{ background: '#FFFFFF', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">ID PEG (Numéro du front)</label>
            <input type="text" className="form-input" placeholder="Ex: N-450-W" value={formData.peg_id} onChange={e => setFormData({...formData, peg_id: e.target.value})} required />
          </div>
          
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Mètres forés</label>
              <input type="number" step="0.1" className="form-input" placeholder="0.0" value={formData.drilled_meters} onChange={e => setFormData({...formData, drilled_meters: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Trous minés</label>
              <input type="number" className="form-input" placeholder="0" value={formData.blasted_holes} onChange={e => setFormData({...formData, blasted_holes: e.target.value})} />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Tonnage marinage (estimé)</label>
            <input type="number" className="form-input" placeholder="0" value={formData.mucked_tonnage} onChange={e => setFormData({...formData, mucked_tonnage: e.target.value})} />
          </div>
          
          <button type="submit" disabled={isSending} style={{
            width: '100%', padding: '1rem', marginTop: '1rem',
            background: 'linear-gradient(135deg, var(--color-ore), var(--color-ore-dark))',
            color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
            fontWeight: 700, fontSize: '1rem', cursor: isSending ? 'wait' : 'pointer', opacity: isSending ? 0.7 : 1,
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)', transition: 'all 0.2s ease'
          }}>
            <Save size={20} />
            Enregistrer l'avancement
          </button>
        </form>
      </div>

      {/* Historique récent */}
      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ color: 'var(--color-stone)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Dernières saisies</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {history.length === 0 ? (
            <p style={{ color: 'var(--color-stone)', fontSize: '0.85rem' }}>Aucune saisie pour le moment.</p>
          ) : history.map(record => (
            <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(17,18,20,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-info)' }}>
              <div>
                <strong style={{ color: 'var(--color-white)', display: 'block' }}>{record.peg_id}</strong>
                <span style={{ color: 'var(--color-stone)', fontSize: '0.8rem' }}>Forage: {record.drilled_meters}m | Marinage: {record.mucked_tonnage}t</span>
              </div>
              <span style={{ color: 'var(--color-chalk)', fontSize: '0.8rem' }}>{record.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
