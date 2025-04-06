/**
 * use in office, side
 */

import { NextRequest, NextResponse } from "next/server";

import { absolute } from "@/utils";
import { regist } from "@/service/user";
import { createAccessKey } from "@/service/access";
import { AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET, COOKIE_NAME, NEXTAUTH_SECRET } from "@/constants/auth";
import { encode } from "next-auth/jwt";

export async function POST(req: Request) {


}

interface TokenData {
    token_type: 'Bearer';
    scope: 'User.Read openid profile email';
    expires_in: number;
    ext_expires_in: number;
    access_token: string;
}


async function getToken(authCode): Promise<TokenData> {
    const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    const redirect_uri = absolute("/auth/web/callback/azure-ad");
    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'client_id': AZURE_AD_CLIENT_ID,
            'scope': 'User.Read',
            'code': authCode,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code',
            'client_secret': AZURE_AD_CLIENT_SECRET,
        }),
    });

    const tokenData = await response.json();
    return tokenData;
}

interface User {
    '@odata.context': string;
    userPrincipalName: string;
    id: string;
    displayName: string;
    surname: string;
    givenName: string;
    preferredLanguage: string;
    mail: string;
    mobilePhone: string | null;
    jobTitle: string | null;
    officeLocation: string | null;
    businessPhones: string[];
    picture: string | null;
}

async function getUserProfile(accessToken): Promise<User> {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const profilePhotoSize = 48;
    const userProfile = await response.json();

    // https://docs.microsoft.com/en-us/graph/api/profilephoto-get?view=graph-rest-1.0#examples
    const response1 = await fetch(
        `https://graph.microsoft.com/v1.0/me/photos/${profilePhotoSize}x${profilePhotoSize}/$value`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    // Confirm that profile photo was returned
    let image
    // TODO: Do this without Buffer
    if (response1.ok && typeof Buffer !== "undefined") {
        try {
            const pictureBuffer = await response1.arrayBuffer()
            const pictureBase64 = Buffer.from(pictureBuffer).toString("base64")
            image = `data:image/jpeg;base64, ${pictureBase64}`
        } catch { }
    }

    return {
        ...userProfile,
        picture: image
    };
}



export async function GET(req: NextRequest) {
    // 重定向到登录页面
    const searchParams = req.nextUrl.searchParams
    const authCode = searchParams.get('code');
    const state = searchParams.get('state'); // 获取state参数
    const callbackUrl = state ? decodeURIComponent(state) : '/'; // 解码获取callbackUrl
    const host = req.nextUrl.hostname;
    const tokenData = await getToken(authCode);
    const userProfile = await getUserProfile(tokenData.access_token);

    const email = userProfile.mail;
    await regist(email);

    const result = await createAccessKey(email);
    // 构建Cookie，重定向到个人信息页

    // 创建一个包含用户信息的 Cookie
    const token = {
        email: email,
        name: userProfile.displayName,
        picture: userProfile.picture,
        accessKey: result, // 假设 createAccessKey 返回了 accessKey
    };

    const maxAge = 60 * 60 * 24 * 30 * 1000;
    const encodedJWT = await encode({
        token,
        secret: NEXTAUTH_SECRET,
        maxAge
    })

    // 重定向到之前保存的callbackUrl
    const response = NextResponse.redirect(`https://${host}${callbackUrl}`);

    // 设置 Cookie
    response.cookies.set(COOKIE_NAME, encodedJWT, {
        httpOnly: true, // 防止客户端 JavaScript 访问
        secure: process.env.NODE_ENV === 'production', // 在生产环境中使用 HTTPS
        sameSite: 'strict', // 防止跨站请求伪造（CSRF）攻击
        maxAge: 365 * 24 * 60 * 60, // Cookie 有效期为 7 天
    });
    return response;
}
