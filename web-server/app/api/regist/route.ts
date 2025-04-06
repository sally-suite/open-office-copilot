/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import { regist } from "@/service/user";

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;
  const data = await regist(email);
  return NextResponse.json({
    code: 0, data: data
  });

  // return NextResponse.json({
  //   code: 0, data: {
  //     "id": 1,
  //     "username": "hongyin163@gmail.com",
  //     "password": "",
  //     "email": "hongyin163@gmail.com",
  //     "registrationDate": "2023-08-17T00:00:00.000Z",
  //     "createdAt": "2023-08-17T10:08:47.712Z",
  //     "updatedAt": "2023-08-17T10:08:47.713Z"
  //   }, message: ""
  // });
}

export async function GET(request: Request) {
  const body = await request.json();
  const { email } = body;
  const data = await regist(email);
  return NextResponse.json({ code: 0, data, message: "" });
}
