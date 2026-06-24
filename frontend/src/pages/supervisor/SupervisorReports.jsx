import { useState } from 'react';
import { FileText, Download, Mail, Printer, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export default function SupervisorReports() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
      setShowModal(true);
      toast("Rapport généré avec succès", "success");
    }, 1500);
  };

  const triggerPrint = () => {
    toast("Conseil : Choisissez 'Enregistrer au format PDF' dans la fenêtre d'impression.", "info");
    setTimeout(() => window.print(), 500);
  };

  return (
    <div className="no-print">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-info)' }}>
          <FileText size={28} />
        </div>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 800, fontSize: '1.5rem' }}>Génération Rapport</h2>
          <p style={{ margin: 0, color: 'var(--color-stone)' }}>Compilez les données du shift pour l'export</p>
        </div>
      </div>

      <div style={{ background: 'rgba(41, 37, 36, 0.4)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '2rem', maxWidth: '800px' }}>
        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="form-label">Période (Du)</label>
              <input type="date" className="premium-input" style={{ width: '100%' }} defaultValue="2026-06-16" />
            </div>
            <div>
              <label className="form-label">Période (Au)</label>
              <input type="date" className="premium-input" style={{ width: '100%' }} defaultValue="2026-06-17" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="form-label">Type de Rapport</label>
              <select className="premium-input" style={{ width: '100%' }}>
                <option>✅ Journalier</option>
                <option>📋 Hebdomadaire</option>
                <option>📊 Mensuel</option>
              </select>
            </div>
            <div>
              <label className="form-label">Entreprise</label>
              <select className="premium-input" style={{ width: '100%' }}>
                <option>Reliant Congo</option>
                <option>Toutes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Contenu à inclure</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" defaultChecked /> Avancement PEG</label>
              <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" defaultChecked /> Production</label>
              <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" defaultChecked /> Sécurité / Incidents</label>
              <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" defaultChecked /> Équipement</label>
              <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" defaultChecked /> Performance équipes</label>
              <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" defaultChecked /> ERP / Finances</label>
            </div>
          </div>

          <button type="submit" className="premium-button primary" disabled={isGenerating} style={{ width: '100%', padding: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            {isGenerating ? <span className="spinner"></span> : <FileText size={20} />}
            {isGenerating ? "Compilation des données..." : "GÉNÉRER LE RAPPORT PREMIUM"}
          </button>
        </form>
        
        {reportGenerated && (
          <button onClick={() => setShowModal(true)} className="premium-button secondary" style={{ width: '100%', padding: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            <FileText size={20} /> VOIR LE RAPPORT GÉNÉRÉ
          </button>
        )}
      </div>

      {/* PDF View Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal print-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', width: '95%', height: '90vh', display: 'flex', flexDirection: 'column', background: 'white' }}>
            <div className="modal-header no-print" style={{ borderBottom: '1px solid var(--color-rock-3)', paddingBottom: '1rem', background: 'var(--color-rock-2)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}><FileText color="var(--color-info)"/> APERÇU DU RAPPORT (FORMAT A4)</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={triggerPrint} className="premium-button primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Download size={18} /> TÉLÉCHARGER PDF
                </button>
                <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon"><X size={20}/></button>
              </div>
            </div>
            
            <div className="modal-body print-body" id="pdf-content" style={{ flex: 1, overflowY: 'auto', background: 'white', padding: '3rem', color: 'black' }}>
              <div style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                
                {/* Header Enterprise */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #003366', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                  <div>
                    <h1 style={{ margin: '0 0 0.5rem 0', color: '#003366', fontSize: '28px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>RELIANT CONGO</h1>
                    <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>MineTrack System Analytics - Site MPAMA North</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h2 style={{ margin: '0 0 0.25rem 0', color: '#333', fontSize: '20px' }}>RAPPORT D'OPÉRATION</h2>
                    <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>Document N°: RC-OP-2026-0617</p>
                    <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>Date d'édition : 17/06/2026 15:30</p>
                  </div>
                </div>
                
                {/* Executive Summary */}
                <div style={{ background: '#f8f9fa', border: '1px solid #e9ecef', padding: '1.5rem', borderRadius: '4px', marginBottom: '2rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#003366', fontSize: '16px', textTransform: 'uppercase' }}>1. Synthèse Executive</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
                    <div style={{ borderRight: '1px solid #dee2e6' }}>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '11px', textTransform: 'uppercase' }}>Production Total</p>
                      <h4 style={{ margin: 0, color: '#212529', fontSize: '24px' }}>1,250 t</h4>
                    </div>
                    <div style={{ borderRight: '1px solid #dee2e6' }}>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '11px', textTransform: 'uppercase' }}>Teneur Moyenne (Sn)</p>
                      <h4 style={{ margin: 0, color: '#212529', fontSize: '24px' }}>2.3%</h4>
                    </div>
                    <div style={{ borderRight: '1px solid #dee2e6' }}>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '11px', textTransform: 'uppercase' }}>Avancement Mine</p>
                      <h4 style={{ margin: 0, color: '#198754', fontSize: '24px' }}>+12 m</h4>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '11px', textTransform: 'uppercase' }}>Incidents HSE</p>
                      <h4 style={{ margin: 0, color: '#dc3545', fontSize: '24px' }}>1 Grave</h4>
                    </div>
                  </div>
                </div>

                {/* Operations */}
                <h3 style={{ borderBottom: '1px solid #dee2e6', color: '#003366', paddingBottom: '0.5rem', marginTop: '2rem', fontSize: '16px', textTransform: 'uppercase' }}>2. Détail des Opérations (PEGs)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#e9ecef', color: '#495057' }}>
                      <th style={{ border: '1px solid #dee2e6', padding: '10px', textAlign: 'left' }}>Zone (PEG)</th>
                      <th style={{ border: '1px solid #dee2e6', padding: '10px', textAlign: 'left' }}>Activité Principal</th>
                      <th style={{ border: '1px solid #dee2e6', padding: '10px', textAlign: 'center' }}>Avancement</th>
                      <th style={{ border: '1px solid #dee2e6', padding: '10px', textAlign: 'center' }}>Tonnage Estimé</th>
                      <th style={{ border: '1px solid #dee2e6', padding: '10px', textAlign: 'center' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #dee2e6', padding: '10px', fontWeight: 'bold' }}>10L-XC5SS</td>
                      <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>Forage / Minage</td>
                      <td style={{ border: '1px solid #dee2e6', padding: '10px', textAlign: 'center' }}>71% (1.3m restants)</td>
                      <td style={{ border: '1px solid #dee2e6', padding: '10px', textAlign: 'center' }}>450 t</td>
                      <td style={{ border: '1px solid #dee2e6', padding: '10px', textAlign: 'center', color: '#0d6efd' }}>En cours</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #dee2e6', padding: '10px', fontWeight: 'bold' }}>11L-FWS</td>
                      <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>Soutènement</td>
                      <td style={{ border: '1px solid #dee2e6', padding: '10px', textAlign: 'center' }}>100% (Terminé)</td>
                      <td style={{ border: '1px solid #dee2e6', padding: '10px', textAlign: 'center' }}>520 t</td>
                      <td style={{ border: '1px solid #dee2e6', padding: '10px', textAlign: 'center', color: '#198754' }}>Complété</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #dee2e6', padding: '10px', fontWeight: 'bold' }}>11L-XC3SS</td>
                      <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>Marinage</td>
                      <td style={{ border: '1px solid #dee2e6', padding: '10px', textAlign: 'center' }}>45% (2.5m restants)</td>
                      <td style={{ border: '1px solid #dee2e6', padding: '10px', textAlign: 'center' }}>280 t</td>
                      <td style={{ border: '1px solid #dee2e6', padding: '10px', textAlign: 'center', color: '#fd7e14' }}>En retard</td>
                    </tr>
                  </tbody>
                </table>

                {/* HSE / Incidents */}
                <h3 style={{ borderBottom: '1px solid #dee2e6', color: '#003366', paddingBottom: '0.5rem', marginTop: '2rem', fontSize: '16px', textTransform: 'uppercase' }}>3. Sécurité et Incidents (HSE)</h3>
                <div style={{ marginTop: '1rem', borderLeft: '4px solid #dc3545', paddingLeft: '1rem', background: '#fff5f5', padding: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#dc3545', fontSize: '14px' }}>⚠️ Incident Critique à 14:30 (10L-XC5SS)</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#333' }}>Éboulement mineur au niveau du front de taille. Opérations suspendues pendant 2h. Sécurisation par béton projeté effectuée. Aucun blessé.</p>
                </div>
                <div style={{ marginTop: '0.5rem', borderLeft: '4px solid #fd7e14', paddingLeft: '1rem', background: '#fff9f5', padding: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#fd7e14', fontSize: '14px' }}>🔧 Panne Équipement à 13:15</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#333' }}>Perforatrice Jumbo S1D 05 : Perte de pression hydraulique. Réparée sur place par l'équipe maintenance.</p>
                </div>

                {/* Approvals */}
                <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ width: '30%', borderTop: '1px solid #000', paddingTop: '0.5rem', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '12px' }}>Superviseur Shift</p>
                    <p style={{ margin: 0, fontSize: '10px', color: '#666' }}>Visa d'approbation</p>
                  </div>
                  <div style={{ width: '30%', borderTop: '1px solid #000', paddingTop: '0.5rem', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '12px' }}>Chef de Mine</p>
                    <p style={{ margin: 0, fontSize: '10px', color: '#666' }}>Pour validation finale</p>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '4rem', borderTop: '1px solid #dee2e6', paddingTop: '1rem', textAlign: 'center', fontSize: '10px', color: '#adb5bd' }}>
                  Document confidentiel généré par MINE_TRACK_ENTERPRISE_SYSTEM. Toute reproduction interdite sans autorisation. Page 1/1
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
