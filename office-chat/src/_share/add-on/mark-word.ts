import MarkdownIt from 'markdown-it';
import katexPlugin from './markdown-it-texmath';
import katex from 'katex';
import { mml2omml } from "./mathml2omml";
import { Footnote } from 'chat-list/types/api/doc';


export default class MarkdownToWord {
    constructor(getDefaultErrorMessage?: (error: any) => string) {
        this.getDefaultErrorMessage = getDefaultErrorMessage || ((error: any) => error.message);
        this.markdownIt = new MarkdownIt({ html: true })
            .use(katexPlugin, {
                throwOnError: false,
                engine: katex,
                delimiters: "math",
                katexOptions: { output: "mathml", removeWraper: true },

            });
    }
    markdownIt: MarkdownIt = null
    getDefaultErrorMessage = (error: any) => error.message;
    // 生成错误信息
    getErrorMessage(error: any) {
        let message = this.getDefaultErrorMessage(error);
        if (error?.message === "GeneralException") {
            message = "Something went wrong. Is the document perhaps read-only?";
        } else if (error?.message === "InvalidArgument") {
            message = "Something went wrong generating text. Please try again with a different selection.";
        } else if (typeof error.error === "string") {
            message = error.error;
        } else if (error.message) {
            message = error.message;
        }
        return message;
    }

    // 转换Markdown为HTML
    getHtmlFromMarkdown(markdown: string) {
        const sanitizedMarkdown = markdown
            .replace(/\\\$[\n\r\s]*/g, "$$")
            .replace(/<latex>[\n\r\s]*|[\n\r\s]*<\/latex>/g, "$$")
            .replace(/\\\[[\n\r\s]*|[\n\r\s]*\\\]/g, "$$")
            .replace(/\\\([\n\r\s]*|[\n\r\s]*\\\)/g, "$$");

        const result = this.markdownIt.render(sanitizedMarkdown);
        console.log(result);
        return result;
    }
    convertMathMLtoOOXML(mathML: string) {
        const result = mml2omml(mathML);
        return result;
    }
    // 插入Markdown到Word，包含数学公式的处理
    insertMarkdown(markdownContent: string, footnotes: Footnote[] = []) {
        return Word.run(async (context) => {
            const htmlContent = this.getHtmlFromMarkdown(markdownContent);
            console.log('html', htmlContent)
            let selectedRange = context.document.getSelection();
            selectedRange.clear();
            await context.sync();

            // 存储插入的位置
            const insertedElements = [];

            // 检查是否包含数学公式
            if (!htmlContent.includes("<math")) {
                selectedRange.insertHtml(htmlContent, "End");
                insertedElements.push(selectedRange);
            } else {
                // 含数学公式的特殊处理
                let currentIndex = 0;
                let hasMoreMath = true;

                while (hasMoreMath) {
                    // 从
                    const mathStartIndex = htmlContent.indexOf(`<math`, currentIndex);
                    const mathEndIndex = htmlContent.indexOf("</math>", currentIndex);

                    console.log('htmlContent', mathStartIndex, mathEndIndex, htmlContent)
                    const beforeMathContent = htmlContent.substring(currentIndex, mathStartIndex > 0 ? mathStartIndex : htmlContent.length);
                    // 插入普通HTML内容
                    if (beforeMathContent) {
                        console.log('beforeMathContent', beforeMathContent)
                        selectedRange = selectedRange.insertHtml(beforeMathContent, "End");
                        insertedElements.push(selectedRange);
                        selectedRange = selectedRange.insertText(" ", "After");
                    }

                    await context.sync();

                    // 插入数学公式
                    if (mathStartIndex > 0 && mathEndIndex > 0) {
                        const mathMLContent = htmlContent.substring(mathStartIndex, mathEndIndex + 7).replace(/<annotation.*?<\/annotation>/g, "");
                        // console.log('mathMLContent', mathMLContent)
                        const ooxmlContentWithMath = this.convertMathMLtoOOXML(mathMLContent);
                        // console.log('ooxmlContentWithMath', ooxmlContentWithMath)
                        const ooxmlContent = this.getMathMLToOOXML(ooxmlContentWithMath);

                        try {
                            console.log('ooxmlContent', ooxmlContent)
                            selectedRange = await selectedRange.insertOoxml(ooxmlContent, "End");
                            await context.sync();
                        } catch (err) {
                            console.error('Error inserting math:', err);
                        }
                    }

                    currentIndex = mathEndIndex + 7;
                    if (mathEndIndex === -1)
                        hasMoreMath = false;
                }
            }

            // 插入脚注（如果有）
            if (footnotes.length > 0) {
                for (const insertedElement of insertedElements) {
                    const hyperlinkRanges = insertedElement.getHyperlinkRanges();
                    context.load(hyperlinkRanges, "items");
                    await context.sync();

                    for (const hyperlinkRange of hyperlinkRanges.items) {
                        const hyperlink = hyperlinkRange.hyperlink;
                        const footnote = footnotes.find((note) => note.url === hyperlink);
                        if (footnote) await this.insertFootnote(footnote, hyperlinkRange);
                    }
                }
            }

            return selectedRange;
        }).catch((error) => this.getErrorMessage(error));
    }

    // 生成OOXML格式的数学公式
    getMathMLToOOXML(mathML: string) {
        return `<pkg:package xmlns:pkg="http://schemas.microsoft.com/office/2006/xmlPackage">
          <pkg:part pkg:name="/_rels/.rels" pkg:contentType="application/vnd.openxmlformats-package.relationships+xml" pkg:padding="512">
            <pkg:xmlData>
              <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
              </Relationships>
            </pkg:xmlData>
          </pkg:part>
          <pkg:part pkg:name="/word/document.xml" pkg:contentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml">
            <pkg:xmlData>
              <w:document xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
                <w:body>
                  <w:p> ${mathML}</w:p>
                </w:body>
              </w:document>
            </pkg:xmlData>
          </pkg:part>
        </pkg:package>`;

    }

    // 插入脚注
    async insertFootnote(footnote: Footnote, range: Word.Range) {
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
}
