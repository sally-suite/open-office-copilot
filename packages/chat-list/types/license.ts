export interface IUserOrderState {
    state: "free" | 'paid',
    type: 1 | 2,
    email: string,
    order: string,
    version: 'standard' | 'pro',
    gpt: 0 | 1,
    exp: number,
    gptLimit: number,
    noApiKey: boolean;
    interval?: 'year' | 'month';
    points?: number;
    key: string;
}