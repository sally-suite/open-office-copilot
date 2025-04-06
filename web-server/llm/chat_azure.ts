import { OPENAI_API_HOST, OPENAI_API_HOST_GPT4, OPENAI_API_KEY, OPENAI_API_KEY_GPT4 } from "@/constants/llm";
import { OpenAIClient, AzureKeyCredential, EventStream, ChatCompletions } from "@azure/openai";
import { IChatRequest } from "@/types/chat";
import { NextResponse } from "next/server";


export async function chat({ messages, ...rest }: IChatRequest) {
  let apiKey = OPENAI_API_KEY_GPT4;
  let apiHost = OPENAI_API_HOST_GPT4;
  let deploymentId = "gpt-4";
  console.log(rest.model)
  if (rest.model === 'gpt-3.5-turbo') {
    apiKey = OPENAI_API_KEY;
    apiHost = OPENAI_API_HOST;
    deploymentId = "gpt-35-turbo-0125";
  }
  const client = new OpenAIClient(apiHost, new AzureKeyCredential(apiKey));
  const result = await client.getChatCompletions(deploymentId, messages as any, {
    ...rest
  });
  if (result.choices.length > 0) {
    console.log(JSON.stringify(result.choices, null, 2));
    const message = result.choices[0].message;
    const usage = result.usage;
    const {
      content,
      functionCall,
      toolCalls
    } = message;
    return {
      content,
      function_call: functionCall,
      tool_calls: toolCalls,
      usage: {
        completion_tokens: usage?.completionTokens,
        prompt_tokens: usage?.promptTokens,
        total_tokens: usage?.totalTokens,
      }
    }
  }
  return {
    content: '',
    function_call: null,
    tool_calls: [],
    usage: {
      completion_tokens: 0,
      prompt_tokens: 0,
      total_tokens: 0,
    }
  }
}

function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async start(controller) {
      while (true) {
        const { value, done } = await iterator.next()
        console.log('value', value)
        if (done) {
          controller.close();
          break;
        }
        controller.enqueue(value);
      }
    },
  })
}

async function* getChatbotMessages(client, deploymentId, messages, options) {
  const events = await client.streamChatCompletions(deploymentId, messages, options);

  for await (const event of events) {
    for (const choice of event.choices) {
      const delta = choice.delta?.content;
      if (delta !== undefined) {
        console.log('delta', delta)
        yield delta;
      }
    }
  }
}

function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}


const encoder = new TextEncoder()

// '当然！以下是三个自然科学问题：\n\n1. 为什么天空是蓝色的？\n2. 什么是黑洞？它是如何形成的？\n3. 为什么地球上有四季变化？{"content":"当然！以下是三个自然科学问题：\\n\\n1. 为什么天空是蓝色的？\\n2. 什么是黑洞？它是如何形成的？\\n3. 为什么地球上有四季变化？","tool_calls":[]}'
async function* makeIterator() {
  yield encoder.encode('当然！以下是三个自然科学问题\n\n')
  await sleep(200)
  yield encoder.encode('1. 为什么天空是蓝色的？')
  await sleep(200)
  yield encoder.encode('2. 什么是黑洞？它是如何形成的？')
  await sleep(200)
  yield encoder.encode('3. 为什么地球上有四季变化？')
  await sleep(200)
  yield encoder.encode(' {"content":"当然！以下是三个自然科学问题：\\n\\n1. 为什么天空是蓝色的？\\n2. 什么是黑洞？它是如何形成的？\\n3. 为什么地球上有四季变化？","tool_calls":[]}')
}

function mergeToolCalls(toToolCalls, fromToolCalls) {
  fromToolCalls.forEach(fromToolCall => {
    const matchingIndex = toToolCalls.findIndex(toToolCall => toToolCall.index === fromToolCall.index);

    if (matchingIndex !== -1) {
      // 合并已存在的 toolCall
      const toToolCall = toToolCalls[matchingIndex];

      // 合并 function 对象的属性，例如 arguments 和 name
      Object.keys(fromToolCall.function).forEach(key => {
        toToolCall.function[key] += fromToolCall.function[key];
      });

      // 如果 fromToolCall 中有其他属性，也合并到 toToolCall 中
      Object.keys(fromToolCall).forEach(key => {
        if (key !== 'function') {
          toToolCall[key] = fromToolCall[key];
        }
      });
    } else {
      // 如果不存在，则将整个 fromToolCall 添加到 toToolCalls 中
      toToolCalls.push(fromToolCall);
    }
  });

  return toToolCalls;
}

export async function chatStream({ messages, ...rest }: IChatRequest) {
  let apiKey = OPENAI_API_KEY_GPT4;
  let apiHost = OPENAI_API_HOST_GPT4;
  let deploymentId = "gpt-4";
  console.log(rest.model)
  if (rest.model === 'gpt-3.5-turbo') {
    apiKey = OPENAI_API_KEY;
    apiHost = OPENAI_API_HOST;
    deploymentId = "gpt-35-turbo-0125";
  }
  console.log(apiKey, apiHost, deploymentId)
  const client = new OpenAIClient(apiHost, new AzureKeyCredential(apiKey));

  const events = await client.streamChatCompletions(deploymentId, messages as any, { ...rest });

  console.log('NextResponse')
  const textEncoder = new TextEncoder();
  const response = {
    content: '',
    tool_calls: []
  }
  const stream = new ReadableStream({

    async start(controller) {
      for await (const event of events) {
        // console.log(event.usage)

        for (const choice of event.choices) {
          const content = choice.delta?.content;
          const toolCalls = choice.delta?.toolCalls;

          if (content !== undefined && content != null) {
            response.content += content;
            // console.log(content);
            const encodedValue = textEncoder.encode(`string:${content}\n\n`);
            controller.enqueue(encodedValue);
          }
          if (toolCalls != undefined && toolCalls != null) {
            response.tool_calls = mergeToolCalls(response.tool_calls, toolCalls);
          }
        }
        // const res = {
        //   choices: event.choices,
        //   usage: event.usage
        // }
        // const encodedValue = textEncoder.encode('data:' + JSON.stringify(res) + '\n');
        // controller.enqueue(encodedValue);
        // controller.enqueue(textEncoder.encode('\n'));
        // await sleep(100)
      }
      if (!response.content) {
        const encodedValue = textEncoder.encode(`json:${JSON.stringify(response)}\n`);
        controller.enqueue(encodedValue);
      }
      const encodedValue = textEncoder.encode(`status:[DONE]`);
      controller.enqueue(encodedValue);
      controller.close();
    },
  })
  return new Response(stream);

  // for await (const event of events) {
  //   for (const choice of event.choices) {
  //     const delta = choice.delta?.content;
  //     if (delta !== undefined) {
  //       console.log(`Chatbot: ${delta}`);
  //     }
  //   }
  // }
  // if (result.choices.length > 0) {
  //   console.log(result.choices[0].message)
  //   const {
  //     content,
  //     functionCall,
  //     toolCalls
  //   } = result.choices[0].message;
  //   return {
  //     content,
  //     function_call: functionCall,
  //     tool_calls: toolCalls
  //   }
  // }
  // return {
  //   content: '',
  //   function_call: null,
  //   tool_calls: []
  // }
}

export async function chatStream1({ messages, ...rest }: IChatRequest) {
  const iterator = makeIterator();
  const stream = iteratorToStream(iterator);
  return new Response(stream);

  // for await (const event of events) {
  //   for (const choice of event.choices) {
  //     const delta = choice.delta?.content;
  //     if (delta !== undefined) {
  //       console.log(`Chatbot: ${delta}`);
  //     }
  //   }
  // }
  // if (result.choices.length > 0) {
  //   console.log(result.choices[0].message)
  //   const {
  //     content,
  //     functionCall,
  //     toolCalls
  //   } = result.choices[0].message;
  //   return {
  //     content,
  //     function_call: functionCall,
  //     tool_calls: toolCalls
  //   }
  // }
  // return {
  //   content: '',
  //   function_call: null,
  //   tool_calls: []
  // }
}
export async function chatWithGPT4({ messages, ...rest }: IChatRequest) {
  console.log('chatWithGPT4')
  const client = new OpenAIClient(OPENAI_API_HOST_GPT4, new AzureKeyCredential(OPENAI_API_KEY_GPT4));
  const deploymentId = "sheet-chat-gpt4-23k";
  const result = await client.getChatCompletions(deploymentId, messages as any, {
    ...rest
  });
  if (result.choices.length > 0) {
    console.log(result.choices[0].message)
    const {
      content,
      functionCall,
      toolCalls
    } = result.choices[0].message;
    return {
      content,
      function_call: functionCall,
      tool_calls: toolCalls
    }
  }
  return {
    content: '',
    function_call: null,
    tool_calls: []
  }
}

export async function chatStreamWithGPT4({ messages, ...rest }: IChatRequest) {
  console.log('chatWithGPT4')
  const client = new OpenAIClient(OPENAI_API_HOST_GPT4, new AzureKeyCredential(OPENAI_API_KEY_GPT4));
  const deploymentId = "sheet-chat-gpt4-23k";
  const events = await client.streamChatCompletions(deploymentId, messages as any, {
    ...rest
  });
  return new NextResponse(events);
}

export const whisper = async (second) => {

}