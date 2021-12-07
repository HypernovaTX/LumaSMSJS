import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import languages from 'Locales/';

i18next.use(initReactI18next).init({
  resources: languages,
  lng: 'english',
  fallbackLng: 'english',
});

export default i18next;
