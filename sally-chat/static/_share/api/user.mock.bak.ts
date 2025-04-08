import { IUserOrderState } from 'chat-list/types/license';
import { IUserService } from 'chat-list/types/api/user'
import api from '@api/index';
import { login } from 'chat-list/service/auth'
import { getLocalStore, setLocalStore } from 'chat-list/local/local';
import { IUserMessage } from 'chat-list/types/user';
import { IAgent } from 'chat-list/types/agent';

class UserServiceMock implements IUserService {
    login: (license: string) => Promise<string> = async (licenseKey: string) => {
        const token = await login(licenseKey)
        return token;
    };
    getEmail = (): Promise<string> => {
        return Promise.resolve('hongyin163@gmail.com');
    };
    setUserProperty: (key: string, value: string) => Promise<void> = async (key: string, value: string) => {
        // await sleep()
        setLocalStore(key, value)
        return Promise.resolve();
    };
    getUserProperty: (key: string) => Promise<string> = async (key: string) => {
        // const store: any = {
        //     'OPENAI_API_MODEL': "gpt-3.5-turbo"
        // }
        // return store[key] || ""
        const value = getLocalStore(key) as unknown as string;
        return Promise.resolve(value);
    };
    checkUser = async (): Promise<IUserOrderState> => {
        // await sleep();
        // debugger;
        // const result = await api.checkUser({});
        // // debugger;
        // return result;
        return Promise.resolve({
            state: 'free',
            email: 'hongyin163@gmail.com',
            order: null,
            version: 'standard',
            gpt: 0,
            exp: Date.now(),
            gptLimit: 12,
            noApiKey: true,
            points: 10,

        } as unknown as IUserOrderState)
    };
    sentMessage: (message: IUserMessage) => Promise<void> = async (message) => {
        console.log(message)
        return;
    };
    deductPoints: (message: IUserMessage) => Promise<void> = async (message) => {
        console.log(message)
        return;
    };
    getAgent = async (id: string) => {
        // return await api.getAgent({ id });
        return null;
    }
    getAgents = async ({ email, type }: any) => {
        // return await api.getAgents({ email, type });
        return [];
    }
    addAgent = async (agent: IAgent) => {
        // await api.addAgent(agent);
        return Promise.resolve();
    }
    updateAgent = async (agent: IAgent) => {
        // await api.updateAgent(agent)
        return Promise.resolve();
    }
    getPoints = async () => {
        // return await api.getPoints({});
        return 1000;
    }
    getConversation = async () => {
        return await api.getConversation({
            offset: 0
        });
    }

}

export default new UserServiceMock();