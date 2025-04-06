/* global clearInterval, console, CustomFunctions, setInterval */
// import { runFunction } from "chat-list/tools/sheet/python/util";
import { render } from 'chat-list/apps/gpt-formulas'
import { flattenArray, Mutex } from 'chat-list/utils'
import { chat } from 'chat-list/service/message';

// function call interval
const INTERVAL = 1000;
const mutex = new Mutex(INTERVAL);

/**
 * Call llm model,first parameter is model name,including:gpt-3.5-turbo,gpt-4,glm-4
 * @customfunction ASK
 * @param model model to use,include:gpt-3.5-turbo,gpt-4,glm-4
 * @param a value or cell address
 * @param b value or cell address
 * @param others value or cell address
 * @returns content from llm model
 * @helpUrl /guide/custom-functions#slask
 */
export async function ask(model: any = 'gpt-3.5-turbo', ...args: any[]) {
    // 遍历args,如果args是一维数组，取值，二维数组，取值，如果是字符串，直接取值，最后拼接成字符串
    console.log('ask')
    try {
        await mutex.lock();
        debugger;
        let cells = flattenArray(args[0]);
        console.log('ask', cells)
        const message = cells.join('\n');
        const result = await chat({
            stream: false,
            model: model || 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: message,
                },
            ],
            temperature: 0.7,
        });
        console.error('ask', result)
        return result?.content;
    } catch (e) {
        console.error('ask', e)
        return e.message;
    } finally {
        mutex.unlock();
    }
}

/**
 * Call GPT3.5 model
 * @customfunction GPT3
 * @param a value or cell address
 * @param b value or cell address
 * @param c value or cell address
 * @returns content from llm model
 * @helpUrl /guide/custom-functions#slgpt3
 */
export async function gpt3(...args: any[]) {
    debugger;
    // 遍历args,如果args是一维数组，取值，二维数组，取值，如果是字符串，直接取值，最后拼接成字符串
    const result = await ask('gpt-3.5-turbo', ...args);
    return result;
}

/**
 * call GPT4 model
 * @customfunction GPT4
 * @param a value or cell address
 * @param b value or cell address
 * @param c value or cell address
 * @returns content from llm model
 * @helpUrl /guide/custom-functions#slgpt4
 */
export async function gpt4(...args: any[]) {
    // 遍历args,如果args是一维数组，取值，二维数组，取值，如果是字符串，直接取值，最后拼接成字符串
    const result = await ask('gpt-4', ...args);
    return result;
}


/**
 * call GLM model
 * @customfunction GLM
 * @param a value or cell address
 * @param b value or cell address
 * @param c value or cell address
 * @returns content from llm model
 * @helpUrl /guide/custom-functions#slglm
 */
export async function glm(...args: any[]) {
    // 遍历args,如果args是一维数组，取值，二维数组，取值，如果是字符串，直接取值，最后拼接成字符串
    const result = await ask('glm-4', ...args);
    return result;
}


Office.onReady(() => {
    render();
});