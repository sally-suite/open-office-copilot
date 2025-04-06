
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
function latexToMathML(latex: string) {
    try {
        // const container = document.createElement('div');
        const result = katex.renderToString(latex, {
            throwOnError: true,
            output: 'mathml'
        });
        return result.replace(/^<span class="katex">/, '').replace(/<\/span>$/, '')
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
function processEquations(text: string) {
    const equations: any[] = [];

    // 处理块级公式 ($$...$$)
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match: any, latex: string) => {
        const mathML = latexToMathML(latex.trim());
        const ooxml = mathMLToWordOOXML(mathML);

        equations.push({
            type: 'block',
            ooxml,
            placeholder: `<p math="true">EQUATION_${equations.length}</p>`
        });
        return `<p math="true">EQUATION_${equations.length - 1}</p>`;
    });

    // 处理行内公式 ($...$)
    text = text.replace(/\$([^\$]*?)\$/g, (match: any, latex: string) => {
        const mathML = latexToMathML(latex.trim());
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

function processHeading(node: HTMLElement) {
    const level = parseInt(node.tagName[1]);
    const fontSize = 20 - (level - 1) * 2; // H1: 20pt, H2: 18pt, H3: 16pt, etc.
    const color = level <= 2 ? "2F5496" : "1F3763"; // Darker blue for H1 and H2, lighter for others
    const spacing = 240 + (6 - level) * 60; // More spacing for higher level headings

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
                <w:t>${node.textContent}</w:t>
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
        <w:p/>
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

    function processTableCell(cell: HTMLElement, isHeader: boolean): string {
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
           </w:tcPr>` // Header cell with center vertical alignment and padding
            : `<w:tcPr>
               <w:shd w:val="clear" w:fill="FFFFFF"/>
               <w:tcMar>
                   <w:top w:w="100" w:type="dxa"/>
                   <w:left w:w="100" w:type="dxa"/>
                   <w:bottom w:w="100" w:type="dxa"/>
                   <w:right w:w="100" w:type="dxa"/>
               </w:tcMar>
               <w:tcW w:w="1000" w:type="dxa"/>
           </w:tcPr>`; // Body cell background color with padding

        return `
        <w:tc>
            ${cellStyle}
            <w:p>
                <w:pPr>
                    <w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>
                </w:pPr>
                <w:r>
                    <w:rPr>${isHeader ? "<w:b/>" : ""}</w:rPr>
                    <w:t>${cell.textContent}</w:t>
                </w:r>
            </w:p>
        </w:tc>
        `;
    }


    // Table cell processing
    // function processTableCell(cell: HTMLElement, isHeader: boolean): string {
    //     const tag = cell.tagName.toLowerCase();
    //     const isHeaderCell = isHeader || tag === 'th';

    //     return `
    //     <w:tc>
    //         <w:tcPr>
    //             <w:tcW w:w="0" w:type="auto"/>
    //             ${isHeaderCell ? '<w:shd w:fill="EEEEEE" w:val="clear"/>' : ''}
    //             <w:tcBorders>
    //                 <w:top w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
    //                 <w:left w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
    //                 <w:bottom w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
    //                 <w:right w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
    //             </w:tcBorders>
    //         </w:tcPr>
    //         <w:p>
    //             <w:pPr>
    //                 <w:jc w:val="${isHeaderCell ? 'center' : 'left'}"/>
    //             </w:pPr>
    //             ${Array.from(cell.childNodes).map((child: HTMLElement) =>
    //         processNode(child, true)
    //     ).join('')}
    //         </w:p>
    //     </w:tc>
    // `;
    // }

    function processListItem(li: HTMLElement, isOrdered: boolean, level: number, listId: number): string {
        let result = '';

        // 处理当前列表项的直接内容
        const currentItemContent = Array.from(li.childNodes)
            .filter(child => child.nodeType === Node.TEXT_NODE || (child.nodeType === Node.ELEMENT_NODE && !['ul', 'ol'].includes(child.nodeName.toLowerCase())))
            .map(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    return (child.textContent || '').trim() ? `<w:r><w:t>${(child.textContent || '').trim()}</w:t></w:r>` : '';
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
        console.log(node.tagName)
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
                                ${Array.from(node.childNodes).map((child: HTMLElement) => processNode(child, false)).join('')}
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
                        return `<w:r><w:rPr><w:i/></w:rPr><w:t>${node.textContent}</w:t></w:r>`;
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
                        return `<w:r><w:t>${node.textContent}</w:t></w:r>`;
                    case 'br':
                        return `<w:br/>`;
                    case 'code':
                        if (inline) {
                            return `<w:r><w:rPr><w:rStyle w:val="Code"/></w:rPr><w:t>${node.textContent}</w:t></w:r>`
                        }
                        return ` <w:p><w:r><w:rPr><w:rStyle w:val="Code"/></w:rPr><w:t>${node.textContent}</w:t></w:r></w:p>`;
                    case 'table':
                        return processTable(node);
                    case 'th':
                    case 'td':
                        return node.textContent || '';
                    default:
                        return Array.from(node.childNodes).map((child: HTMLElement) => processNode(child, false)).join('');
                }
            case Node.TEXT_NODE:
                if (node.textContent.trim()) {
                    return `<w:r><w:t>${node.textContent}</w:t></w:r>`;
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
            ooxml: buildOOXML(ooxml),
            html
        }
    })

}

function buildOOXML(ooxml: string) {
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
             <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
                <w:body>
                    ${tarOoxml}
                </w:body>
            </w:document>
            </pkg:xmlData>
          </pkg:part>
        </pkg:package>`
}

/**
 * 将Markdown转换为Word OOXML
 * @param {string} markdown Markdown文本
 * @returns {string} Word OOXML字符串
 */
export async function markdownToWordOOXML(markdown: string) {
    // 处理数学公式
    console.log('markdown', markdown)
    const { text, equations } = processEquations(markdown);
    console.log('text', text)
    // 转换Markdown为HTML
    let html = await buildHtml(text) as string;
    console.log('html', html)
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

        // 插入到Word
        await PowerPoint.run(async (context) => {
            let range = context.document.getSelection();
            // 转换Markdown为OOXML
            const ooxmls = await markdownToWordOOXML(sanitizedMarkdown);
            for (let i = 0; i < ooxmls.length; i++) {
                const { ooxml, html } = ooxmls[i];
                console.log('html', html);
                console.log('ooxml', ooxml);
                if (html && html.indexOf('<img') > 0) {
                    range = range.insertHtml(html, Word.InsertLocation.after);
                } else {
                    range = range.insertOoxml(ooxml, Word.InsertLocation.after);
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
