import { type BlockContent, type Code, type Root } from 'mdast';
import { type MermaidConfig } from 'mermaid';
import { type PuppeteerLaunchOptions } from 'puppeteer-core';
import { type Config } from 'svgo';
import { type Plugin } from 'unified';
import { type VFile } from 'vfile';
export interface RemarkMermaidOptions {
    /**
     * Launch options to pass to puppeteer.
     *
     * **Note**: This options is required in Node.js. In the browser this option is unused.
     */
    launchOptions?: PuppeteerLaunchOptions;
    /**
     * SVGO options used to minify the SVO output.
     *
     * Set to `false` explicitly to disable this.
     *
     * **Note**: This options is only supported in Node.js. In the browser this option is unused.
     *
     * @default defaultSVGOOptions
     */
    svgo?: Config | false;
    /**
     * The mermaid options to use.
     *
     * **Note**: This options is only supported in Node.js. In the browser this option is unused. If
     * you use this in a browser, call `mermaid.initialize()` manually.
     */
    mermaidOptions?: MermaidConfig;
    /**
     * Create a fallback node if processing of a mermaid diagram fails.
     *
     * @param node The mdast `code` node that couldn’t be rendered.
     * @param error The error message that was thrown.
     * @param file The file on which the error occurred.
     * @returns A fallback node to render instead of the invalid diagram. If nothing is returned, the
     * code block is removed
     */
    errorFallback?: (node: Code, error: string, file: VFile) => BlockContent | undefined | void;
}
export type RemarkMermaid = Plugin<[RemarkMermaidOptions?], Root>;
/**
 * @param options Options that may be used to tweak the output.
 */
declare const remarkMermaid: RemarkMermaid;
export default remarkMermaid;
