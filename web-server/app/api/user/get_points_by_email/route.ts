import { NextResponse } from "next/server";
import { type NextRequest } from 'next/server';
import UserPoint from '@/models/user_points';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    email,
  } = body;
  const result = await UserPoint.findOne({ where: { email: email } });
  if (result) {
    return NextResponse.json({ code: 0, data: result.points, message: '' });
  }
  return NextResponse.json({ code: 0, data: 0, message: '' });
}
