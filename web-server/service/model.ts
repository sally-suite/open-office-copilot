import Models, { UserModelsModel } from '@/models/user_models';

const modelCache = new Map<string, { data: UserModelsModel; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 缓存时间，单位毫秒（这里是 5 分钟）

export const getModelConfig = async (provider: string, model: string): Promise<UserModelsModel> => {
    const cacheKey = provider + model;
    const cached = modelCache.get(cacheKey);

    if (cached && Date.now() < cached.expiresAt) {
        return cached.data;
    }

    const config = await Models.findOne({
        where: { provider, model }
    });

    if (config) {
        modelCache.set(cacheKey, { data: config, expiresAt: Date.now() + CACHE_TTL });
    }

    return config;
};

export const resetModelCache = (provider: string, model: string) => {
    modelCache.delete(provider + model);
};
