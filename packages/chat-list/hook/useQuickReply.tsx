import { IChatPlugin } from "chat-list/types/plugin";
import { useEffect, useState } from "react";
import { QuickReplyItem } from "chat-list/types/message";

export const useQuickReplies = (
  plugin: IChatPlugin,
  input: string,
  defaultQuickReplies: QuickReplyItem[] = [],
) => {
  const [replies, setReplies] = useState([]);

  function updateReplies() {
    if (input === "/") {
      setReplies(defaultQuickReplies);
      return;
    }
    if (!plugin) {
      setReplies(defaultQuickReplies);
      return;
    }
    const list = plugin.quickReplies(input);
    if (list) {
      setReplies(list);
    }
  }
  useEffect(() => {
    updateReplies();
  }, [input, plugin]);
  // if (typing) {
  //   return {
  //     replies: [
  //       {
  //         action: "abort",
  //         // icon: "close-circle",
  //         name: mute ? "Unmute" : 'Mute',
  //       },
  //     ],
  //   };
  // }
  return {
    replies,
    updateReplies
  };
};
