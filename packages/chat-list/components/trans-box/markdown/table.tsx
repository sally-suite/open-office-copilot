import React, { useEffect, useRef, useState } from 'react';
import colors from 'chat-list/data/templates/colors';
import useChatState from 'chat-list/hook/useChatState';
import { Check, Copy, Grid3X3 } from 'lucide-react';
import IconButton from 'chat-list/components/icon-button'
import { ITableOption } from 'chat-list/types/api/sheet';
import styles from './index.module.css';
import { copyByClipboard } from 'chat-list/utils';
import { useTranslation } from 'react-i18next';
interface ITableProps {
  className?: string;
  children?: React.ReactNode;
  showMenu?: boolean;
}

export default React.memo(function Table({
  className,
  children,
  showMenu = true,
  ...props
}: ITableProps) {
  const table = useRef<HTMLTableElement>(null);
  const [copyOk, setCopyOk] = React.useState(false);
  const { t } = useTranslation('side')

  function arrayToCSV(data: string[][]) {
    return data.map(row =>
      row.map(item =>
        typeof item === 'string' && item.includes(',')
          ? `"${item.replace(/"/g, '""')}"`
          : item
      ).join(',')
    ).join('\n');
  }
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
  function downloadCSV(array: string[][], filename = 'data.csv') {
    const csv = arrayToCSV(array);
    const bom = '\uFEFF'; // 添加 BOM
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');

    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const downLoadExcel = async () => {
    const data = convertToArray(true);
    downloadCSV(data)
  }
  const copyExcel = async () => {
    const html = table.current.outerHTML;
    copyByClipboard(html, html);
    setCopyOk(true);
    setTimeout(() => {
      setCopyOk(false);
    }, 1000);
  }

  useEffect(() => {
    setTableStyle(colors[0]);
  }, []);

  if (!showMenu) {
    return (
      <table ref={table} className={className} {...props}>
        {children}
      </table>
    )
  }
  return (
    <>
      <table style={{ borderSpacing: 0, borderCollapse: 'collapse', margin: '4px 0' }} ref={table} className={className} {...props}>
        {children}
      </table>
      <div className={styles.toolbar}>
        <IconButton
          onClick={downLoadExcel}
          icon={Grid3X3}
          className=' w-auto px-1 py-3 mr-1'
        >
          {t('download', 'Download')}
        </IconButton>
        <IconButton
          className=' w-auto px-1 py-3 mr-1'
          onClick={copyExcel}
          icon={copyOk ? Check : Copy}
        >
          {copyOk ? t('copied', 'Copied') : t('copy', 'Copy')}
        </IconButton>
      </div>
    </>
  );
});
