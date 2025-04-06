/**
 * use in office, side
 */

import { NextRequest, NextResponse } from "next/server";

import { absolute } from "@/utils";
import { regist } from "@/service/user";
import { createAccessKey } from "@/service/access";
import { AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET } from "@/constants/auth";

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
    const redirect_uri = absolute("/auth/add-on/callback/azure-ad");
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
}

async function getUserProfile(accessToken): Promise<User> {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const userProfile = await response.json();
    return userProfile;
}



export async function GET(req: NextRequest) {
    // 重定向到登录页面
    const searchParams = req.nextUrl.searchParams
    const authCode = searchParams.get('code');
    const host = req.nextUrl.hostname;
    const tokenData = await getToken(authCode);
    const userProfile = await getUserProfile(tokenData.access_token);

    const email = userProfile.mail;
    await regist(email);
    const result = await createAccessKey(email);

    return NextResponse.redirect(`https://${host}/office-chat/auth/index.html?key=${result}`)
}
