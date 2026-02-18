import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import frCommon from './locales/fr/common.json';
import enCommon from './locales/en/common.json';
import * as Localization from 'expo-localization';

void i18n.use(initReactI18next).init({
  resources: {
    fr: { common: frCommon },
    en: { common: enCommon },
  },
  lng: Localization.getLocales()[0].languageCode ?? 'fr',
  fallbackLng: 'en',
  ns: ['common'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
