import React, { useState } from "react";
import { LogType } from "chat-list/types/log";
import { useTranslation } from 'react-i18next'

interface ILogTabsProps {
  onChange: (type: string) => void;
}
export default function LogTabs(props: ILogTabsProps) {
  const { onChange } = props;
  const { t } = useTranslation('coder');
  const [active, setActive] = useState("all");
  const onTabChange = (type: string) => {
    setActive(type);
    onChange?.(type);
  };
  return (
    <div className="ml-1 flex flex-row ">
      <button
        key={"all"}
        className={`text-sm cursor-pointer border-b-2 px-1 ${active == "all" ? " border-b-gray-700" : "border-b-white"
          }`}
        onClick={onTabChange.bind(this, "all")}
      >
        {t('log.all', 'All')}
      </button>
      {/* {Object.keys(LogType).map((type) => (
        <button
          key={type}
          className={`text-sm cursor-pointer border-b-2 px-1 mx-0 ${active == type ? " border-b-gray-700" : " border-b-white"
            }`}
          onClick={onTabChange.bind(this, type)}
        >
          {type.replace(/^\w/, (match) => match.toUpperCase())}
        </button>
      ))} */}
      <button
        key={'error'}
        className={`text-sm cursor-pointer border-b-2 px-1 mx-0 ${active == 'error' ? " border-b-gray-700" : " border-b-white"
          }`}
        onClick={onTabChange.bind(this, 'error')}
      >
        {t('log.error', 'Error')}
      </button>
      <button
        key={'action'}
        className={`text-sm cursor-pointer border-b-2 px-1 mx-0 ${active == 'action' ? " border-b-gray-700" : " border-b-white"
          }`}
        onClick={onTabChange.bind(this, 'action')}
      >
        {t('log.actions', 'Actions')}
      </button>
    </div>
  );
}
