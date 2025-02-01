import { IMessageBody } from 'chat-list/types/chat';
import instruction from './instruction.md';
import { ChatState, ITool } from 'chat-list/types/plugin';
import { buildChatMessage, letter2columnNum } from 'chat-list/utils';
import sheetApi from '@api/sheet';
import { template } from 'chat-list/utils';
import systemData from './row-prompt.md';
import { getValues, getValuesByRange } from 'chat-list/service/sheet';
import { getLocalStore } from 'chat-list/local/local';
import CardPromptByRow from 'chat-list/components/card-prompt-by-row';
import React from 'react';

const buildTemplate = (titles: string[]) => {
  const content = titles.filter(p => p).map((title) => {
    return `[${title}]\n{${title}}`;
  }).join('\n\n');

  const temp = `#User Requirement\n{requirement}\n\n# Context Information\n${content}`;
  return temp;
};

export const buildDataModeSystemMessage = async (): Promise<string> => {
  const data = await getValues();
  const prompt = template(systemData, {
    tableData: JSON.stringify(data)
  });

  return prompt;
};

const applyPromptByRow = async (requirements: string, column: string, context: any) => {
  const firtRow = await getValuesByRange('1:1');
  const values = await getValues();
  const { row, col, rowNum, colNum, } = await sheetApi.getRowColNum();
  const titles = firtRow[0];
  // console.log('titles', titles);

  const includeTitle = titles[0] == values[0][0];
  let rows = values;
  let startRow = row;
  if (includeTitle) {
    rows = values.slice(1);
    startRow = row + 1;
  }

  const sheet = await sheetApi.getSheetInfo();
  const sheetName = sheet.current;
  let prompTemplate = await getLocalStore('apply_prompt_by_row_' + sheetName);
  if (!prompTemplate) {
    prompTemplate = buildTemplate(titles);
  }
  const prompts: string[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const data = titles.reduce((pre, title, n) => {
      if (title == '') {
        return pre;
      }
      // return `[${title}]\n${row[n]}\n`
      return {
        ...pre,
        [title]: row[n]
      };
    }, {});
    // const prompt = `## User Requirement\n\n${requirements}## Context Information:\n${rowPrompt}`;
    const prompt = template(prompTemplate, {
      requirements,
      ...data
    });
    prompts.push(prompt);
  }

  const columnNum = letter2columnNum(column);

  for (let m = 0; m < prompts.length; m++) {
    const prompt = prompts[m];
    const messages: IMessageBody[] = [{
      role: 'user',
      content: prompt,
    }];
    const cellValue = await getValuesByRange(startRow + m, columnNum, 1, 1);
    if (cellValue[0][0]) {
      continue;
    }
    const { content } = await context.chat({ messages });
    // console.log('setValuesByRange', [[content]], startRow + m, columnNum, 1, 1)
    await sheetApi.setValuesByRange([[content]], startRow + m, columnNum, 1, 1);
  }
};

export const func = async ({ requirements, column, context, dataContext }: { requirements: string, column: string, context: ChatState, dataContext: string }) => {
  // console.log('apply_prompt_by_row', requirements, column);
  // if (!column) {
  //   return buildChatMessage('Please input the letter column label, such as: H', 'text', 'assistant')
  // }
  // context.appendMsg(buildChatMessage(<CardPromptByRow requirements={requirements} column={column} />, 'card', 'assistant'))
  // return buildChatMessage("I've shown user a template for the prompt so you can let user check out and click confirm.", 'text', 'assistant')
  return buildChatMessage(<CardPromptByRow requirements={requirements} column={column} />, 'card', 'assistant', null, [], "I've shown user a form,so you can let user check out and click confirm.");
  // try {
  //   await applyPromptByRow(requirements, column, context);
  //   return buildChatMessage(`All tasks have been completed and the sheet has been updated.`, 'text', 'assistant',);
  // } catch (err) {
  //   return buildChatMessage(`Exception:${err.message}`, 'text', 'assistant',);
  // }
};

export default {
  type: 'function',
  name: 'apply_prompt_by_row',
  description: instruction,
  parameters: {
    "type": "object",
    "properties": {
      "requirements": {
        "type": "string",
        "description": `user requirements`
      },
      "column": {
        "type": "string",
        "description": `fill result to this column`
      },
    },
    "required": ['requirements']
  },
  func
} as unknown as ITool;
