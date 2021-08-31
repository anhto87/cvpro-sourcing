import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translation_vi from './locales/vi/translation.json';
import translation_en from './locales/en/translation.json';

const resources = {
    vi: {
        translation: translation_vi,
    },
    en: {
        translation: translation_en,
    },
};

i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    // keySeparator: false, // we do not use keys in form messages.welcome
    interpolation: {
        escapeValue: false, // react already safes from xss
    },
});

export default i18n;
