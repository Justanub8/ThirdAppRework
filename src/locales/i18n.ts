import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vn from '~/locales/vn';
export const resources = {
  vn: vn,
} as const;
export const defaultNS = 'app';

i18n.use(initReactI18next).init({
  defaultNS,
  resources,
  nsSeparator: ':',
  fallbackLng: ['vn'],
  lng: 'vn',

  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: true,
  },
  load: 'languageOnly',
});

export default i18n;
