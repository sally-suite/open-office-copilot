// import Edit from './edit';

import { IChatPlugin } from "chat-list/types/plugin";
import { matchTextWithWeight } from "chat-list/utils";

export const findPlugin = (plugins: IChatPlugin[], input: string) => {
  const target = plugins.find((item) => item.action.toLowerCase() === input.toLowerCase());
  if (target) {
    return {
      exact: true,
      plugin: target,
    };
  }

  const plugin = findMatchPlugin(plugins, input);
  if (plugin) {
    return {
      exact: false,
      plugin: plugin,
    };
  }
  // 未来可以接 GPT 分析用的意图
  return {
    exact: false,
    plugin: null,
  };
};

export const findMatchPlugin = (plugins: IChatPlugin[], input: string) => {
  const cmd = input.split(" ")[0];
  const ls = plugins.filter((p) => {
    if (!cmd) {
      return false;
    }
    const { weight, match } = matchTextWithWeight(p.action, cmd);
    if (match) {
      return true;
    }
    return false;
  });
  if (ls.length == 1) {
    return ls[0];
  }
  return null;
};
