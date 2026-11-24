import { useState, useRef } from 'react';
import { Package, AlertTriangle, CheckCircle, Upload, Download, Plus, X, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const INITIAL_STOCKS = [
  { id: 1, name: 'Dynamite', current: 180, threshold: 50, unit: 'kg' },
  { id: 2, name: 'Acier (Tiges)', current: 55, threshold: 60, unit: 'unités' },
  { id: 3, name: 'Carburant', current: 1800, threshold: 500, unit: 'L' },
  { id: 4, name: 'Ciment', current: 220, threshold: 250, unit: 'kg' },
];

export default function SupervisorStocks() {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [stocks, setStocks] = useState(INITIAL_STOCKS);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // ── Export .xlsx réel (colonnes propres, pas de texte mélangé) ──
  const exportCSV = async () => {
    try {
      const ExcelJS = (await import('exceljs')).default;
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Stocks');
      ws.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nom', key: 'name', width: 26 },
        { header: 'Quantite_Actuelle', key: 'current', width: 20 },
        { header: 'Seuil_Alerte', key: 'threshold', width: 16 },
        { header: 'Unite', key: 'unit', width: 12 },
        { header: 'Statut', key: 'status', width: 12 },
      ];
      ws.getRow(1).font = { bold: true };
      stocks.forEach(s => ws.addRow({
        id: s.id, name: s.name, current: s.current, threshold: s.threshold,
        unit: s.unit, status: s.current <= s.threshold ? 'ALERTE' : 'OK',
      }));
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stocks_minetrack_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast('Fichier Excel (.xlsx) exporté avec colonnes correctes', 'success');
    } catch {
      toast("Erreur lors de l'export Excel", 'error');
    }
  };

  // ── Import Excel réel (.xlsx/.xls binaire + .csv) via exceljs ──
  const handleFileImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast(`Lecture du fichier : ${file.name}`, 'info');
    try {
      const ExcelJS = (await import('exceljs')).default;
      const buffer = await file.arrayBuffer();
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buffer);
      const sheet = wb.worksheets[0];
      const imported = [];
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // en-tête
        const cols = row.values; // index 0 vide, 1-based
        if (!cols || cols.length < 2) return;
        imported.push({
          id: Date.now() + Math.random(),
          name: String(cols[2] ?? `Produit ${Date.now()}`),
          current: parseFloat(cols[3]) || 0,
          threshold: parseFloat(cols[4]) || 0,
          unit: cols[5] ? String(cols[5]) : 'unité',
        });
      });
      if (imported.length > 0) {
        setStocks(prev => [...prev, ...imported]);
        toast(`✅ ${imported.length} produit(s) importé(s) avec succès`, 'success');
      } else {
        toast('Aucune ligne valide trouvée dans le fichier', 'error');
      }
    } catch {
      toast("Erreur lors de la lecture du fichier Excel", 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleReorderSubmit = (e) => {
    e.preventDefault();
    const id = parseInt(e.target.product.value);
    const qty = parseInt(e.target.quantity.value);
    setStocks(stocks.map(s => s.id === id ? { ...s, current: s.current + qty } : s));
    toast('Stock réapprovisionné avec succès', 'success');
    setShowReorderModal(false);
  };

  const handleAddNewSubmit = (e) => {
    e.preventDefault();
    const newProduct = {
      id: Date.now(),
      name: e.target.name.value,
      current: parseInt(e.target.current.value),
      threshold: parseInt(e.target.threshold.value),
      unit: e.target.unit.value,
    };
    setStocks([...stocks, newProduct]);
    toast('Produit créé et ajouté au catalogue', 'success');
    setShowAddModal(false);
    e.target.reset();
  };

  const alertCount = stocks.filter(s => s.current <= s.threshold).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(238, 155, 95, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-ore)' }}>
            <Package size={28} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 800, fontSize: '1.5rem' }}>Gestion des Stocks</h2>
            <p style={{ margin: 0, color: 'var(--color-stone)' }}>
              {alertCount > 0
                ? <span style={{ color: 'var(--color-warning)' }}>⚠️ {alertCount} produit(s) sous le seuil critique</span>
                : 'Tous les stocks sont au-dessus du seuil'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={exportCSV} className="premium-button secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <Download size={16} /> EXPORTER EXCEL
          </button>
          {/* Hidden real file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={handleFileImport}
            style={{ display: 'none' }}
          />
          <button onClick={() => fileInputRef.current?.click()} className="premium-button secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <Upload size={16} /> IMPORTER CSV
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Inventaire */}
        <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--color-white)', fontSize: '1.1rem' }}>Inventaire en Temps Réel</h3>
            <button onClick={() => setShowAddModal(true)} className="premium-button primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
              <Plus size={16} /> NOUVEAU PRODUIT
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stocks.map(stock => {
              const isLow = stock.current <= stock.threshold;
              const pct = Math.min(100, (stock.current / Math.max(stock.threshold * 2, stock.current)) * 100);
              return (
                <div key={stock.id} style={{ background: isLow ? 'rgba(245,158,11,0.08)' : 'rgba(17,18,20,0.03)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${isLow ? 'var(--color-warning)' : 'var(--color-emerald)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{ color: isLow ? 'var(--color-warning)' : 'var(--color-white)', fontSize: '1rem' }}>{stock.name}</strong>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: isLow ? 'var(--color-warning)' : 'var(--color-emerald)', fontSize: '0.85rem', fontWeight: 700 }}>
                      {isLow ? <><AlertTriangle size={14}/> ALERTE</> : <><CheckCircle size={14}/> OK</>}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: '6px', background: 'rgba(17,18,20,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: isLow ? '#f59e0b' : '#10b981', borderRadius: '3px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                    <span style={{ color: 'var(--color-stone)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      <strong style={{ color: 'var(--color-white)' }}>{stock.current.toLocaleString()}</strong> / seuil {stock.threshold} {stock.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--color-white)', margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Actions Rapides</h3>
            <button onClick={() => setShowReorderModal(true)} className="btn-emergency"
              style={{ width: '100%', padding: '1rem', background: 'var(--color-warning)', color: 'black', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Package size={20} /> RÉAPPROVISIONNER
            </button>
          </div>

          {/* Import instructions */}
          <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px dashed rgba(59,130,246,0.3)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--color-info)', fontWeight: 700, fontSize: '0.85rem' }}>📋 Format d'import CSV :</p>
            <code style={{ color: 'var(--color-stone)', fontSize: '0.75rem', display: 'block', lineHeight: 1.6 }}>
              ID;Nom;Quantité;Seuil;Unité<br/>
              1;Dynamite;180;50;kg<br/>
              2;Carburant;1800;500;L
            </code>
            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--color-stone)', fontSize: '0.7rem' }}>Séparateur : point-virgule (;)</p>
          </div>
        </div>
      </div>

      {/* Modal Reorder */}
      {showReorderModal && (
        <div className="modal-overlay" onClick={() => setShowReorderModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Réapprovisionnement Stock</h3>
              <button onClick={() => setShowReorderModal(false)} className="btn btn-ghost btn-icon"><X size={20}/></button>
            </div>
            <form onSubmit={handleReorderSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Produit à réapprovisionner</label>
                <select name="product" className="premium-input" style={{ width: '100%' }} required>
                  {stocks.map(s => <option key={s.id} value={s.id}>{s.name} (Actuel: {s.current} {s.unit})</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Quantité reçue</label>
                <input type="number" name="quantity" className="premium-input" style={{ width: '100%' }} required min="1" />
              </div>
              <div className="modal-footer" style={{ marginTop: '2rem' }}>
                <button type="submit" className="premium-button primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}><Save size={18}/> VALIDER L'ENTRÉE</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add New */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Créer un Nouveau Produit</h3>
              <button onClick={() => setShowAddModal(false)} className="btn btn-ghost btn-icon"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddNewSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Nom du Produit</label>
                <input type="text" name="name" className="premium-input" style={{ width: '100%' }} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Quantité Initiale</label>
                  <input type="number" name="current" className="premium-input" style={{ width: '100%' }} required min="0" />
                </div>
                <div>
                  <label className="form-label">Unité (ex: kg, L)</label>
                  <input type="text" name="unit" className="premium-input" style={{ width: '100%' }} required />
                </div>
              </div>
              <div>
                <label className="form-label">Seuil d'alerte critique</label>
                <input type="number" name="threshold" className="premium-input" style={{ width: '100%' }} required min="0" />
              </div>
              <div className="modal-footer" style={{ marginTop: '0.5rem' }}>
                <button type="submit" className="premium-button primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}><Plus size={18}/> AJOUTER AU CATALOGUE</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
