import { IChatBody, IChatResult, ICompletionsBody } from "chat-list/types/chat";
import { ITableOption } from "./sheet";

export interface IChatWithPromptOptions {
    prompt: string;
    temperature: number;
}

export interface IInsertTextOption {
    // 纯文本
    text?: string;
    type?: 'text' | 'html' | 'title' | 'paragraph' | 'markdown';
    position?: 'End' | 'After' | 'Replace';
}

export interface IDocService {
    insertTable: (value: string[][], options: ITableOption) => Promise<void>;
    insertText: (value: string, opitions?: IInsertTextOption) => Promise<void>;
    insertFootnote: (footnote: Footnote) => Promise<void>;
    generateDocumentReferences: (options?: any) => Promise<any>;
    insertImage: (base64: string, width?: number, height?: number, altTitle?: string, altDescription?: string, position?: string) => Promise<void>;
    getSelectedText: () => Promise<string>;
    getDocumentContent: () => Promise<string>;
    registSelectEvent?: (callback: (text: string, type?: string) => void) => () => void;
    showSidePanel: (name: string, type: string) => Promise<void>;
    getSelectedImageInfo: () => Promise<{ title: string, description: string }>;
    deselect: () => void;
    insertTitle: (title: string, headingLevel: number) => Promise<void>;
    insertParagraph: (text?: string | string[]) => Promise<void>;
    removeLineBreaks: () => Promise<void>;
    openDialog: (url: string, options?: any, callback?: (result: any) => void) => Promise<void>;
    runScript: (script: string) => Promise<any>;
}


export interface IChapterItem {
    type?: 'cover' | 'overview' | 'page' | 'end',
    title: string;
    subtitle?: string;
    text?: string;
    image?: {
        src: string;
        width?: number;
        height?: number;
    };
}

export interface PublicationInfo {
    summary: string;  // 简介
    authors?: PublicationAuthor[];  // 作者数组
    resources?: Resource[];  // 相关资源数组
    publicationYear?: number;  // 出版年份
    journalName?: string;  // 期刊名称
    volume?: string;  // 卷号
    pages?: string;  // 页码
    doi?: string;  // DOI（数字对象标识符）
    // 可以根据需要添加其他属性
}


export interface Resource {
    title: string;
    file_format: string;
    link: string;
}

export interface Author {
    lastName: string;
    initials: string;
}

export interface PublicationAuthor {
    name: string;
    link: string;
    serpapi_scholar_link: string;
    author_id: string;
}

export interface Journal {
    name?: string;
    volume?: string;
    pages?: string;
}

export interface Footnote {
    authors: Author[];
    year: number;
    title: string;
    url: string;
    journal?: Journal;
}
