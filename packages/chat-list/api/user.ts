import { IUserOrderState } from 'chat-list/types/license';
import { IUserService } from '../types/api/user';
import { IApiLimit, IPlan, IUserMessage } from 'chat-list/types/user';
import { IAgent } from 'chat-list/types/agent';
import { IConversation } from 'chat-list/types/conversation';

class UserServiceMock implements IUserService {
    login: (license: string) => Promise<string>;
    getEmail: () => Promise<string>;
    setUserProperty: (key: string, value: string) => Promise<void>;
    getUserProperty: (key: string) => Promise<string>;
    checkUser: () => Promise<IUserOrderState>;
    deductPoints?: (message: IUserMessage) => Promise<void>;
    getAgents = (params: { email: string, type: string }) => {
        return Promise.resolve({} as IAgent[]);
    };
    addAgent = (agent: IAgent) => {
        return Promise.resolve();
    };
    updateAgent = (agent: IAgent) => {
        return Promise.resolve();
    };
    getAgent = (id: string) => {
        return Promise.resolve({} as IAgent);
    };
    getPoints?: () => Promise<number>;
    getConversation = async (): Promise<IConversation[]> => {
        return [];
    };
    addPlan = async (plan: IPlan) => {
        return;
    };
    getPlan = async (id: string): Promise<IPlan> => {
        return null;
    };
    removePlan = async (id: string) => {
        return;
    };
    getPlanList = async (): Promise<IPlan[]> => {
        return;
    };
}

export default new UserServiceMock();