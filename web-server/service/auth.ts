import { encode } from 'next-auth/jwt'
import { NEXTAUTH_SECRET } from "@/constants/auth";
import { ADMIIN_EMAILS } from "@/constants/site";

interface IToken {
    // 1是订阅用户，2是按点数消费
    type: number,
    state: string,
    email: string,
    version: string,
    interval: string,
    points?: number,
    exp: number,
    key: string,
}

export const getAccessToken = async (email: string): Promise<IToken> => {
    let token;
    if (!email) {
        token = {
            type: 2,
            state: 'anonymous',
            email: 'anonymous@example.com',
            version: 'pro',
            interval: 'day',
            points: 0,
            exp: Date.now() + 999999999
        }
    } else {
        token = {
            type: 2,
            state: 'paid',
            email: email,
            version: 'pro',
            interval: 'day',
            points: 0,
            exp: Date.now() + 999999999
        }
    }

    const key = await encode({
        token,
        secret: NEXTAUTH_SECRET,
        maxAge: 60 * 60 * 24 * 5 * 1000
    })
    return {
        ...token,
        key
    }
}

export const isAdmin = (email: string): boolean => {
    return ADMIIN_EMAILS.includes(email)
}