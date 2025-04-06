export default rehypeMathJaxSvg;
/**
 * Render elements with a `language-math` (or `math-display`, `math-inline`)
 * class with MathJax using SVG.
 *
 * @param [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
declare const rehypeMathJaxSvg: (options?: Readonly<import("./create-plugin.js").Options> | null | undefined) => (tree: import("hast").Root) => undefined;
