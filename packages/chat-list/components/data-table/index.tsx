import { numberToLetter } from 'chat-list/utils';
import React, { useEffect, useRef, useState } from 'react';
import sheetApi from '@api/sheet';
import docApi from '@api/doc';

import colors, { themes } from 'chat-list/data/templates/colors';
import Modal from 'chat-list/components/modal';
import useChatState from 'chat-list/hook/useChatState';
import { ListEnd, Palette, Sheet } from 'lucide-react';
import IconButton from '../icon-button';
import { cn } from 'chat-list/lib/utils';
import { useTranslation } from 'react-i18next';

interface IPreviewProps {
  data: string[][];
  className?: string;
  children?: React.ReactNode;
  showMenu?: boolean;
}

const Preview: React.FC<IPreviewProps> = (props) => {
  const {
    data,
    className,
    showMenu = true,
  } = props;
  if (!data || data.length === 0) return null;

  const [colorIndex, setColor] = useState(0);
  const [open, setOpen] = useState(false);
  const table = useRef<HTMLTableElement>(null);
  const { docType } = useChatState();
  const [tableStyle, setTableStyle] = useState({
    headerRowColor: '',
    firstRowColor: '',
    secondRowColor: '',
    footerRowColor: '',
    headerFontColor: '',
  });
  const { t } = useTranslation();

  useEffect(() => {
    // setTableStyle(colors[0]);
  }, []);

  const calculateColSpan = (row: string[], colIndex: number) => {
    let colSpan = 1;
    for (let i = colIndex + 1; i < row.length; i++) {
      if (row[i] === "") {
        colSpan++;
      } else {
        break;
      }
    }
    return colSpan;
  };

  const calculateRowSpan = (data: string[][], rowIndex: number, colIndex: number) => {
    let rowSpan = 1;
    for (let i = rowIndex + 1; i < data.length; i++) {
      if (data[i][colIndex] === "") {
        rowSpan++;
      } else {
        break;
      }
    }
    return rowSpan;
  };

  const renderRow = (row: string[], rowIndex: number, isHeader = false) => {
    const {
      headerRowColor,
      headerFontColor,
      firstRowColor,
      secondRowColor,
    } = tableStyle;

    return (
      <tr key={rowIndex} className="border-b border-[#e0e0e0]">
        <td
          key={-1}
          className="px-2 py-1 border border-[#e0e0e0] bg-[#f5f5f5]"
          style={{
            width: 26,
            padding: 0,
            textAlign: 'center',
          }}
        >
          {rowIndex + 1}
        </td>
        {row.map((cell, colIndex) => {
          if (cell === "") return null;

          const colSpan = calculateColSpan(row, colIndex);
          const rowSpan = 1;// calculateRowSpan(data, rowIndex, colIndex);
          const backgroundColor = isHeader ? headerRowColor : rowIndex % 2 === 0 ? firstRowColor : secondRowColor;
          const color = isHeader ? headerFontColor : undefined;

          return (
            <td
              key={colIndex}
              className="px-2 py-1 border border-[#e0e0e0]"
              style={{
                backgroundColor,
                color,
              }}
              colSpan={colSpan}
              rowSpan={rowSpan}
            >
              {cell}
            </td>
          );
        })}
      </tr>
    );
  };

  const onInsert = async () => {
    const theme = themes[colorIndex];
    let api: any = sheetApi;
    if (docType === 'doc') {
      api = docApi;
    }
    await api.insertTable(data, {
      theme,
      ...colors[colorIndex],
    });
  };

  const onAppend = async () => {
    await sheetApi.appendRows(data);
  };

  const onSelectTheme = (index: number) => {
    setColor(index);
    const config = colors[index];
    setTableStyle(config);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <div className="w-full text-sm overflow-auto ">
        <table ref={table} className={cn('w-full', className)}>
          <thead>
            <tr>
              <td
                key={-1}
                className="py-1 border border-[#e0e0e0] "
                style={{
                  height: 26,
                  width: 26,
                  textAlign: 'center',
                  margin: 0,
                  padding: 0,
                }}
              ></td>
              {data[0].map((_, cellIndex) => (
                <td
                  key={cellIndex}
                  className="py-1 border border-[#e0e0e0] "
                  style={{
                    height: 16,
                    margin: 0,
                    padding: 0,
                    textAlign: 'center',
                  }}
                >
                  {numberToLetter(cellIndex + 1)}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => renderRow(row, index, index === 0))}
          </tbody>
        </table>
      </div>
      {showMenu && docType !== 'chat' && (
        <div className="flex flex-row mb-2 mt-1 w-full text-sm justify-start">
          <IconButton
            title={t('common.table.set_style_tip')}
            className={cn([` w-auto px-1 py-3 text-[${colors[colorIndex].headerRowColor}] `])}
            style={{ color: colors[colorIndex].headerRowColor }}
            onClick={() => setOpen(true)}
            icon={<Palette size={14} style={{ color: colors[colorIndex].headerRowColor }} />}
          >
            {t('common.table.set_style')}
          </IconButton>
          <IconButton
            title={t('common.table.insert_tip')}
            className=" w-auto ml-1 px-1 py-3 "
            onClick={onInsert}
            icon={Sheet}
          >
            {t('common.table.insert')}
          </IconButton>
          <IconButton
            title={t('common.table.append_tip')}
            className=" w-auto ml-1 px-1 py-3 "
            onClick={onAppend}
            icon={ListEnd}
          >
            {t('common.table.append')}
          </IconButton>
        </div>
      )}
      <Modal
        open={open}
        title="Table Style"
        showClose={true}
        onClose={handleClose}
        showConfirm={false}
      >
        <div className="grid grid-cols-4">
          {colors.map(({ headerRowColor, firstRowColor, secondRowColor, footerRowColor }, index) => (
            <div
              className={`m-1 h-12 border-2 border-black-50 hover:border-primary cursor-pointer ${colorIndex === index ? 'border-primary' : ''}`}
              key={index}
              onClick={() => onSelectTheme(index)}
            >
              <div className="h-1/4" style={{ backgroundColor: headerRowColor }}></div>
              <div className="h-1/4" style={{ backgroundColor: firstRowColor }}></div>
              <div className="h-1/4" style={{ backgroundColor: secondRowColor }}></div>
              <div className="h-1/4" style={{ backgroundColor: footerRowColor }}></div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default Preview;
