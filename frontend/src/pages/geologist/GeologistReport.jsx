import { useState } from 'react';
import { FileText, Send, Download, CheckCircle, FlaskConical, Hammer, X, Printer } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { miniReportsAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

export default function GeologistReport() {
  // Date du rapport, figee a l'ouverture de l'ecran.
  const [{ date, isoDate }] = useState(() => {
    const d = new Date();
    return {
      date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      isoDate: d.toISOString().slice(0, 10),
    };
  });
  const [showPdf, setShowPdf] = useState(false);
  const [signed, setSigned] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSend = async () => {
    setIsSending(true);
    toast('Envoi sécurisé au Superviseur...', 'info');
    try {
      await miniReportsAPI.create({
        shift: 'Jour',
        date: isoDate,
        peg_id: '10L-XC5SS',
        weather_conditions: 'normal',
        safety_summary: '0 zone instable signalée. Bilan stabilité : Stable (RMR 68, Classe II).',
        production_summary: '4 PEG visités, 3 échantillons prélevés, 2 résultats labo reçus. Teneurs moy. : 10L-XC5SS 2.3%, 11L-FWS 1.8%, 11L-XC3SS 2.1%.',
        issues_encountered: 'Aucun incident majeur.',
        submitted_by: user?.email || user?.name || 'Géologue',
      });
      toast('Rapport transmis avec succès au superviseur', 'success');
    } catch {
      toast("Erreur : le rapport n'a pas pu être transmis", 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--color-white)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileText size={28} color="var(--color-chalk)" />
          MINI-RAPPORT GÉOLOGUE
        </h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="premium-button secondary" onClick={() => setShowPdf(true)}><Download size={16}/> VOIR PDF</button>
          <button 
            className="premium-button" 
            disabled={isSending}
            onClick={handleSend}
          >
            {isSending ? <span className="dot dot-green"></span> : <Send size={16}/>}
            {isSending ? 'ENVOI EN COURS...' : 'ENVOYER AU SUPERVISEUR'}
          </button>
        </div>
      </div>

      <div style={{ 
        background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', 
        borderRadius: 'var(--radius-lg)', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem'
      }}>
        
        {/* Header du rapport */}
        <div style={{ borderBottom: '2px solid var(--color-rock-3)', paddingBottom: '1.5rem', textAlign: 'center' }}>
          <h1 style={{ color: 'var(--color-white)', margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>RAPPORT JOURNALIER GÉOLOGIE</h1>
          <p style={{ color: 'var(--color-stone)', margin: 0 }}>Reliant Congo - MPAMA North | Date : {date}</p>
        </div>

        {/* Section 1: Résumé */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ color: 'var(--color-info)', fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} /> RÉSUMÉ DE LA JOURNÉE
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--color-rock)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-rock-3)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-stone)' }}>PEG visités</span>
              <span style={{ color: 'var(--color-white)', fontWeight: 700 }}>4</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-rock-3)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-stone)' }}>Échantillons prélevés</span>
              <span style={{ color: 'var(--color-white)', fontWeight: 700 }}>3</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-stone)' }}>Résultats labo reçus</span>
              <span style={{ color: 'var(--color-white)', fontWeight: 700 }}>2</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-stone)' }}>Zones instables signalées</span>
              <span style={{ color: 'var(--color-warning)', fontWeight: 700 }}>0</span>
            </div>
          </div>
        </div>

        {/* Section 2: Teneurs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ color: 'var(--color-gold)', fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FlaskConical size={18} /> TENEURS MOYENNES DU JOUR
          </h3>
          <div style={{ background: 'var(--color-rock)', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>PEG-10L-XC5SS</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '150px', height: '8px', background: 'var(--color-rock-3)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '70%', height: '100%', background: 'var(--color-gold)' }}></div>
                </div>
                <span style={{ color: 'var(--color-gold)', fontWeight: 800, width: '40px', textAlign: 'right' }}>2.3%</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>PEG-11L-FWS</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '150px', height: '8px', background: 'var(--color-rock-3)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '50%', height: '100%', background: 'var(--color-gold)' }}></div>
                </div>
                <span style={{ color: 'var(--color-gold)', fontWeight: 800, width: '40px', textAlign: 'right' }}>1.8%</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>PEG-11L-XC3SS</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '150px', height: '8px', background: 'var(--color-rock-3)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '60%', height: '100%', background: 'var(--color-gold)' }}></div>
                </div>
                <span style={{ color: 'var(--color-gold)', fontWeight: 800, width: '40px', textAlign: 'right' }}>2.1%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Geotech */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ color: 'var(--color-emerald)', fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Hammer size={18} /> STABILITÉ GÉNÉRALE
          </h3>
          <div style={{ background: 'var(--color-rock)', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ color: 'var(--color-stone)', margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>RMR Moyen</p>
              <p style={{ color: 'var(--color-white)', margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>68</p>
            </div>
            <div>
              <p style={{ color: 'var(--color-stone)', margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>Classement</p>
              <p style={{ color: 'var(--color-white)', margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Classe II (Bon)</p>
            </div>
            <div>
              <p style={{ color: 'var(--color-stone)', margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>Bilan global</p>
              <p style={{ color: 'var(--color-emerald)', margin: 0, fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} /> Stable
              </p>
            </div>
          </div>
        </div>

      </div>

      {showPdf && (
        <div className="modal-overlay" onClick={() => setShowPdf(false)}>
          <div className="modal print-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', height: '90vh', display: 'flex', flexDirection: 'column', background: 'white' }}>
            <div className="modal-header no-print" style={{ borderBottom: '1px solid var(--color-rock-3)', paddingBottom: '1rem', background: 'var(--color-rock-2)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-white)' }}><FileText color="var(--color-info)"/> APERÇU DU DOCUMENT PDF</h3>
              <button onClick={() => setShowPdf(false)} className="btn btn-ghost btn-icon"><X size={20}/></button>
            </div>
            
            <div className="modal-body print-body" id="pdf-content" style={{ flex: 1, overflowY: 'auto', background: 'white', padding: '3rem', color: 'black' }}>
              <div style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid black', paddingBottom: '1rem' }}>
                  <h1 style={{ margin: '0 0 0.5rem 0', color: 'black', fontSize: '24px' }}>RAPPORT DÉTAILLÉ - GÉOLOGIE</h1>
                  <h3 style={{ margin: 0, fontWeight: 'normal', color: '#444' }}>MineTrack - MPAMA North | Date de l'inspection : {date}</h3>
                </div>
                
                <h2 style={{ borderBottom: '1px solid #ccc', color: 'black', paddingBottom: '0.5rem', marginTop: '2rem', fontSize: '18px' }}>1. Echantillonnage et Teneurs (LABO)</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', color: 'black', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                      <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Echantillon ID</th>
                      <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Pegmatite</th>
                      <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Type de roche</th>
                      <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Teneur Sn (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '10px' }}>LAB-2026-045</td>
                      <td style={{ border: '1px solid #ddd', padding: '10px' }}>10L-XC5SS</td>
                      <td style={{ border: '1px solid #ddd', padding: '10px' }}>Minerais Riche</td>
                      <td style={{ border: '1px solid #ddd', padding: '10px', fontWeight: 'bold' }}>2.3%</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '10px' }}>LAB-2026-046</td>
                      <td style={{ border: '1px solid #ddd', padding: '10px' }}>11L-FWS</td>
                      <td style={{ border: '1px solid #ddd', padding: '10px' }}>Minerais Pauvre</td>
                      <td style={{ border: '1px solid #ddd', padding: '10px' }}>1.8%</td>
                    </tr>
                  </tbody>
                </table>

                <h2 style={{ borderBottom: '1px solid #ccc', color: 'black', paddingBottom: '0.5rem', marginTop: '2rem', fontSize: '18px' }}>2. Synthèse Géotechnique</h2>
                <p style={{ lineHeight: '1.6', fontSize: '14px' }}>
                  Lors de l'inspection de la zone <strong>10L-XC5SS</strong>, le massif rocheux a été classé en <strong>Catégorie II (Bon)</strong> selon le RMR de Bieniawski, avec un score de <strong>68</strong>.
                  La valeur Q calculée est de <strong>8.5</strong>, ce qui indique un terrain de qualité passable à bonne. L'indice GSI a été estimé à <strong>65</strong>.
                </p>
                <p style={{ lineHeight: '1.6', fontSize: '14px' }}>
                  <strong>Soutènement recommandé :</strong> Aucun risque majeur d'effondrement n'a été détecté. Un soutènement systématique par boulonnage (espacement 1.0x1.0m, longueur 2.4m) associé à 5 cm de béton projeté est recommandé pour stabiliser les épontes.
                </p>

                <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ border: '1px solid #ccc', padding: '1.5rem', width: '300px', background: '#fcfcfc' }}>
                    <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold', fontSize: '14px' }}>Signature de l'Expert Géologue :</p>
                    {signed ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: '"Brush Script MT", cursive', fontSize: '32px', color: '#000080', transform: 'rotate(-5deg)', margin: '1rem 0' }}>
                          M. Geologue
                        </div>
                        <div style={{ fontSize: '10px', color: '#666', borderTop: '1px dashed #ccc', paddingTop: '0.5rem' }}>
                          Signé électroniquement le {date}
                          <br />Validé via GeoTrack Security
                        </div>
                      </div>
                    ) : (
                      <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc', background: '#fff', color: '#999', fontSize: '12px' }}>
                        En attente de signature
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
            
            <div className="modal-footer no-print" style={{ borderTop: '1px solid var(--color-rock-3)', paddingTop: '1rem', background: 'var(--color-rock-2)', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-white)' }}>
                <input 
                  type="checkbox" 
                  id="signCheckbox" 
                  checked={signed} 
                  onChange={(e) => {
                    setSigned(e.target.checked);
                    if (e.target.checked) toast('Document signé électroniquement', 'success');
                  }} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="signCheckbox" style={{ cursor: 'pointer' }}>Apposer ma signature électronique</label>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="premium-button secondary" onClick={() => setShowPdf(false)}>FERMER</button>
                <button 
                  className="premium-button" 
                  disabled={!signed}
                  onClick={() => {
                    // Small delay to let browser render, then print
                    setTimeout(() => window.print(), 100);
                  }}
                  style={{ opacity: signed ? 1 : 0.5, cursor: signed ? 'pointer' : 'not-allowed' }}
                >
                  <Printer size={16}/> {signed ? 'IMPRIMER LE DOCUMENT' : 'Veuillez signer d\'abord'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
