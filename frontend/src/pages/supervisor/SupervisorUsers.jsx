import { useEffect, useMemo, useState } from 'react';
import { Search, UserPlus, Trash2, Loader2, Check } from 'lucide-react';
import api from '../../api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import PageHero from '../../components/PageHero';

// Libelles traduits : user.role_* (voir locales).
const ROLE_KEYS = ['admin', 'management', 'supervisor', 'logistique', 'support', 'geologist', 'operator'];
// Le serveur applique la même règle (server.py : SUPERVISOR_CREATABLE).
const SUPERVISOR_CREATABLE = ['operator', 'geologist', 'logistique', 'support'];

const EMPTY = { name: '', email: '', role: 'operator', password: '' };

export default function SupervisorUsers() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const roleLabel = (r) => t(`user.role_${r}`, { defaultValue: r });
  const isAdmin = user?.role === 'admin';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/supervisor/users')
    .then(({ data }) => setUsers(Array.isArray(data) ? data : []))
    .catch(() => toast(t('users.err_load'), 'error'))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const creatable = isAdmin ? ROLE_KEYS : SUPERVISOR_CREATABLE;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? users.filter((u) => [u.name, u.email, roleLabel(u.role)].some((v) => String(v || '').toLowerCase().includes(q)))
      : users;
    // Demandes en attente en tete de liste.
    return [...list].sort((a, b) => (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1));
  }, [users, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const pendingCount = users.filter((u) => u.status === 'pending').length;
  const canApprove = (u) => isAdmin || SUPERVISOR_CREATABLE.includes(u.role);

  const approveUser = async (u) => {
    try {
      await api.post(`/supervisor/users/${u.id}/approve`);
      toast(t('users.approved', { name: u.name }), 'success');
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: 'active' } : x)));
    } catch (err) {
      toast(err?.response?.data?.detail || t('users.err_approve'), 'error');
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/supervisor/users', form);
      toast(t('users.created'), 'success');
      setForm(EMPTY);
      load();
    } catch (err) {
      toast(err?.response?.data?.detail || t('users.err_create'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const canDelete = (u) => u.email !== user?.email && (isAdmin || u.role !== 'admin');

  const deleteUser = async (u) => {
    if (!window.confirm(t('users.confirm_delete', { name: u.name, email: u.email }))) return;
    try {
      await api.delete(`/supervisor/users/${u.id}`);
      toast(t('users.deleted'), 'success');
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (err) {
      toast(err?.response?.data?.detail || t('users.err_delete'), 'error');
    }
  };

  return (
    <div>
      <PageHero title={t('users.title')} subtitle={pendingCount ? t('users.pending_count', { count: pendingCount }) : t('users.subtitle')} />
      <div className="mt-body mt-body--wide mt-form">
        <section className="mt-card">
          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
            <Search size={17} color="var(--color-stone)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('users.search')} style={{ paddingLeft: '2.4rem' }} aria-label={t('users.search')} />
          </div>
          {loading ? <p className="mt-empty">{t('users.loading')}</p> : (
            <div className="mt-list">
              {filtered.length === 0 && <p className="mt-empty" style={{ padding: '0.75rem 0' }}>{t('users.none')}</p>}
              {filtered.map((u) => (
                <div key={u.id} className="mt-list__item">
                  <div className="mt-list__icon" style={{ background: '#FFF1E6', color: 'var(--color-ore-dark)', fontWeight: 600 }}>
                    {(u.name || u.email || '?').slice(0, 1).toUpperCase()}
                  </div>
                  <div className="mt-list__main">
                    <strong>{u.name}</strong>
                    <span>{u.email}</span>
                  </div>
                  {u.status === 'pending' && <span className="mt-pill mt-pill--ore">{t('users.pending')}</span>}
                  <span className="mt-pill mt-pill--soft-gray">{roleLabel(u.role)}</span>
                  {u.status === 'pending' && canApprove(u) && (
                    <button type="button" onClick={() => approveUser(u)} title={t('users.approve')} aria-label={`${t('users.approve')} : ${u.name}`}
                      className="mt-round" style={{ width: 36, height: 36, color: '#047857' }}>
                      <Check size={17} />
                    </button>
                  )}
                  {canDelete(u) && (
                    <button type="button" onClick={() => deleteUser(u)} title={u.status === 'pending' ? t('users.reject') : t('users.delete')} aria-label={`${u.status === 'pending' ? t('users.reject') : t('users.delete')} : ${u.name}`}
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
            <UserPlus size={18} /> {t('users.new_account')}
          </h3>
          <div>
            <label htmlFor="u-name">{t('app.full_name')}</label>
            <input id="u-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label htmlFor="u-email">{t('login.email')}</label>
            <input id="u-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label htmlFor="u-role">{t('users.role')}</label>
            <select id="u-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {creatable.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="u-pass">{t('users.temp_password')}</label>
            <input id="u-pass" type="password" autoComplete="new-password" minLength={8} required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <button type="submit" className="mt-btn" disabled={busy}>
              {busy ? <Loader2 size={17} className="spin" /> : <UserPlus size={17} />} {t('users.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
