import { Check, Undo2 } from "lucide-react";
import React from "react";
import { IActionState, ILog } from "chat-list/types/log";
import Loading from "./Loading";

interface IActionProps {
  log: ILog;
  actionState: IActionState;
  onSelect?: (log: ILog) => void;
  onUnDo?: (value: ILog) => void;
  isLast?: boolean;
}

export default function ActionRender(props: IActionProps) {
  const { log, actionState, onSelect, onUnDo, isLast } = props;
  const { type, time, content } = log;
  const onClickAction = () => {
    onSelect?.(log);
  };
  const renderUndo = () => {
    return (
      <div
        className=" cursor-pointer"
        title="Undo"
        onClick={(e) => {
          e.stopPropagation();
          onUnDo && onUnDo(log);
        }}
      >
        <Undo2 size={16} />
      </div>
    );
  };
  const renderStatus = () => {
    if (isLast) {
      if (actionState[log.id].status === "running") {
        return <Loading />;
      } else if (actionState[log.id].status === "success") {
        return (
          <>
            <Check color="green" size={16} />
            {renderUndo()}
          </>
        )
      } else if (actionState[log.id].status === "error") {
        return "";
      }
    }

    if (actionState[log.id].status === "success") {
      return <Check color="green" size={16} />;
    } else if (actionState[log.id].status === "error") {
      return "";
    }
  };

  return (
    <div
      className={`text-${log.type} flex flex-row items-center even:bg-gray-100 hover:bg-gray-200 cursor-pointer`}
      onClick={onClickAction}
    >
      <span className={`log-${type}`}>[{type}]</span>
      {/* <span className="log-time">{time.toLocaleTimeString()}</span> */}
      <span className="pl-1">
        {content} {actionState[log.id].status}
      </span>
      <div className="flex-1"></div>
      <div className={`action-item flex flex-row items-center ${type}`}>
        {renderStatus()}
      </div>
    </div>
  );
}
