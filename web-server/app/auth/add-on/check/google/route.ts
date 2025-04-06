/**
 * use in office, side
 */

import { NextRequest } from "next/server";
import { regist } from "@/service/user";
import { createAccessKey } from "@/service/access";
import { google } from 'googleapis';

async function registerUser(email: string): Promise<void> {
    await regist(email); // 假设这是你定义的注册逻辑

}

export async function POST(req: Request): Promise<Response> {
    try {
        const body = await req.json();
        const accessToken = body.access_token;

        if (!accessToken) {
            return new Response(JSON.stringify({ error: "Missing access_token" }), { status: 400 });
        }

        // 使用 OAuth2Client 初始化
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });

        // 通过 oauth2Client 初始化 OAuth2 API
        const oauth2 = google.oauth2({
            auth: oauth2Client, // 使用 OAuth2Client 进行授权
            version: "v2",
        });

        // 调用 API 获取用户信息
        const userInfo = await oauth2.userinfo.get();
        const email = userInfo?.data?.email;

        if (!email) {
            return new Response(JSON.stringify({ error: "Failed to fetch user email" }), { status: 400 });
        }

        // 用户注册和初始化
        await registerUser(email);

        // 生成自定义访问密钥
        const result = await createAccessKey(email); // 假设 createAccessKey 是你定义的逻辑

        // 返回结果
        return new Response(JSON.stringify({ key: result }), { status: 200 });
    } catch (error) {
        console.error("Error processing request:", error);
        return new Response(JSON.stringify({ error: "Internal server error", details: error.message }), { status: 500 });
    }
}


export async function GET(req: NextRequest) {
    // console.log('google callback')
    // // 重定向到登录页面
    // const host = req.nextUrl.hostname;
    // const searchParams = req.nextUrl.searchParams
    // const authCode = searchParams.get('code');
    // const redirect_uri = (absolute(`/auth/add-on/callback/google`));

    // const oauth2Client = new google.auth.OAuth2(
    //     GOOGLE_CLIENT_ID_ADD_ON, // 来自 Google Cloud 的客户端 ID
    //     GOOGLE_CLIENT_SECRET_ADD_ON, // 客户端密钥
    //     redirect_uri // 重定向 URI
    // );
    // const { tokens } = await oauth2Client.getToken(authCode);
    // oauth2Client.setCredentials(tokens);

    // // 获取用户信息
    // const oauth2 = google.oauth2({
    //     auth: oauth2Client,
    //     version: "v2",
    // });

    // const userInfo = await oauth2.userinfo.get();

    // const email = userInfo.data.email;

    // await regist(email);
    // await initPoints(email);
    // await initSubscription(email);
    // const result = await createAccessKey(email);

    // return NextResponse.redirect(`https://${host}/office-chat/auth/index.html?key=${result}`)
}
