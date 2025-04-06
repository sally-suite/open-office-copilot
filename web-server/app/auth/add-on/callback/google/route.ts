/**
 * use in office, side
 */

import { NextRequest, NextResponse } from "next/server";

import { absolute } from "@/utils";
import { regist } from "@/service/user";
import { createAccessKey } from "@/service/access";
import { google } from 'googleapis';
import { GOOGLE_CLIENT_ID_ADD_ON, GOOGLE_CLIENT_SECRET_ADD_ON } from "@/constants/auth";

export async function POST(req: Request) {

}

export async function GET(req: NextRequest) {
    console.log('google callback')
    // 重定向到登录页面
    const host = req.nextUrl.hostname;
    const searchParams = req.nextUrl.searchParams
    const authCode = searchParams.get('code');
    const redirect_uri = (absolute(`/auth/add-on/callback/google`));

    const oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID_ADD_ON, // 来自 Google Cloud 的客户端 ID
        GOOGLE_CLIENT_SECRET_ADD_ON, // 客户端密钥
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

    return NextResponse.redirect(`https://${host}/office-chat/auth/index.html?key=${result}`)
}
