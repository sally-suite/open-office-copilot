import React, { useEffect, useState } from "react";
import Modal from 'chat-list/components/modal'
import { TRANSLATE_STYLE } from "chat-list/data/translate/languages";
import { ITransStyle } from "chat-list/types/translate";
import { useTranslation } from 'react-i18next'
interface ITransStyleProps {
  value: string;
  placeholder?: string;
  onChange: (value: string, text: string) => void;
}

export default function TranslateStyle(props: ITransStyleProps) {
  const { value = "formal", placeholder, onChange } = props;
  const { t } = useTranslation('translate');
  const [open, setOpen] = useState(false);

  const [current, setCurrent] = useState<ITransStyle>(null);
  function handleClose() {
    setOpen(false);
  }
  const onLngSelect = (item: ITransStyle) => {
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
      const item = TRANSLATE_STYLE.find((p) => p.value === value);
      setCurrent(item);
    }
  }, [value]);
  return (
    <div>
      <div className="input" onClick={showList}>
        {!current && <span className=" text-gray-300">{placeholder || t(`tone.select_tone`, "Select Tone")}</span>}
        {current && t(`tone.${current.value}`, current.label)}
      </div>
      <Modal
        open={open}
        title={t(`tone.select_tone`, "Select Tone")}
        showClose={true}
        onClose={handleClose}
        showConfirm={false}
      >
        <div className=" max-h-96 overflow-scroll">
          {TRANSLATE_STYLE.map((item) => {
            return (
              <div
                className={`list-item ${current?.value === item.value ? "selected" : ""
                  }`}
                key={item.value}
                onClick={onLngSelect.bind(this, item)}
              >
                {t(`tone.${item.value}`, item.label)}
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
