import { IUserOrderState } from 'chat-list/types/license';
import { IUserService } from 'chat-list/types/api/user'
import api from '@api/index';
import { login } from 'chat-list/service/auth'
import { getLocalStore, setLocalStore } from 'chat-list/local/local'
import { IUserMessage } from 'chat-list/types/user';
import { IAgent } from 'chat-list/types/agent';

class UserService implements IUserService {
    login: (license: string) => Promise<string> = async (licenseKey: string) => {
        const token = await login(licenseKey)
        return token;
    };
    getEmail = (): Promise<string> => {
        return Promise.resolve('');
    };
    setUserProperty: (key: string, value: string) => Promise<void> = async (key: string, value: string) => {
        // await sleep()
        setLocalStore(key, value)
        return Promise.resolve();
    };
    getUserProperty: (key: string) => Promise<string> = async (key: string) => {
        const value = getLocalStore(key) as unknown as string;
        return Promise.resolve(value);
    };
    checkUser = async (): Promise<IUserOrderState> => {
        // await sleep();
        // const result = await api.checkUser(null);
        // // debugger;
        // return result;
        return Promise.resolve({
            type: 1,
            state: 'paid',
            email: 'test@mail.com',
            order: null,
            version: 'pro',
            exp: Date.now() + 1000000,
            points: 999999,
            key: 'test',
        } as unknown as IUserOrderState)
    };
    sentMessage? = async (message: IUserMessage) => {
        // await api.sentMessage(message);

    };
    getAgent = async (id: string) => {
        return await api.getAgent({ id });
    }
    getAgents = async ({ email, type }: any) => {
        // return await api.getAgents({ email, type });
        return Promise.resolve([]);
    }
    addAgent = async (agent: IAgent) => {
        await api.addAgent(agent);
        return Promise.resolve();
    }
    updateAgent = async (agent: IAgent) => {
        await api.updateAgent(agent)
        return Promise.resolve();
    }
    getPoints = async () => {
        return await api.getPoints({});
    }
    getConversation = async () => {
        return await api.getConversation({
            offset: 0
        });
    }
}

export default new UserService();