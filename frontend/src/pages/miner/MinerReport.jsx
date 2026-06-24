import { useToast } from '../../contexts/ToastContext';
import { FileText, Send } from 'lucide-react';

export default function MinerReport() {
  const { toast } = useToast();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    toast("Rapport de fin de poste enregistré", "success");
    e.target.reset();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-gold)' }}>
          <FileText size={24} />
        </div>
        <h3 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 700 }}>Rapport de Fin de Poste</h3>
      </div>

      <div style={{ background: 'rgba(41, 37, 36, 0.4)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">Résumé Sécurité</label>
            <textarea className="form-textarea" placeholder="RAS, aucun incident majeur..." required></textarea>
          </div>
          
          <div className="form-group">
            <label className="form-label">Résumé Production</label>
            <textarea className="form-textarea" placeholder="Objectifs atteints ? Quantité estimée..." required></textarea>
          </div>
          
          <div className="form-group">
            <label className="form-label">Problèmes rencontrés (Optionnel)</label>
            <textarea className="form-textarea" placeholder="Retards, pannes mineures, conditions du terrain..."></textarea>
          </div>
          
          <button type="submit" style={{ 
            width: '100%', padding: '1rem', marginTop: '1rem', 
            background: 'linear-gradient(135deg, var(--color-rock-3), var(--color-rock-4))', 
            color: 'white', border: '1px solid var(--color-stone)', borderRadius: 'var(--radius-md)', 
            fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
            transition: 'all 0.2s ease'
          }} onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--color-gold)'; e.currentTarget.style.color = 'var(--color-gold)'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--color-stone)'; e.currentTarget.style.color = 'white'; }}>
            <Send size={18} />
            Soumettre le Rapport
          </button>
        </form>
      </div>
    </div>
  );
}
