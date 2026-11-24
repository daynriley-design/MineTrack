import { useState } from 'react';
import { FileText, Download, Printer, X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

async function generatePDF(elementId) {
  // Import local (npm) — évite dépendance CDN indisponible sur site minier sans internet.
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);
  const el = document.getElementById(elementId);
  if (!el) throw new Error('Contenu du rapport introuvable');
  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * pageW) / canvas.width;
  let y = 0;
  while (y < imgH) {
    pdf.addImage(imgData, 'PNG', 0, -y, imgW, imgH);
    y += pageH;
    if (y < imgH) pdf.addPage();
  }
  pdf.save(`rapport_minetrack_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export default function SupervisorReports() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const today = new Date().toLocaleDateString('fr-FR');

  const handleGenerate = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
      setShowModal(true);
      toast('Rapport généré avec succès', 'success');
    }, 1500);
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    toast('Génération du PDF en cours...', 'info');
    try {
      await generatePDF('pdf-report-content');
      toast('PDF téléchargé avec succès !', 'success');
    } catch {
      toast('Erreur lors de la génération du PDF', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) {
      toast("Impression bloquée : autorisez les pop-ups pour ce site", 'error');
      return;
    }
    const content = document.getElementById('pdf-report-content')?.innerHTML || '';
    printWin.document.write(`<!DOCTYPE html><html><head><title>Rapport MineTrack</title>
      <style>body{font-family:Helvetica,Arial,sans-serif;margin:0;padding:2rem;}table{border-collapse:collapse;width:100%}th,td{border:1px solid #dee2e6;padding:10px}th{background:#e9ecef}h1,h2,h3,h4{color:#003366}</style>
      </head><body>${content}</body></html>`);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 500);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-info)' }}>
          <FileText size={28} />
        </div>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 800, fontSize: '1.5rem' }}>Génération Rapport</h2>
          <p style={{ margin: 0, color: 'var(--color-stone)' }}>Compilez les données du shift pour l'export PDF</p>
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '2rem', maxWidth: '800px' }}>
        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="form-label">Période (Du)</label>
              <input type="date" className="premium-input" style={{ width: '100%' }} defaultValue="2026-06-16" />
            </div>
            <div>
              <label className="form-label">Période (Au)</label>
              <input type="date" className="premium-input" style={{ width: '100%' }} defaultValue={new Date().toISOString().slice(0,10)} />
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(17,18,20,0.06)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" defaultChecked /> Avancement PEG</label>
              <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" defaultChecked /> Production</label>
              <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" defaultChecked /> Sécurité / Incidents</label>
              <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" defaultChecked /> Équipement</label>
              <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" defaultChecked /> Performance équipes</label>
              <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" defaultChecked /> ERP / Finances</label>
            </div>
          </div>

          <button type="submit" className="premium-button primary" disabled={isGenerating}
            style={{ width: '100%', padding: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            {isGenerating ? <span className="spinner"></span> : <FileText size={20} />}
            {isGenerating ? 'Compilation des données...' : 'GÉNÉRER LE RAPPORT PREMIUM'}
          </button>
        </form>
        
        {reportGenerated && (
          <button onClick={() => setShowModal(true)} className="premium-button secondary"
            style={{ width: '100%', padding: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            <FileText size={20} /> VOIR LE RAPPORT GÉNÉRÉ
          </button>
        )}
      </div>

      {/* PDF Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', width: '95%', height: '90vh', display: 'flex', flexDirection: 'column', background: '#1a1a1a' }}>
            {/* Modal Header - NOT printed */}
            <div style={{ borderBottom: '1px solid var(--color-rock-3)', padding: '1rem 1.5rem', background: 'var(--color-rock-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-white)' }}>
                <FileText color="var(--color-info)" /> APERÇU DU RAPPORT (FORMAT A4)
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={handleDownloadPDF} disabled={isDownloading}
                  style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  {isDownloading ? <span className="spinner" /> : <Download size={16} />}
                  {isDownloading ? 'Génération...' : 'TÉLÉCHARGER PDF'}
                </button>
                <button onClick={handlePrint}
                  style={{ padding: '0.5rem 1rem', background: 'rgba(17,18,20,0.06)', color: 'var(--color-white)', border: '1px solid rgba(17,18,20,0.2)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <Printer size={16} /> IMPRIMER
                </button>
                <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-white)', cursor: 'pointer', padding: '0.25rem' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable report body */}
            <div style={{ flex: 1, overflowY: 'auto', background: '#e5e7eb', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
              <div id="pdf-report-content" style={{ width: '210mm', background: 'white', padding: '20mm', boxShadow: '0 4px 20px rgba(17,18,20,0.06)', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', color: '#333' }}>
                
                {/* Letterhead */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #003366', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                  <div>
                    <h1 style={{ margin: '0 0 0.25rem 0', color: '#003366', fontSize: '26px', fontWeight: 900, letterSpacing: '1px' }}>RELIANT CONGO</h1>
                    <p style={{ margin: '0 0 0.1rem 0', color: '#666', fontSize: '11px' }}>MineTrack System Analytics</p>
                    <p style={{ margin: 0, color: '#666', fontSize: '11px' }}>Site : MPAMA North, Katanga, RDC</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h2 style={{ margin: '0 0 0.25rem 0', color: '#333', fontSize: '18px' }}>RAPPORT D'OPÉRATION</h2>
                    <p style={{ margin: '0 0 0.1rem 0', color: '#666', fontSize: '11px' }}>Document N° : RC-OP-2026-0714</p>
                    <p style={{ margin: 0, color: '#666', fontSize: '11px' }}>Date d'édition : {today}</p>
                  </div>
                </div>

                {/* Executive Summary */}
                <div style={{ background: '#f8f9fa', border: '1px solid #e9ecef', padding: '1.5rem', borderRadius: '4px', marginBottom: '2rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#003366', fontSize: '15px', textTransform: 'uppercase' }}>1. Synthèse Executive</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
                    {[
                      { label: 'Production Total', val: '1 250 t', color: '#212529' },
                      { label: 'Teneur Moy. (Cu)', val: '2.3 %', color: '#212529' },
                      { label: 'Avancement Mine', val: '+12 m', color: '#198754' },
                      { label: 'Incidents HSE', val: '1 Grave', color: '#dc3545' },
                    ].map((item, i) => (
                      <div key={i} style={{ borderRight: i < 3 ? '1px solid #dee2e6' : 'none', paddingRight: i < 3 ? '0.5rem' : 0 }}>
                        <p style={{ margin: '0 0 0.3rem 0', color: '#6c757d', fontSize: '10px', textTransform: 'uppercase' }}>{item.label}</p>
                        <h4 style={{ margin: 0, color: item.color, fontSize: '22px', fontWeight: 800 }}>{item.val}</h4>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operations Table */}
                <h3 style={{ borderBottom: '1px solid #dee2e6', color: '#003366', paddingBottom: '0.5rem', marginTop: '2rem', fontSize: '15px', textTransform: 'uppercase' }}>2. Détail des Opérations (PEGs)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#e9ecef', color: '#495057' }}>
                      {['Zone (PEG)', 'Activité Principale', 'Avancement', 'Tonnage', 'Statut'].map(h => (
                        <th key={h} style={{ border: '1px solid #dee2e6', padding: '8px 10px', textAlign: 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['10L-XC5SS', 'Forage / Minage', '71% (1.3m restants)', '450 t', 'En cours', '#0d6efd'],
                      ['11L-FWS', 'Soutènement', '100% (Terminé)', '520 t', 'Complété', '#198754'],
                      ['11L-XC3SS', 'Marinage', '45% (2.5m restants)', '280 t', 'En retard', '#fd7e14'],
                    ].map((row, i) => (
                      <tr key={i}>
                        <td style={{ border: '1px solid #dee2e6', padding: '8px 10px', fontWeight: 'bold' }}>{row[0]}</td>
                        <td style={{ border: '1px solid #dee2e6', padding: '8px 10px' }}>{row[1]}</td>
                        <td style={{ border: '1px solid #dee2e6', padding: '8px 10px', textAlign: 'center' }}>{row[2]}</td>
                        <td style={{ border: '1px solid #dee2e6', padding: '8px 10px', textAlign: 'center' }}>{row[3]}</td>
                        <td style={{ border: '1px solid #dee2e6', padding: '8px 10px', textAlign: 'center', color: row[5] }}>{row[4]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* HSE */}
                <h3 style={{ borderBottom: '1px solid #dee2e6', color: '#003366', paddingBottom: '0.5rem', marginTop: '2rem', fontSize: '15px', textTransform: 'uppercase' }}>3. Sécurité et Incidents (HSE)</h3>
                <div style={{ marginTop: '1rem', borderLeft: '4px solid #dc3545', background: '#fff5f5', padding: '1rem', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: '0 0 0.4rem 0', color: '#dc3545', fontSize: '13px' }}>⚠️ Incident Critique — 10L-XC5SS</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#333', lineHeight: 1.5 }}>Hémorragie suite à accident véhicule LV42. Opérations suspendues pendant 2h. Victime transportée à l'hôpital de Kolwezi.</p>
                </div>
                <div style={{ borderLeft: '4px solid #fd7e14', background: '#fff9f5', padding: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.4rem 0', color: '#fd7e14', fontSize: '13px' }}>🔧 Panne Équipement — Foreuse D65</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#333', lineHeight: 1.5 }}>Perte de pression hydraulique complète. Réparée sur place par l'équipe maintenance. Durée d'immobilisation : 3h.</p>
                </div>

                {/* Signatures */}
                <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'space-between' }}>
                  {['Superviseur Shift', 'Chef de Mine'].map(role => (
                    <div key={role} style={{ width: '35%', borderTop: '1px solid #333', paddingTop: '0.5rem', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontWeight: 'bold', fontSize: '12px' }}>{role}</p>
                      <p style={{ margin: 0, fontSize: '10px', color: '#666' }}>Visa d'approbation</p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ marginTop: '4rem', borderTop: '1px solid #dee2e6', paddingTop: '0.75rem', textAlign: 'center', fontSize: '9px', color: '#adb5bd' }}>
                  Document confidentiel généré par MINE_TRACK_ENTERPRISE_SYSTEM v2.0 · {today} · Toute reproduction interdite sans autorisation écrite.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
