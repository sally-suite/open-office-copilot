import { DEEPSEEK_API_KEY, OPENROUTER_API_KEY, SILICONFLOW_API_KEY } from './llm'

export const modelMapping = {
    'glm-4': 'glm-4-0520',
    "gpt-4o": "gpt-4o-2024-08-06",
    "claude-3.5-sonnet": "anthropic/claude-3.5-sonnet",
    "claude-3.5-haiku": "anthropic/claude-3.5-haiku",
    "deepseek-chat": "deepseek-ai/DeepSeek-V3",
    "deepseek-reasoner": "deepseek-ai/DeepSeek-R1",
}

export const VersionModelMapping: { [x: string]: string[] } = {
    'chrome': ['gpt-4o-mini', 'gpt-4o', 'deepseek-chat', 'claude-3.5-haiku'],
    'excel': ['gpt-4o-mini', 'gpt-4o', 'deepseek-chat', 'claude-3.5-haiku'],
    'powerpoint': ['gpt-4o-mini', 'gpt-4o', 'deepseek-chat', 'claude-3.5-haiku'],
    'outlook': ['gpt-4o-mini', 'gpt-4o', 'deepseek-chat', 'claude-3.5-haiku'],
    'word': ['gpt-4o-mini', 'gpt-4o', 'deepseek-chat', 'claude-3.5-haiku'],
    'trial': ['gpt-4o-mini', 'deepseek-chat'],
    'free': ['gpt-4o-mini', 'deepseek-chat'],
    'basic': ['gpt-4o-mini', 'gpt-4o', 'deepseek-chat', 'claude-3.5-haiku'],
    'standard': ['gpt-4o-mini', 'gpt-4o', 'o1-mini', 'o3-mini', 'deepseek-chat', 'deepseek-reasoner', 'claude-3.5-haiku'],
    'pro': ['gpt-4o-mini', 'gpt-4o', 'o1-mini', 'o3-mini', 'claude-3.5-sonnet', 'deepseek-chat', 'deepseek-reasoner', 'claude-3.5-haiku'],
    'flex': []
}


export const buildVersionModelMatrix = () => {
    const matrix = {}
    Object.entries(VersionModelMapping).forEach(([version, models]) => {
        matrix[version] = {};
        models.forEach(model => {
            matrix[version][model] = true;
        });
    });
    return matrix;
}

export const VersionModelMatrix = buildVersionModelMatrix();

export const isModelSupported = (version: string, model: string) => {
    return VersionModelMatrix[version][model] || false;
}

export const ProviderBaseUrl = {
    'openai': {
        baseUrl: 'https://api.openai.com/v1',
        models: [
            {
                id: 'gpt-4o-mini',
                name: 'GPT-4o Mini',
            },
            {
                id: 'gpt-4o',
                name: 'GPT-4o',
            },
            {
                id: 'o3-mini',
                name: 'O3 Mini',
            },
            {
                id: 'o3',
                name: 'O3'
            }
        ],
    },
    'deepseek': {
        baseUrl: 'https://api.deepseek.com',
        apiKey: DEEPSEEK_API_KEY
    },
    'openrouter': {
        baseUrl: 'https://openrouter.ai/api/v1',
        apiKey: OPENROUTER_API_KEY
    },
    'siliconflow': {
        apiKey: SILICONFLOW_API_KEY,
        baseUrl: 'https://api.siliconflow.cn/v1',
    }
}