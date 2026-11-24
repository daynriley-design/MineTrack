import { useEffect, useMemo, useState } from 'react';
import { Package, Download, Loader2 } from 'lucide-react';
import api from '../../api';
import { useToast } from '../../contexts/ToastContext';
import PageHero from '../../components/PageHero';

const asList = (data) => (Array.isArray(data) ? data : data?.items || []);
const fr = (iso) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR') : '—');
const CATEGORY = { magasinier: 'Magasin', explosifs: 'Explosifs' };
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };

/** Stocks reels : entrees saisies par la Logistique (API /stock-entries). */
export default function SupervisorStocks() {
  const { toast } = useToast();
  const [sites, setSites] = useState([]);
  const [entries, setEntries] = useState([]);
  const [siteId, setSiteId] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/sites'), api.get('/stock-entries')])
      .then(([s, e]) => { setSites(asList(s.data)); setEntries(asList(e.data)); })
      .catch(() => toast('Impossible de charger les stocks', 'error'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const siteName = (id) => sites.find((s) => s.id === id)?.name || '—';
  const filtered = useMemo(() => entries.filter((e) => !siteId || e.site_id === siteId), [entries, siteId]);

  // Dernier stock connu par (site, materiel) + consommation des 7 derniers jours.
  const summary = useMemo(() => {
    const since = daysAgo(7);
    const map = new Map();
    filtered.forEach((e) => {
      const key = `${e.site_id}|${e.material}`;
      const row = map.get(key) || { site_id: e.site_id, material: e.material, category: e.category, last: null, consumption7: 0 };
      if (!row.last || `${e.report_date}${e.created_at}` > `${row.last.report_date}${row.last.created_at}`) row.last = e;
      if (e.report_date >= since) row.consumption7 += Number(e.consumption || 0);
      map.set(key, row);
    });
    return [...map.values()].sort((a, b) => a.material.localeCompare(b.material));
  }, [filtered]);

  const exportExcel = async () => {
    setExporting(true);
    try {
      const ExcelJS = (await import('exceljs')).default;
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Stocks');
      ws.columns = [
        { header: 'Date', key: 'date', width: 12 }, { header: 'Shift', key: 'shift', width: 8 },
        { header: 'Site', key: 'site', width: 18 }, { header: 'Catégorie', key: 'cat', width: 12 },
        { header: 'Matériel', key: 'material', width: 18 }, { header: 'Consommation', key: 'cons', width: 14 },
        { header: 'Stock final', key: 'stock', width: 12 }, { header: 'Notes', key: 'notes', width: 30 },
      ];
      filtered.forEach((e) => ws.addRow({
        date: e.report_date, shift: e.shift === 'night' ? 'Nuit' : 'Jour', site: siteName(e.site_id),
        cat: CATEGORY[e.category] || e.category, material: e.material, cons: e.consumption, stock: e.final_stock, notes: e.notes,
      }));
      ws.getRow(1).font = { bold: true };
      const buf = await wb.xlsx.writeBuffer();
      const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `stocks_minetrack_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast("Échec de l'export Excel", 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <PageHero title="Stocks" subtitle="saisis par la logistique">
        <div className="mt-chips" role="tablist" aria-label="Site">
          <button type="button" className={`mt-chip${!siteId ? ' is-active' : ''}`} onClick={() => setSiteId('')}>Tous les sites</button>
          {sites.map((s) => (
            <button key={s.id} type="button" className={`mt-chip${siteId === s.id ? ' is-active' : ''}`} onClick={() => setSiteId(s.id)}>{s.name}</button>
          ))}
        </div>
      </PageHero>

      <div className="mt-body mt-page">
        <section className="mt-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 500 }}>Dernier stock connu</h3>
            <button type="button" className="mt-btn mt-btn--ghost" onClick={exportExcel} disabled={exporting || !filtered.length}>
              {exporting ? <Loader2 size={16} className="spin" /> : <Download size={16} />} Exporter en Excel
            </button>
          </div>
          {loading ? <p className="mt-empty">Chargement…</p> : summary.length === 0 ? (
            <p className="mt-empty">Aucune entrée de stock. La logistique les saisit dans son espace en fin de poste.</p>
          ) : (
            <div className="mt-table-wrap">
              <table className="mt-table">
                <thead><tr><th>Matériel</th><th>Site</th><th>Stock final</th><th>Conso. 7 jours</th><th>Dernière saisie</th></tr></thead>
                <tbody>
                  {summary.map((r) => (
                    <tr key={`${r.site_id}|${r.material}`}>
                      <td><span style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}><Package size={15} />{r.material}</span> <span className="mt-pill mt-pill--soft-gray">{CATEGORY[r.category] || r.category}</span></td>
                      <td>{siteName(r.site_id)}</td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>{r.last?.final_stock ?? '—'}</td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>{Math.round(r.consumption7 * 100) / 100}</td>
                      <td>{fr(r.last?.report_date)} · {r.last?.shift === 'night' ? 'Nuit' : 'Jour'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {filtered.length > 0 && (
          <section className="mt-card">
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 500 }}>Dernières saisies</h3>
            <div className="mt-table-wrap">
              <table className="mt-table">
                <thead><tr><th>Date</th><th>Site</th><th>Matériel</th><th>Consommation</th><th>Stock final</th><th>Notes</th></tr></thead>
                <tbody>
                  {filtered.slice(0, 30).map((e) => (
                    <tr key={e.id}>
                      <td>{fr(e.report_date)} · {e.shift === 'night' ? 'Nuit' : 'Jour'}</td>
                      <td>{siteName(e.site_id)}</td><td>{e.material}</td>
                      <td>{e.consumption ?? '—'}</td><td>{e.final_stock ?? '—'}</td><td>{e.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
