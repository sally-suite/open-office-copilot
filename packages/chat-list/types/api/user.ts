import { IUserOrderState } from "chat-list/types/license";
import { IApiLimit, IPlan, IUserMessage } from "chat-list/types/user";
import { IAgent } from "../agent";
import { IConversation } from "../conversation";


export interface IUserService {
    login: (license: string) => Promise<string>;
    getEmail: () => Promise<string>;
    setUserProperty: (key: string, value: string) => Promise<void>;
    getUserProperty: (key: string) => Promise<string>;
    checkUser: () => Promise<IUserOrderState>;
    getPoints?: () => Promise<number>;
    deductPoints?: (message: IUserMessage) => Promise<void>;
    getAgents?: (params: { email: string, type: string }) => Promise<IAgent[]>;
    updateAgent?: (agent: IAgent) => Promise<void>;
    addAgent?: (agent: IAgent) => Promise<void>;
    getAgent?: (id: string) => Promise<IAgent>;
    getConversation?: (offset?: number, limit?: number) => Promise<IConversation[]>;
    addPlan?: (plan: IPlan) => Promise<void>;
    getPlan?: (id: string) => Promise<IPlan>;
    removePlan?: (id: string) => Promise<void>;
    getPlanList?: () => Promise<IPlan[]>;
}
