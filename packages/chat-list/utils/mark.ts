import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';
import remarkMermaid from 'remark-mermaidjs';
import rehypeKatex from 'rehype-katex';
import remarkStringify from 'remark-stringify';

import remarkGfm from 'remark-gfm';
import { unified } from 'unified';

import visit from 'unist-util-visit';
import { toHtml } from 'hast-util-to-html';
import type { Plugin } from 'unified';
import type { Root } from 'hast';
import { svgAsPng } from './img';



// SVG 转 PNG 插件
const svgToImagePlugin: Plugin<[], Root> = function () {
    return async function transformer(tree) {
        const promises: Promise<void>[] = [];

        visit(tree, 'element', (node: any) => {
            if (node.tagName === 'svg') {
                promises.push(
                    (async () => {
                        try {
                            console.log('node', node);
                            // 获取 SVG 字符串
                            const svgString = toHtml(node);
                            console.log('svgString', svgString);
                            const div = document.createElement('div');
                            div.style.position = 'fixed';
                            div.style.left = '-2000px';
                            div.style.top = '-2000px';
                            div.style.width = '800px';
                            div.innerHTML = svgString;
                            document.body.appendChild(div);
                            const { width, height, data } = await svgAsPng(div.childNodes[0] as SVGElement);
                            console.log(width, height, data);
                            document.body.removeChild(div);
                            // 修改节点为 img
                            node.tagName = 'img';
                            node.properties = {
                                ...node.properties,
                                src: data,
                                width: `${width}px`,
                                height: `${height}px`,
                                alt: 'Mermaid diagram'
                            };
                            node.children = [];
                        } catch (error) {
                            console.error('Error converting SVG to PNG:', error);
                        }
                    })()
                );
            }
        });

        await Promise.all(promises);
    };
};

// 保留 HTML 插件
const preserveHtmlPlugin: Plugin<[], Root> = function () {
    return function transformer(tree) {
        visit(tree, 'raw', (node: any) => {
            node.type = 'html';
        });
    };
};

// 构建处理器
export const buildHtml = async (text: string, isMathjax = false): Promise<string> => {
    if (isMathjax) {
        return await buildHtmlWithMathjax(text);
    }
    return await buildHtmlWithKatex(text);
    // const file = await unified()
    //     .use(remarkParse)
    //     .use(remarkGfm)
    //     .use(remarkMath)
    //     .use(remarkMermaid)
    //     .use(preserveHtmlPlugin)
    //     .use(remarkRehype, {
    //         allowDangerousHtml: true,
    //         allowDangerousCharacters: true
    //     })
    //     .use(rehypeKatex)
    //     .use(svgToImagePlugin)
    //     .use(rehypeStringify, {
    //         allowDangerousHtml: true,
    //         allowDangerousCharacters: true
    //     })
    //     .process(text);

    // return String(file);
};

const buildHtmlWithKatex = async (text: string): Promise<string> => {

    const file = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkMermaid)
        .use(preserveHtmlPlugin)
        .use(remarkRehype, {
            allowDangerousHtml: true,
            allowDangerousCharacters: true
        })
        .use(rehypeKatex)
        .use(svgToImagePlugin)
        .use(rehypeStringify, {
            allowDangerousHtml: true,
            allowDangerousCharacters: true
        })
        .process(text);

    return String(file);
};

const buildHtmlWithMathjax = async (text: string) => {
    const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkMermaid)
        .use(remarkRehype, {
            allowDangerousHtml: true,
        })
        .use(rehypeMathjax)
        .use(svgToImagePlugin)
        .use(rehypeStringify);

    const hastNode = await processor.process(text);
    const html = hastNode.value as string;
    return html;
};