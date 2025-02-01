import React, { useEffect, useRef, useState } from 'react';
import CodeEditor from '@uiw/react-codemirror';

// import { javascript } from '@codemirror/lang-javascript';
import { githubLightInit } from '@uiw/codemirror-theme-github';
import IconButton from './IconButton';
import { XCircle, Upload, ChevronUp } from 'lucide-react';
import { ILog, LogType, ICell, CellType, ICellState } from 'chat-list/types/log';
import { copyByClipboard, uuid } from 'chat-list/utils';
import { cn } from 'chat-list/lib/utils';
import { useTranslation } from 'react-i18next';
import { python } from '@codemirror/lang-python';
import Folder from './Folder';
import { clearFolder, createXlsxFile, prepareFolder, writeFile } from 'chat-list/tools/sheet/python/util';
import Markdown, { replaceImageLinks } from "../markdown/plain";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import MarkEdit from './MarkEdit';
import Console from './Console';
import LogTabs from './LogTabs';
import IconSvg from 'chat-list/components/icon';
import FileSelector from '../file-selector';
import sheetApi from '@api/sheet';
import Notes from './Notes';
import Modal from '../modal';
import Button from '../button';
import { Input } from '../ui/input';
import api from '@api/index';
import stepsPng from 'chat-list/assets/img/steps-80.png';

// import { editFunction } from '../service/edit';
// import return1 from '../data/return1.md';

interface ICodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onRun: (code: string, log?: (text: string) => void) => Promise<any>;
  renderPerview?: () => React.ReactNode;
  onSaveToSheet?: () => void;
  codeCompletion: (code: string, input: string, callback: (done: boolean, code: string) => void) => Promise<string>;
  children?: React.ReactNode;
  className?: string;
  onRedo?: (log: ILog) => void;
  onUndo?: (log: ILog) => void;
  autoRun?: boolean;
  hideChatbox?: boolean;
}

function App({
  code,
  onChange,
  onRun,
  renderPerview,
  onSaveToSheet,
  codeCompletion,
  children,
  className = '',
  onRedo,
  onUndo,
  autoRun = true,
}: ICodeEditorProps) {
  const { t } = useTranslation(['coder']);
  const [editorCode, setEditorCode] = useState(code || ''); // 初始化代码
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<ILog[]>([]);
  const [logType, setLogType] = useState<LogType | 'all'>('all');
  const [cells, setCells] = useState<ICell[]>([]);
  const [currentCell, setCurrentCell] = useState('');
  const [currentCellIndex, setCurrentCellIndex] = useState(0);
  const [actionState, setActionState] = useState<ICellState>(null);
  const [waitting, setWaitting] = useState(false);
  const [mode, setMode] = useState<'input' | 'output' | 'code' | 'notes'>('code');
  const inputFolder = useRef(null);
  const outputFolder = useRef(null);
  const editorRef = useRef(null);
  const [noteName, setNoteName] = useState('');
  const [markOpen, setMarkOpen] = useState(false);
  const onCodeChange = (id: string, value: string) => {
    // setEditorCode(value);
    setActionState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        code: value,
      }
    }));
  };
  const addLog = (newLog: ILog) => {
    setLogs((prevLogs) => [...prevLogs, newLog]);
  };
  const addCell = (newAction: ICell) => {
    setCells((prevActions) => [...prevActions, newAction]);
    setActionState({
      ...actionState,
      [newAction.id]: newAction,
    });
  };

  const updateCell = (id: string, newCell: Partial<ICell>) => {
    setActionState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...newCell
      }
    }));
  };
  const removeCell = (id: string) => {
    setCurrentCell('');
    setCurrentCellIndex(-1);
    setCells((prevActions) => {
      return prevActions.filter((action) => action.id !== id);
    });
    setActionState((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const appendLog = (content: string, type: LogType) => {
    const id = uuid();
    const newLog: ILog = { id, content, type, time: new Date() };
    addLog(newLog);
    return id;
  };

  const updateLog = (id: string, content: string) => {
    setLogs((prevLogs) => {
      return prevLogs.map((log) => {
        if (log.id === id) {
          return { ...log, content };
        }
        return log;
      });
    });
  };

  const onInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInput(e.target.value);
  };


  const onLogTypeChange = (type: LogType) => {
    setLogType(type);
  };
  const onClear = () => {
    setLogs([]);
  };

  const sleep = () => {
    return new Promise(resolve => setTimeout(resolve, 500));
  };
  // 执行代码的函数
  const executeCode = async (editorCode: string) => {
    try {
      await clearOutput();
      setWaitting(true);
      const id = appendLog(`Script running.`, LogType.info);
      await sleep();
      const result = await onRun?.(editorCode);
      updateLog(id, `Script run finished.`);
      setWaitting(false);
      await refreshOutput();
      return `${typeof result == 'object' ? JSON.stringify(result) : result}`;
    } catch (error) {
      console.error(error);
      appendLog(error.message, LogType.error);
    } finally {
      setWaitting(false);
    }
  };
  function generateIpynb(data: { result: string, code: string }[]) {
    const cells: any = [];

    data.forEach(item => {
      // 添加代码单元格
      if (item.code) {
        cells.push({
          cell_type: "code",
          execution_count: null,
          metadata: {},
          outputs: [],
          source: item.code.split('\n')
        });
      }
      // 添加Markdown单元格存储结果
      if (item.result) {
        cells.push({
          cell_type: "markdown",
          metadata: {},
          source: item.result.split('\n').map(line => `    ${line}`)
        });
      }
    });

    const notebook = {
      cells: cells,
      metadata: {
        kernelspec: {
          display_name: "Python 3",
          language: "python",
          name: "python3"
        },
        language_info: {
          codemirror_mode: {
            name: "ipython",
            version: 3
          },
          file_extension: ".py",
          mimetype: "text/x-python",
          name: "python",
          nbconvert_exporter: "python",
          pygments_lexer: "ipython3",
          version: "3.7.3"
        }
      },
      nbformat: 4,
      nbformat_minor: 2
    };

    return JSON.stringify(notebook, null, 2);
  }

  const runCode = async (e: any) => {

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      setCurrentCell(cell.id);
      moveCellToView(cell.id);
      await onRunCode(cell.id);
    }

  };

  const moveCellToView = (cellId: string) => {

    setTimeout(() => {
      document.getElementById(cellId).scrollIntoView({
        behavior: 'smooth'
      });
    }, 500);
  };

  const removeCode = async () => {
    if (!currentCell) {
      return;
    }
    removeCell(currentCell);
  };
  const onAddCell = (type: CellType) => {

    const id = uuid();
    setActionState({
      ...actionState,
      [id]: {
        id,
        type,
        status: 'success',
        code: '\n\n',
        result: ''
      },
    });
    // 插入当前焦点cell的下面
    const index = cells.findIndex(cell => cell.id === currentCell);
    if (index !== -1) {
      cells.splice(index + 1, 0, { id, type });
    } else {
      cells.push({ id, type });
    }
    // setCells([...cells, { id, type }]);
    setCurrentCell(id);

  };
  function download(mark: string, filename = 'script.md') {

    const blob = new Blob([mark], { type: 'text/plain;charset=utf-8;' });

    const link = document.createElement('a');

    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  const downloadMark = async () => {
    const mark = cells.map((p) => {
      const type = actionState[p.id].type;
      if (type == 'code') {
        const code = actionState[p.id].code;
        const result = actionState[p.id].result;
        return `\`\`\`python\n${code}\n\`\`\`\n\n${result}`;
      } else if (type == 'markdown') {
        return actionState[p.id].content;
      }
    }).join('\n\n');
    const md = replaceImageLinks(mark);
    download(md);
  };
  const downloadJupyter = () => {
    const list = cells.map((p) => {
      const type = actionState[p.id].type;
      if (type == 'code') {
        const code = actionState[p.id].code;
        const result = actionState[p.id].result;
        return { code, result: replaceImageLinks(result) };
      } else if (type == 'markdown') {
        return { code: '', result: replaceImageLinks(actionState[p.id].content) };
      }
    });
    const ipynb = generateIpynb(list);
    download(ipynb, 'note.ipynb');
  };
  const copyMark = async () => {
    const mark = cells.map((p) => {
      const type = actionState[p.id].type;
      if (type == 'code') {
        const code = actionState[p.id].code || '';
        const result = actionState[p.id].result || '';
        return `\`\`\`python\n${code}\n\`\`\`\n\n${result}`;
      } else if (type == 'markdown') {
        return actionState[p.id].content;
      }
    }).join('\n\n');
    const md = replaceImageLinks(mark);
    copyByClipboard(md);
  };
  const copyJupyter = () => {
    const list = cells.map((p) => {
      const type = actionState[p.id].type;
      if (type == 'code') {
        const code = actionState[p.id].code || '';
        const result = actionState[p.id].result || '';
        return { code, result: replaceImageLinks(result) };
      } else if (type == 'markdown') {
        return { code: '', result: replaceImageLinks(actionState[p.id].content) };
      }
    });
    const ipynb = generateIpynb(list);
    // download(ipynb, 'note.ipynb');
    copyByClipboard(ipynb);
  };

  const onSelectCodeblock = async (id: string) => {
    const index = cells.findIndex(p => p.id == id);
    setCurrentCellIndex(index);
    setCurrentCell(id);
  };
  const onDeselect = () => {
    setCurrentCell('');
    setCurrentCellIndex(-1);
  };
  const onMarkChange = (id: string, content: string) => {
    setActionState({
      ...actionState,
      [id]: {
        ...actionState[id],
        content
      },
    });
  };
  const addCodeLog = async (id: string, log: string) => {
    if (!actionState) {
      return;
    }
    let currentId = id;
    if (!id) {
      currentId = currentCell;
    }

    const data = actionState[currentId];
    if (!data) {
      return;
    }
    setActionState({
      ...actionState,
      [currentId]: {
        ...data,
        status: 'success',
        result: log
      },
    });
  };
  const saveToSheet = async () => {
    try {
      await onSaveToSheet?.();
      // await sheetApi.setValues(executionResult);
      // appendLog('Update successfully!', LogType.info);
    } catch (err) {
      appendLog(err.message, LogType.error);
    }
  };

  const onRecorderOutput = (text: string) => {
    setInput(input + text);
  };

  const renderSelectedCodeBlock = () => {
    if (!currentCell) {
      return 'No code selected';
    }
    if (actionState[currentCell].type !== 'code') {
      return 'No code selected';
    }
    return `[${(currentCellIndex + 1)} ]`;
  };

  const onContentChange = (id: string, e: any) => {
    // setEditorCode(value);
    setActionState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        content: e.target.value,
      }
    }));
  };

  const onEnter = async (cellId: string) => {
    if (waitting) {
      return;
    }
    setWaitting(true);
    updateCell(cellId, {
      status: 'generating'
    });
    try {
      const content = actionState[cellId].content;
      const code = actionState[cellId].code;
      const result = await codeCompletion(code, content, (done: boolean, code: string) => {
        updateCell(cellId, {
          code: code,
        });
      });
      if (result) {
        updateCell(cellId, {
          status: 'running'
        });
        const execResult = await executeCode(result);
        if (execResult.startsWith('Script run failed')) {
          updateCell(cellId, {
            result: execResult,
            type: 'code',
            status: 'error',
          });
        } else {
          updateCell(cellId, {
            code: result,
            content: content,
            result: execResult,
            type: 'code',
            status: 'success',
          });
        }

      } else {
        updateCell(cellId, {
          result: 'No response',
          status: 'success',
        });
      }
      // 设置 editorRef.current 的滚动条到最底部
      // setTimeout(() => {
      //   if (editorRef.current) {
      //     editorRef.current.scrollTop = editorRef.current.scrollHeight;
      //   }
      // }, 1000)

    } catch (err) {
      updateCell(cellId, {
        result: err.message,
        status: 'error',
      });
    } finally {
      setWaitting(false);
    }
  };
  const onRunCode = async (cellId: string) => {
    if (waitting) {
      return;
    }
    setWaitting(true);
    updateCell(cellId, {
      status: 'running'
    });
    try {
      const result = actionState[cellId].code;

      if (result) {
        const execResult = await executeCode(result);
        console.log(execResult);
        if (execResult.startsWith('Script run failed')) {
          updateCell(cellId, {
            result: execResult,
            type: 'code',
            status: 'error',
          });
        } else {
          updateCell(cellId, {
            result: execResult,
            type: 'code',
            status: 'success',
          });
        }

      } else {
        updateCell(cellId, {
          result: 'No response',
          status: 'success',
        });
      }
      // 设置 editorRef.current 的滚动条到最底部
      // setTimeout(() => {
      //   if (editorRef.current) {
      //     editorRef.current.scrollTop = editorRef.current.scrollHeight;
      //   }
      // }, 1000)

    } catch (err) {
      updateCell(cellId, {
        result: err.message,
        status: 'error',
      });
    } finally {
      setWaitting(false);
    }
  };
  const onStart = async () => {
    if (waitting) {
      return;
    }
    setWaitting(true);
    // executeCode();
    if (!input.trim()) return;

    const id = uuid();
    addCell({
      id,
      code: '',
      content: input,
      result: '',
      type: 'code',
      expand: true,
      status: 'generating',
    });

    setCurrentCell(id);

    try {
      const content = input;
      const result = await codeCompletion('', content, (done: boolean, code: string) => {
        console.log(code);
        updateCell(id, {
          code: code,
        });
      });
      if (result) {
        updateCell(id, {
          status: 'running'
        });
        const execResult = await executeCode(result);
        if (execResult.startsWith('Script run failed')) {
          updateCell(id, {
            result: execResult,
            type: 'code',
            status: 'error',
          });
        } else {
          updateCell(id, {
            code: result,
            content: content,
            result: execResult,
            status: 'success',
            type: 'code'
          });
        }

      } else {
        updateCell(id, {
          type: 'code',
          id,
          code: result,
          content: content,
          result: 'No response',
          status: 'success',
        });
      }
      // 设置 editorRef.current 的滚动条到最底部
      // setTimeout(() => {
      //   if (editorRef.current) {
      //     editorRef.current.scrollTop = editorRef.current.scrollHeight;
      //   }
      // }, 1000)

    } catch (err) {
      updateCell(id, {
        type: 'code',
        id,
        result: err.message,
        status: 'error',
      });
    } finally {
      setWaitting(false);
    }
  };
  const onFixError = async (cellId: string) => {
    if (waitting) {
      return;
    }
    setWaitting(true);

    try {
      const content = actionState[cellId].content;
      const error = actionState[cellId].result;
      const code = actionState[cellId].code;
      const prompt = `user requirement:${content}\n\n Code Exception:${error}`;
      const result = await codeCompletion(code, prompt, (done: boolean, code: string) => {
        updateCell(cellId, {
          code: code,
        });
      });
      if (result) {
        const execResult = await executeCode(result);
        updateCell(cellId, {
          code: result,
          content: content,
          result: execResult,
          type: 'code',
          status: 'success',
        });
      } else {
        updateCell(cellId, {
          result: 'No response',
          status: 'success',
        });
      }
      // 设置 editorRef.current 的滚动条到最底部
      // setTimeout(() => {
      //   if (editorRef.current) {
      //     editorRef.current.scrollTop = editorRef.current.scrollHeight;
      //   }
      // }, 1000)

    } catch (err) {
      updateCell(cellId, {
        result: err.message,
        status: 'error',
      });
    } finally {
      setWaitting(false);
    }
  };
  const onExpand = (id: string) => {
    updateCell(id, {
      expand: !actionState[id].expand
    });
  };


  const onClearInput = () => {
    setInput('');
  };
  // const toggleMode = (mode) => {
  //   setMode(mode === 'code' ? 'output' : 'code');
  // }

  const onSelectFile = async (files: File[]) => {



    appendLog('Uploading file...', LogType.info);

    await prepareFolder(['/input'], true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // const buffer = await blobToArrayBuffer(file)
      // const uint8View = new Uint8Array(buffer);
      window.INPUT_EXCEL_FILE = file;
      const wboutArrayBuffer = await createXlsxFile();
      await writeFile(`/input/data.xlsx`, wboutArrayBuffer);
    }
    if (inputFolder.current) {
      await inputFolder.current.refresh();
    }

    appendLog(`Upload file successfully`, LogType.info);

    appendLog(`Parsing your Excel`, LogType.info);

    const sheetInfo = await sheetApi.getSheetInfo();
    appendLog('This file contains the following sheets:', LogType.info);
    sheetInfo.sheetInfo.forEach((sheet, i) => {
      appendLog(`${i + 1}. **Sheet Name**:${sheet.sheetName}\n**Headers**: ${sheet.headers.map(p => p.name).join(' , ')}`, LogType.info);
    });

    appendLog(`Please **check these table headers** above, if they are incorrect the generated code may not be accurate.`, LogType.info);


  };

  const clearOutput = async () => {
    await clearFolder('/output');
    await refreshOutput();
  };

  const refreshOutput = async () => {
    if (outputFolder.current) {
      outputFolder.current.refresh();
    }
  };

  const saveNote = async () => {
    const notes = cells.map((p) => {
      return {
        ...p,
        ...actionState[p.id]
      };
    });
    console.log(notes);
    await api.addBookmark({
      name: noteName || 'notes-' + new Date().toLocaleString(),
      type: 'sheet',
      agent: 'jupyter',
      data: JSON.stringify(notes),
    });
    setMarkOpen(false);
  };

  const onNoteSelect = (data: string) => {
    const cells = JSON.parse(data);
    const state = cells.reduce((prev: any, p: any) => {
      return {
        ...prev,
        [p.id]: p
      };
    }, {});
    setCells(cells);
    setActionState(state);
    setCurrentCell(cells[0].id);
    setMode('code');
  };

  const init = () => {
    const log: ICell = {
      id: uuid(),
      type: 'code',
      content: input,
      time: new Date(),
      status: 'success',
      code: editorCode
    };
    setCurrentCell(log.id);
    addCell(log);
    if (autoRun) {
      executeCode(editorCode);
    }
  };

  useEffect(() => {
    // console.log(editorCode);
    if (editorCode) {
      init();
    }

  }, []);


  // useEffect(() => {
  //   document.addEventListener('keydown', onKeyDown);
  //   return () => {
  //     document.removeEventListener('keydown', onKeyDown);
  //   };
  // }, [onKeyDown]);

  // React.useEffect(() => {
  //   if (isDragging) {
  //     document.addEventListener('mousemove', handleMouseMove);
  //     document.addEventListener('mouseup', handleMouseUp);
  //     document.addEventListener('mouseleave', handleMouseLeave);
  //   } else {
  //     document.removeEventListener('mousemove', handleMouseMove);
  //     document.removeEventListener('mouseup', handleMouseUp);
  //     document.removeEventListener('mouseleave', handleMouseLeave);
  //   }
  //   return () => {
  //     document.removeEventListener('mousemove', handleMouseMove);
  //     document.removeEventListener('mouseup', handleMouseUp);
  //     document.removeEventListener('mouseleave', handleMouseLeave);
  //   };
  // }, [isDragging]);

  return (
    <div className={cn([
      "flex flex-row items-stretch h-screen border border-gray-300",
      className,
    ])}>
      <div className='flex flex-row items-stretch flex-1 overflow-auto'>
        <div className="flex flex-col flex-1 shrink-0 overflow-auto border-r border-gray-300">
          {/* <div className={cn("flex flex-col border-b border-gray-300", "flex-1 overflow-auto")}>
            <div className="toolbar">
              <div className={cn([
                'px-1  mr-2 cursor-pointer border-b-2 border-b-gray-700',
              ])} >
                /input
              </div>
              <div className='action  space-x-1'>
                <FileSelector
                  icon={Upload}
                  onSelect={onSelectFile}
                  config={{
                    maxSize: 10000000,
                    maxFiles: 1,
                    accept: {
                      xlsx: true
                    }
                  }}>
                  <span className=' hidden sm:inline-block'>
                    {t('upload', 'Upload')} Excel
                  </span>
                </FileSelector>
              </div>
            </div>
            <div className='flex overflow-auto flex-1 flex-col text-sm'>
              <Folder ref={inputFolder} folder='/input' showFileContent={false} />
            </div>
          </div> */}
          {/* <div className={cn("flex flex-col border-b border-gray-300", "flex-[3] overflow-auto")}>
            <div className="toolbar">
              <div className={cn([
                'px-1  mr-2 cursor-pointer border-b-2 border-b-gray-700',
              ])} >
                /output
              </div>
              <div className='action  space-x-1'>
                <IconButton
                  name="Trash2"
                  onClick={clearOutput}
                >
                  <span className=' hidden sm:inline-block'>
                    {t('clear', 'Clear')}
                  </span>
                </IconButton>
              </div>

            </div>
            <div className='flex overflow-auto flex-1 flex-col text-sm'>
              <Folder ref={outputFolder} folder='/output' showFileContent={true} />
            </div>
          </div> */}
          <div className={cn("flex flex-col border-b border-gray-300", "flex-1 overflow-auto")}>
            <div className="toolbar">
              <div className={cn([
                'px-1 text-sm  mr-2 cursor-pointer border-b-2 border-b-gray-700',
              ])} >
                {t('folder', 'Folder')}
              </div>
              <div className='action  space-x-1'>
                <FileSelector
                  icon={Upload}
                  onSelect={onSelectFile}
                  config={{
                    maxSize: 10000000,
                    maxFiles: 1,
                    accept: {
                      xlsx: true
                    }
                  }}>
                  <span className=' hidden sm:inline-block'>
                    {t('upload', 'Upload')} Excel
                  </span>
                </FileSelector>
              </div>
            </div>
            <div className="flex flex-col shrink-0 overflow-auto border-r border-gray-300">
              <Folder ref={inputFolder} folder='/input' showFileContent={false} />
              <Folder ref={outputFolder} folder='/output' showFileContent={true} />
              <Folder folder='/home/pyodide' folderName="" showFileContent={false} />
            </div>
            <div className="toolbar mt-4 pr-1">
              <div className={cn([
                'px-1 text-sm  mr-2 cursor-pointer border-b-2 border-b-gray-700',
              ])} >
                {t('notes', 'Notes')}
              </div>
              <div>
                <IconButton
                  name={'Plus'}
                  className='bg-white h-6 w-auto px-2 py-1 my-1 border shrink-0 rounded-sm hover:bg-gray-100 active:bg-gray-200'
                  onClick={() => {
                    setCells([]);
                  }}
                >
                  {t('new', 'New')}
                </IconButton>
              </div>
            </div>
            <div>
              <Notes onSelect={onNoteSelect} />
            </div>
          </div>

        </div>
        <div className="flex flex-col border-b overflow-auto flex-[2] shrink-0  border-r border-gray-300"
          onKeyDown={(e) => {
            if (
              e.key === 'Enter'
            ) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <div className="toolbar">
            <div className="title text-sm ">
              <button className={cn([
                'px-1 mr-2 cursor-pointer border-b-2',
                mode === 'code' ? " border-b-gray-700" : " border-b-white"
              ])}
                onClick={setMode.bind(null, 'code')}
              >
                {t('code', 'Code')}
              </button>
              {/* <button className={cn([
                'px-1 mr-2 cursor-pointer border-b-2',
                mode === 'history' ? " border-b-gray-700" : " border-b-white"
              ])} onClick={setMode.bind(null, 'history')}>
                {t('history', 'History')}
              </button> */}
            </div>
            <div className='action  space-x-1'>
              {
                mode == 'code' && (
                  <>
                    <IconButton
                      name="FastForward"
                      onClick={runCode}
                    >
                      <span className=' hidden sm:inline-block'>
                        {t('run', 'Run')}
                      </span>
                    </IconButton>
                    <IconButton
                      name="Plus"
                      onClick={onAddCell.bind(null, 'code')}
                    >
                      <span className=' hidden sm:inline-block'>
                        {t('add', 'Add')}
                      </span>
                    </IconButton>
                    {/* <DropdownMenu>
                      <DropdownMenuTrigger>
                        <IconButton
                          name="Plus"
                        >
                          <span className=' hidden sm:inline-block'>
                            {t('add', 'Add')}
                          </span>
                        </IconButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={onAddCell.bind(null, 'code')}>
                          Code
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onAddCell.bind(null, 'markdown')}>
                          Markdown
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu> */}
                    <IconButton
                      name="Trash"
                      onClick={removeCode}
                    >
                      <span className=' hidden sm:inline-block'>
                        {t('remove', 'Remove')}
                      </span>
                    </IconButton>
                    <IconButton
                      name="Save"
                      onClick={() => setMarkOpen(true)}
                    >
                      <span className=' hidden sm:inline-block'>
                        {t('save', 'Save')}
                      </span>
                    </IconButton>
                    {/* <DropdownMenu>
                      <DropdownMenuTrigger>
                        <IconButton
                          name="Copy"
                        >
                          <span className=' hidden sm:inline-block'>
                            {t('copy', 'Copy')}
                          </span>
                        </IconButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <IconButton
                            name="Code"
                            onClick={copyMark}
                          >
                            <span className='inline-block'>
                              {t('markdown', 'Markdown')}
                            </span>
                          </IconButton>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <IconButton
                            name="BookDown"
                            onClick={copyJupyter}
                          >
                            <span className='inline-block'>
                              {t('jupyter', 'Jupyter')}
                            </span>
                          </IconButton>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu> */}
                    {/* <DropdownMenu>
                      <DropdownMenuTrigger>
                        <IconButton
                          name="Download"
                        >
                          <span className=' hidden sm:inline-block'>
                            {t('download', 'Download')}
                          </span>
                        </IconButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <IconButton
                            name="Code"
                            onClick={downloadMark.bind(null, '')}
                          >
                            <span className='inline-block'>
                              {t('markdown', 'Markdown')}
                            </span>
                          </IconButton>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <IconButton
                            name="BookDown"
                            onClick={downloadJupyter.bind(null, '')}
                          >
                            <span className='inline-block'>
                              {t('jupyter', 'Jupyter')}
                            </span>
                          </IconButton>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu> */}
                  </>
                )
              }
            </div>
          </div>
          {
            mode == 'code' && cells.length == 0 && (
              <div className={cn([
                "flex flex-col h-screen items-center  border border-gray-300",
                className,
              ])}>
                <div className='flex flex-col items-center w-full mt-[200px]'>
                  <img src={stepsPng} className='w-14 py-4' alt="" />
                  <p className=' font-mono text-base font-semibold'>
                    Build Your Analytics Flow
                  </p>
                  <div className="flex w-3/5 flex-col relative border border-primary rounded-md m-1 overflow-hidden">
                    <textarea
                      disabled={waitting}
                      value={input}
                      placeholder={
                        waitting ? t('running', "Script running, please wait...") : t('input_placeholder', "Please enter data analysis requirements or code update requirements.")
                      }
                      className=" flex-1 p-1  focus:outline-none resize-none text-sm rounded-md"
                      onChange={onInputChange}
                      rows={2}
                    />

                    <div className="flex flex-row justify-between items-center text-gray-500 p-1 ">
                      {/* <Recorder onOutput={onRecorderOutput} /> */}
                      <FileSelector
                        icon={Upload}
                        onSelect={onSelectFile}
                        config={{
                          maxSize: 10000000,
                          maxFiles: 1,
                          accept: {
                            xlsx: true
                          }
                        }}>
                        <span className=' hidden sm:inline-block'>
                          {t('upload', 'Upload')} Excel
                        </span>
                      </FileSelector>
                      {/* <Terminal size={16} /> */}
                      <IconSvg
                        name="plane"
                        className='text-primary cursor-pointer'
                        style={{
                          // color: '#127934',
                          height: 18,
                          width: 18
                        }}
                        onClick={onEnter}
                      ></IconSvg>
                    </div>

                    {input && (
                      <XCircle onClick={onClearInput} className=" absolute top-1 w-5 h-5 right-1 opacity-50 text-gray-500 cursor-pointer" />
                    )}
                  </div>
                </div>
              </div>
            )
          }
          {
            mode === 'code' && cells.length > 0 && (
              <div ref={editorRef} className='flex flex-col flex-1 overflow-auto items-stretch min-h-8 pb-40'>
                {
                  cells.map((action, i) => {
                    const type = actionState[action.id].type;
                    if (type === 'code') {
                      const code = actionState[action.id].code;
                      const result = actionState[action.id].result;
                      const content = actionState[action.id].content;
                      const expand = actionState[action.id].expand;
                      const status = actionState[action.id].status;
                      return (
                        <div
                          key={action.id}
                          id={action.id}
                          // className='border-t border-b' 
                          className={cn(
                            "flex flex-row border-b items-stretch min-h-8",
                          )}
                          onClick={onSelectCodeblock.bind(null, action.id)}
                        >

                          <div className={cn(['border-r border-gray-300 shrink-0 text-sm text-center text-gray-500 w-8',])} >
                            [{i + 1}]
                          </div>
                          <div
                            className={cn(
                              "flex-1 w-full overflow-x-auto ",
                              currentCell == action.id ? "border border-primary" : ""
                            )}
                          >
                            <div className='w-full border-b relative'>
                              <textarea
                                value={content}
                                placeholder={
                                  t('input_placeholder', "Please enter data analysis requirements or code update requirements.")
                                }
                                className="w-full p-1 focus:outline-none text-sm rounded-none"
                                // onChange={onInputChange}
                                onChange={onContentChange.bind(null, action.id)}
                                rows={3}
                              />
                              {
                                currentCell == action.id && (
                                  <div className='absolute top-0 right-1'>
                                    <IconButton
                                      name={'Wand'}
                                      className='bg-white  w-auto ml-1 px-2 py-1 my-1 border shrink-0 rounded-sm hover:bg-gray-100 active:bg-gray-200'
                                      onClick={onEnter.bind(null, action.id)}
                                    >
                                      {t('generate', 'Generate')}
                                    </IconButton>
                                  </div>

                                )
                              }

                            </div>
                            <div className='w-full border-b relative'>
                              <CodeEditor
                                basicSetup={{
                                  lineNumbers: false,
                                  foldGutter: false,

                                }}
                                className={cn(expand ? "h-auto" : " h-9 overflow-hidden")}
                                editable={true}
                                lang="python"
                                value={code || ""}
                                extensions={[python()]}
                                onChange={onCodeChange.bind(null, action.id)}
                                theme={githubLightInit({
                                  settings: {
                                    background: '#f5f5f5',
                                    foreground: '#333333'
                                  }
                                })}
                              />
                              {
                                currentCell == action.id && (
                                  <div className='absolute top-0 right-1 flex flex-row items-center space-x-1'>
                                    <IconButton
                                      loading={status == 'running'}
                                      name={'Play'}
                                      className='bg-white  w-auto ml-1 px-2 py-1 my-1 border shrink-0 rounded-sm hover:bg-gray-100 active:bg-gray-200'
                                      onClick={onRunCode.bind(null, action.id)}
                                    >
                                      {t('run', 'Run')}
                                    </IconButton>
                                    <IconButton
                                      icon={<ChevronUp className={cn('h-4 w-4 transition-all duration-300', expand ? 'rotate-180' : 'rotate-0')} />}
                                      className='bg-white  w-auto ml-1 px-1 py-1 my-1 border shrink-0 rounded-sm hover:bg-gray-100 active:bg-gray-200'
                                      onClick={onExpand.bind(null, action.id)}
                                    >
                                    </IconButton>
                                  </div>
                                )
                              }

                            </div>
                            <div className='w-full border-b relative'>
                              <Markdown className='p-2'>
                                {result}
                              </Markdown>
                              {
                                currentCell == action.id && status == 'error' && (
                                  <div className='absolute top-0 right-1 flex flex-row items-center space-x-1'>
                                    <IconButton
                                      name={'Bug'}
                                      className='bg-white  w-auto ml-1 px-2 py-1 my-1 border shrink-0 rounded-sm hover:bg-gray-100 active:bg-gray-200'
                                      onClick={onFixError.bind(null, action.id)}
                                    >
                                      {t('try-to-fix', 'Try to Fix')}
                                    </IconButton>
                                  </div>
                                )
                              }
                            </div>
                          </div>
                        </div>

                      );
                    } else if (type === 'markdown') {
                      return (
                        <div key={action.id}
                          // className='border-t border-b' 
                          className={cn(
                            "flex flex-row border-b items-stretch min-h-8",
                          )}
                          onClick={onSelectCodeblock.bind(null, action.id)}
                        >

                          <div className={cn(['border-r border-gray-300 shrink-0 text-sm text-center text-gray-500 w-8',])} >
                            [{i + 1}]
                          </div>
                          <div className={cn(
                            "flex-1 w-full overflow-x-auto ",
                            currentCell == action.id ? "border border-primary" : ""
                          )}>
                            <MarkEdit value={actionState[action.id].content} onChange={onMarkChange.bind(null, action.id)} >
                            </MarkEdit>
                          </div>
                        </div>
                      );
                    }

                  })
                }
              </div>
            )
          }
        </div>
        <div className="flex flex-col flex-1 shrink-0  overflow-auto" >
          <div className="toolbar overflow-hidden w-full">
            <div className="title">
              {t('console', 'Console')}
            </div>
            <LogTabs onChange={onLogTypeChange} />
            <div className=" flex-1"></div>
            <div className="action">
              <IconButton name="Eraser" className="mx-2" onClick={onClear}>
                {t('clear', 'Clear')}
              </IconButton>
            </div>
          </div>
          <div className="panel border-b-0" >
            <Console
              logType={logType}
              logs={logs}
              actions={[]}
              actionState={{}}
              onUndo={null}
              onSelectAction={null}
            />
          </div>
          {/* <div className='flex flex-row items-center h-6  pl-1 pr-2 w-auto m-1 text-sm bg-white border justify-start sm:w-auto rounded-full '>
            <Code height={14} width={14} className='text-gray-500' />
            <div className='flex-1 ml-1 text-gray-500'>
              {renderSelectedCodeBlock()}
            </div>
            <span className='cursor-pointer' onClick={onDeselect}>
              <X height={16} width={16} className='text-gray-500' />
            </span>
          </div> */}
          {/* <div className="flex flex-col relative border border-primary rounded-md m-1 overflow-hidden">
            <textarea
              disabled={waitting}
              value={input}
              placeholder={
                waitting ? t('running', "Script running, please wait...") : t('input_placeholder', "Please enter data analysis requirements or code update requirements.")
              }
              className=" flex-1 p-1  focus:outline-none resize-none text-sm rounded-md"
              onChange={onInputChange}
              rows={2}
              onKeyDown={onKeyDown}
            />

            <div className="flex flex-row justify-between items-center text-gray-500 p-1 ">
              <FileSelector
                icon={Upload}
                onSelect={onSelectFile}
                config={{
                  maxSize: 10000000,
                  maxFiles: 1,
                  accept: {
                    xlsx: true
                  }
                }}>
                <span className=' hidden sm:inline-block'>
                  {t('upload', 'Upload')} Excel
                </span>
              </FileSelector>
              <IconSvg
                name="plane"
                className='text-primary cursor-pointer'
                style={{
                  height: 18,
                  width: 18
                }}
                onClick={onEnter}
              ></IconSvg>
            </div>

            {input && (
              <XCircle onClick={onClearInput} className=" absolute top-1 w-5 h-5 right-1 opacity-50 text-gray-500 cursor-pointer" />
            )}
          </div> */}
        </div>
      </div>
      <Modal
        title={t('save', 'Save')}
        open={markOpen}
        showConfirm={false}
        showClose={false}
        onClose={() => setMarkOpen(false)}
      >
        <div className="p-1 space-y-1">
          <h3 className="input-label">  {t('note_name', 'Note name')}</h3>
          <Input value={noteName} onChange={(e) => setNoteName(e.target.value)} />
        </div>
        <div className='p-1 flex flex-row space-x-1'>
          <Button onClick={saveNote}>
            {t('save', 'Save')}
          </Button>
          <Button variant="secondary" onClick={() => setMarkOpen(false)} >
            {t('close', 'Close')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default App;
