import { IUserOrderState } from 'chat-list/types/license';
import { IUserService } from '../types/api/user'
import { sleep } from 'chat-list/utils';
import { login } from 'chat-list/service/auth'
import { IApiLimit, IPlan, IUserMessage } from 'chat-list/types/user';
import { IAgent } from 'chat-list/types/agent';
import { IConversation } from 'chat-list/types/conversation';

class UserServiceMock implements IUserService {
    login: (license: string) => Promise<string> = async (licenseKey: string) => {
        const token = await login(licenseKey)
        return token;
    };
    getEmail = (): Promise<string> => {
        return Promise.resolve('hongyin163@gmail.com');
    };
    setUserProperty: (key: string, value: string) => Promise<void> = async () => {
        await sleep()
        return Promise.resolve();
    };
    getUserProperty: (key: string) => Promise<string> = async (key: string) => {
        const store: any = {
            'OPENAI_API_MODEL': "gpt-3.5-turbo"
        }
        return store[key] || ""
    };
    checkUser = async (): Promise<IUserOrderState> => {
        await sleep();
        return Promise.resolve({
            state: 'free',
            email: 'hongyin163@gmail.com',
            order: null,
            version: 'standard',
            gpt: 0,
            exp: Date.now(),
            gptLimit: 12,
            noApiKey: true,
        } as unknown as IUserOrderState)
    };
    sentMessage = async (message: IUserMessage) => {
        console.log(message)
        return
    }
    deductPoints: (message: IUserMessage) => Promise<void> = async (message) => {
        console.log(message)
        return;
    };
    getAgent = (id: string) => {
        return Promise.resolve({} as IAgent[]);
    }
    getAgents = (email: string) => {
        return Promise.resolve({} as IAgent[]);
    }
    addAgent = (agent: IAgent) => {
        return Promise.resolve();
    }
    updateAgent = (agent: IAgent) => {
        return Promise.resolve();
    }
    getPoints = () => {
        return Promise.resolve(30000);
    }
    getConversation = async (): Promise<IConversation[]> => {
        return []
    }
    addPlan = async (plan: IPlan) => {
        return
    };
    getPlan = async (id: string) => {
        return
    };
    removePlan = async (id: string) => {
        return
    };
    getPlanList = async (): Promise<IPlan[]> => {
        return
    };

}

export default new UserServiceMock();