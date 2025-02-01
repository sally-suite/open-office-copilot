import React from 'react';
import { QuickReplyItem } from 'chat-list/types/message';
import { ChatPluginBase, IChatPlugin, ITool } from 'chat-list/types/plugin';
import { search } from 'chat-list/service/chart';
import { IChatMessage } from 'chat-list/types/message';
import CardChart from 'chat-list/components/card-chart';
import { FunctionCall } from 'chat-list/types/chat';
import { PieChart } from 'lucide-react';
import instruction from './promps/instruction.md'
import introduce from './promps/introduce.md'
import description from './promps/description.md'
import { getSheetInfo } from 'chat-list/service/sheet';
import ChartRender from 'chat-list/components/render-chart'
import i18n from 'chat-list/locales/i18n';

export class CreateChart extends ChatPluginBase implements IChatPlugin {
  name = i18n.t('sheet.agent.chart', 'Chart')
  icon = PieChart;
  action = 'chart';
  shortDescription = i18n.t('sheet.agent.chart.short_description', "Create charts by your requirements.");
  description = description;
  instruction = instruction;
  placeholder = 'Help me create bar chart about...';
  introduce = introduce;
  quickReplies = (input: string) => {
    return search(input) as QuickReplyItem[];
  };
  onQuickReply = (item: QuickReplyItem) => {
    this.sendMsg(this.buildChatMessage(<CardChart
      options={{
        type: item.name,
      }}
    />, 'card'));
  };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };
  tools = ['add_chart', 'recommend_charts'];
  injectContext = async () => {
    return await getSheetInfo()
  }
  transferGoogleChart = async (functionCall: FunctionCall) => {
    try {
      const options = JSON.parse(functionCall.arguments);

      return this.buildChatMessage(
        <CardChart options={options} autoAdd={false} />,
        'card'
      );
    } catch (err) {
      return this.buildChatMessage(`Task execution failure.`);
    }
  };
  render = () => {
    return <ChartRender />
  }
}

export default new CreateChart();
