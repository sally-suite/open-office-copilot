import React from "react";
import second, { chartTypes } from "chat-list/data/charts";
import Icon from "chat-list/components/icon";

interface IChartListProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ChartList(props: IChartListProps) {
  const { value, onChange } = props;
  const onSelectIcon = (name: string) => {
    if (onChange) onChange(name);
  };
  return (
    <div className={`flex flex-row space-x-2`}>
      {chartTypes.map(({ name, icon }) => {
        return (
          <div
            key={name}
            className={`flex justify-center items-center w-10 h-10 border-2  hover:border-primary cursor-pointer ${
              name === value ? "border-primary" : "border-gray-300"
            } `}
            onClick={onSelectIcon.bind(null, name)}
          >
            <Icon
              name={icon}
              style={{
                fill: "gray",
                stroke: "gray",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
