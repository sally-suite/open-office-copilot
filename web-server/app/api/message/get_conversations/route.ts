/**
 * Get message from message table by conversation id
 */

import { NextRequest, NextResponse } from "next/server";
import conversations from '@/models/conversations'

export async function POST(request: NextRequest) {
  const { limit = 50, offset = 0 } = await request.json();
  const list = await conversations.findAll({
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });
  return NextResponse.json({ code: 0, data: list, message: "" });
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const limit: number = Number(searchParams.get('limit') || 50);
  const offset = Number(searchParams.get('offset') || 0);
  const list = await conversations.findAll({
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });
  return NextResponse.json({ code: 0, data: list, message: "" });
}
