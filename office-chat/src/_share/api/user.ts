import { IUserOrderState } from 'chat-list/types/license';
import { IUserService } from 'chat-list/types/api/user'
import { sleep } from 'chat-list/utils';
import api from '@api/index';
import { login } from 'chat-list/service/auth'
import { getLocalStore, setLocalStore } from 'chat-list/local/local'
import { IApiLimit, IUserMessage } from 'chat-list/types/user';
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
        const result = await api.checkUser(null);
        return result;
    };
    sentMessage? = async (message: IUserMessage) => {
        await api.sentMessage(message);
    };
    getAgent = async (id: string) => {
        return await api.getAgent({ id });
    }
    getAgents = async ({ email, type }: any) => {
        return await api.getAgents({ email, type });
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

}

export default new UserService();