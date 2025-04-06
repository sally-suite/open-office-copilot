
import katex from 'katex';
import { marked } from 'marked'
import { mml2omml } from "./mathml2omml";
import { Footnote } from 'chat-list/types/api/doc';
import { buildHtml } from 'chat-list/utils/mark';
/**
 * 将LaTeX公式转换为MathML
 * @param {string} latex LaTeX公式
 * @returns {string} MathML字符串
 */
function latexToMathML(latex: string, isDisplayMode: boolean = false) {
    try {
        const result = katex.renderToString(latex, {
            throwOnError: true,
            output: 'mathml',
            displayMode: isDisplayMode, // 添加 displayMode 配置
            strict: false              // 可选：使解析更宽松
        });
        return result.replace(/^<span class="katex">/, '').replace(/<\/span>$/, '');
    } catch (error) {
        console.error('LaTeX conversion error:', error);
        return `[Error converting equation: ${latex}]`;
    }
}

/**
 * 将MathML转换为Word OOXML公式
 * @param {string} mathML MathML字符串
 * @returns {string} Word OOXML字符串
 */
function mathMLToWordOOXML(mathML: string): string {
    // 移除XML声明和DOCTYPE
    mathML = mathML.replace(/<\?xml[^>]*\?>/, "")
        .replace(/<!DOCTYPE[^>]*>/, "");
    const ooxml = mml2omml(mathML);
    return ooxml as unknown as string;
    // return '';
}

/**
 * 处理文本中的数学公式
 * @param {string} text Markdown文本
 * @returns {string} 处理后的文本
 */
// function processEquations(text: string) {
//     const equations: any[] = [];

//     // 处理块级公式 ($$...$$)
//     text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match: any, latex: string) => {
//         const mathML = latexToMathML(latex.trim(), true);
//         const ooxml = mathMLToWordOOXML(mathML);

//         equations.push({
//             type: 'block',
//             ooxml,
//             placeholder: `  <p math="true">EQUATION_${equations.length}</p>`
//         });
//         return `  <p math="true">EQUATION_${equations.length - 1}</p>`;
//     });

//     // 处理行内公式 ($...$)
//     text = text.replace(/\$([^\$\n]*?)\$/g, (match: any, content: string) => {
//         // text = text.replace(
//         //     /\$((?:\d+(?:[a-zA-Z\\×÷±∑∏∫√α-ωΑ-Ω\+\-\*\/\^_=<>≠≤≥≈]|\{|$$|\$$a-zA-Z]+)|[a-zA-Z\\×÷±∑∏∫√α-ωΑ-Ω\+\-\*\/\^_=<>≠≤≥≈$$$$$$$$\{\}])[^\$]*?)\$/g
//         //     ,
//         //     (match: any, content: string) => {
//         // text = text.replace(/\$([^\$\n]+?)\$/g, (match, content) => {
//         // // 检查是否是货币格式
//         // if (/^\s*\d[\d,\.\s]*$/.test(content)) {
//         //     // 是货币格式，直接返回原文本
//         //     return match;
//         // }

//         // // 检查是否包含数学符号或字母
//         // if (!/[a-zA-Z\\{}()$$$$+\-*\/^_=<>]/.test(content)) {
//         //     // 不包含数学相关字符，可能是货币，返回原文本
//         //     return match;
//         // }

//         if (/^\s*\d+(,\d{3})*(\.\d+)?\s*$/.test(content)) {
//             return match;  // 是货币格式，保持原样
//         }

//         const mathML = latexToMathML(content.trim(), false);
//         const ooxml = mathMLToWordOOXML(mathML);
//         equations.push({
//             type: 'inline',
//             ooxml,
//             placeholder: `<span math="true">EQUATION_${equations.length}</span>`
//         });
//         return `<span math="true">EQUATION_${equations.length - 1}</span>`;
//     });



//     return { text, equations };
// }

/**
 * 处理文本中的数学公式，同时正确处理货币符号
 * @param {string} text Markdown文本
 * @returns {string} 处理后的文本
 */
function processEquations(text: string) {
    const equations: any[] = [];

    // 处理块级公式 ($$...$$)
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match: any, latex: string) => {
        const mathML = latexToMathML(latex.trim(), true);
        const ooxml = mathMLToWordOOXML(mathML);

        equations.push({
            type: 'block',
            ooxml,
            placeholder: `  <p math="true">EQUATION_${equations.length}</p>`
        });
        return `  <p math="true">EQUATION_${equations.length - 1}</p>`;
    });

    // 处理行内公式 ($...$)，但排除货币格式
    text = text.replace(/\$([^$\n]*?)\$/g, (match: string, content: string) => {
        // 检查是否是表格中的货币格式 ($number|$number)
        if (/\$\d+(?:\.\d+)?(?:\|\$\d+(?:\.\d+)?)+/.test(match)) {
            return match;
        }

        // 检查是否是普通货币格式
        if (/^\$\s*\d+(,\d{3})*(\.\d+)?\s*$/.test(match)) {
            return match;
        }

        // 检查是否确实包含数学表达式的特征
        const hasMathFeatures = /[a-zA-Z\\×÷±∑∏∫√α-ωΑ-Ω\+\-\*\/\^_=<>≠≤≥≈\{\}]/.test(content) ||
            /\d+[a-zA-Z]/.test(content) ||  // 数字后跟字母
            /[a-zA-Z]\d+/.test(content);     // 字母后跟数字

        if (!hasMathFeatures) {
            return match;  // 不是数学表达式，保持原样
        }

        const mathML = latexToMathML(content.trim(), false);
        const ooxml = mathMLToWordOOXML(mathML);
        equations.push({
            type: 'inline',
            ooxml,
            placeholder: `<span math="true">EQUATION_${equations.length}</span>`
        });
        return `<span math="true">EQUATION_${equations.length - 1}</span>`;
    });

    return { text, equations };
}

/**
 * 辅助函数：判断是否是表格单元格中的货币格式
 * @param {string} text 要检查的文本
 * @returns {boolean} 是否是表格中的货币格式
 */
function isTableCellCurrency(text: string): boolean {
    // 匹配表格单元格中的货币格式：$13 或 $13.45 或 $13,456.78
    return /^\$\s*\d+(,\d{3})*(\.\d+)?\s*(?:\||\s*$)/.test(text);
}

// function processEquations(text: string) {
//     const equations: any[] = [];

//     // 分离表格和非表格内容
//     const parts = text.split(/((?:^|\n)\|.*\|(?:\n|$))/g);
//     console.log(parts)
//     const processedParts = parts.map(part => {
//         if (part.trim().startsWith('|') && part.trim().endsWith('|')) {
//             // 这是表格内容，保持货币符号不变
//             return part;
//         } else {
//             // 非表格内容，处理数学公式
//             return processMathEquations(part, equations);
//         }
//     });

//     return { text: processedParts.join(''), equations };
// }

// function processMathEquations(text: string, equations: any[]) {

//     // 处理块级公式 ($$...$$)
//     text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match: any, latex: string) => {
//         const mathML = latexToMathML(latex.trim(), true);
//         const ooxml = mathMLToWordOOXML(mathML);

//         equations.push({
//             type: 'block',
//             ooxml,
//             placeholder: `  <p math="true">EQUATION_${equations.length}</p>`
//         });
//         return `  <p math="true">EQUATION_${equations.length - 1}</p>`;
//     });

//     // 处理行内公式 ($...$)
//     text = text.replace(/\$([^\$\n]*?)\$/g, (match: any, latex: string) => {
//         // text = text.replace(/\$([a-zA-Z\\\(\)\[\]\{\}+\-*/^_=<>,][\s\S]*?)\$/g, (match: any, latex: string) => {

//         const mathML = latexToMathML(latex.trim(), false);
//         const ooxml = mathMLToWordOOXML(mathML);
//         equations.push({
//             type: 'inline',
//             ooxml,
//             placeholder: `<span math="true">EQUATION_${equations.length}</span>`
//         });
//         return `<span math="true">EQUATION_${equations.length - 1}</span>`;
//     });

//     return text;
// }

function processHeading(node: HTMLElement) {
    const level = parseInt(node.tagName[1]);
    const fontSize = 20 - (level - 1) * 2; // H1: 20pt, H2: 18pt, H3: 16pt, etc.
    const color = level <= 2 ? "2F5496" : "1F3763"; // Darker blue for H1 and H2, lighter for others
    const spacing = 240 + (6 - level) * 60; // More spacing for higher level headings
    const escapedText = escapeXmlSpecialChars(node.textContent);
    return `
        <w:p> </w:p>
        <w:p>
            <w:pPr>
                <w:pStyle w:val="Heading${level}"/>
                <w:spacing w:before="${spacing}" w:after="${spacing}"/>
                <w:rPr>
                    <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                    <w:sz w:val="${fontSize * 2}"/>
                    <w:szCs w:val="${fontSize * 2}"/>
                    <w:color w:val="${color}"/>
                </w:rPr>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                    <w:sz w:val="${fontSize * 2}"/>
                    <w:szCs w:val="${fontSize * 2}"/>
                    <w:color w:val="${color}"/>
                </w:rPr>
                <w:t>${escapedText}</w:t>
            </w:r>
        </w:p>
        <w:p> </w:p>
    `;
}

/**
 * 转换HTML为OOXML
 * @param {string} html HTML字符串
 * @returns {string} OOXML字符串
 */
function htmlToOOXML(html: string = '', equations: any[]): { html: string, ooxml: string }[] {
    // 创建临时DOM元素来解析HTML
    const div = document.createElement('div');
    div.innerHTML = html;
    const hyperlinks: Array<{ id: string, url: string }> = [];

    let ooxml = '';
    // Table processing function
    function processTable(node: HTMLElement): string {
        const rows = Array.from(node.getElementsByTagName('tr'));
        const columnCount = Math.max(...rows.map(row =>
            Array.from(row.children).length
        ));

        // Calculate table width (distribute evenly)
        const cellWidth = Math.floor(9000 / columnCount); // 9000 twips = ~15.75cm

        return `
        <w:p/>
        <w:tbl>
            <w:tblPr>
                <w:tblStyle w:val="TableGrid"/>
                <w:tblW w:w="5000" w:type="pct"/>
                <w:tblBorders>
                    <w:top w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
                    <w:left w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
                    <w:bottom w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
                    <w:right w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
                    <w:insideH w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
                    <w:insideV w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
                </w:tblBorders>
                <w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/>
                <w:shd w:val="clear" w:color="auto" w:fill="D9EAD3"/>
            </w:tblPr>
            <w:tblGrid>
                ${Array(columnCount).fill(`<w:gridCol w:w="${cellWidth}"/>`).join('')}
            </w:tblGrid>
            ${rows.map((row, rowIndex) => processTableRow(row as HTMLElement, rowIndex === 0)).join('')}
        </w:tbl>
        `;
    }

    function processTableRow(row: HTMLElement, isHeader: boolean): string {
        const cells = Array.from(row.children);
        return `
        <w:tr>
            ${cells.map(cell => processTableCell(cell as HTMLElement, isHeader)).join('')}
        </w:tr>
        `;
    }

    // function processTableCell(cell: HTMLElement, isHeader: boolean): string {
    //     const escapedText = escapeXmlSpecialChars((cell.textContent || ''));
    //     const cellStyle = isHeader
    //         ? `<w:tcPr>
    //            <w:shd w:val="clear" w:fill="EEEEEE"/>
    //            <w:vAlign w:val="center"/>
    //            <w:tcMar>
    //                <w:top w:w="100" w:type="dxa"/>
    //                <w:left w:w="100" w:type="dxa"/>
    //                <w:bottom w:w="100" w:type="dxa"/>
    //                <w:right w:w="100" w:type="dxa"/>
    //            </w:tcMar>
    //            <w:tcW w:w="1000" w:type="dxa"/>
    //        </w:tcPr>` // Header cell with center vertical alignment and padding
    //         : `<w:tcPr>
    //            <w:shd w:val="clear" w:fill="FFFFFF"/>
    //            <w:tcMar>
    //                <w:top w:w="100" w:type="dxa"/>
    //                <w:left w:w="100" w:type="dxa"/>
    //                <w:bottom w:w="100" w:type="dxa"/>
    //                <w:right w:w="100" w:type="dxa"/>
    //            </w:tcMar>
    //            <w:tcW w:w="1000" w:type="dxa"/>
    //        </w:tcPr>`; // Body cell background color with padding

    //     return `
    //     <w:tc>
    //         ${cellStyle}
    //         <w:p>
    //             <w:pPr>
    //                 <w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>
    //             </w:pPr>
    //             <w:r>
    //                 <w:rPr>${isHeader ? "<w:b/>" : ""}</w:rPr>
    //                 <w:t>${escapedText}</w:t>
    //             </w:r>
    //         </w:p>
    //     </w:tc>
    //     `;
    // }

    function processTableCell(cell: HTMLElement, isHeader: boolean): string {
        // Instead of directly using textContent, we need to process the cell content
        // to handle potential equations and other formatting
        const cellStyle = isHeader
            ? `<w:tcPr>
               <w:shd w:val="clear" w:fill="EEEEEE"/>
               <w:vAlign w:val="center"/>
               <w:tcMar>
                   <w:top w:w="100" w:type="dxa"/>
                   <w:left w:w="100" w:type="dxa"/>
                   <w:bottom w:w="100" w:type="dxa"/>
                   <w:right w:w="100" w:type="dxa"/>
               </w:tcMar>
               <w:tcW w:w="1000" w:type="dxa"/>
           </w:tcPr>`
            : `<w:tcPr>
               <w:shd w:val="clear" w:fill="FFFFFF"/>
               <w:tcMar>
                   <w:top w:w="100" w:type="dxa"/>
                   <w:left w:w="100" w:type="dxa"/>
                   <w:bottom w:w="100" w:type="dxa"/>
                   <w:right w:w="100" w:type="dxa"/>
               </w:tcMar>
               <w:tcW w:w="1000" w:type="dxa"/>
           </w:tcPr>`;

        // Process cell content to handle equations and other formatting
        const cellContent = Array.from(cell.childNodes)
            .map((node: Node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent || '';
                    return text.trim() ? `<w:r><w:t>${escapeXmlSpecialChars(text)}</w:t></w:r>` : '';
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as HTMLElement;
                    if (element.tagName.toLowerCase() === 'span' && element.getAttribute('math')) {
                        // Handle equation
                        const index = parseInt(element.textContent?.replace('EQUATION_', '') || '0');
                        if (equations[index]) {
                            return `<w:r>${equations[index].ooxml}</w:r>`;
                        }
                    }
                    // Handle other element types if needed
                    return processNode(element as HTMLElement, true);
                }
                return '';
            })
            .join('');

        return `
        <w:tc>
            ${cellStyle}
            <w:p>
                <w:pPr>
                    <w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>
                    ${isHeader ? '<w:jc w:val="center"/>' : ''}
                </w:pPr>
                ${cellContent}
            </w:p>
        </w:tc>
        `;
    }

    function processListItem(li: HTMLElement, isOrdered: boolean, level: number, listId: number): string {
        let result = '';

        // 处理当前列表项的直接内容
        const currentItemContent = Array.from(li.childNodes)
            .filter(child => child.nodeType === Node.TEXT_NODE || (child.nodeType === Node.ELEMENT_NODE && !['ul', 'ol'].includes(child.nodeName.toLowerCase())))
            .map(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    const escapedText = escapeXmlSpecialChars(child.textContent);
                    return (child.textContent || '').trim() ? `<w:r><w:t>${(escapedText || '').trim()}</w:t></w:r>` : '';
                } else {
                    return processNode(child as HTMLElement, true);
                }
            })
            .join('');

        const listStyleType = isOrdered ? 'ListNumber' : 'ListBullet';

        // 为当前列表项创建段落
        result += `
            <w:p>
                <w:pPr>
                    <w:pStyle w:val="${listStyleType}"/>
                    <w:numPr>
                        <w:ilvl w:val="${level}"/>
                        <w:numId w:val="${listId}"/>
                    </w:numPr>
                     <w:ind w:left="${(level + 1) * 360}" w:hanging="360"/>
                </w:pPr>
                ${currentItemContent}
            </w:p>
           
        `;

        // 处理嵌套列表
        const nestedLists = Array.from(li.children).filter(child => ['ul', 'ol'].includes(child.tagName.toLowerCase()));
        for (const nestedList of nestedLists) {
            const isNestedOrdered = nestedList.tagName.toLowerCase() === 'ol';
            const nestedItems = Array.from(nestedList.children);
            for (const nestedItem of nestedItems) {
                result += processListItem(nestedItem as HTMLElement, isNestedOrdered, level + 1, listId);
            }
        }

        return result;
    }


    // 递归处理DOM节点
    function processNode(node: HTMLElement, inline: boolean, level = 0, listId = 0): string {
        // console.log(node.tagName)
        switch (node.nodeType) {
            case Node.ELEMENT_NODE:
                switch (node.tagName.toLowerCase()) {
                    case 'p':
                        // 获取属性
                        const isMath = node.getAttribute('math');
                        if (isMath) {
                            const index = parseInt((node.textContent || '').replace('EQUATION_', ''));
                            if (equations[index]) {
                                if (inline) {
                                    return `<w:br/><w:r>${equations[index].ooxml}</w:r><w:br/>`;
                                }
                                return `
                                <w:p>
                                    <w:r>${equations[index].ooxml}</w:r>
                                </w:p>
                                <w:p>
                                </w:p>
                                `;
                            }
                        }
                        if (inline) {
                            return Array.from(node.childNodes).map((child: HTMLElement) => processNode(child, inline)).join('');
                        }
                        return `
                            <w:p>
                                ${Array.from(node.childNodes).map((child: HTMLElement) => processNode(child, true)).join('')}
                            </w:p>
                            <w:p>
                            </w:p>
                            `;
                    case 'h1':
                    case 'h2':
                    case 'h3':
                    case 'h4':
                    case 'h5':
                    case 'h6':
                        return processHeading(node);
                    // console.log(node.tagName)
                    // const level = node.tagName[1];
                    // return `<w:p><w:pPr><w:pStyle w:val="Heading${level}"/></w:pPr><w:r><w:t>${node.textContent}</w:t></w:r></w:p>`;
                    case 'strong':
                    case 'b':
                        // 修改这里，使用map处理子节点而不是直接使用textContent
                        return `<w:r><w:rPr><w:b/></w:rPr>${Array.from(node.childNodes).map((child: HTMLElement) => processNode(child, false)).join('')}</w:r>`;
                    case 'em':
                    case 'i':
                        // return `<w:r><w:rPr><w:i/></w:rPr><w:t>${node.textContent}</w:t></w:r>`;
                        return `<w:r><w:rPr><w:i/></w:rPr>${Array.from(node.childNodes).map((child: HTMLElement) => processNode(child, false)).join('')}</w:r>`;
                    case 'ul':
                    case 'ol':
                        const lsId = Math.floor(Date.now() + Math.random() * 1000);
                        const isOrdered = node.tagName.toLowerCase() === 'ol';
                        return Array.from(node.children)
                            .map(li => processListItem(li as HTMLElement, isOrdered, level, lsId))
                            .join('') + " <w:p> </w:p>"
                    // case 'li':
                    //     return processListItem(node, false, level, listId);
                    // case 'ul':
                    // case 'ol':

                    //     const items = Array.from(node.children).map((li, i) => {
                    //         console.log(node.tagName)
                    //         return `<w:r><w:t>${node.tagName.toLowerCase() === 'ol' ? `${i + 1}.` : '•'} ${processNode(li)}</w:t></w:r>`;
                    //     }).join('</w:p><w:p>');
                    //     return `<w:p>${items}</w:p>`;
                    case 'span':
                        const isInlineMath = node.getAttribute('math');
                        if (isInlineMath) {
                            const index = parseInt(node.textContent.replace('EQUATION_', ''));
                            if (equations[index]) {
                                return `<w:r>${equations[index].ooxml}</w:r>`;
                            }
                        }
                        const escapedSpanText = escapeXmlSpecialChars(node.textContent);
                        return `<w:r><w:t>${escapedSpanText}</w:t></w:r>`;
                    case 'br':
                        return `<w:br/>`;
                    case 'code':
                        const escapedCodeText = escapeXmlSpecialChars(node.textContent);
                        if (inline) {
                            return `<w:r>
                                <w:rPr>
                                    <w:shd w:val="clear" w:color="auto" w:fill="D3D3D3"/>
                                </w:rPr>
                                <w:t xml:space="preserve"> ${escapedCodeText} </w:t>
                            </w:r>`;
                            // return `<w:r><w:rPr><w:rStyle w:val="Code"/></w:rPr><w:t> ${node.textContent} </w:t></w:r>`
                        }
                        return `<w:p><w:r><w:rPr><w:rStyle w:val="Code"/></w:rPr><w:t>${escapedCodeText}</w:t></w:r></w:p>`;
                    case 'table':
                        return processTable(node);
                    case 'th':
                    case 'td':
                        return node.textContent || '';
                    case 'a':
                        const href = node.getAttribute('href');
                        const escapedLinkText = escapeXmlSpecialChars(node.textContent);
                        if (href) {
                            // 生成唯一的关系ID
                            const rId = `rId${Math.floor(Date.now() * Math.random())}`;
                            hyperlinks.push({
                                id: rId,
                                url: href
                            });

                            return `
                                    <w:hyperlink r:id="${rId}" w:history="1">
                                        <w:r>
                                            <w:rPr>
                                                <w:rStyle w:val="Hyperlink"/>
                                                <w:color w:val="0000FF"/>
                                                <w:u w:val="single"/>
                                            </w:rPr>
                                            <w:t xml:space="preserve"> ${escapedLinkText} </w:t>
                                        </w:r>
                                    </w:hyperlink>
                                `;
                        }
                        return `<w:r><w:t xml:space="preserve"> ${escapedLinkText} </w:t></w:r>`;

                    default:
                        return Array.from(node.childNodes).map((child: HTMLElement) => processNode(child, false)).join('');
                }
            case Node.TEXT_NODE:
                if (node.textContent.trim()) {
                    const escapedText = escapeXmlSpecialChars(node.textContent);
                    return `<w:r><w:t>${escapedText}</w:t></w:r>`;
                    // return `<w:r><w:t>${node.textContent}</w:t></w:r>`;
                }
                return '';
            default:
                return '';
        }
    }

    return Array.from(div.childNodes).map((child: HTMLElement) => {
        return {
            html: child.outerHTML,
            ooxml: processNode(child, false)
        }
    }).filter(p => !!p.ooxml).map(({ ooxml, html }) => {
        // if (!ooxml) {
        //     return buildOOXML(`<w:br/>`)
        // }
        return {
            ooxml: buildOOXML(ooxml, hyperlinks),
            html
        }
    })

}

function buildOOXML(ooxml: string, hyperlinks: Array<{ id: string, url: string }> = []) {
    // `<w:p><w:r><w:t xml:space="preserve">${ooxml}</w:t></w:r></w:p>`
    // 检查ooxml是否是以<w:r>开头，如果是，用<w:p>包裹
    let tarOoxml = ooxml.trim();
    if (tarOoxml.startsWith('<w:r>')) {
        tarOoxml = `<w:p>${ooxml}</w:p>`
    }
    return `
        <pkg:package xmlns:pkg="http://schemas.microsoft.com/office/2006/xmlPackage">
          <pkg:part pkg:name="/_rels/.rels" pkg:contentType="application/vnd.openxmlformats-package.relationships+xml" pkg:padding="512">
            <pkg:xmlData>
              <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
              </Relationships>
            </pkg:xmlData>
          </pkg:part>
          <pkg:part pkg:name="/word/document.xml" pkg:contentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml">
            <pkg:xmlData>
             <w:document 
                xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
             >
                <w:body>
                    ${tarOoxml}
                </w:body>
            </w:document>
            </pkg:xmlData>
          </pkg:part>
          <pkg:part pkg:name="/word/_rels/document.xml.rels" pkg:contentType="application/vnd.openxmlformats-package.relationships+xml">
            <pkg:xmlData>
                <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                ${hyperlinks.map(link => `
                    <Relationship 
                    Id="${link.id}"
                    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink"
                    Target="${link.url}"
                    TargetMode="External"
                    />`).join('')}
                </Relationships>
            </pkg:xmlData>
          </pkg:part>
        </pkg:package>`
}

function escapeXmlSpecialChars(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function checkImageSrc(html: string) {
    console.log('checkImageSrc')
    console.log(html)
    const src = /<img[^>]+src="([^">]+)"/.exec(html);
    const url = src && src[1]; // 提取图片URL
    console.log(src, url)
    if (url.startsWith('data:')) {
        return true;
    }
    return false;
}

/**
 * 将Markdown转换为Word OOXML
 * @param {string} markdown Markdown文本
 * @returns {string} Word OOXML字符串
 */
export async function markdownToWordOOXML(markdown: string) {
    // 首先转义特殊字符
    // const escapedMarkdown = escapeXmlSpecialChars(markdown);
    // 处理数学公式
    // console.log('markdown', markdown)
    const { text, equations } = processEquations(markdown);
    // console.log('text', text)
    // 转换Markdown为HTML
    let html = await buildHtml(text) as string;
    // console.log('html', html)
    // 转换HTML为OOXML
    let ooxmls = htmlToOOXML(html, equations)

    return ooxmls;
}

export const insertOoxmlBlock = async (ooxml: string, range: Word.Range) => {
    try {
        // 插入到Word
        return await Word.run(async (context) => {
            let selectRange = range || context.document.getSelection();
            selectRange = selectRange.insertOoxml(ooxml, Word.InsertLocation.after);
            await context.sync();
            return selectRange;
        });
    } catch (error) {
        console.error('Error inserting markdown:', error);
        throw error;
    }
}

/**
 * 将Markdown插入到Word文档中
 * @param {string} markdown Markdown文本
 */
export async function insertMarkdown2(markdown: string) {
    try {
        const sanitizedMarkdown = markdown
            .replace(/\\\$[\n\r\s]*/g, "$$")
            .replace(/<latex>[\n\r\s]*|[\n\r\s]*<\/latex>/g, "$$")
            .replace(/\\\[[\n\r\s]*|[\n\r\s]*\\\]/g, "$$")
            .replace(/\\\([\n\r\s]*|[\n\r\s]*\\\)/g, "$$");

        await Word.run(async (context) => {
            let selectRange = context.document.getSelection();

            // 转换Markdown为OOXML
            const ooxmls = await markdownToWordOOXML(sanitizedMarkdown);
            for (let i = 0; i < ooxmls.length; i++) {
                const { ooxml, html } = ooxmls[i];

                if (html && html.indexOf('<img/>') > 0) {
                    selectRange = await insertOoxmlBlock(ooxml, selectRange)
                }
                selectRange = await insertOoxmlBlock(ooxml, selectRange)
            }
        });


    } catch (error) {
        console.error('Error inserting markdown:', error);
        throw error;
    }
}


/**
 * 将Markdown插入到Word文档中
 * @param {string} markdown Markdown文本
 */
export async function insertMarkdown(markdown: string) {
    try {
        const sanitizedMarkdown = markdown
            .replace(/\\\$[\n\r\s]*/g, "$$")
            .replace(/<latex>[\n\r\s]*|[\n\r\s]*<\/latex>/g, "$$")
            .replace(/\\\[[\n\r\s]*|[\n\r\s]*\\\]/g, "$$")
            .replace(/\\\([\n\r\s]*|[\n\r\s]*\\\)/g, "$$");

        // console.log(sanitizedMarkdown);
        // 插入到Word
        await Word.run(async (context) => {
            let range = context.document.getSelection();
            // 转换Markdown为OOXML
            const ooxmls = await markdownToWordOOXML(sanitizedMarkdown);
            for (let i = 0; i < ooxmls.length; i++) {
                const { ooxml, html } = ooxmls[i];
                // console.log('html', html);
                // console.log('ooxml');
                // console.log(ooxml)
                if (html && html.indexOf('<img') > 0) {
                    range = range.insertHtml(html, Word.InsertLocation.after);
                    range = range.insertText("\n", Word.InsertLocation.after);
                } else if (ooxml) {
                    range = range.insertOoxml(ooxml, Word.InsertLocation.after);
                } else if (html) {
                    range = range.insertHtml(html, Word.InsertLocation.after);
                }
                await context.sync();
            }
            // 把鼠标焦点移动到range后，不选择文本
            // 插入一个空文本范围并选中它
            const emptyRange = range.insertText("", Word.InsertLocation.after);
            emptyRange.select();
            await context.sync();

        });
    } catch (error) {
        console.error('Error inserting markdown:', error);
        throw error;
    }
}


export async function insertFootnoteToDoc(footnote: Footnote, range: Word.Range) {
    const context = range.context;
    const footnoteElement = range.insertFootnote("");
    context.trackedObjects.add(footnoteElement);
    const footnoteBody = footnoteElement.body.paragraphs.getFirst();

    await context.sync();

    const authors = footnote.authors.map((author) => `${author.lastName}, ${author.initials}`).join(", ");
    footnoteBody.insertText(`${authors} (${footnote.year})`, "End").font.italic = false;
    const title = footnoteBody.insertText(` ${footnote.title}`, "End");
    title.font.italic = false;
    title.hyperlink = footnote.url;

    if (footnote.journal) {
        const journalInfo = [footnote.journal.name, footnote.journal.volume].filter(Boolean).join(" ");
        footnoteBody.insertText(` ${journalInfo}`, "End").font.italic = true;

        if (footnote.journal.pages) {
            footnoteBody.insertText(`, ${footnote.journal.pages}`, "End").font.italic = false;
        }
    }

    await context.sync();
}