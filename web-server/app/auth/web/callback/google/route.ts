/**
 * use in office, side
 */

import { NextRequest, NextResponse } from "next/server";

import { absolute } from "@/utils";
import { regist } from "@/service/user";
import { createAccessKey } from "@/service/access";
import { google } from 'googleapis';
import { COOKIE_NAME, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET } from "@/constants/auth";
import { encode } from "next-auth/jwt";

export async function POST(req: Request) {

}

export async function GET(req: NextRequest) {
    console.log('google callback')
    // 重定向到登录页面
    const host = req.nextUrl.hostname;
    const searchParams = req.nextUrl.searchParams
    const authCode = searchParams.get('code');
    const state = searchParams.get('state'); // 获取state参数
    const callbackUrl = state ? decodeURIComponent(state) : '/'; // 解码获取callbackUrl
    const redirect_uri = (absolute(`/auth/web/callback/google`));

    const oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID, // 来自 Google Cloud 的客户端 ID
        GOOGLE_CLIENT_SECRET, // 客户端密钥
        redirect_uri // 重定向 URI
    );
    const { tokens } = await oauth2Client.getToken(authCode);
    oauth2Client.setCredentials(tokens);

    // 获取用户信息
    const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: "v2",
    });

    const userInfo = await oauth2.userinfo.get();

    const email = userInfo.data.email;

    await regist(email);

    const result = await createAccessKey(email);

    // 创建一个包含用户信息的 Cookie
    const token = {
        email: email,
        name: userInfo.data.name,
        picture: userInfo.data.picture,
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
