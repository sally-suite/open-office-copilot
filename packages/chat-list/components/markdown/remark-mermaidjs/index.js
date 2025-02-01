import { createRequire } from 'node:module';
import { fromParse5 } from 'hast-util-from-parse5';
import { parseFragment } from 'parse5';
import puppeteer from 'puppeteer-core';
import { optimize } from 'svgo';
import { extractCodeBlocks, replaceCodeBlocks } from './shared.js';
const mermaidScript = {
    path: createRequire(import.meta.url).resolve('mermaid/dist/mermaid.min.js'),
};
/**
 * @param options Options that may be used to tweak the output.
 */
const remarkMermaid = (options) => {
    if (!options?.launchOptions?.executablePath) {
        throw new Error('The option `launchOptions.executablePath` is required when using Node.js');
    }
    const { launchOptions, mermaidOptions, svgo } = options;
    let browserPromise;
    let count = 0;
    return async function transformer(ast, file) {
        const instances = extractCodeBlocks(ast);
        // Nothing to do. No need to start puppeteer in this case.
        if (!instances.length) {
            return;
        }
        count += 1;
        browserPromise ?? (browserPromise = puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            ...launchOptions,
        }));
        const browser = await browserPromise;
        let page;
        let results;
        try {
            page = await browser.newPage();
            await page.goto(String(new URL('index.html', import.meta.url)));
            await page.addScriptTag(mermaidScript);
            results = await page.evaluate(
            // We can’t calculate coverage on this function, as it’s run by Chrome, not Node.
            /* c8 ignore start */
            (codes, initOptions) => {
                if (initOptions) {
                    mermaid.initialize(initOptions);
                }
                return codes.map((code, index) => {
                    try {
                        return {
                            success: true,
                            result: mermaid.render(`remark-mermaid-${index}`, code),
                        };
                    }
                    catch (error) {
                        return {
                            success: false,
                            result: error instanceof Error ? error.message : String(error),
                        };
                    }
                });
            }, 
            /* C8 ignore stop */
            instances.map((instance) => instance[0].value), mermaidOptions);
        }
        finally {
            count -= 1;
            await page?.close();
        }
        replaceCodeBlocks(instances, results, options, file, (value) => {
            const processedValue = svgo === false ? value : optimize(value, svgo).data;
            return [processedValue, fromParse5(parseFragment(processedValue))];
        });
        if (!count) {
            browserPromise = undefined;
            await browser?.close();
        }
    };
};
export default remarkMermaid;
