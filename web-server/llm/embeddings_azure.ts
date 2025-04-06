import { OPENAI_API_HOST, OPENAI_API_KEY } from "@/constants/llm";
import { AzureKeyCredential, Embeddings, OpenAIClient } from "@azure/openai";

// Create instance

export const embeddings = async (input: string): Promise<Embeddings> => {
  const client = new OpenAIClient(OPENAI_API_HOST, new AzureKeyCredential(OPENAI_API_KEY));
  const embeddings = await client.getEmbeddings('text-embedding-ada', [input]);

  return embeddings;
};
