/**
 * 参考文献样式配置
 */
export interface ReferenceStyle {
    /** 标题字号（磅） */
    titleFontSize: number;
    /** 正文字号（磅） */
    contentFontSize: number;
    /** 行距（倍数） */
    lineSpacing: number;
}

/**
 * 引用编号格式类型
 */
export type NumberFormatType = '[]' | '()';

/**
 * 参考文献处理配置选项
 */
export interface ReferenceProcessingOptions {
    /** 是否在参考文献前添加分页符 */
    addPageBreak?: boolean;
    /** 参考文献标题文本 */
    title?: string;
    /** 是否去除重复引用 */
    removeDuplicates?: boolean;
    /** 引用编号格式 */
    numberFormat?: NumberFormatType;
    /** 样式配置 */
    style?: Partial<ReferenceStyle>;
}

/**
 * 参考文献处理结果
 */
export interface ReferenceProcessingResult {
    /** 处理的引用数量 */
    count: number;
    /** 处理后的引用列表 */
    references: string[];
}

/**
 * 引用类型枚举
 */
export enum ReferenceType {
    /** 期刊文章 */
    Journal = 'J',
    /** 图书 */
    Book = 'M',
    /** 学位论文 */
    Dissertation = 'D',
    /** 会议论文 */
    Conference = 'C',
    /** 报纸文章 */
    Newspaper = 'N',
    /** 网络资源 */
    Online = 'EB',
    /** 专利 */
    Patent = 'P',
    /** 标准 */
    Standard = 'S'
}

/**
 * 处理Word文档中的引用，收集脚注并生成参考文献列表
 * @param context - Word上下文对象
 * @param options - 配置选项
 * @returns 返回处理结果，包含引用数量和引用列表
 */
export declare function processDocumentReferences(
    context: Word.RequestContext,
    options?: ReferenceProcessingOptions
): Promise<ReferenceProcessingResult>;

// 默认配置常量
export const DEFAULT_REFERENCE_OPTIONS: Required<ReferenceProcessingOptions> = {
    addPageBreak: true,
    title: "References",
    removeDuplicates: true,
    numberFormat: "[]",
    style: {
        titleFontSize: 16,
        contentFontSize: 12,
        lineSpacing: 1.5
    }
};

// 辅助类型：引用格式配置
export interface ReferenceFormat {
    /** 引用类型 */
    type: ReferenceType;
    /** 格式模板 */
    template: string;
    /** 必需字段 */
    requiredFields: string[];
    /** 可选字段 */
    optionalFields?: string[];
}

// 引用格式配置示例
export const REFERENCE_FORMATS: Record<ReferenceType, ReferenceFormat> = {
    [ReferenceType.Journal]: {
        type: ReferenceType.Journal,
        template: "{authors}. {title}[J]. {journal}, {year}, {volume}({issue}): {pages}",
        requiredFields: ['authors', 'title', 'journal', 'year'],
        optionalFields: ['volume', 'issue', 'pages']
    },
    [ReferenceType.Book]: {
        type: ReferenceType.Book,
        template: "{authors}. {title}[M]. {location}: {publisher}, {year}",
        requiredFields: ['authors', 'title', 'publisher', 'year'],
        optionalFields: ['location', 'isbn']
    },
    [ReferenceType.Dissertation]: {
        type: ReferenceType.Dissertation,
        template: "{author}. {title}[D]. {university}, {year}",
        requiredFields: ['author', 'title', 'university', 'year']
    },
    [ReferenceType.Conference]: {
        type: ReferenceType.Conference,
        template: "{authors}. {title}[C]// {proceedings}. {location}, {year}: {pages}",
        requiredFields: ['authors', 'title', 'proceedings', 'year'],
        optionalFields: ['location', 'pages']
    },
    [ReferenceType.Newspaper]: {
        type: ReferenceType.Newspaper,
        template: "{author}. {title}[N]. {newspaper}, {date}({edition})",
        requiredFields: ['author', 'title', 'newspaper', 'date'],
        optionalFields: ['edition']
    },
    [ReferenceType.Online]: {
        type: ReferenceType.Online,
        template: "{authors}. {title}[EB/OL]. {url}, {accessDate}",
        requiredFields: ['authors', 'title', 'url'],
        optionalFields: ['accessDate']
    },
    [ReferenceType.Patent]: {
        type: ReferenceType.Patent,
        template: "{inventors}. {title}[P]. {patentNumber}, {date}",
        requiredFields: ['inventors', 'title', 'patentNumber', 'date']
    },
    [ReferenceType.Standard]: {
        type: ReferenceType.Standard,
        template: "{standardNumber} {title}[S]. {organization}, {year}",
        requiredFields: ['standardNumber', 'title', 'organization', 'year']
    }
} as const;


/**
 * 处理Word文档中的引用，收集脚注并生成参考文献列表
 * @param {Word.Context} context - Word上下文对象
 * @param {Object} options - 配置选项
 * @param {boolean} options.addPageBreak - 是否在参考文献前添加分页符，默认true
 * @param {string} options.title - 参考文献标题，默认"参考文献"
 * @param {boolean} options.removeDuplicates - 是否去除重复引用，默认true
 * @param {string} options.numberFormat - 引用编号格式，可选 "[]" 或 "()"，默认"[]"
 * @param {Object} options.style - 样式配置
 * @param {number} options.style.titleFontSize - 标题字号，默认16
 * @param {number} options.style.contentFontSize - 正文字号，默认12
 * @param {number} options.style.lineSpacing - 行距，默认1.5
 * @returns {Promise<{count: number, references: string[]}>} 返回处理结果，包含引用数量和引用列表
 */
export async function generateDocumentReferences(options: ReferenceProcessingOptions = {}) {

    const context = await Word.run(async (context) => context);

    const defaultOptions = {
        addPageBreak: true,
        title: "参考文献",
        removeDuplicates: true,
        numberFormat: "[]",
        style: {
            titleFontSize: 16,
            contentFontSize: 12,
            lineSpacing: 1.5
        }
    };

    const finalOptions = { ...defaultOptions, ...options };
    finalOptions.style = { ...defaultOptions.style, ...options.style };

    // try {
    // 加载所有脚注及其文本内容
    const footnotes = context.document.body.footnotes;
    footnotes.load("items");
    await context.sync();

    // 收集和处理引用
    let references = [];

    // 逐个处理脚注
    for (const footnote of footnotes.items) {
        // 正确加载脚注内容
        const range = footnote.body.getRange();
        range.load("text");
        await context.sync();

        // 获取脚注文本
        const footnoteText = range.text;

        // 清理和格式化引用文本
        if (footnoteText) {
            const cleanedRef = cleanReferenceText(footnoteText);
            if (cleanedRef) {
                const formattedRef = formatReference(cleanedRef);
                references.push(formattedRef);
            }
        }
    }

    // 去重
    if (finalOptions.removeDuplicates) {
        references = [...new Set(references)];
    }

    // 在文档末尾添加参考文献
    const body = context.document.body;

    // 添加分页符
    if (finalOptions.addPageBreak) {
        const range = context.document.body.getRange("End");
        range.insertBreak(Word.BreakType.page, "After");
        await context.sync();
    }

    // 添加标题
    const titleParagraph = body.insertParagraph(finalOptions.title, "End");
    titleParagraph.font.size = finalOptions.style.titleFontSize;
    titleParagraph.font.bold = true;
    titleParagraph.alignment = Word.Alignment.left;
    titleParagraph.spaceBefore = 12;
    titleParagraph.spaceAfter = 12;
    await context.sync();

    // 添加参考文献条目
    for (let i = 0; i < references.length; i++) {
        const numberPrefix = finalOptions.numberFormat === "[]"
            ? `[${i + 1}] `
            : `(${i + 1}) `;

        const paragraph = body.insertParagraph(
            numberPrefix + references[i],
            "End"
        );

        // 设置段落格式
        paragraph.font.size = finalOptions.style.contentFontSize;
        paragraph.spaceBefore = 6;
        paragraph.spaceAfter = 6;
        paragraph.lineSpacing = finalOptions.style.lineSpacing * 20;
        paragraph.firstLineIndent = 0;

        await context.sync();
    }

    // 返回处理结果
    return {
        count: references.length,
        references: references
    };

    // } catch (error) {
    //     console.error("处理引用时发生错误:", error);
    //     throw error;
    // }
}

/**
 * 清理引用文本
 * @param {string} text - 原始引用文本
 * @returns {string} 清理后的文本
 */
function cleanReferenceText(text: string) {
    // 移除空白字符
    text = text.trim();

    // 移除脚注编号（支持多种格式）
    text = text.replace(/^[\[\(]?\d+[\]\)]?\s*\.?\s*/, '');

    // 移除多余的空格
    text = text.replace(/\s+/g, ' ');

    // 移除特殊字符
    text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');

    return text;
}

/**
 * 格式化引用
 * @param {string} text - 清理后的引用文本
 * @returns {string} 格式化后的引用
 */
function formatReference(text: string) {
    // 处理期刊文章 [J]
    if (text.includes('[J]')) {
        const parts = text.split('[J]');
        if (parts.length === 2) {
            const [authorsTitle, journalInfo] = parts;
            // 确保作者、标题和期刊信息之间有正确的标点符号
            return `${authorsTitle.trim()}[J].${journalInfo.trim()}`;
        }
    }

    // 处理图书 [M]
    if (text.includes('[M]')) {
        const parts = text.split('[M]');
        if (parts.length === 2) {
            const [authorsTitle, pubInfo] = parts;
            // 确保作者、书名和出版信息之间有正确的标点符号
            return `${authorsTitle.trim()}[M].${pubInfo.trim()}`;
        }
    }

    // 处理学位论文 [D]
    if (text.includes('[D]')) {
        const parts = text.split('[D]');
        if (parts.length === 2) {
            const [authorsTitle, uniInfo] = parts;
            return `${authorsTitle.trim()}[D].${uniInfo.trim()}`;
        }
    }

    // 处理会议论文 [C]
    if (text.includes('[C]')) {
        const parts = text.split('[C]');
        if (parts.length === 2) {
            const [authorsTitle, confInfo] = parts;
            return `${authorsTitle.trim()}[C].${confInfo.trim()}`;
        }
    }

    // 处理报纸文章 [N]
    if (text.includes('[N]')) {
        const parts = text.split('[N]');
        if (parts.length === 2) {
            const [authorsTitle, newspaperInfo] = parts;
            return `${authorsTitle.trim()}[N].${newspaperInfo.trim()}`;
        }
    }

    // 如果没有匹配到特定格式，返回清理后的文本
    return text;
}