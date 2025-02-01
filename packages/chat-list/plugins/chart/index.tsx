import React from 'react';
import { QuickReplyItem } from 'chat-list/types/message';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { search } from 'chat-list/service/chart';
import { IChatMessage } from 'chat-list/types/message';
import CardChart from 'chat-list/components/card-chart';
import { buildEChartMessage, buildGoogleChartPrompt } from './util';
import { extractCodeFromMd } from 'chat-list/utils';
import { FunctionCall } from 'chat-list/types/chat';
import CardChartEchart from 'chat-list/components/card-echart';
import CardChartIntroduce from 'chat-list/components/card-chart-introduce';
import { SHEET_CHAT_CHART_ENGINE } from 'chat-list/config/chart';
import { getLocalStore } from 'chat-list/local/local';
import sheetApi from '@api/sheet';
import { PieChart } from 'lucide-react';
import image from 'chat-list/utils/image';
import { getValues } from 'chat-list/service/sheet'
import { renderEChart } from 'chat-list/utils/chart';
import instruction from './promps/instruction.md'
import introduce from './promps/introduce.md'
export class CreateChart extends ChatPluginBase implements IChatPlugin {
  name = 'Create Chart';
  icon = PieChart;
  action = 'chart';
  description = 'Create charts by user requirements.';
  instruction = instruction;
  placeholder = 'Help me create bar chart about...';
  introduce = introduce;
  // introduce = () => {
  //   return (
  //     <CardChartIntroduce
  //       onSetChartEngine={(name) => {
  //         this.sendMsg(
  //           this.buildChatMessage(
  //             `Successfully set the chart engine to \`${name}\`. Now start entering your requirements!`,
  //             'text'
  //           )
  //         );
  //       }}
  //     />
  //   );
  // };
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
  transfer = async (input: IChatMessage) => {
    // GPT发送的消息，拦截，自定义一些操作
    const content = input.content;
    // console.log('input:' + JSON.stringify(content));
    try {
      const data = extractCodeFromMd(content);
      // console.log('output:' + JSON.stringify(expression));
      if (!data) {
        return this.buildChatMessage(`I'm sorry, I can't deal with your request.`);
      }

      return this.buildChatMessage(JSON.stringify(data), 'text');
    } catch (err) {
      return this.buildChatMessage(`I'm sorry, I can't deal with your request.`);
    }
  };
  transferGoogleChart = async (functionCall: FunctionCall) => {
    try {
      const options = JSON.parse(functionCall.arguments);

      return this.buildChatMessage(
        <CardChart options={options} autoAdd={false} />,
        'card'
      );
    } catch (err) {
      return this.buildChatMessage(`I'm sorry, I can't deal with your request.`);
    }
  };
  buildEchartOption = async (content: string) => {
    const data = await getValues();
    const code = extractCodeFromMd(content as string);

    const initFunc = (code: string) => {
      const fun = eval(`(function() {${code}; \n return createEchartOption;})`);
      return fun();
    };
    const fun = initFunc(code);
    const copy = JSON.parse(JSON.stringify(data));
    const option = fun(copy);
    return option;
  }

  transferEChart = async (content: string, onRender?: (base64: string) => void) => {
    // GPT发送的消息，拦截，自定义一些操作
    const jsCode = extractCodeFromMd(content as string);
    const sourceData = await getValues();
    return this.buildChatMessage(
      <CardChartEchart
        data={sourceData}
        code={jsCode}
        onError={(err) => {
          this.sendMsg(
            this.buildChatMessage(
              `Sorry, there are some errors when excute function. \`${err.message}\``
            )
          );
          this.sendMsg(this.buildChatMessage(content));
        }}
        onRender={onRender}
      />,
      'card'
    );
  };
  buildByGoogleChart = async (message: IChatMessage, showCard = true) => {
    const { prompt, tools } = await buildGoogleChartPrompt();
    const result = await this.chat(message.content, prompt, tools);
    const { tool_calls, content } = result;
    if (!tool_calls || tool_calls?.length <= 0) {
      this.context.appendMsg(this.buildChatMessage(content, 'text', message.from.name));
      return null;
    }

    const function_call = tool_calls?.[0].function;

    if (showCard) {
      const newMsg = await this.transferGoogleChart(function_call);
      this.context.appendMsg(newMsg);
    }

    const {
      type = '',
      title = '',
      x_axis_title = '',
      y_axis_title = '',
      y_axis_titles = []
    } = JSON.parse(function_call.arguments);
    const chartImageUrl = await sheetApi.AddChart({
      type,
      title,
      xAxisTitle: x_axis_title,
      yAxisTitle: y_axis_title,
      yAxisTitles: y_axis_titles,
      isStack: false,
      position: [],
      address: ''
    });
    return {
      title,
      chartImageUrl
    };
  };
  buildByECharts = async (message: IChatMessage, showCard = true) => {
    const { prompt } = await buildEChartMessage();
    const result = await this.chat(prompt);
    // const text = returned;
    const jsCode = extractCodeFromMd(result.content as string);
    if (jsCode) {
      if (showCard) {
        const newMsg = await this.transferEChart(result.content);
        this.sendMsg(newMsg);
      }

      const option = await this.buildEchartOption(result.content);
      const base64 = renderEChart(option);

      return {
        title: option?.title?.text || 'chart',
        chartImageUrl: base64
      };
    } else {
      this.sendMsg(this.buildChatMessage(result.content));
      return null;
    }
  };
  onReceive = async (message: IChatMessage) => {
    // 接收到GPT消息，解析消息，给回复
    this.context.setTyping(true);
    // const engine = getLocalStore(SHEET_CHAT_CHART_ENGINE) || 'google';
    // message from other assistant, only use google chart 
    // if (message.role === 'assistant') {
    // let chartResult;
    // if (engine === 'google' || engine === 'office') {
    //   chartResult = await this.buildByGoogleChart(message, false);

    // } else {
    //   chartResult = await this.buildByECharts(message, false)
    // }
    const chartResult = await this.buildByGoogleChart(message, false);
    if (chartResult) {
      const url = image.set(chartResult.chartImageUrl)
      const msg = `
Ok, Here is ${chartResult.title} chart :

![${chartResult.title}](${url})

`;
      this.context.appendMsg(this.buildChatMessage(msg, 'text', message.from.name, 'assistant'));
      return this.buildChatMessage('Create chart successfully.', 'text', message.from.name, 'assistant')
    } else {
      return this.buildChatMessage('Create chart failed.', 'text', message.from.name, 'assistant')
    }

    // }

    // if (engine === 'google' || engine === 'office') {
    //   await this.buildByGoogleChart(message);
    // } else {
    //   const chartResult = await this.buildByECharts(message);
    //   if (chartResult) {
    //     await sheetApi.insertImage(chartResult.chartImageUrl, 600, 400);
    //   }
    // }

  };
}

export default new CreateChart();
