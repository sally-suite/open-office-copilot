import React from 'react';

interface ISwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

const Switch = (props: ISwitchProps) => {
  const { value, onChange } = props;

  const toggleSwitch = () => {
    onChange?.(!value);
  };

  return (
    <div
      className="flex items-center"
      title={`${value ? 'Close' : 'Open'} plug-in mode`}
    >
      <div
        className={` w-4 h-4  rounded-full shadow-md transition duration-300 ease-in-out cursor-pointer ${
          value ? ' bg-primary' : 'bg-gray-300'
        }`}
        onClick={toggleSwitch}
      />
    </div>
  );
};

export default Switch;
