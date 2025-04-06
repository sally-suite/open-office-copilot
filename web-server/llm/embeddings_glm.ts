import { GLM_API_KEY } from "@/constants/llm";
import { ZhipuAI } from 'zhipuai-sdk-nodejs-v4';
import { EmbeddingsResponse } from "zhipuai-sdk-nodejs-v4/dist/types/embeddings";

// Create instance

export const embeddings = async (input: string): Promise<EmbeddingsResponse> => {
  const client = new ZhipuAI({
    apiKey: GLM_API_KEY
  })
  const events = await client.embeddings.create({
    input: input,
    model: 'embedding-2',
    encodingFormat: "",
    user: "",
    sensitiveWordCheck: undefined
  });
  // Embed queries
  return events;
};
