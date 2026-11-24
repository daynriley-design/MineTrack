import { useState, useEffect } from 'react';
import { Eye, ShieldCheck, AlertTriangle, Camera, X, Send } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { faceExaminationsAPI } from '../../api';

export default function GeologistFaceExam() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [groundCondition, setGroundCondition] = useState('safe');

  const loadExams = () => {
    faceExaminationsAPI.list().then(res => {
      const items = Array.isArray(res.data) ? res.data : res.data?.items || [];
      setExams(items.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 10));
    }).catch(() => {});
  };

  useEffect(() => { loadExams(); }, []);

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
      await faceExaminationsAPI.create({
        peg_id: formData.get('peg_id'),
        date: new Date().toISOString().slice(0, 10),
        examiner: user?.name || user?.email || 'Géologue',
        ground_condition: groundCondition,
        hazards_observed: formData.get('hazards_observed') || null,
        ventilation_ok: formData.get('ventilation_ok') === 'on' ? 1 : 0,
        gas_readings: formData.get('gas_readings') || null,
        action_required: formData.get('action_required') || null,
        status: groundCondition === 'safe' ? 'cleared' : 'action_required',
        photo: photo || null,
      });
      toast('Face examination enregistrée', 'success');
      e.target.reset();
      setPhoto(null);
      setGroundCondition('safe');
      loadExams();
    } catch {
      toast("Erreur : l'inspection n'a pas pu être enregistrée", 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)' }}>
          <Eye size={28} />
        </div>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 800, fontSize: '1.5rem' }}>Face Examination</h2>
          <p style={{ margin: 0, color: 'var(--color-stone)' }}>Inspection du front avant reprise des travaux</p>
        </div>
      </div>

      <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div className="form-group">
            <label className="form-label">PEG / Front examiné</label>
            <input type="text" name="peg_id" className="form-input" placeholder="Ex: 10L-XC5SS" required />
          </div>

          <div className="form-group">
            <label className="form-label">État du terrain</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={() => setGroundCondition('safe')}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700,
                  border: `1px solid ${groundCondition === 'safe' ? 'var(--color-emerald)' : 'var(--color-stone)'}`,
                  background: groundCondition === 'safe' ? 'rgba(16,185,129,0.15)' : 'transparent',
                  color: groundCondition === 'safe' ? 'var(--color-emerald)' : 'var(--color-chalk)' }}>
                <ShieldCheck size={16} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} /> Sûr
              </button>
              <button type="button" onClick={() => setGroundCondition('unstable')}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700,
                  border: `1px solid ${groundCondition === 'unstable' ? 'var(--color-danger)' : 'var(--color-stone)'}`,
                  background: groundCondition === 'unstable' ? 'rgba(239,68,68,0.15)' : 'transparent',
                  color: groundCondition === 'unstable' ? 'var(--color-danger)' : 'var(--color-chalk)' }}>
                <AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} /> Instable / Danger
              </button>
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-white)', cursor: 'pointer' }}>
              <input type="checkbox" name="ventilation_ok" defaultChecked /> Ventilation conforme
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Relevé gaz (O2 / CO / CH4)</label>
            <input type="text" name="gas_readings" className="form-input" placeholder="Ex: O2 20.9% / CO 0ppm / CH4 0%" />
          </div>

          <div className="form-group">
            <label className="form-label">Dangers observés</label>
            <textarea name="hazards_observed" className="form-textarea" rows="2" placeholder="Ex: blocs suspendus, fissures visibles..."></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Action requise avant reprise</label>
            <textarea name="action_required" className="form-textarea" rows="2" placeholder="Ex: purge de la zone, pose de soutènement complémentaire..."></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Photo <span style={{ color: 'var(--color-stone)', fontWeight: 400 }}>(optionnel)</span></label>
            {photo ? (
              <div style={{ position: 'relative', width: 'fit-content' }}>
                <img src={photo} alt="Aperçu" style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-danger)' }} />
                <button type="button" onClick={() => setPhoto(null)} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', border: 'none', borderRadius: '50%', width: '24px', height: '24px', color: 'white', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px dashed var(--color-stone)', borderRadius: 'var(--radius-md)', padding: '1rem', cursor: 'pointer', color: 'var(--color-chalk)' }}>
                <Camera size={18} /> Prendre / ajouter une photo
                <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} hidden />
              </label>
            )}
          </div>

          <button type="submit" disabled={isSending} className="premium-button" style={{ padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={18} /> {isSending ? 'Enregistrement...' : "Enregistrer l'inspection"}
          </button>
        </form>
      </div>

      <div>
        <h4 style={{ color: 'var(--color-stone)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Inspections récentes</h4>
        {exams.length === 0 ? (
          <p style={{ color: 'var(--color-stone)', fontSize: '0.85rem' }}>Aucune inspection enregistrée.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {exams.map(ex => (
              <div key={ex.id} style={{ padding: '0.85rem 1rem', background: ex.ground_condition === 'safe' ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${ex.ground_condition === 'safe' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <strong style={{ color: 'var(--color-white)' }}>{ex.peg_id} — {ex.date}</strong>
                  <span style={{ color: ex.ground_condition === 'safe' ? 'var(--color-emerald)' : 'var(--color-danger)', fontWeight: 700, fontSize: '0.85rem' }}>
                    {ex.ground_condition === 'safe' ? '✅ Sûr' : '⚠️ Instable'}
                  </span>
                </div>
                {ex.hazards_observed && <p style={{ margin: '0.4rem 0 0 0', color: 'var(--color-chalk)', fontSize: '0.8rem' }}>Dangers : {ex.hazards_observed}</p>}
                {ex.action_required && <p style={{ margin: '0.2rem 0 0 0', color: 'var(--color-stone)', fontSize: '0.8rem' }}>Action : {ex.action_required}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
