import NextAuth, { AuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { encode } from 'next-auth/jwt'
import { COOKIE_NAME } from "@/constants/auth";
import SequelizeAdapter from "@auth/sequelize-adapter"
import Users from '@/models/users'
import db from '@/models/db'
import { createAccessKey } from "@/service/access";
import { Adapter } from "next-auth/adapters";
import { ADMIIN_EMAILS, ADMIIN_PASSWORD } from "@/constants/site";

// import { DataTypes } from "sequelize";
// const isProd = process.env.VERCEL_ENV === "production";
// console.log(process.env.VERCEL_ENV)
const providers = [
    CredentialsProvider({
        name: "Credentials",
        credentials: {
            username: { label: "Username", type: "text", placeholder: "user name" },
            password: {
                label: "Password",
                type: "password",
                placeholder: "password",
            },
        },
        async authorize(credentials: any, req) {
            console.log(credentials)
            console.log(ADMIIN_EMAILS)
            console.log(ADMIIN_PASSWORD)
            if (ADMIIN_EMAILS.includes(credentials.username) && credentials.password === ADMIIN_PASSWORD) {
                return {
                    name: credentials.username,
                    email: credentials.username,
                } as User
            }
            return null;
        },
    }),
]

const adapter = SequelizeAdapter(db, {
    models: {
        User: Users as any
    }
}) as unknown as Adapter;
// db.sync();
const options: AuthOptions = {

    debug: false,// process.env.VERCEL_ENV !== "production",
    cookies: {
        sessionToken: {
            name: COOKIE_NAME,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: true
            }
        }
    },
    session: {
        strategy: 'jwt',

    },
    jwt: {
        // maxAge: 60 * 60 * 24 * 30,
        // You can define your own encode/decode functions for signing and encryption
        async encode(params): Promise<string> {
            const maxAge = 60 * 60 * 24 * 30 * 1000;
            const { token, secret } = params;
            const encodedJWT = await encode({
                token, secret, maxAge
            })
            // console.log(encodedJWT)
            return encodedJWT;
        }
    },
    providers: [
        // EmailProvider({
        //     // server: process.env.EMAIL_SERVER,
        //     // from: process.env.EMAIL_FROM
        //     server: {
        //         host: process.env.EMAIL_SERVER_HOST,
        //         port: process.env.EMAIL_SERVER_PORT,
        //         auth: {
        //             user: process.env.EMAIL_SERVER_USER,
        //             pass: process.env.EMAIL_SERVER_PASSWORD
        //         }
        //     },
        //     from: process.env.EMAIL_FROM
        // }),
        // GoogleProvider({
        //     clientId: GOOGLE_CLIENT_ID,
        //     clientSecret: GOOGLE_CLIENT_SECRET,
        // }),
        // AzureADProvider({
        //     name: 'Microsoft Account',
        //     clientId: process.env.AZURE_AD_CLIENT_ID,
        //     clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
        //     // tenantId: process.env.AZURE_AD_TENANT_ID,
        //     style: {
        //         logo: absolute("/icons/microsoft.svg"),
        //         logoDark: "/azure-dark.svg",
        //         bg: "#fff",
        //         text: "#000",
        //         bgDark: "#0072c6",
        //         textDark: "#fff",
        //     }
        // }),
        // GitHubProvider({
        //     clientId: GITHUB_CLIENT_ID,
        //     clientSecret: GITHUB_CLIENT_SECRET,
        // }),
        ...providers
    ],
    adapter,
    pages: {
        // signOut: "/auth/signout",
        // newUser: "/auth/new-user",
        signIn: "/auth/signin",
        // error: "/auth/error",
        // verifyRequest: "/auth/verify-request",
    },
    callbacks: {
        async redirect({ url, baseUrl }) {
            console.log(url, baseUrl)
            const baseURL = process.env.NEXTAUTH_URL;

            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseURL}${url}`
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseURL) return url
            return baseURL
        }
        // async session({ session, token, user }) {
        //     console.log('session', session, token)
        //     return session
        // },
        // async jwt({ token, user, account, profile, isNewUser }) {
        //     console.log('tokenxx', token)
        //     return token
        // }

        // async signIn({
        //     user,
        //     account,
        //     profile,
        //     email,
        // }): Promise<boolean> {
        //     // Check if the user already exists in your database based on their Google ID
        //     // console.log(user, account, profile)
        //     if (email && email?.verificationRequest) {
        //         return true;
        //     }

        //     await createAccessKey(user.email);
        //     return true;
        // },

    },
    theme: {
        colorScheme: "light", // "auto" | "dark" | "light"
        brandColor: "#4da953", // Hex color code
        logo: "/logo.svg", // Absolute URL to image
        buttonText: "#FFF" // Hex color code
    }
};

const handler = NextAuth(options)

export { handler as GET, handler as POST }