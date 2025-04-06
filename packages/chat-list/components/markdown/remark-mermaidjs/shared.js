import { visit } from 'unist-util-visit';
/**
 * Extract Mermaid code blocks from the AST.
 *
 * @param ast The markdown AST to extract code blocks from.
 * @returns A list of tuples that represent the code blocks.
 */
export function extractCodeBlocks(ast) {
  const instances = [];
  visit(ast, { type: 'code', lang: 'mermaid' }, (node, index, parent) => {
    instances.push([node, index, parent]);
  });
  return instances;
}
/**
 * Replace the code blocks with rendered diagrams.
 *
 * @param instances The code block instances to replace.
 * @param results The diagram rendering results.
 * @param options The `remark-mermaidjs` options as given by the user.
 * @param file The file to report errors on.
 * @param processDiagram Postprocess a diagram.
 */
export function replaceCodeBlocks(
  instances,
  results,
  options,
  file,
  processDiagram
) {
  for (const [i, [node, index, parent]] of instances.entries()) {
    const result = results[i];
    if (result.success) {
      const [value, hChild] = processDiagram(result.result, i);
      hChild.properties['title'] = 'mermaid-graph';
      hChild.properties['description'] = result.code;
      parent.children[index] = {
        type: 'paragraph',
        children: [{ type: 'html', value }],
        data: { hChildren: [hChild] },
      };
    } else if (options?.errorFallback) {
      const fallback = options.errorFallback(node, result.result, file);
      if (fallback) {
        parent.children[index] = fallback;
      } else {
        parent.children.splice(index, 1);
      }
    } else {
      file.fail(result.result, node, 'remark-mermaidjs:remark-mermaidjs');
    }
  }
}
