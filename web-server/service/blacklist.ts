import { kv } from '@vercel/kv';

// 黑名单键的前缀
const BLACKLIST_KEY_PREFIX = 'blacklist:';

// 添加到黑名单
export async function addToBlacklist(type: 'ip' | 'user', value: string, reason: string = '') {
    const key = `${BLACKLIST_KEY_PREFIX}${type}:${value}`;
    await kv.set(key, { reason, createdAt: new Date().toISOString() });
    console.log(`Added to blacklist: ${type}:${value}`);
}

// 检查是否在黑名单
export async function isInBlacklist(type: 'ip' | 'user', value: string): Promise<boolean> {
    const key = `${BLACKLIST_KEY_PREFIX}${type}:${value}`;
    const data = await kv.get(key);
    return data !== null;
}

// 获取黑名单信息
export async function getBlackInfo(type: 'ip' | 'user', value: string): Promise<{ reason: string, createdAt: string } | null> {
    const key = `${BLACKLIST_KEY_PREFIX}${type}:${value}`;
    const data = await kv.get(key);
    return data as { reason: string, createdAt: string } | null;
}

// 从黑名单移除
export async function removeFromBlacklist(type: 'ip' | 'user', value: string) {
    const key = `${BLACKLIST_KEY_PREFIX}${type}:${value}`;
    await kv.del(key);
    console.log(`Removed from blacklist: ${type}:${value}`);
}
