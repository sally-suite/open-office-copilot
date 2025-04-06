import Config, { ConfigModel } from '../models/config';

// 创建一个 Map 用于缓存
const configCache = new Map<string, ConfigModel>();

export const getConfig = async (name: string): Promise<any> => {
    // 检查缓存中是否已有该配置
    if (configCache.has(name)) {
        const cacheResult = configCache.get(name);
        return JSON.parse(cacheResult.value);
    }

    // 从数据库中获取配置
    const result = await Config.findOne({
        where: {
            name: name
        }
    });

    // 如果获取到了配置，则将其缓存起来
    if (result) {
        configCache.set(name, result);
        return JSON.parse(result.value);
    }

    return null;
}
