import { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { equipmentPannesAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { Wrench, AlertCircle, Camera, X } from 'lucide-react';

export default function MinerEquipment() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setPhoto(evt.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setIsSending(true);
    try {
      await equipmentPannesAPI.create({
        equipment_id: formData.get('equipment_id'),
        issue_type: formData.get('issue_type'),
        description: formData.get('description'),
        reported_date: new Date().toISOString().slice(0, 10),
        reported_by: user?.name || user?.email || 'Mineur',
        status: 'open',
        photo: photo || null, // optionnel
      });
      toast("Alerte panne transmise à la maintenance", "success");
      e.target.reset();
      setPhoto(null);
    } catch {
      toast("Erreur : la panne n'a pas pu être transmise", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-warning)' }}>
          <Wrench size={24} />
        </div>
        <h3 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 700 }}>Signaler Panne Engin</h3>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'inset 0 0 20px rgba(245, 158, 11, 0.05)' }}>
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">ID Engin</label>
            <input type="text" name="equipment_id" className="form-input" placeholder="Ex: LHD-102" required />
          </div>
          
          <div className="form-group">
            <label className="form-label">Type de problème principal</label>
            <select className="form-select" name="issue_type" required>
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
            <textarea className="form-textarea" name="description" rows="3" placeholder="Ex: Fuite d'huile sous le vérin de levage, perte de puissance..." required></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Photo <span style={{ color: 'var(--color-stone)', fontWeight: 400 }}>(optionnel)</span></label>
            {photo ? (
              <div style={{ position: 'relative', width: 'fit-content' }}>
                <img src={photo} alt="Aperçu panne" style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-warning)' }} />
                <button type="button" onClick={() => setPhoto(null)} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', border: 'none', borderRadius: '50%', width: '24px', height: '24px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px dashed var(--color-stone)', borderRadius: 'var(--radius-md)', padding: '1rem', cursor: 'pointer', color: 'var(--color-chalk)' }}>
                <Camera size={18} /> Ajouter une photo (facultatif)
                <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} hidden />
              </label>
            )}
          </div>
          
          <button type="submit" disabled={isSending} style={{ 
            width: '100%', padding: '1rem', marginTop: '1rem', 
            background: 'linear-gradient(135deg, var(--color-warning), #D97706)', 
            color: 'white', border: 'none', borderRadius: 'var(--radius-md)', 
            fontWeight: 800, fontSize: '1rem', cursor: isSending ? 'wait' : 'pointer', opacity: isSending ? 0.7 : 1,
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)', transition: 'all 0.2s ease', textTransform: 'uppercase'
          }}>
            <AlertCircle size={20} />
            {isSending ? 'Envoi...' : 'Demander une Intervention'}
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
            <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(17,18,20,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-warning)' }}>
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
