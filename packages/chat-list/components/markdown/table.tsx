import React, { useEffect, useRef, useState } from 'react';
import sheetApi from '@api/sheet';
import docApi from '@api/doc';
import slideApi from '@api/slide';
import emailApi from '@api/email';
import colors, { themes } from 'chat-list/data/templates/colors';
import Modal from 'chat-list/components/modal';
import useChatState from 'chat-list/hook/useChatState';
import { Grid3X3, ListEnd, Palette, Sheet, Layers3, Copy, Check } from 'lucide-react';
import IconButton from '../icon-button';
import { cn } from 'chat-list/lib/utils';
import { useTranslation } from 'react-i18next';
import XLSX from 'xlsx';
import { ITableOption } from 'chat-list/types/api/sheet';
import { copyByClipboard } from 'chat-list/utils';

interface ITableProps {
  className?: string;
  children?: React.ReactNode;
  showMenu?: boolean;
  showScroll?: boolean;
}

export default React.memo(function Table({
  className,
  children,
  showMenu = true,
  showScroll = true,
  ...props
}: ITableProps) {
  const [colorIndex, setColor] = useState(0);
  const [open, setOpen] = useState(false);
  const table = useRef<HTMLTableElement>(null);
  const { docType } = useChatState();
  const { t } = useTranslation();
  const [copyOk, setCopyOk] = React.useState(false);

  const convertToArray = (withHeader = true) => {
    const tb = table.current;
    const data = [];
    const start = withHeader ? 0 : 1;
    for (let i = start; i < tb.rows.length; i++) {
      const row = tb.rows[i];
      const cells = [];
      for (let j = 0; j < row.cells.length; j++) {
        cells.push(row.cells[j].innerText);
      }
      data.push(cells);
    }
    return data;
  };

  const setTableStyle = ({
    headerRowColor,
    firstRowColor,
    secondRowColor,
    footerRowColor,
    headerFontColor,
  }: ITableOption) => {
    const tb = table.current;
    const thead = tb.tHead;
    if (thead) {
      let haveHeader = false;
      for (let i = 0; i < thead.rows.length; i++) {
        const row = thead.rows[i];

        for (let j = 0; j < row.cells.length; j++) {
          const cell = row.cells[j];
          cell.style.border = '1px solid #cccccc';
          cell.style.fontWeight = 'bold';
          cell.style.backgroundColor = headerRowColor;
          cell.style.color = headerFontColor;
          if (cell.innerText) {
            haveHeader = true;
          }
        }
      }
      if (!haveHeader) {
        thead.style.display = 'none';
      }
    }
    const tbody = tb.tBodies[0];
    if (tbody) {
      for (let i = 0; i < tbody.rows.length; i++) {
        const row = tbody.rows[i];
        for (let j = 0; j < row.cells.length; j++) {
          const cell = row.cells[j];
          cell.style.border = '1px solid #cccccc';
          cell.style.color = '#586e75';
          cell.style.padding = '5px';
          if (i % 2 == 0) {
            cell.style.backgroundColor = secondRowColor;
          } else {
            cell.style.backgroundColor = firstRowColor;
          }
        }
      }
    }

    const tfoot = tb.tFoot;
    if (tfoot) {
      for (let i = 0; i < tfoot.rows.length; i++) {
        const row = tfoot.rows[i];
        for (let j = 0; j < row.cells.length; j++) {
          const cell = row.cells[j];
          cell.style.border = '1px solid #cccccc';
          cell.style.backgroundColor = footerRowColor;
        }
      }
    }
  };

  const onInsert = async () => {
    const theme = themes[colorIndex];
    let api: any = docApi;
    if (docType === 'doc') {
      api = docApi;
    } else if (docType == 'slide') {
      api = slideApi;
    } else if (docType == 'email') {
      api = emailApi;
    } else if (docType == 'sheet') {
      api = sheetApi;
    }
    await api.insertTable(convertToArray(), {
      theme,
      ...colors[colorIndex],
    });
  };
  const onNewsheet = async () => {
    const theme = themes[colorIndex];
    await sheetApi.initSheet('Sheet', [], { active: true });
    await sheetApi.insertTable(convertToArray(), {
      theme,
      ...colors[colorIndex],
    });
  };
  const onAppend = async () => {
    await sheetApi.appendRows(convertToArray(false));
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
  const downLoadExcel = async () => {
    const ws = XLSX.utils.table_to_sheet(table.current);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "SheetJS.xlsx");
  };
  const copyTable = async () => {
    setCopyOk(true);
    copyByClipboard('', table.current.outerHTML);
    setTimeout(() => {
      setCopyOk(false);
    }, 1000);
  };

  useEffect(() => {
    setTableStyle(colors[0]);
  }, []);

  if (!showMenu) {
    return (
      <div className={cn("w-full", showScroll ? "overflow-auto max-h-52" : "")}>
        <table ref={table} className={className} {...props}>
          {children}
        </table>
      </div>
    );
  }
  return (
    <>
      <div className={cn("w-full", showScroll ? "overflow-auto max-h-52" : "")}>
        <table ref={table} className={className} {...props}>
          {children}
        </table>
      </div>
      <div className="flex flex-row mb-2 w-full text-sm justify-start">
        <IconButton
          title={t('common.table.set_style_tip')}
          className={cn([
            ` w-auto px-1 py-3 shrink-0 text-[${colors[colorIndex].headerRowColor}] `,
          ])}
          style={{
            color: colors[colorIndex].headerRowColor
          }}
          onClick={() => setOpen(true)}
          icon={<Palette size={14} style={{ color: colors[colorIndex].headerRowColor }} />}
        >
          {t('common.table.set_style')}
        </IconButton>
        {
          (docType === 'doc' || docType === 'sheet' || docType == 'email') && (
            <>
              {/* <IconButton
                title={t('common.table.set_style_tip')}
                className={cn([
                  ` w-auto px-1 py-3 shrink-0 text-[${colors[colorIndex].headerRowColor}] `,
                ])}
                style={{
                  color: colors[colorIndex].headerRowColor
                }}
                onClick={() => setOpen(true)}
                icon={<Palette size={14} style={{ color: colors[colorIndex].headerRowColor }} />}
              >
                {t('common.table.set_style')}
              </IconButton> */}
              <IconButton
                title={t('common.table.insert_tip')}
                className=' w-auto ml-1 px-1 py-3 shrink-0'
                onClick={onInsert}
                icon={Sheet}
              >
                {t('common.table.insert')}
              </IconButton>
            </>
          )
        }
        {
          docType === 'sheet' && (
            <>
              <IconButton
                title={t('common.table.new_sheet_tip')}
                className=' w-auto ml-1 px-1 py-3 shrink-0 '
                onClick={onNewsheet}
                icon={Layers3}
              >
                {t('common.table.new_sheet')}
              </IconButton>
              <IconButton
                title={t('common.table.append_tip')}
                className=' w-auto ml-1 px-1 py-3 shrink-0'
                onClick={onAppend}
                icon={ListEnd}
              >
                {t('common.table.append')}
              </IconButton>
            </>
          )
        }
        {
          (docType === 'chat' || docType == 'side') && (
            <IconButton
              className=' w-auto ml-1 px-1 py-3 shrink-0'
              onClick={downLoadExcel}
              icon={Grid3X3}
            >
              {t('common.download')}
            </IconButton>
          )
        }
        {
          (docType === 'chat' || docType == 'side' || docType == 'slide' || docType == 'email') && (
            <IconButton
              className=' w-auto ml-1 px-1 py-3 shrink-0'
              onClick={copyTable}
              icon={copyOk ? Check : Copy}
            >
              {t('common.copy')}
            </IconButton>
          )
        }

      </div>
      <Modal
        open={open}
        title="Table Style"
        showClose={true}
        onClose={handleClose}
        showConfirm={false}
      // actions={[
      //   {
      //     label: 'Ok',
      //     color: 'primary',
      //     onClick: handleOk,
      //   },
      // ]}
      >
        <div className=" grid grid-cols-4">
          {colors.map(
            (
              { headerRowColor, firstRowColor, secondRowColor, footerRowColor },
              index
            ) => {
              return (
                <div
                  className={`m-1 h-12 border-2 border-black-50 hover:border-primary cursor-pointer ${colorIndex === index ? 'border-primary' : ''
                    }`}
                  key={index}
                  onClick={onSelectTheme.bind(null, index)}
                >
                  <div
                    className=" h-1/4 "
                    style={{ backgroundColor: headerRowColor }}
                  ></div>
                  <div
                    className=" h-1/4 "
                    style={{ backgroundColor: firstRowColor }}
                  ></div>
                  <div
                    className="h-1/4 "
                    style={{ backgroundColor: secondRowColor }}
                  ></div>
                  <div
                    className=" h-1/4 "
                    style={{ backgroundColor: footerRowColor }}
                  ></div>
                </div>
              );
            }
          )}
        </div>
      </Modal>
    </>
  );
});
