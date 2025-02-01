import React, { useEffect, useState } from 'react';
import Modal from 'chat-list/components/modal'
interface IOption {
  label: string;
  value: string;
}

interface ISelectListProps {
  value: string;
  placeholder?: string;
  options: IOption[];
  onChange: (value: string, label: string) => void;
}

export default function SelectList(props: ISelectListProps) {
  const { value = '', placeholder = 'Select', options = [], onChange } = props;
  const [open, setOpen] = useState(false);

  const [current, setCurrent] = useState<IOption>(null);
  function handleClose() {
    setOpen(false);
  }
  const onLngSelect = (item: IOption) => {
    setCurrent(item);
    setOpen(false);
    if (onChange) {
      onChange(item.value, item.label);
    }
  };
  const showList = () => {
    setOpen(true);
  };
  useEffect(() => {
    if (value) {
      const item = options.find((p) => p.value === value);
      setCurrent(item);
    }
  }, [value]);
  return (
    <div className=" w-full">
      <div className="input" onClick={showList}>
        {!current && <span className=" text-gray-300">{placeholder}</span>}
        {current && current.label}
      </div>
      <Modal
        open={open}
        title="Select Languate"
        showClose={true}
        onClose={handleClose}
        showConfirm={false}
      >
        <div className="list">
          {options.map(({ label, value }) => {
            return (
              <div
                className={`list-item ${current?.value === value ? 'selected' : ''}`}
                key={value}
                onClick={onLngSelect.bind(this, { label, value })}
              >
                {label}
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
