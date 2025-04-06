import { fromDom } from 'hast-util-from-dom';
import mermaid from 'mermaid';
import { extractCodeBlocks, replaceCodeBlocks } from './shared.js';
let counter = 0;
const remarkMermaid = (options) => (ast, file) => {
  const instances = extractCodeBlocks(ast);
  // Nothing to do. No need to do further processing.
  if (!instances.length) {
    return;
  }
  const results = instances.map(([node]) => {
    try {
      // @ts-expect-error The mermaid types are wrong.
      const result = mermaid.render(`remark-mermaid-${counter}`, node.value);
      counter += 1;
      return {
        success: true,
        result,
        code: node.value,
      };
    } catch (error) {
      return {
        success: false,
        result: error instanceof Error ? error.message : String(error),
        code: '',
      };
    }
  });
  const wrapper = document.createElement('div');
  replaceCodeBlocks(instances, results, options, file, (value) => {
    wrapper.innerHTML = value;
    return [value, fromDom(wrapper.firstChild)];
  });
};
export default remarkMermaid;
