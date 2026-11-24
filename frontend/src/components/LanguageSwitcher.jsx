import { useTranslation } from 'react-i18next';
import { ensureLocaleLoaded } from '../i18n';

const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'ln', label: 'Lingala' },
  { code: 'lu', label: 'Tshiluba' },
  { code: 'kg', label: 'Kikongo' },
];

/** Sélecteur de langue réutilisable — change i18n.language partout dans l'app. */
export default function LanguageSwitcher({ style }) {
  const { i18n } = useTranslation();

  const changeLanguage = async (code) => {
    await ensureLocaleLoaded(code);
    i18n.changeLanguage(code);
    try { localStorage.setItem('i18nextLng', code); } catch { /* storage unavailable */ }
  };

  return (
    <select
      aria-label="Choisir la langue / Choose language"
      value={(i18n.language || i18n.resolvedLanguage || 'fr').slice(0, 2)}
      onChange={(e) => changeLanguage(e.target.value)}
      style={{
        background: 'var(--color-rock-2, #F7F8FA)',
        color: 'var(--color-chalk, #f3ede7)',
        border: '1px solid var(--color-rock-3, #2a2724)',
        padding: '0.4rem 0.8rem',
        borderRadius: 'var(--radius-md, 7px)',
        fontSize: '0.85rem',
        cursor: 'pointer',
        outline: 'none',
        ...style,
      }}
    >
      {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
    </select>
  );
}
