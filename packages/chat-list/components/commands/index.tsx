import React, { useCallback, useContext, useEffect, useState } from "react";

// import { ACTIONS } from 'chat-list/config/commands';
import { ChatContext } from "chat-list/store/chatContext";
import { matchTextWithWeight } from "chat-list/utils/search";
import { extractCommand } from "chat-list/utils";

interface ICommandsProps {
  input: string;
  onSelect: (command: string) => void;
  className: string;
  style?: React.CSSProperties;
}

export default React.memo(function Commands(props: ICommandsProps) {
  const { input, onSelect, className = "", style = {} } = props;
  const { plugins } = useContext(ChatContext);
  const [list, setList] = useState(plugins);
  const [bottom, setBottom] = useState(0);
  const [visible, setVisible] = useState(false);
  const onSelectCommand = (cmd: string) => {
    if (onSelect) {
      onSelect(cmd);
    }
  };
  const showPanel = () => {
    const chatFooter = document.getElementsByClassName('ChatFooter')[0];
    const rect = chatFooter.getBoundingClientRect();
    const inputHeight = rect.height;
    const botm = inputHeight + 5;
    setBottom(botm);
    setVisible(true);
  };
  const onInputChange = useCallback(() => {

    const ls = plugins.filter((p) => {
      if (!input) {
        return false;
      }
      const command = extractCommand(input);
      const { weight, match } = matchTextWithWeight(p.action, command);
      if (match) {
        return true;
      }
      return false;
    });
    setList(ls);
  }, [input]);

  useEffect(() => {
    if (!input) {
      setVisible(false);
      return;
    }
    if (input.startsWith('/')) {
      showPanel();
    }
    onInputChange();
  }, [input]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`markdown ml-3 mr-3 shadow shadow-gray-500 rounded overflow-hidden ${className}`}
      style={{
        width: "auto",
        margin: "0 12px 0 12px",
        bottom,
        zIndex: 200,
        ...style,
      }}
    >
      <div className="list">

        {list.map((item) => {
          return (
            <div
              className={`list-item ${list.length == 1 ? "selected" : ""
                }`}
              key={item.action}
              onClick={onSelectCommand.bind(this, `/${item.action}`)}
            >
              <>
                <code>{item.action == '/' ? '/' : `/${item.action}`}</code>
                <span className="ml-2">{item.description}</span>
              </>
            </div>
          );
        })}
      </div>
    </div>
  );
});
