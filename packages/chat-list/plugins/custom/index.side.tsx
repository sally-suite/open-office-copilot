import { ChatPluginBase, IChatPlugin } from "chat-list/types/plugin";
import { IAgent } from "chat-list/types/agent";

/**
 * Code generation and run it in Google Apps Script
 */
export class CustomAgent extends ChatPluginBase implements IChatPlugin {
  constructor(agent: IAgent) {
    super();
    this.id = agent.id + '';
    this.name = agent.name;
    this.icon = agent.avatar;
    this.tools = agent.tools;
    this.agents = [];
    this.instruction = agent.instruction || '';
    this.description = agent.description || '';
    this.introduce = agent.introduce || `Hi,I'm ${this.name},How can I assistant you?`;
    this.dataAsContext = agent.dataAsContext;
    this.action = this.name;
    this.isCustom = true;
  }
  dataAsContext: boolean;
  // tools = tools;
  // injectContext = async () => {
  //   const text = await docApi.getSelectedText();
  //   if (text) {
  //     return `I HAVE SELECTED TEXT:\n${text}\n`
  //   }
  //   return "NO SELECTED TEXT.";
  // }
}

export default CustomAgent;
