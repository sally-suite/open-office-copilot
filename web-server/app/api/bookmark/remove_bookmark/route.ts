import { NextResponse } from "next/server";
import bookmarks from "@/models/bookmarks";

export async function POST(req: Request) {
  const email: string = req.headers.get('email') || ''

  const body = await req.json();
  const {
    id
  } = body;

  const deletedRows = await bookmarks.destroy({
    where: {
      id: id,
      email: email
    }
  })

  return NextResponse.json({ code: 0, data: deletedRows, message: "" });
}

export async function GET(request: Request) {

  return NextResponse.json({ code: 0, data: null, message: "" });
}
