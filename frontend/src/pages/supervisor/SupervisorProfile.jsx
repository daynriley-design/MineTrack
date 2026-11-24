import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Mail, BadgeCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PageHero from '../../components/PageHero';
import LanguageSwitcher from '../../components/LanguageSwitcher';

/** Profil du compte connecte (donnees reelles du jeton de session). */
export default function SupervisorProfile() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div>
      <PageHero title={t('app.profile')} subtitle={`${user?.name || ''}`} />
      <div className="mt-body mt-page">
        <section className="mt-card mt-card--row">
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FFF1E6', color: 'var(--color-ore-dark)', display: 'grid', placeItems: 'center', fontSize: '1.4rem', fontWeight: 600, flexShrink: 0 }}>
            {(user?.name || '?').slice(0, 1).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="mt-card__title" style={{ margin: 0 }}>{user?.name}</p>
            <p className="mt-card__eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', margin: '0.2rem 0 0' }}><Mail size={14} /> {user?.email}</p>
            <p className="mt-card__eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', margin: '0.2rem 0 0' }}><BadgeCheck size={14} /> {t(`user.role_${user?.role}`, { defaultValue: user?.role })}</p>
          </div>
        </section>

        <section className="mt-card">
          <p className="mt-card__eyebrow" style={{ marginBottom: '0.5rem' }}>{t('login.choose_language')}</p>
          <LanguageSwitcher variant="block" />
        </section>

        <section className="mt-card">
          <button type="button" className="mt-btn mt-btn--ghost" style={{ color: 'var(--color-ruby)' }} onClick={handleLogout}>
            <LogOut size={17} /> {t('user.logout')}
          </button>
        </section>
      </div>
    </div>
  );
}
