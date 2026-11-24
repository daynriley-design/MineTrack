import { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { hseChecklistsAPI } from '../../api';

const STATUS = {
  pending: { label: 'En attente de validation', color: 'var(--color-gold)' },
  approved: { label: 'Validée par le superviseur', color: 'var(--color-emerald)' },
  rejected: { label: 'Rejetée — à refaire', color: 'var(--color-ruby)' },
};
const today = () => new Date().toISOString().slice(0, 10);
const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));

/** Declaration « Face Safe » : enregistree sur le serveur, validee par le superviseur. */
export default function MinerHSE() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);

  const loadHistory = () => hseChecklistsAPI.list()
    .then(({ data }) => {
      const list = Array.isArray(data) ? data : data?.items || [];
      setHistory(list.filter((d) => d.created_by === user?.email).slice(0, 5));
    })
    .catch(() => {});

  useEffect(() => { loadHistory(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    setBusy(true);
    try {
      const res = await hseChecklistsAPI.create({
        peg_id: f.get('peg_id'),
        shift: f.get('shift'),
        date: today(),
        shift_boss: f.get('shift_boss'),
        pic: f.get('pic') || user?.name || null,
        gas_ch4: num(f.get('gas_ch4')),
        gas_co: num(f.get('gas_co')),
        gas_o2: num(f.get('gas_o2')),
        reentry_minutes: num(f.get('reentry_minutes')),
        face_safe: true,
        ventilation_ok: true,
        gas_checked: true,
        water_sprayed: true,
        supports_ok: f.get('supports_ok') === 'on',
        notes: f.get('notes') || null,
      });
      toast(res.data?._offline_queued
        ? 'Hors ligne : déclaration mise en file, envoyée au retour du réseau'
        : 'Déclaration HSE envoyée au superviseur', 'success');
      e.target.reset();
      loadHistory();
    } catch (err) {
      toast(err?.response?.data?.detail?.toString?.() || "Échec de l'envoi de la déclaration", 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-emerald)' }}>
          <ShieldCheck size={24} />
        </div>
        <h3 style={{ margin: 0, color: 'var(--color-white)', fontWeight: 700 }}>Déclaration HSE — Face Safe</h3>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid var(--color-rock-3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="hse-peg">PEG / Front</label>
              <input id="hse-peg" type="text" name="peg_id" className="form-input" placeholder="Ex : 10L-XC5SS" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="hse-shift">Shift</label>
              <select id="hse-shift" name="shift" className="form-select" defaultValue={new Date().getHours() >= 6 && new Date().getHours() < 18 ? 'day' : 'night'}>
                <option value="day">Jour</option>
                <option value="night">Nuit</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="hse-boss">Shift boss</label>
              <input id="hse-boss" type="text" name="shift_boss" className="form-input" placeholder="Nom du chef de poste" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="hse-pic">PIC (personne responsable)</label>
              <input id="hse-pic" type="text" name="pic" className="form-input" placeholder={user?.name || 'Votre nom'} />
            </div>
          </div>

          <div>
            <span className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Relevés gaz (GDI)</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div><label className="form-label" htmlFor="hse-ch4" style={{ fontSize: '0.75rem' }}>CH4 (%)</label><input id="hse-ch4" type="number" step="0.1" min="0" name="gas_ch4" className="form-input" defaultValue="0" /></div>
              <div><label className="form-label" htmlFor="hse-co" style={{ fontSize: '0.75rem' }}>CO (ppm)</label><input id="hse-co" type="number" min="0" name="gas_co" className="form-input" defaultValue="0" /></div>
              <div><label className="form-label" htmlFor="hse-o2" style={{ fontSize: '0.75rem' }}>O2 (%)</label><input id="hse-o2" type="number" step="0.1" min="0" name="gas_o2" className="form-input" defaultValue="20.9" /></div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="hse-reentry" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} /> Période de ré-entrée (minutes)</label>
            <input id="hse-reentry" type="number" min="0" name="reentry_minutes" className="form-input" placeholder="Ex : 30" required />
          </div>

          <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" required /> Front sécurisé (purgé de tout bloc instable)</label>
          <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" required /> Ventilation primaire et secondaire actives</label>
          <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" required /> Niveaux de gaz vérifiés (CO, NO2) dans les normes</label>
          <label className="form-checkbox-label"><input type="checkbox" className="form-checkbox" required /> Arrosage effectué (abattage des poussières)</label>
          <label className="form-checkbox-label"><input type="checkbox" name="supports_ok" className="form-checkbox" /> Soutènement vérifié</label>

          <div className="form-group">
            <label className="form-label" htmlFor="hse-notes">Remarques</label>
            <textarea id="hse-notes" name="notes" className="form-textarea" rows={2} />
          </div>

          <button type="submit" disabled={busy} style={{
            width: '100%', padding: '1rem', marginTop: '0.5rem',
            background: 'linear-gradient(135deg, var(--color-emerald), #047857)',
            color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
            fontWeight: 700, fontSize: '1rem', cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1,
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
          }}>
            <CheckCircle size={20} />
            {busy ? 'Envoi…' : 'Certifier la zone sécurisée'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ color: 'var(--color-stone)', marginBottom: '1rem', fontSize: '0.9rem' }}>Mes dernières déclarations</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {history.length === 0 ? (
            <p style={{ color: 'var(--color-stone)', fontSize: '0.85rem' }}>Aucune déclaration envoyée pour le moment.</p>
          ) : history.map((d) => {
            const st = STATUS[d.status] || STATUS.pending;
            return (
              <div key={d._id || d.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', background: 'rgba(17,18,20,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${st.color}` }}>
                <div>
                  <strong style={{ color: 'var(--color-white)', display: 'block' }}>{d.peg_id}</strong>
                  <span style={{ color: st.color, fontSize: '0.8rem', fontWeight: 600 }}>{st.label}</span>
                </div>
                <span style={{ color: 'var(--color-chalk)', fontSize: '0.8rem' }}>{d.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
