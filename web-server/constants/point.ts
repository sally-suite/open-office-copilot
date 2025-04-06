

export const PointConfig: { [x: string]: number } = {
    'gpt-3.5-turbo': 1,
    'gpt-4o-mini': 0.4,
    'gpt-4': 8,
    'gpt-4o': 3,
    'o1-mini': 7,
    'o3-mini': 7,
    // 'gemini-pro': 0,
    // 'gemini-pro-vision': 0,
    'text-embedding-ada-002': 0.5,
    'gpt-4-vision-preview': 8,
    'glm-4': 10,
    'glm-4v': 10,
    'embedding-2': 0.5,
    'dall-e-3': 10000,
    'search': 500,
    'search-images': 500,
    'ERNIE-Speed-128K': 0,
    'deepseek-chat': 0.4,
    'deepseek-reasoner': 1,
    'deepseek-coder': 0.4,
    'glm-4-air': 0.3,
    'claude-3.5-sonnet': 8,
    'claude-3.5-haiku': 3,
    'google_scholar': 500,
    'google_scholar_cite': 500,
    "gpt-4o-2024-08-06": 3
}


export const PointVersionConfig: { [x: string]: number } = {
    '2': 1000000,
    '5': 2000000,
    '10': 5000000,
    '20': 11000000,
    'pro': 99999999999,//gpt4
    'standard': 5000000,//gpt4
    'ultimate': 99999999999,//gpt4
}
