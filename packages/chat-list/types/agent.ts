
export interface IAgent {
    id?: number | string;
    type?: string;
    avatar: string;
    name: string;
    description: string;
    introduce?: string;
    instruction: string;
    tools: string[];
    agents?: string[];
    visibility?: 'private' | 'public';
    status?: 'active' | 'inactive';
    version?: string;
    dataAsContext?: boolean;
    tags?: string[];
    acitions?: string[];
}
