
import language from './language'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
export const languages = language;
i18n
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: languages,
    // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option
    // lng: 'en',
    ns: Object.keys(language['en-US']),
    defaultNS: ['base'],
    fallbackLng: 'en-US',
    preload: ['en-US', 'zh-CN', 'es'],
    interpolation: {
      escapeValue: false // react already safes from xss
    },
    detection: {
      // order and from where user language should be detected
      order: [
        'localStorage',
        'sessionStorage',
        'querystring',
        'navigator',
        'htmlTag',
        'cookie',
        'path',
        'subdomain'
      ],

      // keys or params to lookup language from
      lookupQuerystring: 'lang',
      lookupCookie: 'lang',
      lookupLocalStorage: 'lang',
      lookupSessionStorage: 'lang',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,

      // cache user language on
      caches: ['localStorage', 'sessionStorage', 'cookie'],
      excludeCacheFor: ['cimode'], // languages to not persist (cookie, localStorage)

      // optional expire and domain for set cookie
      // cookieMinutes: 10,
      // cookieDomain: 'myDomain',

      // optional htmlTag with lang attribute, the default is:
      htmlTag: document.documentElement

      // optional set cookie options, reference:[MDN Set-Cookie docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
      // cookieOptions: { path: '/', sameSite: 'strict' }
    }
  })

document.documentElement.lang = i18n.language

export default i18n
