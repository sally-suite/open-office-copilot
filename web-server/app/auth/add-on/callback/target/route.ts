/**
 * use in office, side
 */

import { NextRequest, NextResponse } from "next/server";
import { google } from 'googleapis';
import { AZURE_AD_CLIENT_ID, GOOGLE_CLIENT_ID_ADD_ON, GOOGLE_CLIENT_SECRET_ADD_ON } from "@/constants/auth";

export async function POST(req: Request) {

}



export async function GET(req: NextRequest) {
    // 重定向到登录页面
    const searchParams = req.nextUrl.searchParams
    const host = req.nextUrl.hostname;
    const platform = searchParams.get('platform');
    if (platform == 'google') {
        const redirect_uri = (`https://${host}/auth/add-on/callback/google`);

        const oauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID_ADD_ON, // 来自 Google Cloud 的客户端 ID
            GOOGLE_CLIENT_SECRET_ADD_ON, // 客户端密钥
            redirect_uri // 重定向 URI
        );

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/userinfo.email'], // 请求访问的范围
        });

        return NextResponse.redirect(authUrl)
    } else if (platform == 'azure-ad') {
        const redirect_uri = encodeURIComponent(`https://${host}/auth/add-on/callback/azure-ad`);
        var authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize
        ?client_id=${AZURE_AD_CLIENT_ID}
        &response_type=code
        &redirect_uri=${redirect_uri}
        &response_mode=query
        &scope=openid profile User.Read
        &state=12345`;
        return NextResponse.redirect(authUrl)
    }
}
