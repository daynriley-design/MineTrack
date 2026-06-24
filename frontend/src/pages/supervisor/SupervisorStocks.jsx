import { useState } from 'react';
import { Package, AlertTriangle, CheckCircle, Upload, Download, Plus, X, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export default function SupervisorStocks() {
  const { toast } = useToast();
  
  const [stocks, setStocks] = useState([
    { id: 1, name: 'Dynamite', current: 180, threshold: 50, unit: 'kg' },
    { id: 2, name: 'Acier (Tiges)', current: 55, threshold: 60, unit: 'unités' },
    { id: 3, name: 'Carburant', current: 1800, threshold: 500, unit: 'L' },
    { id: 4, name: 'Ciment', current: 220, threshold: 250, unit: 'kg' }
  ]);

  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const exportCSV = () => {
    let csv = "ID,Nom,Quantite_Actuelle,Seuil,Unite\n";
    stocks.forEach(s => {
      csv += `${s.id},${s.name},${s.current},${s.threshold},${s.unit}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'stocks_minetrack.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Fichier Excel (CSV) exporté", "success");
  };

  const importCSV = () => {
    toast("Lecture du fichier...", "info");
    setTimeout(() => {
      setStocks([...stocks, { id: Date.now(), name: 'Boulons M24', current: 500, threshold: 100, unit: 'pièces' }]);
      toast("Import réussi. Nouveaux éléments ajoutés.", "success");
    }, 1500);
  };

  const handleReorderSubmit = (e) => {
    e.preventDefault();
    const id = parseInt(e.target.product.value);
    const qty = parseInt(e.target.quantity.value);
    setStocks(stocks.map(s => s.id === id ? { ...s, current: s.current + qty } : s));
    toast("Stock réapprovisionné avec succès", "success");
    setShowReorderModal(false);
  };

  const handleAddNewSubmit = (e) => {
    e.preventDefault();
    const newProduct = {
      id: Date.now(),
      name: e.target.name.value,
      current: parseInt(e.target.current.value),
      threshold: parseInt(e.target.threshold.value),
      unit: e.target.unit.value
    };
    setStocks([...stocks, newProduct]);
    toast("Produit créé et ajouté au catalogue", "success");
    setShowAddModal(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(249, 115, 22, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-ore)' }}>
            <Package size={28} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 800, fontSize: '1.5rem' }}>Gestion des Stocks</h2>
            <p style={{ margin: 0, color: 'var(--color-stone)' }}>Suivi des consommables et réapprovisionnement</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={exportCSV} className="premium-button secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <Download size={16} /> EXPORTER EXCEL
          </button>
          <button onClick={importCSV} className="premium-button secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <Upload size={16} /> IMPORTER
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Inventaire Actuel */}
        <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--color-white)', fontSize: '1.1rem' }}>Inventaire en Temps Réel</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowAddModal(true)} className="premium-button primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                <Plus size={16} /> NOUVEAU PRODUIT
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stocks.map(stock => {
              const isLow = stock.current <= stock.threshold;
              return (
                <div key={stock.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isLow ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${isLow ? 'var(--color-warning)' : 'var(--color-emerald)'}` }}>
                  <div>
                    <strong style={{ color: isLow ? 'var(--color-warning)' : 'var(--color-white)', display: 'block', fontSize: '1.1rem' }}>{stock.name}</strong>
                    <span style={{ color: 'var(--color-stone)', fontSize: '0.85rem' }}>{stock.current} {stock.unit} (Seuil: {stock.threshold})</span>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: isLow ? 'var(--color-warning)' : 'var(--color-emerald)', fontSize: '0.9rem', fontWeight: 600 }}>
                    {isLow ? <><AlertTriangle size={16}/> Alerte</> : <><CheckCircle size={16}/> OK</>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions Rapides */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ background: 'var(--color-rock-2)', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--color-white)', margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Actions Rapides</h3>
            <button onClick={() => setShowReorderModal(true)} className="btn-emergency" style={{ width: '100%', padding: '1rem', background: 'var(--color-warning)', color: 'black', fontWeight: 800 }}>
              <Package size={20} /> RÉAPPROVISIONNER
            </button>
          </div>
        </div>

      </div>

      {/* Modal Reorder */}
      {showReorderModal && (
        <div className="modal-overlay" onClick={() => setShowReorderModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Réapprovisionnement</h3>
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
                  <label className="form-label">Unité (ex: kg, L, pièces)</label>
                  <input type="text" name="unit" className="premium-input" style={{ width: '100%' }} required />
                </div>
              </div>
              <div>
                <label className="form-label">Seuil d'alerte critique</label>
                <input type="number" name="threshold" className="premium-input" style={{ width: '100%' }} required min="0" />
              </div>
              <div className="modal-footer" style={{ marginTop: '1rem' }}>
                <button type="submit" className="premium-button primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}><Plus size={18}/> AJOUTER AU CATALOGUE</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
