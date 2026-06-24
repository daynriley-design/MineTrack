import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './locales/fr/translation.json';
import ln from './locales/ln/translation.json';
import lu from './locales/lu/translation.json';
import kg from './locales/kg/translation.json';
import sw from './locales/sw/translation.json';

import en from './locales/en/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ln: { translation: ln },
      lu: { translation: lu },
      kg: { translation: kg },
      sw: { translation: sw },
    },
    fallbackLng: 'fr',
    supportedLngs: ['en', 'fr', 'sw', 'ln', 'lu', 'kg'],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
