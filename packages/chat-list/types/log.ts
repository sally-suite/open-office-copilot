// export type LogType = 'info' | 'error' | 'warn' | 'action';

export enum LogType {
    info = 'info',
    error = 'error',
    warn = 'warn',
    action = 'action',
}
export interface ILog {
    [x: string]: any;
    id: string;
    type: LogType;
    time: Date;
    content: string | React.ReactNode | any;
    status?: ActionStatus;

}

export type CellType = 'code' | 'markdown'

export interface ICell {
    [x: string]: any;
    id: string;
    type: CellType;
    // time: Date;
    content?: string | React.ReactNode | any;
    status?: ActionStatus;
    code?: string;
    result?: string;
    expand?: boolean;
    note?: string;
}

export type ActionStatus = 'generating' | 'running' | 'success' | 'error';

export interface IActionState {
    [id: string]: ILog;
}

export interface ICellState {
    [id: string]: ICell;
}

export type LogTypes = keyof LogType;