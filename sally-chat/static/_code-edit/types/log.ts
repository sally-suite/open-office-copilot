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

export type ActionStatus = 'running' | 'success' | 'error';

export interface IActionState {
    [id: string]: ILog;
}

export type LogTypes = keyof LogType;