export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  registrationDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserContextState {
  user: IUserState;
  points: number;
  updatePoints: () => void;
  loading: boolean;
  setUserState: (user: Partial<IUserState>) => void;
  checkLicense: (license: string) => void;
  openLogin: boolean;
  setOpenLogin: (open: boolean) => void;
}

export interface IUserState {
  id: number;
  username: string;
  email: string;
  image?: string;
  /**
   * 1是订阅用户，2是积分用户
   *  */
  type?: 1 | 2,
  state: 'free' | 'paid';
  order?: string;
  version?: 'standard' | 'pro' | 'trial' | string;
  exp?: number;
  gptLimit?: number;
  interval?: 'year' | 'month';
  points?: number;
  // Is sign up
  isAuthenticated?: boolean;
  key?: string;
}

export interface IApiLimit {
  gpt3Count: number;
  gpt4Count: number;
  freeCount: number;
  lastResetTimestamp: Date;
}

export interface IUserMessage {
  conversationId?: string;
  senderId?: string;
  receiverId?: string;
  content: string,
  agent: string,
  email?: string,
  model: string,
  platform?: string
}

export interface IPlanTask {
  id: string;
  text: string;
  steps?: IPlanTask[]
}

export interface IPlan {
  id?: string;
  name: string;
  description?: string;
  tasks?: IPlanTask[]
}
