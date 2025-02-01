import openaiLogo from 'chat-list/assets/img/openai.png';
import deepseekLogo from 'chat-list/assets/img/deepseek.png';
import claudeLogo from 'chat-list/assets/img/claude.png';

export const VersionModelMapping: any = {
    'chrome': ['gpt-4o-mini', 'gpt-4o', 'deepseek-chat', 'claude-3.5-haiku'],
    'excel': ['gpt-4o-mini', 'gpt-4o', 'deepseek-chat', 'claude-3.5-haiku'],
    'powerpoint': ['gpt-4o-mini', 'gpt-4o', 'deepseek-chat', 'claude-3.5-haiku'],
    'outlook': ['gpt-4o-mini', 'gpt-4o', 'deepseek-chat', 'claude-3.5-haiku'],
    'word': ['gpt-4o-mini', 'gpt-4o', 'deepseek-chat', 'claude-3.5-haiku'],
    'trial': ['gpt-4o-mini', 'deepseek-chat'],
    'free': ['gpt-4o-mini', 'deepseek-chat'],
    'basic': ['gpt-4o-mini', 'gpt-4o', 'deepseek-chat', 'claude-3.5-haiku'],
    'standard': ['gpt-4o-mini', 'gpt-4o', 'o1-mini', 'deepseek-chat', 'claude-3.5-haiku'],
    'pro': ['gpt-4o-mini', 'gpt-4o', 'o1-mini', 'claude-3.5-sonnet', 'deepseek-chat', 'claude-3.5-haiku'],
    'flex': []
}

export const ModelTip: any = {
    'gpt-4o-mini': ['TRIAL', 'Fast+'],
    'deepseek-chat': ['TRIAL', 'Fast+'],
    'gpt-4o': ['BASIC+', ' Fast'],
    'o1-mini': ['STANDARD+', 'Slow'],
    'claude-3.5-sonnet': ['PRO', 'Slow'],
    'claude-3.5-haiku': ['STANDARD+', 'Slow'],
}

export const ModelIcon: any = {
    'gpt-4o-mini': openaiLogo,
    'deepseek-chat': deepseekLogo,
    'gpt-4o': openaiLogo,
    'o1-mini': openaiLogo,
    'claude-3.5-sonnet': claudeLogo,
    'claude-3.5-haiku': claudeLogo,
}

export const NotSupportToolCallModel: { [x: string]: boolean } = {
    'claude-3.5-sonnet': true,
    'claude-3.5-haiku': true,
    // 'deepseek-chat': true,
}

export const IsSupportToolCallModel = (model = '') => {
    const name = model.toLowerCase();
    if (name.includes('gpt') || name.includes('o1') || name.includes('claude')) {
        return true;
    }
    return false;
}

export const Providers = [

    // {
    //     id: 'anthropic',
    //     name: 'Anthropic',
    //     logo: claudeLogo,
    //     baseUrl: 'https://api.anthropic.com',
    // },

    {
        id: 'custom',
        name: 'Custom',
        baseUrl: '',
    },
    {
        id: 'openai',
        name: 'OpenAI',
        logo: openaiLogo,
        baseUrl: 'https://api.openai.com/v1',
        siteUrl: 'https://openai.com/'
    },
    {
        id: 'openrouter',
        name: 'OpenRouter',
        baseUrl: 'https://openrouter.ai/api/v1',
        siteUrl: 'https://openrouter.ai/'
    },
    {
        id: 'siliconflow',
        name: 'SiliconFlow',
        baseUrl: 'https://api.siliconflow.cn/v1',
        siteUrl: 'https://www.siliconflow.cn/'
    },
    {
        id: 'deepseek',
        name: 'DeepSeek',
        baseUrl: 'https://api.deepseek.com',
        siteUrl: 'https://platform.deepseek.com/',
    }
]

export const ProvidersMap = Providers.reduce((acc: any, cur: any) => {
    return {
        ...acc,
        [cur.id]: cur
    }
}, {})