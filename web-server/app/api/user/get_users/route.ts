/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import users from "@/models/users";
import { getToken } from "next-auth/jwt"
import { type NextRequest } from 'next/server'
import { isAdmin } from "@/service/auth";

export async function GET(req: NextRequest) {

  const email: string = req.headers.get('email') || ''
  if (isAdmin(email)) {
    const searchParams = req.nextUrl.searchParams
    const limit: number = Number(searchParams.get('limit')) || 50;
    const offset = Number(searchParams.get('offset'));
    const list = await users.findAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    return NextResponse.json({ code: 0, data: list, message: '' });
  }

  return NextResponse.json({ code: 0, data: [], message: '' });
}
