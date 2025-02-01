// import the original type declarations
import 'i18next'
// import all namespaces (for the default language, only)
import base from './language/en-US/base.json'
import func from './language/en-US/function.json'
import formula from './language/en-US/formula.json'
import sheet from './language/en-US/sheet.json'
import chart from './language/en-US/chart.json'
import translate from './language/en-US/translate.json'
import vision from './language/en-US/vision.json'
import knowledge from './language/en-US/knowledge.json';
import coder from './language/en-US/knowledge.json';
import agent from './language/en-US/agent.json';
import tool from './language/en-US/tool.json';
import intelligent from './language/en-US/intelligent.json';
import prompt from './language/en-US/prompt';
import vba from './language/en-US/vba.json'
import python from './language/en-US/python.json'
import side from './language/en-US/side.json'
import image from './language/en-US/image.json'
import paper from './language/en-US/paper.json'
import latex from './language/en-US/latex.json'

import language from './language/en-US/language.json'

// import { languages } from './i18n'
// import enDoc from './language/en/doc.json'
// import enSheet from './language/en/sheet.json'
// import zh from './language/zh.json'

const languageModules = {
  base,
  function: func,
  sheet,
  chart,
  translate,
  vision,
  knowledge,
  intelligent,
  coder,
  agent,
  tool,
  formula,
  prompt,
  vba,
  python,
  side,
  image,
  paper,
  latex,
  language
};

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom namespace type, if you changed it
    defaultNS: 'base'
    // custom resources type
    resources: {
      [key in keyof typeof languageModules]: typeof languageModules[key];
    };
    // resources: {
    //   // [x: keyof typeof languages['en']]: keyof typeof languages['en']
    //   base: typeof base,
    //   function: typeof func,
    //   sheet: typeof sheet,
    //   chart: typeof chart,
    //   translate: typeof translate,
    //   vision: typeof vision,
    //   knowledge: typeof knowledge
    //   //   // doc: typeof enDoc,
    //   //   // sheet: typeof enSheet
    // }
    // resources: typeof languages
    // other
  }
}
