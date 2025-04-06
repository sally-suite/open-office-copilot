import { OpenAI } from "langchain/llms/openai";
import { OPENAI_API_HOST, OPENAI_API_KEY } from "@/constants/llm";


export async function completion(prompt: string, stop: string[]) {
  const llm = new OpenAI(
    {
      openAIApiKey: OPENAI_API_KEY,
      temperature: 1,
      maxTokens: 999999,
      streaming: true,
      stop: ["\n"],
    },
    {
      basePath: `${OPENAI_API_HOST}/v1`,
    }
  );

  console.log(prompt)
  const msgs: string[] = [];
  await llm.call(prompt, {
    callbacks: [
      {
        handleLLMNewToken(token: string) {
          msgs.push(token);
        },
      },
    ],
  });
  return msgs.join("");
}
