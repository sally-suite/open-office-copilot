export default rehypeMathJaxCHtml;
/**
 * Render elements with a `language-math` (or `math-display`, `math-inline`)
 * class with MathJax using CHTML.
 *
 * @param options
 *   Configuration (`options.chtml.fontURL` is required).
 * @returns
 *   Transform.
 */
declare const rehypeMathJaxCHtml: (options?: Readonly<import("./create-plugin.js").Options> | null | undefined) => (tree: import("hast").Root) => undefined;
