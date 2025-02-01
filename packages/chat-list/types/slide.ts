
export type IElementType = `title` | `list` | `image` | `text`;

export interface ILayoutElement {
    type: IElementType;
    top: number;
    left: number;
    width: number;
    height: number;
    text?: string;
    title?: string;
    image?: string;
    list?: string[];
}