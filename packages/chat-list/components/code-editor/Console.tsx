import React, { useRef, useEffect } from "react";
import ActionRender from "./ActionRender";
import { IActionState, ILog, LogType } from "chat-list/types/log";
import Markdown from "../markdown";
interface IConsoleProps {
  logs: ILog[];
  logType: LogType | "all";
  actions?: ILog[];
  actionState?: IActionState;
  onUndo: (log: ILog) => void;
  onSelectAction: (log: ILog) => void;
}

const Console = ({
  logs,
  actions = [],
  actionState = {},
  onUndo,
  logType,
  onSelectAction,
}: IConsoleProps) => {
  const consoleRef = useRef(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  //   // 添加日志的函数
  //   const addLog = (message, type = 'info') => {
  //     const newLog = { message, type };
  //     setLogs((prevLogs) => [...prevLogs, newLog]);
  //   };

  return (
    <div className=" h-full flex flex-col overflow-y-auto" ref={consoleRef}>
      {/* 显示日志 */}
      {logs
        .filter((p) => {
          if (logType === "all") {
            return true;
          }
          return p.type === logType;
        })
        .map((log, index) => {
          if (log.type === "action") {
            return (
              <ActionRender
                key={log.id}
                log={log}
                actionState={actionState}
                isLast={actions[actions.length - 1].id == log.id}
                onUnDo={onUndo}
                onSelect={onSelectAction}
              />
            );
          }

          return (
            <div
              key={log.id}
              className={`text-${log.type} flex w-full flex-row items-start even:bg-gray-100 hover:bg-gray-200 `}
            >
              [<span className={`log-${log.type}`}>{log.type}</span>]
              {/* <span className="log-time">{log.time.toLocaleTimeString()}</span> */}
              <span className="w-full" title={log.content}>
                {typeof log.content === 'string' && (
                  <Markdown className="w-full break-words" supportMath={false} copyContentBtn={false}>
                    {log.content}
                  </Markdown>
                )}
                {typeof log.content === 'object' && JSON.stringify(log.content)}
              </span>
            </div>
          );
        })}
    </div>
  );
};

export default Console;
