/**
 * Create a renderer.
 *
 * @param {Options} options
 *   Configuration.
 * @param {OutputJax} output
 *   Output jax.
 * @returns {Renderer}
 *   Rendeder.
 */
export function createRenderer(options: Options, output: import("mathjax-full/js/core/OutputJax.js").OutputJax<HTMLElement, Text, Document>): Renderer;
export type Element = import('hast').Element;
export type MathDocument = import('mathjax-full/js/core/MathDocument.js').MathDocument<HTMLElement, Text, Document>;
export type OutputJax = import('mathjax-full/js/core/OutputJax.js').OutputJax<HTMLElement, Text, Document>;
export type Options = import('./create-plugin.js').Options;
export type Renderer = import('./create-plugin.js').Renderer;
