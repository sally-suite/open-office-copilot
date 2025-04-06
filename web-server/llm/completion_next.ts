import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { OPENAI_API_HOST, OPENAI_API_KEY } from "@/constants/llm";

const config = new Configuration({
  apiKey: OPENAI_API_KEY,
  basePath: `${OPENAI_API_HOST}/v1`,
});
const openai = new OpenAIApi(config);

// export const runtime = "edge";

export async function completion(prompt: string, temperature: number) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    stream: true,
    temperature: temperature || 0.6,
    prompt,
  });
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream).text();
}
