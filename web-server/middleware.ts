import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware"
import { decode } from 'next-auth/jwt'
import { COOKIE_NAME, NEXTAUTH_SECRET } from "./constants/auth";
import { ADMIIN_EMAILS } from "./constants/site";
// import { checkAccesskey } from "./service/access";

const apiRegex = /^\/api(?!\/admin\b).*/;


const addCors = async (req) => {
  // const { name, email, picture } = req['token'];
  // req.headers.set('email', email);
  const requestHeaders = new Headers(req.headers);
  // console.log(req.nextauth.token)
  // You can also set request headers in NextResponse.rewrite
  const response = NextResponse.next({
    request: {
      // New request headers
      // nextauth: { token },
      headers: requestHeaders,
    },
  });

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization,request-id"
  );
  return response;
}

const authMiddleware: any = withAuth(addCors, {
  pages: {
    // signIn: "/auth/signin",
    // signOut: '/auth/signout',
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (used for check email message)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  },

  callbacks: {
    authorized: async ({ token, req }) => {
      const authorization = req.headers.get('authorization');
      let tokenValue = '';
      if (authorization) {
        tokenValue = authorization.split(' ')[1]
      } else {
        tokenValue = req.cookies.get(COOKIE_NAME)?.value
      }

      const decodeToken = await decode({

        token: tokenValue, secret: NEXTAUTH_SECRET
      })

      // req['token'] = decodeToken
      // req.nextauth = { token }
      req.headers.set('email', decodeToken?.email);

      const pathname = req.nextUrl.pathname;
      if (pathname.startsWith('/admin')) {
        if (ADMIIN_EMAILS.includes(decodeToken?.email)) {
          return true;
        } else {
          return false;
        }
      }
      return !!decodeToken;
    },
  }
})


export default function middleware(req: NextRequest) {
  // const { name, email, picture } = req['token'];
  // req.headers.set('email', email);
  if (req.method === 'OPTIONS') {
    const requestHeaders = new Headers(req.headers);
    // console.log(req.nextauth.token)
    // You can also set request headers in NextResponse.rewrite
    const response = NextResponse.next({
      request: {
        // New request headers
        headers: requestHeaders,
      },
    });

    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization,request-id"
    );
    return response;
  }
  // req.nextUrl

  // req.nextUrl
  const { pathname } = req.nextUrl;
  if (apiRegex.test(pathname)) {
    return addCors(req)
  }

  return authMiddleware(req as any);
}
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
  ],
};
