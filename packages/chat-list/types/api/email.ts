import { IInsertTextOption } from "./doc";
import { ITableOption } from "./sheet";


export interface IEmailService {
    insertTable: (value: string[][], options: ITableOption) => Promise<void>;
    insertText: (value: string, opitions?: IInsertTextOption) => Promise<void>;
    insertImage: (base64: string, width?: number, height?: number, altTitle?: string, altDescription?: string, position?: string) => Promise<void>;
    getSelectedText: () => Promise<string>;
    getDocumentContent: () => Promise<string>;
    registSelectEvent?: (callback: (text: string, type?: string) => void) => () => void;
    showSidePanel: (name: string, type: string) => Promise<void>;
    getSelectedImageInfo: () => Promise<{ title: string, description: string }>;
    deselect: () => void;
    setSubject: (title: string) => Promise<void>;
    setBody: (text: string, type: 'text' | 'html') => Promise<void>;
    setToRecipients: (recipients: { displayName: string, emailAddress: string }[]) => Promise<void>;
    setCCRecipients: (recipients: { displayName: string, emailAddress: string }[]) => Promise<void>;
    setBCCRecipients: (recipients: { displayName: string, emailAddress: string }[]) => Promise<void>;
}


