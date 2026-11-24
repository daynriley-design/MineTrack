import { useState } from 'react';
import { FlaskConical, Search, Filter, Download, Plus, MapPin, Camera, CheckCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export default function GeologistSamples() {
  const [view, setView] = useState('list'); // 'list' or 'new'
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [showValidated, setShowValidated] = useState(true);
  const [showPending, setShowPending] = useState(true);
  const { toast } = useToast();

  const samples = [
    { id: 'LAB-2026-045', peg: '10L-XC5SS', grade: '2.3%', status: 'Validé', date: '15/06/2026' },
    { id: 'LAB-2026-046', peg: '11L-FWS', grade: '1.8%', status: 'En attente', date: '14/06/2026' },
    { id: 'LAB-2026-047', peg: '11L-XC3SS', grade: '-', status: 'En attente', date: '17/06/2026' },
  ];

  const visibleSamples = samples.filter(s => {
    if (s.status === 'Validé' && !showValidated) return false;
    if (s.status === 'En attente' && !showPending) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!s.id.toLowerCase().includes(q) && !s.peg.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const exportSamples = async () => {
    try {
      const ExcelJS = (await import('exceljs')).default;
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Echantillons');
      ws.columns = [
        { header: 'N° Lot', key: 'id', width: 18 },
        { header: 'PEG', key: 'peg', width: 16 },
        { header: 'Teneur', key: 'grade', width: 12 },
        { header: 'Statut', key: 'status', width: 14 },
        { header: 'Date', key: 'date', width: 14 },
      ];
      ws.getRow(1).font = { bold: true };
      visibleSamples.forEach(s => ws.addRow(s));
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `echantillons_minetrack_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast('Export Excel généré avec succès', 'success');
    } catch {
      toast("Erreur lors de l'export", 'error');
    }
  };

  if (view === 'new') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: 'var(--color-white)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FlaskConical size={24} color="var(--color-info)" />
            NOUVEL ÉCHANTILLON - Saisie
          </h2>
          <button onClick={() => setView('list')} style={{ background: 'transparent', border: '1px solid var(--color-stone)', color: 'var(--color-chalk)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
            Annuler
          </button>
        </div>

        <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--color-emerald)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-white)', fontWeight: 600 }}>
              <MapPin size={18} color="var(--color-emerald)" />
              GPS : -13.2456, 28.1234
              <span style={{ color: 'var(--color-emerald)', marginLeft: '1rem' }}><CheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> (Précision 2m)</span>
            </div>
            <button style={{ background: 'rgba(17,18,20,0.1)', border: 'none', color: 'var(--color-white)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={16} /> Ajouter Photo
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--color-stone)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>PEG</label>
              <select className="premium-input" style={{ width: '100%' }}>
                <option>10L-XC5SS</option>
                <option>11L-FWS</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--color-stone)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Date/Heure</label>
              <input type="datetime-local" className="premium-input" style={{ width: '100%' }} defaultValue="2026-06-17T10:00" />
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--color-gold)', margin: '0 0 1rem 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>COORDONNÉES PRÉCISES</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
              <div><label className="form-label">Latitude</label><input type="text" className="premium-input" defaultValue="-13.2456" /></div>
              <div><label className="form-label">Longitude</label><input type="text" className="premium-input" defaultValue="28.1234" /></div>
              <div><label className="form-label">Prof. (m)</label><input type="number" className="premium-input" defaultValue="12.5" /></div>
              <div><label className="form-label">Alt. (m)</label><input type="number" className="premium-input" defaultValue="1450" /></div>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--color-info)', margin: '0 0 1rem 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>TYPE DE ROCHE</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label className="form-label">Type</label>
                <select className="premium-input" style={{ width: '100%' }}><option>Pegmatite</option><option>Schiste</option></select>
              </div>
              <div><label className="form-label">Couleur</label><input type="text" className="premium-input" defaultValue="Blanc-rosé" /></div>
              <div style={{ gridColumn: '1 / -1' }}><label className="form-label">Minéralogie</label><input type="text" className="premium-input" defaultValue="Quartz, Feldspath, Mica, Tourmaline" /></div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="premium-button" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { toast('Échantillon enregistré avec succès', 'success'); setView('list'); }}>✅ VALIDER</button>
            <button className="premium-button secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => toast('Échantillon transmis au laboratoire', 'info')}>📤 ENVOYER AU LABO</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--color-white)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FlaskConical size={28} color="var(--color-info)" />
          LISTE DES ÉCHANTILLONS
        </h2>
        <button onClick={() => setView('new')} className="premium-button">
          <Plus size={18} /> NOUVEL ÉCHANTILLON
        </button>
      </div>

      <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <Search size={18} color="var(--color-stone)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher échantillon..." className="premium-input" style={{ width: '100%', paddingLeft: '2.5rem' }} />
            </div>
            <button 
              onClick={() => {
                setIsGpsLoading(true);
                toast('Recherche de satellites GPS...', 'info');
                setTimeout(() => {
                  setGpsCoords('-13.2456, 28.1234');
                  setIsGpsLoading(false);
                  toast('Position GPS acquise (Précision 2m)', 'success');
                }, 2000);
              }}
              style={{ background: 'var(--color-rock)', border: '1px solid var(--color-rock-3)', color: 'var(--color-chalk)', padding: '0 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {isGpsLoading ? <span className="dot dot-green"></span> : <MapPin size={16} />}
              GPS {gpsCoords && <span style={{color: 'var(--color-emerald)', fontSize: '0.8rem'}}>({gpsCoords})</span>}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              style={{ background: 'transparent', border: '1px solid var(--color-stone)', color: 'var(--color-chalk)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Filter size={16} /> Filtres
            </button>
            {showFilters && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem', background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 10, boxShadow: 'var(--shadow-lg)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-white)' }}><input type="checkbox" checked={showValidated} onChange={e => setShowValidated(e.target.checked)} /> Validés</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-white)' }}><input type="checkbox" checked={showPending} onChange={e => setShowPending(e.target.checked)} /> En attente</label>
              </div>
            )}
            <button 
              onClick={exportSamples}
              style={{ background: 'transparent', border: '1px solid var(--color-stone)', color: 'var(--color-chalk)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Download size={16} /> Exporter
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: 'var(--color-chalk)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-rock-3)' }}>
                <th style={{ padding: '1rem', color: 'var(--color-stone)', fontWeight: 600 }}>N° Lot</th>
                <th style={{ padding: '1rem', color: 'var(--color-stone)', fontWeight: 600 }}>PEG</th>
                <th style={{ padding: '1rem', color: 'var(--color-stone)', fontWeight: 600 }}>Teneur</th>
                <th style={{ padding: '1rem', color: 'var(--color-stone)', fontWeight: 600 }}>Statut</th>
                <th style={{ padding: '1rem', color: 'var(--color-stone)', fontWeight: 600 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {visibleSamples.map((samp, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--color-rock-3)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-rock)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1rem', fontWeight: 700, fontFamily: 'monospace' }}>#{samp.id}</td>
                  <td style={{ padding: '1rem' }}>{samp.peg}</td>
                  <td style={{ padding: '1rem', color: samp.grade !== '-' ? 'var(--color-gold)' : 'var(--color-ash)', fontWeight: 700 }}>{samp.grade}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      background: samp.status === 'Validé' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                      color: samp.status === 'Validé' ? 'var(--color-emerald)' : 'var(--color-warning)',
                      padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600
                    }}>
                      {samp.status === 'Validé' ? '✅' : '⏳'} {samp.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--color-stone)' }}>{samp.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '2rem', padding: '1rem', background: 'var(--color-rock)', borderRadius: 'var(--radius-md)', marginTop: '1rem' }}>
          <div style={{ color: 'var(--color-stone)' }}>Total: <strong style={{ color: 'var(--color-white)' }}>12</strong></div>
          <div style={{ color: 'var(--color-stone)' }}>Validés: <strong style={{ color: 'var(--color-emerald)' }}>8</strong></div>
          <div style={{ color: 'var(--color-stone)' }}>En attente: <strong style={{ color: 'var(--color-warning)' }}>4</strong></div>
          <div style={{ color: 'var(--color-stone)', marginLeft: 'auto' }}>Teneur max: <strong style={{ color: 'var(--color-gold)' }}>3.2%</strong></div>
        </div>

      </div>
    </div>
  );
}
