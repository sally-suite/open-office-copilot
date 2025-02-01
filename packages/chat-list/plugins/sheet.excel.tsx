
import Translate from './translate-v2';
import Function from './function';
import Intelligent from './intelligent'
import Sally from './sally-sheet'
import Vision from './vision'
import Python from './python'
import Vba from './vba'
import Jupyter from './jupyter'
import Eric from './eric'

export const plugins = [
  Sally,
  Function,
  Python,
  Vba,
  Vision,
  Translate,
  Intelligent,
  Jupyter,
  Eric
];

export const homeQuickReplies = (): any[] => {
  return [];
};
