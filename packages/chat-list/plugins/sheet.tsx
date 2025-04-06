import Translate from './translate-v2';
import Function from './function';
import Sally from './sally-sheet';
import Vision from './vision';
import Coder from './coder';
import Python from './python';
import Jupyter from './jupyter';

export const plugins = [
  Sally,
  Function,
  Coder,
  Python,
  Jupyter,
  Vision,
  Translate,
];

export const homeQuickReplies = (): any[] => {
  return [];
};
