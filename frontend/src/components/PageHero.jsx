import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

// Langue de l'interface -> locale de date du navigateur (repli : francais).
const DATE_LOCALES = { fr: 'fr-FR', en: 'en-GB', sw: 'sw-TZ', ln: 'ln-CD' };

function formatToday(lang) {
  let locale = DATE_LOCALES[lang] || 'fr-FR';
  try {
    if (!Intl.DateTimeFormat.supportedLocalesOf([locale]).length) locale = 'fr-FR';
  } catch { locale = 'fr-FR'; }
  const raw = new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/**
 * En-tete degrade de la maquette : date, salutation + nom, et une rangee
 * de boutons ronds a droite (actions). `title` remplace la salutation
 * quand la page a un vrai titre (ex. « Stocks & consommation »).
 */
export default function PageHero({ title, subtitle, actions, left, children }) {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const hour = new Date().getHours();
  const greeting = t(hour < 12 ? 'app.morning' : hour < 18 ? 'app.afternoon' : 'app.evening');
  // i18n.language d'abord : resolvedLanguage reste sur « fr » tant que la
  // langue choisie est chargee a la demande (voir i18n.js).
  const date = formatToday((i18n.language || i18n.resolvedLanguage || 'fr').slice(0, 2));

  let second = subtitle ?? `${user?.name || ''},`;
  // Comptes de demo nommes comme le role (« Support technique ») : on evite le doublon.
  if (title && second.replace(/,$/, '').trim().toLowerCase() === title.toLowerCase()) {
    second = t('app.hello');
  }

  return (
    <header className={`mt-hero${left || actions ? '' : ' mt-hero--plain'}`}>
      {(left || actions) && (
        <div className="mt-hero__bar">
          <div>{left}</div>
          <div className="mt-hero__actions">{actions}</div>
        </div>
      )}
      <p className="mt-hero__date">{date}</p>
      <h1 className="mt-hero__title">
        {title || greeting}
        <span>{second}</span>
      </h1>
      {children}
    </header>
  );
}
