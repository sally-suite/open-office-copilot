import AccessKey from "@/models/access_key"
import crypto from 'crypto'
import { kv } from "@vercel/kv";

function generateAccessKey(licenseData) {
    // 将许可证数据序列化为 JSON 格式
    const licenseDataJson = JSON.stringify(licenseData);

    // 创建随机的盐（salt）并添加到许可证数据中
    const salt = crypto.randomBytes(16).toString('hex');
    const saltedData = licenseDataJson + salt;

    // 使用 SHA-256 哈希算法生成许可证密钥
    const accessKey = crypto.createHash('sha256').update(saltedData).digest('hex');

    // 返回许可证密钥和盐
    return { accessKey, salt };
}

export function validateAccessKey(accessKey: string, salt: string, email: string) {
    const saltedData = JSON.stringify({ email }) + salt;
    const hashedAccessKey = crypto.createHash('sha256').update(saltedData).digest('hex');

    return accessKey === hashedAccessKey;
}

export async function checkAccesskey(accessKey: string): Promise<{ valid: boolean, data?: any, message?: string }> {
    try {
        // 首先从kv里获取accessKey
        const email = await kv.get(accessKey);
        if (email) {
            return { valid: true, data: { email }, message: 'Access key is valid' };
        }

        const data = await AccessKey.findOne({
            where: {
                key: accessKey
            }
        });

        if (data) {
            // 验证accessKey是否有效
            const isValid = validateAccessKey(accessKey, data.salt, data.email);
            if (isValid) {
                // 将accessKey存入kv中
                await kv.set(accessKey, data.email);
                return { valid: true, data, message: 'Access key is valid' };
            } else {
                return { valid: false, data, message: 'Invalid access key' };
            }
        } else {
            return { valid: false, data, message: 'Invalid access key' };
        }
    } catch (error) {
        return { valid: false, message: 'Error validating access key' };
    }
}

export const createAccessKey = async (email: string) => {
    const item = await AccessKey.findOne({
        where: {
            email: email
        }
    })
    if (item) {
        return item.key;
    }
    const token = generateAccessKey({
        email
    })
    const { accessKey, salt } = token;
    const result = await AccessKey.create({
        email: email,
        key: accessKey,
        salt
    })
    return result.key;
}