/**
 * Create a plugin.
 *
 * @param {CreateRenderer} createRenderer
 *   Create a renderer.
 * @returns
 *   Plugin.
 */
export function createPlugin(createRenderer: CreateRenderer): (options?: Readonly<Options> | null | undefined) => (tree: Root) => undefined;
export type Element = import('hast').Element;
export type ElementContent = import('hast').ElementContent;
export type Root = import('hast').Root;
/**
 * Create a renderer.
 */
export type CreateRenderer = (options: Readonly<Options>) => Renderer;
/**
 * Format an error.
 */
export type FormatError = (jax: any, error: any) => string;
/**
 * Configuration for input tex math.
 * <http://docs.mathjax.org/en/latest/options/input/tex.html#the-configuration-block>
 */
export type InputTexOptions = {
    /**
     * URL for use with links to tags, when there is a `<base>` tag in effect
     * (optional).
     */
    baseURL?: string | null | undefined;
    /**
     * Pattern for recognizing numbers (optional).
     */
    digits?: RegExp | null | undefined;
    /**
     * Start/end delimiter pairs for display math (optional).
     */
    displayMath?: ReadonlyArray<MathNotation> | null | undefined;
    /**
     * Function called when TeX syntax errors occur (optional).
     */
    formatError?: FormatError | null | undefined;
    /**
     * Start/end delimiter pairs for in-line math (optional).
     */
    inlineMath?: ReadonlyArray<MathNotation> | null | undefined;
    /**
     * Max size for the internal TeX string (5K) (optional).
     */
    maxBuffer?: number | null | undefined;
    /**
     * Max number of macro substitutions per expression (optional).
     */
    maxMacros?: number | null | undefined;
    /**
     * Extensions to use (optional).
     */
    packages?: ReadonlyArray<string> | null | undefined;
    /**
     * Process `\begin{xxx}...\end{xxx}` outside math mode (optional).
     */
    processEnvironments?: boolean | null | undefined;
    /**
     * Use `\$` to produce a literal dollar sign (optional).
     */
    processEscapes?: boolean | null | undefined;
    /**
     * Process `\ref{...}` outside of math mode (optional).
     */
    processRefs?: boolean | null | undefined;
    /**
     * Amount to indent tags (optional).
     */
    tagIndent?: string | null | undefined;
    /**
     * Side for `\tag` macros (optional).
     */
    tagSide?: 'left' | 'right' | null | undefined;
    /**
     * Optional.
     */
    tags?: 'all' | 'ams' | 'none' | null | undefined;
    /**
     * Use label name rather than tag for ids (optional).
     */
    useLabelIds?: boolean | null | undefined;
};
/**
 * Markers to use for math.
 * See: <http://docs.mathjax.org/en/latest/options/input/tex.html#the-configuration-block>
 */
export type MathNotation = [string, string];
/**
 * Configuration.
 *
 * ###### Notes
 *
 * When using `rehype-mathjax/browser`, only `options.tex.displayMath` and
 * `options.tex.inlineMath` are used.
 * That plugin will use the first delimiter pair in those fields to wrap
 * math.
 * Then you need to load MathJax yourself on the client and start it with the
 * same markers.
 * You can pass other options on the client.
 *
 * When using `rehype-mathjax/chtml`, `options.chtml.fontURL` is required.
 * For example:
 *
 * ```js
 * // …
 * .use(rehypeMathjaxChtml, {
 *   chtml: {
 *     fontURL: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2'
 *   }
 * })
 * // …
 * ```
 */
export type Options = {
    /**
     * Configuration for the output, when CHTML (optional).
     */
    chtml?: Readonly<OutputCHtmlOptions> | null | undefined;
    /**
     * Configuration for the output, when SVG (optional).
     */
    svg?: Readonly<OutputSvgOptions> | null | undefined;
    /**
     * Configuration for the input TeX (optional).
     */
    tex?: Readonly<InputTexOptions> | null | undefined;
};
/**
 * Configuration for output CHTML.
 * <http://docs.mathjax.org/en/latest/options/output/chtml.html#the-configuration-block>
 */
export type OutputCHtmlOptions = {
    /**
     * `true` means only produce CSS that is used in the processed equations (optional).
     */
    adaptiveCSS?: boolean | null | undefined;
    /**
     * Default for indentalign when set to `'auto'` (optional).
     */
    displayAlign?: 'center' | 'left' | 'right' | null | undefined;
    /**
     * Default for indentshift when set to `'auto'` (optional).
     */
    displayIndent?: string | null | undefined;
    /**
     * Default size of ex in em units (optional).
     */
    exFactor?: number | null | undefined;
    /**
     *   The URL where the fonts are found (**required**).
     */
    fontURL: string;
    /**
     * `true` to match ex-height of surrounding font (optional).
     */
    matchFontHeight?: boolean | null | undefined;
    /**
     * `true` for MathML spacing rules, false for TeX rules (optional).
     */
    mathmlSpacing?: boolean | null | undefined;
    /**
     * `true` to make merror text use surrounding font (optional).
     */
    merrorInheritFont?: boolean | null | undefined;
    /**
     * Smallest scaling factor to use (optional).
     */
    minScale?: number | null | undefined;
    /**
     * `true` to make mtext elements use surrounding font (optional).
     */
    mtextInheritFont?: boolean | null | undefined;
    /**
     * Global scaling factor for all expressions (optional).
     */
    scale?: number | null | undefined;
    /**
     * RFDa and other attributes NOT to copy to the output (optional).
     */
    skipAttributes?: Readonly<Record<string, boolean>> | null | undefined;
};
/**
 * Configuration for output SVG.
 * <http://docs.mathjax.org/en/latest/options/output/svg.html#the-configuration-block>
 */
export type OutputSvgOptions = {
    /**
     * Default for indentalign when set to `'auto'` (optional).
     */
    displayAlign?: 'center' | 'left' | 'right' | null | undefined;
    /**
     * Default for indentshift when set to `'auto'` (optional).
     */
    displayIndent?: string | null | undefined;
    /**
     * Default size of ex in em units (optional).
     */
    exFactor?: number | null | undefined;
    /**
     * Or `'global'` or `'none'` (optional).
     */
    fontCache?: 'global' | 'local' | 'none' | null | undefined;
    /**
     * Insert `<title>` tags with speech content (optional).
     */
    internalSpeechTitles?: boolean | null | undefined;
    /**
     * ID to use for local font cache, for single equation processing (optional).
     */
    localID?: string | null | undefined;
    /**
     * `true` for MathML spacing rules, `false` for TeX rules (optional).
     */
    mathmlSpacing?: boolean | null | undefined;
    /**
     * `true` to make merror text use surrounding font (optional).
     */
    merrorInheritFont?: boolean | null | undefined;
    /**
     * Smallest scaling factor to use (optional).
     */
    minScale?: number | null | undefined;
    /**
     * `true` to make mtext elements use surrounding font (optional).
     */
    mtextInheritFont?: boolean | null | undefined;
    /**
     * Global scaling factor for all expressions (optional).
     */
    scale?: number | null | undefined;
    /**
     * RFDa and other attributes *not* to copy to the output (optional).
     */
    skipAttributes?: Readonly<Record<string, boolean>> | null | undefined;
    /**
     * Initial ID number to use for `aria-labeledby` titles (optional).
     */
    titleID?: number | null | undefined;
};
/**
 * Render a math node.
 */
export type Render = (value: string, options: Readonly<RenderOptions>) => Array<ElementContent>;
/**
 * Configuration.
 */
export type RenderOptions = {
    /**
     *   Whether to render display math.
     */
    display: boolean;
};
/**
 * Renderer.
 */
export type Renderer = {
    /**
     *   Render a math node.
     */
    render: Render;
    /**
     * Render a style sheet (optional).
     */
    styleSheet?: StyleSheet | null | undefined;
};
/**
 * Render a style sheet.
 */
export type StyleSheet = () => Element;
