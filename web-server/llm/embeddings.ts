import { OPENAI_API_HOST, OPENAI_API_KEY } from "@/constants/llm";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
// Create instance

export const embeddings = async (input: string): Promise<number[]> => {
  const embeddingsInstance = new OpenAIEmbeddings(
    {
      openAIApiKey: OPENAI_API_KEY,
    },
    {
      basePath: `${OPENAI_API_HOST}/v1`,
    }
  );

  // Embed queries
  return embeddingsInstance.embedQuery(input)
};
