/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import bookmarks from "@/models/bookmarks";
import { type NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const email: string = req.headers.get('email') || '';
  const body = await req.json();
  const {
    limit = 9999,
    offset = 0,
    type,
    agent
  } = body;
  let list = [];
  if (agent == 'all') {
    list = await bookmarks.findAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      where: {
        type,
        email
      }
    });
  } else {
    list = await bookmarks.findAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      where: {
        type,
        agent,
        email
      }
    });
  }
  return NextResponse.json({ code: 0, data: list, message: '' });
}

export async function GET(request: Request) {

  return NextResponse.json({ code: 0, data: null, message: "" });
}
