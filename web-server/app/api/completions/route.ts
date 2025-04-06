import { NextResponse } from "next/server";
import { completion } from "@/llm/completion";

// export const runtime = "edge";

export async function POST(req: Request) {
  const { prompt, stop, temperature } = await req.json();
  // console.log(prompt)
  const result = await completion(prompt, stop);
  return NextResponse.json({
    code: 0,
    data: result,
  });
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
