import { QuickReplyItem } from 'chat-list/types/message';
import { ChatPluginBase, IChatPlugin, ITool } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
import sheetApi from '@api/sheet';
import { Filter } from 'lucide-react';
import instruction from './prompts/instruction.md'
import description from './prompts/description.md'
import { getSheetInfo } from 'chat-list/service/sheet';
import i18n from 'chat-list/locales/i18n';
export class EditSheet extends ChatPluginBase implements IChatPlugin {
  name = i18n.t('sheet.agent.filter', 'Filter');
  icon = Filter;
  action = 'filter';
  shortDescription = i18n.t('sheet.agent.filter.short_description', "Help you filter data by conditions, store data to other sheets.");
  description = description;
  instruction = instruction;
  placeholder = 'Filter data by conditions in sheet name or current sheet';
  fromLeader = false;
  introduce = `Hi, I can help you filter the current dataset by condition and store data to other sheets.`;
  quickReplies = (input: string) => {
    return [];
  };
  onQuickReply = async (item: QuickReplyItem): Promise<any> => {
    if (item.code === 'clean-filter') {
      await sheetApi.clearHighlightRows();
    }
    return [];
  };
  onSend = (input: IChatMessage) => {
    return input;
  };
  injectContext = async () => {
    return await getSheetInfo()
  }
  tools = ['filter_by_condition'];
  // onReceive = async (message: IChatMessage) => {
  //   const { setTyping } = this.context;
  //   setTyping(true)
  //   this.sampleData = await getValues(3);

  //   const rows = await this.getSheetDataByFunctionMode(message.content, this.sampleData);
  //   if (rows.length <= 0) {
  //     return this.buildChatMessage(`Filter result is empty.`, 'text', message.from.name);
  //   }
  //   const color = this.getColor();
  //   await this.hightlightRowsByColor(rows, color);
  //   const result = await this.buildMarkdownTable(rows, this.sampleData);
  //   // this.sendTaskSuccessMsg(result, message.from);
  //   this.showFilterCard(rows, color);
  //   setTyping(false);
  //   return this.buildChatMessage(result, 'text', message.from.name);
  // };
}

export default new EditSheet();
