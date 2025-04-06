export const DEFAULT_SYSTEM_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT ||
  "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.";

export const OPENAI_API_HOST =
  process.env.OPENAI_API_HOST || "https://api.openai.com";

export const OPENAI_API_HOST_GPT4 =
  process.env.OPENAI_API_HOST_GPT4 || "https://api.openai.com";

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

export const OPENAI_API_KEY_GPT4 = process.env.OPENAI_API_KEY_GPT4 || "";

export const DEFAULT_TEMPERATURE = parseFloat(
  process.env.NEXT_PUBLIC_DEFAULT_TEMPERATURE || "1"
);

export const OPENAI_API_TYPE = process.env.OPENAI_API_TYPE || "openai";

export const OPENAI_API_VERSION =
  process.env.OPENAI_API_VERSION || "2023-03-15-preview";

export const OPENAI_ORGANIZATION = process.env.OPENAI_ORGANIZATION || "";

export const AZURE_DEPLOYMENT_ID = process.env.AZURE_DEPLOYMENT_ID || "";

export const LLAMA_API_HOST =
  process.env.LLAMA_API_HOST || "http://127.0.0.1:8000";

export const LLAMA_STREAM_MODE = process.env.LLAMA_STREAM_MODE || "1";

export const GLM_API_KEY = process.env.GLM_API_KEY || "";

export const QIANFAN_ACCESS_KEY = process.env.QIANFAN_ACCESS_KEY || "";
export const QIANFAN_SECRET_KEY = process.env.QIANFAN_SECRET_KEY || "";

export const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
export const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "";

export const DEEPBRICKS_API_KEY = process.env.DEEPBRICKS_API_KEY || "";
export const DEEPBRICKS_BASE_URL = process.env.DEEPBRICKS_BASE_URL || "";

export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
export const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || "";


export const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY || "";
export const SILICONFLOW_BASE_URL = process.env.SILICONFLOW_BASE_URL || "";


export const FREE_API_KEY = process.env.FREE_API_KEY || "";
export const FREE_BASE_URL = process.env.FREE_BASE_URL || "";


export const LANGFUSE_SECRET_KEY = process.env.LANGFUSE_SECRET_KEY || "";
export const LANGFUSE_PUBLIC_KEY = process.env.LANGFUSE_PUBLIC_KEY || "";
export const LANGFUSE_HOST = process.env.LANGFUSE_HOST || "";


export const ALIYUN_API_KEY = process.env.ALIYUN_API_KEY || "";
export const ALIYUN_BASE_URL = process.env.ALIYUN_BASE_URL || "";

