import { useEffect, useMemo, useState } from 'react';
import { Search, UserPlus, Trash2, Loader2 } from 'lucide-react';
import api from '../../api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import PageHero from '../../components/PageHero';

const ROLE_LABELS = {
  admin: 'Administrateur',
  management: 'Management',
  supervisor: 'Superviseur',
  logistique: 'Logistique',
  support: 'Support technique',
  geologist: 'Géologue',
  operator: 'Opérateur',
};
// Le serveur applique la même règle (server.py : SUPERVISOR_CREATABLE).
const SUPERVISOR_CREATABLE = ['operator', 'geologist', 'logistique', 'support'];

const EMPTY = { name: '', email: '', role: 'operator', password: '' };

export default function SupervisorUsers() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/supervisor/users')
    .then(({ data }) => setUsers(Array.isArray(data) ? data : []))
    .catch(() => toast('Impossible de charger les comptes', 'error'))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const creatable = isAdmin ? Object.keys(ROLE_LABELS) : SUPERVISOR_CREATABLE;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => [u.name, u.email, ROLE_LABELS[u.role] || u.role].some((v) => String(v || '').toLowerCase().includes(q)));
  }, [users, search]);

  const createUser = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/supervisor/users', form);
      toast('Compte créé', 'success');
      setForm(EMPTY);
      load();
    } catch (err) {
      toast(err?.response?.data?.detail || 'Création impossible', 'error');
    } finally {
      setBusy(false);
    }
  };

  const canDelete = (u) => u.email !== user?.email && (isAdmin || u.role !== 'admin');

  const deleteUser = async (u) => {
    if (!window.confirm(`Supprimer définitivement le compte de ${u.name} (${u.email}) ?`)) return;
    try {
      await api.delete(`/supervisor/users/${u.id}`);
      toast('Compte supprimé', 'success');
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (err) {
      toast(err?.response?.data?.detail || 'Suppression impossible', 'error');
    }
  };

  return (
    <div>
      <PageHero title="Utilisateurs" subtitle="comptes et rôles" />
      <div className="mt-body mt-body--wide mt-form">
        <section className="mt-card">
          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
            <Search size={17} color="var(--color-stone)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un nom, un email, un rôle…" style={{ paddingLeft: '2.4rem' }} aria-label="Rechercher" />
          </div>
          {loading ? <p className="mt-empty">Chargement…</p> : (
            <div className="mt-list">
              {filtered.length === 0 && <p className="mt-empty" style={{ padding: '0.75rem 0' }}>Aucun compte trouvé.</p>}
              {filtered.map((u) => (
                <div key={u.id} className="mt-list__item">
                  <div className="mt-list__icon" style={{ background: '#FFF1E6', color: 'var(--color-ore-dark)', fontWeight: 600 }}>
                    {(u.name || u.email || '?').slice(0, 1).toUpperCase()}
                  </div>
                  <div className="mt-list__main">
                    <strong>{u.name}</strong>
                    <span>{u.email}</span>
                  </div>
                  <span className="mt-pill mt-pill--soft-gray">{ROLE_LABELS[u.role] || u.role}</span>
                  {canDelete(u) && (
                    <button type="button" onClick={() => deleteUser(u)} title="Supprimer le compte" aria-label={`Supprimer ${u.name}`}
                      className="mt-round" style={{ width: 36, height: 36, color: 'var(--color-ruby)' }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <form className="mt-card" onSubmit={createUser} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={18} /> Nouveau compte
          </h3>
          <div>
            <label htmlFor="u-name">Nom complet</label>
            <input id="u-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label htmlFor="u-email">Email</label>
            <input id="u-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label htmlFor="u-role">Rôle</label>
            <select id="u-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {creatable.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="u-pass">Mot de passe temporaire (8 caractères minimum)</label>
            <input id="u-pass" type="password" autoComplete="new-password" minLength={8} required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <button type="submit" className="mt-btn" disabled={busy}>
              {busy ? <Loader2 size={17} className="spin" /> : <UserPlus size={17} />} Créer le compte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
