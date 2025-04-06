import { NextResponse } from "next/server";
import { ErrorInfo } from "@/constants/error";
import { IGetImagesOptions } from "@/types/image";
import { generateImage } from "@/llm/image_deepbricks";

export const maxDuration = 60;
export async function POST(request: Request) {
  const email: string = request.headers.get('email') || ''
  const version: string = request.headers.get('version') || ''
  const body = await request.json();
  const {
    model = 'dall-e-3',
    prompt = '',
    n = 1,
    size = "1024x1024",
    quality = 'standard',
    response_format = 'b64_json',
    style = 'vivid'
  } = body as IGetImagesOptions;


  if (version != 'pro') {
    return NextResponse.json({ code: -1, data: "", message: ErrorInfo.VersionNotSupport });
  }

  let result: any = {};
  try {
    if (!model || model == 'dall-e-3') {
      result = await generateImage({ model, prompt, n, size, quality, style, response_format } as IGetImagesOptions);
    }
    return NextResponse.json({ code: 0, data: result, message: "" });
  } catch (err) {
    return NextResponse.json({ code: -1, data: result, message: err.message });
  }
}

export async function GET(request: Request) {
  return NextResponse.json({ code: 0, data: "", message: "" });
}
