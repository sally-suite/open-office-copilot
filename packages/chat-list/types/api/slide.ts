
export interface IChatWithPromptOptions {
    prompt: string;
    temperature: number;
}

// 'bubble','radar', 'scatter', 'doughnut','bar3d',
export const ChartTypes = ['bar', 'line', 'pie', 'area', 'scatter']

export interface ISlideItem {
    type?: 'cover' | 'catalog' | 'overview' | 'slide' | 'section' | 'end' | 'list' | 'table' | 'chart',
    background?: {
        color?: string;
        image?: {
            src: string;
            width?: number;
            height?: number;
        }
    };
    title: string;
    subtitle?: string;
    text?: string;
    list?: { title: string, description: string }[];
    image?: {
        src: string;
        width?: number | string;
        height?: number | string;
    }[];
    table?: string[][];
    data?: { chart_type?: string, name: string, labels: string[], values: number[] }[];
    notes?: string;
}

export interface ISlideService {
    insertTable: (value: string[][], options: ITableOption) => Promise<void>;
    insertText: (value: string) => Promise<void>;
    insertImage: (base64: string, width?: number, height?: number, altTitle?: string, altDescription?: string) => Promise<void>;
    getSelectedText: () => Promise<string>;
    getDocumentContent: () => Promise<string>;
    registSelectEvent?: (callback: (text: string) => void) => () => void;
    showSidePanel: (name: string, type: string) => Promise<void>;
    getSelectedImageInfo: () => Promise<{ title: string, description: string }>;
    generateSlide: (items: Slide[]) => Promise<void>;
    generatePresentation: (presentation: Presentation) => Promise<void>;
    createPage: (title: string, text: string, list?: string[], image?: { src: string, width?: number, height?: number }, notes?: string) => Promise<void>;
    createCover: (title: string, subTitle: string,) => Promise<void>;
    createEnd: (title: string, content: string,) => Promise<void>;
    deselect: () => void;
    getSlidesText: (id?: string) => Promise<{ id: string, texts: string[] }[]>;
    getSlides: (isSelected: boolean) => Promise<{ id: string }[]>;
    setSpeakerNote: (id: string, content: string) => Promise<void>;
    getSelectedSlides: () => Promise<{ id: string, num: number, texts: string[] }[]>;
    insertSlidesFromBase64?: (bae64: string) => Promise<void>;
    runScript: (script: string) => Promise<void>;
}


type LayoutType = "TITLE_AND_CONTENT" | string;

interface Background {
    color: string; // 背景颜色
    image?: string; // 背景图片URL（可选）
}

export interface TextOption {
    fontSize?: number;
    color?: string;
    fontFamily?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    bullet?: boolean; // 仅适用于文本类型
    lineSpacing?: number; // 仅适用于文本类型
    align?: "left" | "center" | "right"; // 仅适用于文本类型
    valign?: "top" | "middle" | "bottom"; // 仅适用于文本类型
    spaceAfter?: number; // 仅适用于文本类型
    spaceBefore?: number; // 仅适用于文本类型
    fill?: FillProps;
    margin?: number | [number, number, number, number];
    /**
     * 0-1
     */
    rectRadius?: number;
}

export interface Position {
    x: number; // 英寸
    y: number; // 英寸
}

export interface Size {
    width: number; // 英寸
    height: number; // 英寸
}

export interface TextBlock {
    type?: "paragraph" | "heading";
    text: string;
    style: TextOption;
}

export interface FillProps {
    color?: string
    /**
     * Transparency (percent)
     * - MS-PPT > Format Shape > Fill & Line > Fill > Transparency
     * - range: 0-100
     * @default 0
     */
    transparency?: number
    /**
     * Fill type
     * @default 'solid'
     */
    type?: 'none' | 'solid'

    /**
     * Transparency (percent)
     * @deprecated v3.3.0 - use `transparency`
     */
    alpha?: number
}

export interface ITableCell {
    text: string,
    options: ICellOption

}
export interface ICellOption extends TextOption {
    align: "left" | 'center' | 'right',
    fontFace: string,
    border?: IBorderOption[]
}

export interface ITableOption {
    fontFace: string,
    border?: IBorderOption | IBorderOption[]
}

export interface IBorderOption {
    type: 'solid' | 'dashed' | 'none',
    color: string,
    pt: number
}


export interface SlideElement {
    id?: string;
    placeholder?: string;
    type: "title" | "text" | "image" | "chart" | 'shape' | 'table';
    shapeName?: any;
    content?: string | TextBlock[];
    style?: TextOption;
    position: Position;
    size: Size;
    src?: string; // 仅适用于图片类型
    chartType?: string; // 仅适用于图表类型
    chartImage?: string; // 仅适用于图表类型
    table?: {
        rows?: ITableCell[][]; // 仅适用于表格类型
        options?: ITableOption; // 仅适用于表格类型
    }
    data?: { name: string, labels: string[]; values: number[] }[]; // 仅适用于图表类型
}

export interface Slide {
    id: string;
    layout: LayoutType;
    background: Background;
    elements: SlideElement[];
    notes?: string;
}

export interface Theme {
    images?: {
        crop?: boolean
    }
    colors: {
        primary: string;
        background: string;
        title: string;
        body: string;
        highlight: string;
        complementary: string;
    };
    fonts: {
        title: string;
        body: string;
    };
}

export interface Metadata {
    title: string;
    subject: string;
    author: string;
    company: string;
}

export interface Presentation {
    slides: Slide[];
    theme?: Theme;
    metadata?: Metadata;
}
