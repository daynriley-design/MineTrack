import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// PERF: seule la langue de fallback (fr) est bundlée au démarrage.
// Les 5 autres locales (~4-5KB chacune) sont chargées à la demande via
// dynamic import — évite ~25KB de JSON inutile au premier chargement
// pour un utilisateur qui reste en français.
import fr from './locales/fr/translation.json';

const LOCALE_LOADERS = {
  en: () => import('./locales/en/translation.json'),
  sw: () => import('./locales/sw/translation.json'),
  ln: () => import('./locales/ln/translation.json'),
  lu: () => import('./locales/lu/translation.json'),
  kg: () => import('./locales/kg/translation.json'),
};

const loadedLocales = new Set(['fr']);

export async function ensureLocaleLoaded(lng) {
  if (loadedLocales.has(lng) || !LOCALE_LOADERS[lng]) return;
  const mod = await LOCALE_LOADERS[lng]();
  i18n.addResourceBundle(lng, 'translation', mod.default, true, true);
  loadedLocales.add(lng);
}

// IMPORTANT : la détection de langue (plugin LanguageDetector) est asynchrone —
// lire i18n.resolvedLanguage juste après .init() est une course perdue d'avance
// (ça a réellement produit le bug : le <select> affichait "English" — correctement
// réactif à i18n.language — mais tous les t() retombaient en français parce que
// le bundle 'en' n'avait jamais été chargé). On écoute 'languageChanged' à la
// place : cet évènement se déclenche aussi bien pour la langue détectée au
// démarrage que pour un changement manuel, donc un seul mécanisme couvre les deux.
i18n.on('languageChanged', (lng) => {
  const code = (lng || '').slice(0, 2);
  // <html lang> suit la langue choisie (lecteurs d'ecran, traduction du navigateur).
  if (code && typeof document !== 'undefined') document.documentElement.lang = code;
  if (!code || code === 'fr' || loadedLocales.has(code) || !LOCALE_LOADERS[code]) return;
  ensureLocaleLoaded(code).then(() => {
    // addResourceBundle seul ne re-render pas les composants déjà montés ;
    // réémettre l'évènement force react-i18next à relire les clés maintenant chargées.
    i18n.emit('languageChanged', i18n.language);
  });
});

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
    },
    fallbackLng: 'fr',
    supportedLngs: ['en', 'fr', 'sw', 'ln', 'lu', 'kg'],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
