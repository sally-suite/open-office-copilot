import { ChatPluginBase, IChatPlugin } from "chat-list/types/plugin";
import { IChatMessage, QuickReplyItem } from "chat-list/types/message";
import instruction from './promps/instruction.md';
import React from "react";
import i18n from 'chat-list/locales/i18n';
import sallyPng from 'chat-list/assets/img/sally-32.png';
import CardIntroduce from 'chat-list/components/card-introduce';
import { dataRangeAnalyzeMixin } from '../_mixins/sheet';
import ContextSheet from "chat-list/components/context-sheet";
import { ISheetInfo } from "chat-list/types/api/sheet";
// import sheetApi from '@api/sheet';
/**
 * Main service, task split ,plan
 */
export class Main extends ChatPluginBase implements IChatPlugin {
  constructor(...mixins: any[]) {
    super(...mixins);
  }
  name = "Sally";
  icon = sallyPng;
  model = {
    prompt: ``,
    temperature: 0.7
  };
  action = "sally";
  placeholder = i18n.t('sheet.agent.sally.placeholder', "Chat with me Or @ agent to help you.");
  shortDescription = "";
  description = "Your AI Assistant, help you edit sheet, powered by GPT or Gemini.";
  instruction = instruction;
  // introduce = introduce;
  introduce = () => {
    return <CardIntroduce />;
  };
  fileConfig = {
    accept: {
      text: true,
      image: true
    },
    maxSize: 2 * 1014 * 1024,
    maxFiles: 3,
    multiple: true,
  };
  quickReplies = () => {
    // const { colAgents = [], plugins } = this.context;
    // const agents = (colAgents || []).filter(agent => {
    //   if (!agent.enable) {
    //     return false;
    //   }
    //   const plg = plugins.find(p => p.action == agent.id);
    //   if (plg) {
    //     return plg.render
    //   }
    //   return true;
    // }).map((agent) => {
    //   return {
    //     code: agent.id,
    //     name: capitalizeFirstLetter(i18n.t(`sheet.agent.${agent.id}` as any, agent.name)),
    //     tip: i18n.t(`sheet.agent.${agent.id}.short_description`, agent.name)
    //   }
    // });

    // return [
    //   ...agents,
    //   // {
    //   //   code: 'test',
    //   //   name: 'test'
    //   // }
    // ]

    // const { agentTools = [], setAgentTool } = this.context;
    // const agents = (agentTools || []).filter(tool => {
    //   if (!tool.enable) {
    //     return false;
    //   }
    //   const plg = this.tools.find(p => p == tool.id);
    //   if (plg) {
    //     return true;
    //   }
    //   return false;
    // }).map((tool) => {
    //   return {
    //     code: tool.id,
    //     name: capitalizeFirstLetter(i18n.t(`tool:${tool.id}` as any, tool.name)),
    //     onRemove: (id: string) => {
    //       setAgentTool(id, false)
    //     }
    //   }
    // });

    return [
      // ...agents,
      // {
      //   code: 'test',
      //   name: 'test'
      // }
    ];

    // return [];
  };
  onQuickReply = async (item: QuickReplyItem) => {


    // await sheetApi.createPivotTable({
    //   source_range: "A1:D14",
    //   title: 'Sales',
    //   rows: [4],
    //   "columns": [],
    //   values: [
    //     {
    //       "column": 2,
    //       "summarize_by": "SUM",
    //       "title": "Total Sales",
    //     },
    //     {
    //       "column": 3,
    //       "summarize_by": "SUM",
    //       "title": "Total Orders",
    //     }
    //   ],
    //   chartConfig: {
    //     chartTitle: 'aa',
    //     chartType: 'Scatter'
    //   }
    // });
    // await sheetApi.createPivotTable({
    //   source_range: "A1:D14",
    //   title: 'Sales',
    //   rows: [4],
    //   "columns": [],
    //   values: [
    //     {
    //       "column": 2,
    //       "summarize_by": "SUM",
    //       "title": "Total Sales",
    //     },
    //     {
    //       "column": 3,
    //       "summarize_by": "SUM",
    //       "title": "Total Orders",
    //     }
    //   ],
    //   chartConfig: {
    //     chartTitle: 'aa',
    //     chartType: 'Treemap'
    //   }
    // });
    // await sheetApi.createPivotTable({
    //   source_range: "A1:D14",
    //   title: 'Sales',
    //   rows: [4],
    //   "columns": [],
    //   values: [
    //     {
    //       "column": 2,
    //       "summarize_by": "SUM",
    //       "title": "Total Sales",
    //     },
    //     {
    //       "column": 3,
    //       "summarize_by": "SUM",
    //       "title": "Total Orders",
    //     }
    //   ],
    //   chartConfig: {
    //     chartTitle: 'aa',
    //     chartType: 'Waterfall'
    //   }
    // });
    // await sheetApi.createPivotTable({
    //   source_range: "A1:D14",
    //   title: 'Sales',
    //   rows: [4],
    //   "columns": [],
    //   values: [
    //     {
    //       "column": 2,
    //       "summarize_by": "SUM",
    //       "title": "Total Sales",
    //     },
    //     {
    //       "column": 3,
    //       "summarize_by": "SUM",
    //       "title": "Total Orders",
    //     }
    //   ],
    //   chartConfig: {
    //     chartTitle: 'aa',
    //     chartType: 'Bubble'
    //   }
    // });

    // const result = await sheetApi.createPivotTable({
    //   "title": "City Sales Orders and Revenue Analysis",
    //   "source_range": "Sheet1!A1:D11",
    //   "rows": [1],
    //   "columns": [],
    //   "values": [
    //     {
    //       "column": 3,
    //       "title": "Total Orders",
    //       "summarize_by": "SUM"
    //     },
    //     // {
    //     //   "column": 4,
    //     //   "title": "Total Revenue",
    //     //   "summarize_by": "SUM"
    //     // },
    //     // {
    //     //   "column": 4,
    //     //   "title": "Average Order Revenue",
    //     //   "summarize_by": "AVERAGE"
    //     // }
    //   ],
    //   "chartConfig": {
    //     "chartType": "Bar",
    //     "chartTitle": "City Sales Performance Comparison"
    //   }
    // });
    // console.log(result)

  };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };
  tools = ['generate_table', 'complete_table', 'generate_function', 'generate_pivot_table', 'code_interpreter'];
  agents = ['intelligent', 'translate', 'vision', 'python', 'vba'];
  // injectContext = async () => {
  //   return await getSheetInfo()
  // }
  renderMessageContext = (context: string) => {
    const sheetInfo: ISheetInfo = JSON.parse(context);
    return (
      <ContextSheet address={sheetInfo.activeRange} />
    );
  };
  // getTableImage: () => Promise<any>;
  // analyzeDataRange: (content: string) => Promise<void>;
  // showSheetInfo: (message: IChatMessage) => void;
  onReceive = async (message: IChatMessage) => {

    const { setTyping } = this.context;
    setTyping(true);

    if (!message.content) {
      return;
    }

    if (message.mentions.length == 0 && this.memory.length == 0) {
      setTyping(true);
      if ((this as any).showSheetInfo) {
        await (this as any).showSheetInfo(message);
        return;
      }
    }
    return await super.onReceive(message);
  };
}
export default new Main(dataRangeAnalyzeMixin);
