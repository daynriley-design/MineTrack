import { CircleDollarSign, ArrowUpRight, Download, Printer, X } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';

export default function SupervisorERP() {
  const { toast } = useToast();
  const [showReportModal, setShowReportModal] = useState(false);

  const handleExportCSV = () => {
    const csv = `PEG,Cout_Total,Cout_Par_M,Budget_Utilise,Statut
10L-XC5SS,45230,420,78%,OK
11L-FWS,12450,380,100%,Termine
11L-XC3SS,38920,450,92%,Attention`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'erp_costs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Fichier CSV exporté", "success");
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(234, 179, 8, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-gold)' }}>
          <CircleDollarSign size={28} />
        </div>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 800, fontSize: '1.5rem' }}>ERP - Gestion Financière</h2>
          <p style={{ margin: 0, color: 'var(--color-stone)' }}>Tableau de bord de suivi budgétaire</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--color-rock-2)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-rock-3)' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--color-stone)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Coûts Totaux</p>
          <h3 style={{ margin: 0, color: 'var(--color-white)', fontSize: '1.5rem' }}>$2.5M</h3>
        </div>
        <div style={{ background: 'var(--color-rock-2)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-rock-3)' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--color-stone)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Revenus Estimés</p>
          <h3 style={{ margin: 0, color: 'var(--color-success)', fontSize: '1.5rem' }}>$3.8M</h3>
        </div>
        <div style={{ background: 'var(--color-rock-2)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-rock-3)' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--color-stone)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Marge Estimée</p>
          <h3 style={{ margin: 0, color: 'var(--color-info)', fontSize: '1.5rem' }}>52%</h3>
        </div>
        <div style={{ background: 'var(--color-rock-2)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-rock-3)' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--color-stone)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Budget Restant</p>
          <h3 style={{ margin: 0, color: 'var(--color-warning)', fontSize: '1.5rem' }}>$1.2M</h3>
        </div>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-emerald)' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--color-emerald)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Écart</p>
          <h3 style={{ margin: 0, color: 'var(--color-emerald)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowUpRight size={20}/> +12% vs plan</h3>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Suivi coûts par PEG */}
        <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--color-white)', margin: '0 0 1.5rem 0', fontSize: '1.1rem' }}>📋 Suivi Coûts par PEG</h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-rock-3)', color: 'var(--color-stone)', textAlign: 'left', fontSize: '0.85rem' }}>
                <th style={{ padding: '0.75rem 0' }}>PEG</th>
                <th style={{ padding: '0.75rem 0' }}>Coût Total</th>
                <th style={{ padding: '0.75rem 0' }}>Coût/m</th>
                <th style={{ padding: '0.75rem 0' }}>% Budget</th>
                <th style={{ padding: '0.75rem 0', textAlign: 'right' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(17,18,20,0.05)', color: 'var(--color-chalk)' }}>
                <td style={{ padding: '1rem 0' }}><strong>10L-XC5SS</strong></td>
                <td>$45,230</td>
                <td>$420/m</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ flex: 1, background: 'rgba(17,18,20,0.1)', height: '6px', borderRadius: '3px' }}>
                      <div style={{ width: '78%', background: 'var(--color-info)', height: '100%', borderRadius: '3px' }}></div>
                    </div>
                    <span style={{ fontSize: '0.75rem' }}>78%</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right', color: 'var(--color-emerald)', fontWeight: 600 }}>✅ OK</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(17,18,20,0.05)', color: 'var(--color-chalk)' }}>
                <td style={{ padding: '1rem 0' }}><strong>11L-FWS</strong></td>
                <td>$12,450</td>
                <td>$380/m</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ flex: 1, background: 'rgba(17,18,20,0.1)', height: '6px', borderRadius: '3px' }}>
                      <div style={{ width: '100%', background: 'var(--color-emerald)', height: '100%', borderRadius: '3px' }}></div>
                    </div>
                    <span style={{ fontSize: '0.75rem' }}>100%</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right', color: 'var(--color-emerald)', fontWeight: 600 }}>✅ Terminé</td>
              </tr>
              <tr style={{ color: 'var(--color-chalk)' }}>
                <td style={{ padding: '1rem 0' }}><strong>11L-XC3SS</strong></td>
                <td>$38,920</td>
                <td>$450/m</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ flex: 1, background: 'rgba(17,18,20,0.1)', height: '6px', borderRadius: '3px' }}>
                      <div style={{ width: '92%', background: 'var(--color-warning)', height: '100%', borderRadius: '3px' }}></div>
                    </div>
                    <span style={{ fontSize: '0.75rem' }}>92%</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right', color: 'var(--color-warning)', fontWeight: 600 }}>⚠️ Attention</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Répartition des coûts */}
        <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--color-white)', margin: '0 0 1.5rem 0', fontSize: '1.1rem' }}>📊 Coûts par Catégorie</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-chalk)', fontSize: '0.9rem' }}>
                <span>Main-d'œuvre</span>
                <strong>45%</strong>
              </div>
              <div style={{ width: '100%', background: 'rgba(17,18,20,0.1)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: '45%', background: 'var(--color-info)', height: '100%' }}></div>
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-chalk)', fontSize: '0.9rem' }}>
                <span>Explosifs</span>
                <strong>25%</strong>
              </div>
              <div style={{ width: '100%', background: 'rgba(17,18,20,0.1)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: '25%', background: 'var(--color-danger)', height: '100%' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-chalk)', fontSize: '0.9rem' }}>
                <span>Équipement</span>
                <strong>20%</strong>
              </div>
              <div style={{ width: '100%', background: 'rgba(17,18,20,0.1)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: '20%', background: 'var(--color-warning)', height: '100%' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-chalk)', fontSize: '0.9rem' }}>
                <span>Consommables</span>
                <strong>10%</strong>
              </div>
              <div style={{ width: '100%', background: 'rgba(17,18,20,0.1)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: '10%', background: 'var(--color-emerald)', height: '100%' }}></div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
            <button onClick={handleExportCSV} className="premium-button secondary" style={{ flex: 1, padding: '0.75rem', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}><Download size={16}/> EXPORTER</button>
            <button onClick={() => setShowReportModal(true)} className="premium-button primary" style={{ flex: 1, padding: '0.75rem', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}><Printer size={16}/> RAPPORT</button>
          </div>
        </div>

      </div>

      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal print-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%', height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header no-print">
              <h3>Rapport Financier Détaillé</h3>
              <button onClick={() => setShowReportModal(false)} className="btn btn-ghost btn-icon"><X size={20}/></button>
            </div>
            
            <div className="modal-body print-body" style={{ flex: 1, overflowY: 'auto', background: 'white', color: 'black', padding: '2rem' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '1rem', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0, color: 'black' }}>RAPPORT FINANCIER ERP</h1>
                <p style={{ margin: 0 }}>Reliant Congo - MPAMA North | Date: {new Date().toLocaleDateString('fr-FR')}</p>
              </div>

              <h3>1. Synthèse Budgétaire</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                <tbody>
                  <tr><td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Coûts Totaux</td><td style={{ border: '1px solid #ccc', padding: '0.5rem', fontWeight: 'bold' }}>$2,500,000</td></tr>
                  <tr><td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Revenus Estimés</td><td style={{ border: '1px solid #ccc', padding: '0.5rem', fontWeight: 'bold', color: 'green' }}>$3,800,000</td></tr>
                  <tr><td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Budget Restant</td><td style={{ border: '1px solid #ccc', padding: '0.5rem', fontWeight: 'bold' }}>$1,200,000</td></tr>
                </tbody>
              </table>

              <h3>2. Détails par PEG</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>PEG</th>
                    <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Coût Total</th>
                    <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>% Budget</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>10L-XC5SS</td><td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>$45,230</td><td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>78%</td></tr>
                  <tr><td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>11L-FWS</td><td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>$12,450</td><td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>100%</td></tr>
                  <tr><td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>11L-XC3SS</td><td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>$38,920</td><td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>92%</td></tr>
                </tbody>
              </table>

              <p style={{ marginTop: '3rem', fontStyle: 'italic', fontSize: '0.9rem' }}>Document généré automatiquement par MineTrack ERP.</p>
            </div>

            <div className="modal-footer no-print">
              <button onClick={() => window.print()} className="premium-button primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}><Printer size={18}/> IMPRIMER LE RAPPORT (PDF)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
