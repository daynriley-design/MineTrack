import { useState, useRef } from 'react';
import { Hammer, AlertTriangle, ShieldCheck, Camera, FileText, X, Printer } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export default function GeologistGeotech() {
  const [peg, setPeg] = useState('10L-XC5SS');
  const [photos, setPhotos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleValidate = () => {
    toast('Rapport géotechnique enregistré avec succès.', 'success');
  };

  const handlePhotoUpload = (e) => {
    if (photos.length >= 3) {
      toast('Limite de 3 photos atteinte', 'error');
      return;
    }
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setPhotos(prev => {
        if (prev.length < 3) return [...prev, url];
        return prev;
      });
    });
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--color-white)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Hammer size={28} color="var(--color-warning)" />
          GÉOTECHNIQUE - SUIVI STABILITÉ
        </h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select className="premium-input" value={peg} onChange={(e) => setPeg(e.target.value)}>
            <option value="10L-XC5SS">10L-XC5SS</option>
            <option value="11L-FWS">11L-FWS</option>
          </select>
          <span style={{ color: 'var(--color-stone)' }}>17/06/2026</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Indicateurs */}
        <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ color: 'var(--color-white)', fontSize: '1rem', margin: 0, borderBottom: '1px solid var(--color-rock-3)', paddingBottom: '0.5rem' }}>
            📊 INDICATEURS STABILITÉ
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><label className="form-label">RMR (Rock Mass Rating)</label><input type="number" className="premium-input" defaultValue="68" /></div>
            <div><label className="form-label">Classe</label><input type="text" className="premium-input" defaultValue="II - Bon" disabled style={{ background: 'rgba(255,255,255,0.02)' }} /></div>
            
            <div><label className="form-label">Q-System</label><input type="number" className="premium-input" defaultValue="8.5" step="0.1" /></div>
            <div><label className="form-label">Stabilité globale</label><input type="text" className="premium-input" defaultValue="Moyenne" disabled style={{ background: 'rgba(255,255,255,0.02)' }} /></div>

            <div><label className="form-label">RQD (%)</label><input type="number" className="premium-input" defaultValue="75" /></div>
            <div><label className="form-label">Fracturation</label>
              <select className="premium-input" style={{ width: '100%' }}><option>Modérée</option><option>Forte</option></select>
            </div>
          </div>

          <h4 style={{ color: 'var(--color-info)', margin: '1rem 0 0 0', fontSize: '0.9rem' }}>Propriétés Mécaniques</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><label className="form-label">GSI</label><input type="number" className="premium-input" defaultValue="65" /></div>
            <div><label className="form-label">Cohésion (MPa)</label><input type="number" className="premium-input" defaultValue="1.5" step="0.1" /></div>
            <div><label className="form-label">Angle frottement (°)</label><input type="number" className="premium-input" defaultValue="35" /></div>
          </div>
        </div>

        {/* Côté Droit : Alertes & Soutènement */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--color-warning)' }} />
            <h3 style={{ color: 'var(--color-warning)', fontSize: '1rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} /> ZONES INSTABLES
            </h3>
            <p style={{ color: 'var(--color-stone)', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>Aucune signalée - Contrôle visuel OK</p>
            <button style={{ background: 'transparent', border: '1px dashed var(--color-warning)', color: 'var(--color-warning)', width: '100%', padding: '0.75rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
              + Ajouter une zone instable
            </button>
          </div>

          <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--color-white)', fontSize: '1rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--color-emerald)" /> SOUTÈNEMENT RECOMMANDÉ
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}><label className="form-label">Type</label>
                <select className="premium-input" style={{ width: '100%' }}><option>Grillage + Boulons</option><option>Béton Projeté</option></select>
              </div>
              <div><label className="form-label">Espacement (m)</label><input type="text" className="premium-input" defaultValue="1.0 x 1.0" /></div>
              <div><label className="form-label">Béton projeté (cm)</label><input type="number" className="premium-input" defaultValue="5" /></div>
              <div><label className="form-label">Long. boulons (m)</label><input type="number" className="premium-input" defaultValue="2.4" step="0.1" /></div>
            </div>
          </div>

        </div>

      </div>

      <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" multiple hidden />
            <button 
              onClick={() => fileInputRef.current?.click()}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--color-stone)', color: 'var(--color-chalk)', padding: '1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', flex: 1 }}
            >
              <Camera size={18} /> Ajouter Photos ({photos.length}/3)
            </button>
            {photos.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {photos.map((url, i) => (
                  <div key={i} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={url} alt={`Photo ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button onClick={() => removePhoto(i)} style={{ position: 'absolute', top: 2, right: 2, background: 'var(--color-ruby)', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={10} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ flex: 2 }}>
            <textarea className="premium-input" placeholder="Commentaires géotechniques..." style={{ width: '100%', height: '100%', minHeight: '50px', resize: 'none' }}></textarea>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button className="premium-button secondary" style={{ width: '200px', justifyContent: 'center' }} onClick={() => setShowModal(true)}><FileText size={18}/> RAPPORT GÉOTECH</button>
        <button className="premium-button" style={{ width: '200px', justifyContent: 'center' }} onClick={handleValidate}>✅ VALIDER</button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--color-rock-3)', paddingBottom: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Hammer color="var(--color-emerald)"/> FICHE DE SUIVI GÉOTECHNIQUE</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon"><X size={20}/></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-rock-3)', paddingBottom: '0.5rem' }}>
                <div>
                  <span style={{ color: 'var(--color-stone)' }}>Lieu:</span> <strong style={{ color: 'var(--color-white)' }}>{peg}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-stone)' }}>Date:</span> <strong style={{ color: 'var(--color-white)' }}>17/06/2026</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'var(--color-rock)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ color: 'var(--color-stone)', margin: '0 0 0.5rem 0', fontSize: '0.8rem', textTransform: 'uppercase' }}>Classification du Massif</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-ash)' }}>RMR:</span> <strong>68 (Classe II)</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-ash)' }}>Q-System:</span> <strong>8.5</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-ash)' }}>RQD:</span> <strong>75%</strong></div>
                </div>
                
                <div style={{ background: 'var(--color-rock)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ color: 'var(--color-stone)', margin: '0 0 0.5rem 0', fontSize: '0.8rem', textTransform: 'uppercase' }}>Propriétés Mécaniques</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-ash)' }}>GSI:</span> <strong>65</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-ash)' }}>Cohésion:</span> <strong>1.5 MPa</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-ash)' }}>Frottement:</span> <strong>35°</strong></div>
                </div>
              </div>

              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid var(--color-emerald)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ color: 'var(--color-emerald)', margin: '0 0 0.5rem 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={16}/> PRESCRIPTION DE SOUTÈNEMENT
                </h4>
                <p style={{ margin: 0, color: 'var(--color-white)', fontSize: '0.9rem' }}>
                  Installation de <strong>Grillage + Boulons</strong>.
                  <br/>Espacement: <strong>1.0 x 1.0m</strong>
                  <br/>Longueur des boulons: <strong>2.4m</strong> avec ancrage résine.
                  <br/>Épaisseur béton projeté: <strong>5 cm</strong>.
                </p>
              </div>

            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid var(--color-rock-3)', paddingTop: '1rem' }}>
              <button className="premium-button secondary" onClick={() => window.print()}><Printer size={16}/> IMPRIMER</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
