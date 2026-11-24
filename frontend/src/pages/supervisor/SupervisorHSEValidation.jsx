import { ShieldCheck, CheckCircle, XCircle, AlertCircle, Image as ImageIcon, MapPin } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useSharedData } from '../../contexts/sharedDataStore';

export default function SupervisorHSEValidation() {
  const { toast } = useToast();
  const { data, approveHSEDeclaration } = useSharedData();
  const declarations = data.hseDeclarations;

  const handleValidate = (id) => {
    approveHSEDeclaration(id);
    toast("Déclaration HSE validée et archivée", "success");
  };

  const handleReject = (id) => {
    approveHSEDeclaration(id);
    toast("Déclaration HSE rejetée - Alerte envoyée au mineur", "danger");
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-emerald)' }}>
          <ShieldCheck size={28} />
        </div>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 800, fontSize: '1.5rem' }}>Validation HSE</h2>
          <p style={{ margin: 0, color: 'var(--color-stone)' }}>Déclarations "Face Safe" en attente de validation</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {declarations.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-rock-3)' }}>
            <CheckCircle size={48} color="var(--color-emerald)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--color-white)' }}>Aucune déclaration en attente</h3>
            <p style={{ color: 'var(--color-stone)' }}>Toutes les zones actives ont été validées pour ce shift.</p>
          </div>
        ) : declarations.map(decl => (
          <div key={decl.id} style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-emerald)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderBottom: '1px solid var(--color-emerald)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck size={20} color="var(--color-emerald)" />
                <h3 style={{ margin: 0, color: 'var(--color-white)' }}>Face Safe Declaration - {decl.peg}</h3>
              </div>
              <span style={{ color: 'var(--color-emerald)', fontWeight: 700 }}>15:30</span>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <p style={{ margin: '0 0 1rem 0', color: 'var(--color-chalk)' }}>
                <strong>Date :</strong> {decl.date} <br/>
                <strong>PIC :</strong> {decl.pic} &nbsp;|&nbsp; <strong>Shift Boss :</strong> {decl.shiftBoss}
              </p>

              <div style={{ background: 'rgba(17,18,20,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', borderLeft: '3px solid var(--color-emerald)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-white)', marginBottom: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--color-emerald)" /> {decl.gas ? '8' : '4'} points de contrôle validés
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-white)', marginBottom: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--color-emerald)" /> GDI relevés : CH4 {decl.gas ? decl.gas.ch4 : '0.0%'} | CO {decl.gas ? decl.gas.co : '0.0%'} | O2 {decl.gas ? decl.gas.o2 : '20.9%'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-white)', marginBottom: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--color-emerald)" /> Re-entry period : {decl.reentry || '0 min'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-white)' }}>
                  <CheckCircle size={16} color="var(--color-emerald)" /> Déclaration sécurité signée
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--color-stone)' }}>✍️ Signatures :</p>
                  <span style={{ color: 'var(--color-chalk)' }}>PIC : <strong style={{ color: 'var(--color-emerald)' }}>[✅ Signé]</strong></span> &nbsp;&nbsp;
                  <span style={{ color: 'var(--color-chalk)' }}>Shift Boss : <strong style={{ color: 'var(--color-emerald)' }}>[✅ Signé]</strong></span>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--color-stone)' }}>Pièces jointes :</p>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-info)' }}><ImageIcon size={16} /> {decl.photos || 0} photos</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-chalk)', marginTop: '0.25rem' }}><MapPin size={16} /> GPS: {decl.coords || 'Non spécifié'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--color-rock-3)', paddingTop: '1.5rem' }}>
                <button onClick={() => handleValidate(decl.id)} className="btn-success" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', border: 'none', color: 'white', background: 'var(--color-emerald)' }}>
                  <CheckCircle size={20} /> VALIDER
                </button>
                <button onClick={() => handleReject(decl.id)} className="btn-danger" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', border: 'none', color: 'white', background: 'var(--color-danger)' }}>
                  <XCircle size={20} /> REJETER
                </button>
                <button className="btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', background: 'transparent', border: '1px solid var(--color-stone)', color: 'var(--color-white)' }}>
                  <AlertCircle size={20} /> DEMANDER CORRECTION
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
