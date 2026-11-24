import { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSharedData } from '../../contexts/sharedDataStore';
import { ShieldCheck, CheckCircle, Clock } from 'lucide-react';

export default function MinerHSE() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addHSEDeclaration } = useSharedData();
  const [history, setHistory] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newDeclaration = {
      id: `HSE-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      author: user?.name || 'Mineur',
      peg: formData.get('peg_id'),
      pic: formData.get('pic') || user?.name || 'Mineur',
      shiftBoss: formData.get('shift_boss'),
      gas: {
        ch4: `${formData.get('gas_ch4') || 0}%`,
        co: `${formData.get('gas_co') || 0}ppm`,
        o2: `${formData.get('gas_o2') || 20.9}%`,
      },
      reentry: `${formData.get('reentry_minutes') || 0} min`,
      photos: 0,
      coords: 'Non spécifié',
      status: 'En attente',
    };
    addHSEDeclaration(newDeclaration);
    setHistory(prev => [newDeclaration, ...prev].slice(0, 5));
    toast("Déclaration HSE envoyée au Superviseur", "success");
    e.target.reset();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-emerald)' }}>
          <ShieldCheck size={24} />
        </div>
        <h3 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 700 }}>Déclaration HSE — Face Safe</h3>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">PEG / Front</label>
              <input type="text" name="peg_id" className="form-input" placeholder="Ex: 10L-XC5SS" required />
            </div>
            <div className="form-group">
              <label className="form-label">Shift Boss</label>
              <input type="text" name="shift_boss" className="form-input" placeholder="Nom du chef de poste" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">PIC (Personne responsable)</label>
            <input type="text" name="pic" className="form-input" placeholder={user?.name || 'Votre nom'} />
          </div>

          <div>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Relevés gaz (GDI)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div><label className="form-label" style={{ fontSize: '0.75rem' }}>CH4 (%)</label><input type="number" step="0.1" name="gas_ch4" className="form-input" defaultValue="0" /></div>
              <div><label className="form-label" style={{ fontSize: '0.75rem' }}>CO (ppm)</label><input type="number" name="gas_co" className="form-input" defaultValue="0" /></div>
              <div><label className="form-label" style={{ fontSize: '0.75rem' }}>O2 (%)</label><input type="number" step="0.1" name="gas_o2" className="form-input" defaultValue="20.9" /></div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} /> Période de Re-entry (minutes)</label>
            <input type="number" name="reentry_minutes" className="form-input" placeholder="Ex: 30" required />
          </div>

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

      {/* Historique de la session */}
      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ color: 'var(--color-stone)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Dernières Déclarations (cette session)</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {history.length === 0 ? (
            <p style={{ color: 'var(--color-stone)', fontSize: '0.85rem' }}>Aucune déclaration envoyée pour le moment.</p>
          ) : history.map(record => (
            <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(17,18,20,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-emerald)' }}>
              <div>
                <strong style={{ color: 'var(--color-white)', display: 'block' }}>{record.peg}</strong>
                <span style={{ color: 'var(--color-emerald)', fontSize: '0.8rem', fontWeight: 600 }}>Re-entry : {record.reentry} — En attente de validation</span>
              </div>
              <span style={{ color: 'var(--color-chalk)', fontSize: '0.8rem' }}>{record.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
