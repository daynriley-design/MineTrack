import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Loader2, WifiOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ensureLocaleLoaded } from '../i18n';

// Raccourcis de rôle : ils pré-remplissent seulement l'EMAIL du compte.
// Aucun mot de passe n'est embarqué dans la page (audit : avant, n'importe
// qui pouvait se connecter en admin d'un clic sur le site public).
const ROLE_EMAILS = {
  admin: 'admin@minetrack.com',
  management: 'management@minetrack.com',
  supervisor: 'supervision@minetrack.com',
  logistique: 'logistique@minetrack.com',
  support: 'support@minetrack.com',
};

const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'ln', label: 'Lingala' },
  { code: 'kg', label: 'Kikongo' },
  { code: 'lu', label: 'Tshiluba' },
  { code: 'en', label: 'English' },
];

// Rôles backend actuels : admin | management | supervisor | logistique | support
// (+ geologist | operator, hérités d'une itération antérieure).
const ROLES = [
  { key: 'admin', labelKey: 'login.role_admin', home: '/admin/operations' },
  { key: 'management', labelKey: 'login.role_management', home: '/management/reports' },
  { key: 'supervisor', labelKey: 'login.role_supervisor', home: '/supervisor/dashboard' },
  { key: 'logistique', labelKey: 'login.role_logistique', home: '/logistique/dashboard' },
  { key: 'support', labelKey: 'login.role_support', home: '/support/dashboard' },
];

const HOME_BY_ROLE = {
  admin: '/admin/operations',
  management: '/management/reports',
  supervisor: '/supervisor/dashboard',
  logistique: '/logistique/dashboard',
  support: '/support/dashboard',
  geologist: '/geologist/dashboard',
  operator: '/miner/dashboard',
};

const CSS = `
.login{--ore:#EE9B5F;--ore-hot:#F6C29A;--shaft:#F2F3F5;--panel:#FFFFFF;--line:#ECEDF0;--txt:#2A2C31;--muted:#8B8E95;
min-height:100vh;display:grid;grid-template-columns:1fr 1fr;background:var(--shaft);color:var(--txt);
font-family:'Inter',system-ui,sans-serif}
.login__visual{position:relative;
background:radial-gradient(90% 70% at 15% 10%,rgba(255,178,120,.55),transparent 70%),
linear-gradient(160deg,rgba(255,227,204,.88),rgba(255,241,226,.86) 40%,rgba(242,243,245,.94) 85%),url('/login-bg.png') center/cover no-repeat}
.login__lang{position:absolute;top:2.5rem;left:2.5rem;display:flex;align-items:center;gap:.75rem;
background:#FFFFFF;border-radius:9999px;padding:.25rem 1rem .25rem .5rem;color:#111214;box-shadow:0 6px 20px rgba(17,18,20,.08)}
.login__lang select{appearance:none;border:0;background:transparent;font-size:1.5rem;color:inherit;
padding:.4rem .6rem;cursor:pointer;min-width:14rem}
.login__lang select:focus-visible{outline:2px solid var(--ore);outline-offset:3px}
.login__panel{display:flex;align-items:center;justify-content:center;padding:3rem 2rem}
.login__card{width:min(28rem,100%);background:var(--panel);border-radius:24px;padding:2rem;box-shadow:0 1px 2px rgba(17,18,20,.04),0 12px 32px rgba(17,18,20,.06)}
.login__brand{display:flex;flex-direction:column;align-items:center;gap:.4rem;margin-bottom:1.5rem;text-align:center}
.login__logo{width:min(13rem,70%);height:auto}
.login__mark{display:grid;place-items:center;width:2.9rem;height:2.9rem;border-radius:10px;
background:linear-gradient(145deg,var(--ore-hot),var(--ore));color:#3F1F08}
.login__brand strong{display:block;font-size:1.15rem}
.login__brand em{display:block;font-style:normal;font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.login__roles{display:grid;gap:.6rem}
.login__role{display:flex;align-items:center;justify-content:center;gap:.5rem;width:100%;padding:.7rem 1rem;
border:0;border-radius:14px;
background:linear-gradient(180deg,var(--ore-hot),var(--ore));color:#3F1F08;font-size:.95rem;font-weight:600;
box-shadow:0 6px 16px rgba(238, 155, 95,.22);cursor:pointer;transition:filter .15s ease,transform .15s ease}
.login__role:hover:not(:disabled){filter:brightness(1.06);transform:translateY(-1px)}
.login__role:disabled{opacity:.7;cursor:not-allowed}
.login__role:focus-visible{outline:2px solid #fff;outline-offset:2px}
.login__hint{margin:0 0 .75rem;font-size:.85rem;color:var(--muted);text-align:center}
.login__chips{display:flex;flex-wrap:wrap;gap:.4rem;justify-content:center;margin-bottom:1.1rem}
.login__chip{border:0;border-radius:999px;padding:.45rem .85rem;background:#F4F5F7;color:var(--txt);font:inherit;font-size:.85rem;cursor:pointer}
.login__chip:hover{background:#ECEDF0}
.login__chip.is-active{background:#FFF1E6;color:#A65218;font-weight:600}
.login__form{display:grid;gap:.4rem}
.login__form label{font-size:.8rem;color:var(--muted);margin-top:.35rem}
.login__form input{width:100%;padding:.75rem .9rem;border:1px solid transparent;border-radius:12px;background:#F7F8FA;color:var(--txt);font:inherit;font-size:.95rem;outline:none}
.login__form input:focus{background:#fff;border-color:var(--ore);box-shadow:0 0 0 3px rgba(238,155,95,.2)}
.login__form .login__role{margin-top:.9rem}
.login__error{margin:1rem 0 0;font-size:.82rem;color:#DC2626;display:flex;align-items:center;gap:.4rem}
.login__spin{animation:login-spin .9s linear infinite}
@keyframes login-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.login__spin{animation:none}}
@media (max-width:900px){.login{grid-template-columns:1fr}.login__visual{min-height:14rem}
.login__lang{top:1.25rem;left:1.25rem}.login__lang select{font-size:1.05rem;min-width:10rem}}
`;

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  const changeLanguage = async (code) => {
    await ensureLocaleLoaded(code);
    i18n.changeLanguage(code);
    try { localStorage.setItem('i18nextLng', code); } catch { /* storage unavailable */ }
  };

  const pickRole = (roleKey) => {
    setRole(roleKey);
    setEmail(ROLE_EMAILS[roleKey]);
    setError('');
    setTimeout(() => document.getElementById('login-password')?.focus(), 0);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!online) {
      setError(t('login.offline_error'));
      return;
    }
    setBusy(true);
    try {
      const user = await login({ email: email.trim(), password });
      navigate(HOME_BY_ROLE[user.role] || '/');
    } catch (err) {
      const status = err?.response?.status;
      setError(
        status === 401 ? t('login.error_invalid')
          : status === 429 ? 'Trop de tentatives : réessayez dans 15 minutes.'
            : t('login.error_server')
      );
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <style>{CSS}</style>

      <section className="login__visual">
        <div className="login__lang">
          <select aria-label={t('login.choose_language')} value={(i18n.language || 'fr').slice(0, 2)}
            onChange={(e) => changeLanguage(e.target.value)}>
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <ChevronDown size={22} aria-hidden="true" />
        </div>
      </section>

      <section className="login__panel">
        <div className="login__card">
          <header className="login__brand">
            <img src="/logo-full.png" alt="MineTrack" className="login__logo" width="412" height="337" />
            <em>{t('login.brand_subtitle')}</em>
          </header>

          <p className="login__hint">Choisissez votre rôle, puis saisissez votre mot de passe.</p>
          <nav className="login__chips" aria-label={t('login.demo_title')}>
            {ROLES.map((r) => (
              <button key={r.key} type="button" aria-pressed={role === r.key}
                className={`login__chip${role === r.key ? ' is-active' : ''}`}
                onClick={() => pickRole(r.key)}>
                {t(r.labelKey)}
              </button>
            ))}
          </nav>

          <form className="login__form" onSubmit={submit}>
            <label htmlFor="login-email">Email</label>
            <input id="login-email" type="email" autoComplete="username" required value={email}
              onChange={(e) => { setEmail(e.target.value); setRole(null); }} />
            <label htmlFor="login-password">Mot de passe</label>
            <input id="login-password" type="password" autoComplete="current-password" required value={password}
              onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="login__role" disabled={busy || !online}>
              {busy && <Loader2 size={18} className="login__spin" />} Se connecter
            </button>
          </form>

          {!online && (
            <p className="login__error" role="status"><WifiOff size={15} /> {t('login.offline_banner')}</p>
          )}
          {error && <p className="login__error" role="alert">{error}</p>}
        </div>
      </section>
    </div>
  );
}
