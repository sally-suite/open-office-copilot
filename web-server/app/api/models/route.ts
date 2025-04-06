/**
 * Get message from message table by conversation id
 */

import { NextResponse } from "next/server";
import user from "@/models/users";

export async function GET(request: Request) {
  // const list = await user.findAll();

  //   const { searchParams } = new URL(request.url);
  //   const id = searchParams.get("id");
  //   const res = await fetch(`https://data.mongodb-api.com/product/${id}`, {
  //     headers: {
  //       "Content-Type": "application/json",
  //       "API-Key": process.env.DATA_API_KEY,
  //     },
  //   });
  //   const product = await res.json();

  return NextResponse.json({ code: 0, data: [], message: "" });
}
