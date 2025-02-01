import React, { useEffect, useRef, useState } from 'react';
import CodeEditor from '@uiw/react-codemirror';

// import { javascript } from '@codemirror/lang-javascript';
import { githubLightInit } from '@uiw/codemirror-theme-github';
import IconButton from './IconButton';
import CopyButton from './CopyButton';
import { XCircle, Code, X } from 'lucide-react';
import { ILog, LogType, ICell, CellType, ICellState } from 'chat-list/types/log';
import { blobToArrayBuffer, copyByClipboard, uuid } from 'chat-list/utils';
import { cn } from 'chat-list/lib/utils';
import { useTranslation } from 'react-i18next';
import { python } from '@codemirror/lang-python';
import Folder from './Folder'
import { clearFolder, prepareFolder, writeFile } from 'chat-list/tools/sheet/python/util';
import Markdown, { replaceImageLinks } from "../markdown/plain";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import MarkEdit from './MarkEdit'
// import { editFunction } from '../service/edit';
// import return1 from '../data/return1.md';

interface ICodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onRun: (code: string, log?: (text: string) => void) => Promise<any>;
  renderPerview?: () => React.ReactNode;
  onSaveToSheet?: () => void;
  codeCompletion: (code: string, input: string) => Promise<string>;
  children?: React.ReactNode;
  className?: string;
  onRedo?: (log: ILog) => void;
  onUndo?: (log: ILog) => void;
  autoRun?: boolean;
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
  const [currentCell, setCurrentAction] = useState('');
  const [currentCellIndex, setCurrentCellIndex] = useState(0);
  const [undoActions, setUndoActions] = useState([]);
  const [actionState, setActionState] = useState<ICellState>(null);
  const [waitting, setWaitting] = useState(false);
  const [mode, setMode] = useState<'input' | 'output' | 'code' | 'folder'>('code');
  const inputFolder = useRef(null);
  const outputFolder = useRef(null);
  const editorRef = useRef(null);

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
  }
  const removeCell = (id: string) => {
    setCurrentAction('');
    setCurrentCellIndex(-1);
    setCells((prevActions) => {
      return prevActions.filter((action) => action.id !== id);
    });
    setActionState((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }
  const addUndoActions = (action: ILog) => {
    setUndoActions((prevLogs) => [...prevLogs, action]);
  };

  const appendLog = (content: string, type: LogType) => {
    const newLog: ILog = { id: uuid(), content, type, time: new Date() };
    addLog(newLog);
  };

  const onInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInput(e.target.value);
  };

  const undoAction = async () => {
    // const action = cells[cells.length - 1];
    // if (action) {
    //   const id = action.id;
    //   const newActions = cells.filter((action) => action.id !== id);
    //   setCells(newActions);
    //   setLogs((prevActions) => {
    //     return prevActions.filter((action) => action.id !== id);
    //   });
    //   addUndoActions(action);
    //   // TODO
    //   let resultCode = '';
    //   if (newActions.length > 0) {
    //     resultCode = actionState[newActions[newActions.length - 1].id].code;
    //   } else {
    //     // TODO
    //     resultCode = code;
    //   }
    //   setEditorCode(resultCode);
    //   if (onUndo) {
    //     await onUndo(action)
    //   } else {
    //     await executeCode(resultCode);
    //   }
    // }
  };
  const redoAction = async () => {
    if (undoActions.length <= 0) {
      return;
    }
    const action = undoActions[undoActions.length - 1];
    if (action) {
      addCell(action);
      addLog(action);
      setUndoActions(undoActions.filter((action) => action.id !== action.id));

      // TODO
      const resultCode = actionState[action.id].code;
      setEditorCode(resultCode);

      if (onRedo) {
        await onRedo(action);
      } else {
        await executeCode(resultCode);
      }
    }
  };
  const onLogTypeChange = (type: LogType) => {
    setLogType(type);
  };
  const onClear = () => {
    setLogs([]);
  };
  const onSelectAction = (log: ILog) => {
    // const resultCode = actionState[log.id].code;
    // setEditorCode(resultCode);
    // executeCode(resultCode);
  };


  const onEnter = async () => {
    if (waitting) {
      return;
    }
    setWaitting(true);
    // executeCode();
    if (!input.trim()) return;
    const id = uuid();
    addCell({
      id,
      type: 'markdown',
      content: 'Waitting',
      status: 'success',
    })
    setInput('');
    try {
      if (!currentCell) {
        const result = await codeCompletion('', input);
        if (result) {
          updateCell(id, {
            content: result,
            status: 'success',
            type: 'code'
          })
        } else {
          updateCell(id, {
            content: 'No response',
            status: 'success',
          })
        }
      } else if (actionState[currentCell].type === 'markdown') {
        const content = actionState[currentCell].content;
        const result = await codeCompletion(content, input);
        if (result) {
          const execResult = await executeCode(result);
          updateCell(id, {
            code: result,
            content: result,
            result: execResult,
            type: 'code'
          })
        } else {
          updateCell(id, {
            content: 'No response',
            status: 'success',
          })
        }

      } else if (actionState[currentCell].type == 'code') {
        const code = actionState[currentCell].code;
        const result = await codeCompletion(code, input);
        if (result) {
          const execResult = await executeCode(result);
          updateCell(id, {
            code: result,
            content: result,
            result: execResult,
            id: currentCell,
            type: 'code'
          })
        } else {
          updateCell(id, {
            content: 'No response',
            status: 'success',
          })
        }
      }
      // 设置 editorRef.current 的滚动条到最底部
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.scrollTop = editorRef.current.scrollHeight;
        }
      }, 1000)

    } catch (err) {
      updateCell(id, {
        content: err.message,
        status: 'error',
      })
    } finally {
      setWaitting(false);
    }
  };

  const onKeyDown = async (e: KeyboardEvent) => {
    if (!e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      await onEnter();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      // 在这里执行你的自定义操作，比如缩进文本等
    }

  };
  // 执行代码的函数
  const executeCode = async (editorCode: string) => {
    try {
      await clearOutput();
      setWaitting(true)
      const result = await onRun?.(editorCode);
      if (result) {
        appendLog(`${typeof result == 'object' ? JSON.stringify(result) : result}`, LogType.info);
      } else {
        appendLog(`Script run finished.`, LogType.info);
      }
      setWaitting(false)
      await refreshOutput();
      return `${typeof result == 'object' ? JSON.stringify(result) : result}`;
    } catch (error) {
      console.error(error)
      appendLog(error.message, LogType.error);
    } finally {
      setWaitting(false)
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

  const runCode = async (id: string) => {
    let currentId = id
    if (!id) {
      currentId = currentCell;
    }
    if (!currentId) {
      return;
    }
    const type = actionState[currentId].type;
    if (type == 'code') {
      const code = actionState[currentId].code;
      const result = await executeCode(code);
      addCodeLog(currentCell, result);
    }
  }
  const removeCode = async () => {
    if (!currentCell) {
      return;
    }
    removeCell(currentCell);
  }
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
    })
    // 插入当前焦点cell的下面
    const index = cells.findIndex(cell => cell.id === currentCell);
    if (index !== -1) {
      cells.splice(index + 1, 0, { id, type });
    } else {
      cells.push({ id, type });
    }
    // setCells([...cells, { id, type }]);
    setCurrentAction(id);

  }
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
        return `\`\`\`python\n${code}\n\`\`\`\n\n${result}`
      } else if (type == 'markdown') {
        return actionState[p.id].content
      }
    }).join('\n\n');
    const md = replaceImageLinks(mark);
    download(md);
  }
  const downloadJupyter = () => {
    const list = cells.map((p) => {
      const type = actionState[p.id].type;
      if (type == 'code') {
        const code = actionState[p.id].code;
        const result = actionState[p.id].result;
        return { code, result: replaceImageLinks(result) }
      } else if (type == 'markdown') {
        return { code: '', result: replaceImageLinks(actionState[p.id].content) }
      }
    });
    const ipynb = generateIpynb(list);
    download(ipynb, 'note.ipynb');
  }
  const copyMark = async () => {
    const mark = cells.map((p) => {
      const type = actionState[p.id].type;
      if (type == 'code') {
        const code = actionState[p.id].code || '';
        const result = actionState[p.id].result || '';
        return `\`\`\`python\n${code}\n\`\`\`\n\n${result}`
      } else if (type == 'markdown') {
        return actionState[p.id].content
      }
    }).join('\n\n');
    const md = replaceImageLinks(mark);
    copyByClipboard(md)
  }
  const copyJupyter = () => {
    const list = cells.map((p) => {
      const type = actionState[p.id].type;
      if (type == 'code') {
        const code = actionState[p.id].code || '';
        const result = actionState[p.id].result || '';
        return { code, result: replaceImageLinks(result) }
      } else if (type == 'markdown') {
        return { code: '', result: replaceImageLinks(actionState[p.id].content) }
      }
    });
    const ipynb = generateIpynb(list);
    // download(ipynb, 'note.ipynb');
    copyByClipboard(ipynb)
  }

  const onSelectCodeblock = async (id: string) => {
    const index = cells.findIndex(p => p.id == id)
    setCurrentCellIndex(index);
    setCurrentAction(id)
  }
  const onDeselect = () => {
    setCurrentAction('');
    setCurrentCellIndex(-1);
  }
  const onMarkChange = (id: string, content: string) => {
    setActionState({
      ...actionState,
      [id]: {
        ...actionState[id],
        content
      },
    });
  }
  const addCodeLog = async (id: string, log: string) => {
    if (!actionState) {
      return;
    }
    let currentId = id
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
  }
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
  }

  const renderSelectedCodeBlock = () => {
    if (!currentCell) {
      return 'No code selected'
    }
    if (actionState[currentCell].type !== 'code') {
      return 'No code selected'
    }
    return `[${(currentCellIndex + 1)} ]`
  }

  const onClearInput = () => {
    setInput('')
  }
  // const toggleMode = (mode) => {
  //   setMode(mode === 'code' ? 'output' : 'code');
  // }

  const onSelectFile = async (files: File[]) => {
    await prepareFolder(['/input'], false);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = await blobToArrayBuffer(file)
      const uint8View = new Uint8Array(buffer);
      await writeFile(`/input/${file.name}`, uint8View)
    }
    if (inputFolder.current) {
      await inputFolder.current.refresh();
    }
  }

  const clearOutput = async () => {
    await clearFolder('/output');
    await refreshOutput();
  }

  const refreshOutput = async () => {
    if (outputFolder.current) {
      outputFolder.current.refresh();
    }
  }

  const init = () => {
    const log: ICell = {
      id: uuid(),
      type: 'code',
      content: input,
      time: new Date(),
      status: 'success',
      code: editorCode
    };
    setCurrentAction(log.id);
    addCell(log);
    if (autoRun) {
      executeCode(editorCode);
    }
  }

  useEffect(() => {
    // console.log(editorCode);
    if (editorCode) {
      init();
    } else {
      const log: ICell = {
        id: uuid(),
        type: 'code',
        content: '',
        time: new Date(),
        status: 'success',
        code: '\n'
      };
      addCell(log);
      setCurrentAction(log.id);
    }

  }, []);

  // useEffect(() => {
  //   onChange?.(editorCode);
  // }, [editorCode]);

  // useEffect(() => {
  //   const log = console.log;
  //   const error = console.error;
  //   console.log = (...args) => {
  //     const texts = args.map((arg) => {
  //       if (typeof arg === 'object') {
  //         return JSON.stringify(arg, null, 2);
  //       } else {
  //         return arg;
  //       }
  //     }).filter(p => !!p)
  //     appendLog(texts.join(' '), LogType.info);
  //     // log(...args);
  //     if (args) {
  //       console.info(...args)
  //     }

  //   };
  //   console.error = (...args) => {
  //     const texts = args.map((arg) => {
  //       if (typeof arg === 'object') {
  //         return JSON.stringify(arg, null, 2);
  //       } else {
  //         return arg;
  //       }
  //     })
  //     appendLog(texts.join(' '), LogType.error);
  //     // error(...args);
  //     if (args) {
  //       console.info(...args)
  //     }
  //   };
  //   return () => {
  //     console.log = log;
  //     console.error = error;
  //   };
  // }, []);

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
      <div className="flex flex-col  flex-1 overflow-auto border-r border-gray-300 ">
        <div className="flex flex-col  overflow-auto relative flex-1" ref={editorRef} >
          <div className="toolbar">
            <div className="title text-sm ">
              <button className={cn([
                'px-1 mr-2 cursor-pointer border-b-2',
                mode === 'code' ? " border-b-gray-700" : " border-b-white"
              ])} onClick={setMode.bind(null, 'code')}>
                {t('code', 'Code')}
              </button>
              <button className={cn([
                'px-1  mr-2 cursor-pointer border-b-2',
                mode === 'folder' ? " border-b-gray-700" : " border-b-white"
              ])} onClick={setMode.bind(null, 'folder')}>
                Folder
              </button>
              {/* <button className={cn([
                'px-1  mr-2 cursor-pointer border-b-2',
                mode === 'output' ? " border-b-gray-700" : " border-b-white"
              ])} onClick={setMode.bind(null, 'output')}>
                /output
              </button> */}
            </div>
            <div className="action  space-x-1">
              {/* {
                mode == 'input' && (
                  <FileSelector
                    icon={Upload}
                    onSelect={onSelectFile} config={{
                      accept: {
                        xlsx: true
                      }
                    }}>
                    <span className=' hidden sm:inline-block'>
                      {t('upload', 'Upload')}
                    </span>
                  </FileSelector>
                )
              } */}
              {
                mode == 'output' && (
                  <IconButton
                    name="Trash2"
                    onClick={clearOutput}
                  >
                    <span className=' hidden sm:inline-block'>
                      {t('clear', 'Clear')}
                    </span>
                  </IconButton>
                )
              }
              {
                mode === 'code' && (
                  <>

                    <IconButton
                      name="Play"
                      onClick={runCode.bind(null, '')}
                    >
                      <span className=' hidden sm:inline-block'>
                        {t('run', 'Run')}
                      </span>
                    </IconButton>
                    <DropdownMenu>
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
                    </DropdownMenu>
                    <IconButton
                      name="Trash"
                      onClick={removeCode}
                    >
                      <span className=' hidden sm:inline-block'>
                        {t('remove', 'Remove')}
                      </span>
                    </IconButton>
                    <DropdownMenu>
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
                    </DropdownMenu>
                    <DropdownMenu>
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
                    </DropdownMenu>
                    {/* <IconButton
                      name="Code"
                      onClick={downloadMark.bind(null, '')}
                    >
                      <span className=' hidden sm:inline-block'>
                        {t('markdown', 'Markdown')}
                      </span>
                    </IconButton>
                    <IconButton
                      name="BookDown"
                      onClick={downloadJupyter.bind(null, '')}
                    >
                      <span className=' hidden sm:inline-block'>
                        {t('jupyter', 'Jupyter')}
                      </span>
                    </IconButton> */}
                    {/* {
                      platform === 'office' && (
                        <IconButton
                          name="SquareEqual"
                          onClick={insertToCell}
                        >
                          <span className=' hidden sm:inline-block'>
                            {t('insert', 'Insert')}
                          </span>
                        </IconButton>
                      )
                    } */}
                  </>
                )
              }

            </div>
          </div>
          {/* {
            mode === 'input' && (
              <div className="panel flex-1 overflow-auto">
                <Folder ref={inputFolder} folder='/input' showFileContent={false} />
              </div>
            )
          } */}
          {
            mode == 'folder' && (
              <div className="flex flex-col flex-1 shrink-0 overflow-auto border-r border-gray-300">
                <div className={cn("flex flex-col border-b border-gray-300", "flex-1 overflow-auto")}>
                  <div className="toolbar">
                    <div className={cn([
                      'px-1  mr-2 ',
                    ])} >
                      /input
                    </div>
                  </div>
                  <div className='flex overflow-auto flex-1 flex-col text-sm'>
                    <Folder ref={inputFolder} folder='/input' showFileContent={false} />
                  </div>
                </div>
                <div className={cn("flex flex-col border-b border-gray-300", "flex-[3] overflow-auto")}>
                  <div className="toolbar">
                    <div className={cn([
                      'px-1  mr-2 ',
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
                </div>
              </div>
            )
          }
          {/* {
            mode === 'output' && (
              <div className="panel flex-1 overflow-auto">
                <Folder ref={outputFolder} folder='/output' />
              </div>
            )
          } */}
          {/* {
            mode === 'code' && (
              <div
                className="panel overflow-auto"
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter' ||
                    isCtrlPlus(e, 'z') ||
                    isCtrlPlus(e, 'y')
                  ) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                style={{ height: editorHeight }}
              >
                <CodeEditor
                  lang="python"
                  value={editorCode}
                  extensions={[python()]}
                  theme={githubLight}
                  onChange={onCodeChange}
                />
              </div>
            )
          } */}
          {
            mode === 'code' && (
              <div ref={editorRef} className='flex flex-col flex-1 overflow-auto items-stretch min-h-8'>
                {
                  cells.map((action, i) => {
                    const type = actionState[action.id].type;
                    if (type === 'code') {
                      const code = actionState[action.id].code;
                      const result = actionState[action.id].result;
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
                          <div
                            className={cn(
                              "flex-1 w-full overflow-x-auto ",
                              currentCell == action.id ? "border border-primary" : ""
                            )}
                          >
                            <CodeEditor
                              basicSetup={{
                                lineNumbers: false,
                                foldGutter: false,

                              }}
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
                            <Markdown className='p-2'>
                              {result}
                            </Markdown>
                          </div>

                        </div>

                      )
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
                      )
                    }

                  })
                }
              </div>
            )
          }

          {/* <div className="h-1 w-full absolute left-0 bottom-0 bg-gray-100 cursor-row-resize " onMouseDown={handleMouseDown}></div> */}
        </div>
        <div className="flex flex-col  overflow-auto" >
          {/* <div className="toolbar overflow-hidden w-full">
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
          <div className="panel border-b-0" style={{ height: consoleHeight }}>
            <Console
              logType={logType}
              logs={logs}
              cells={cells}
              actionState={actionState}
              onUndo={undoAction}
              onSelectAction={onSelectAction}
            />
          </div> */}
          <div className='flex flex-row items-center h-6  pl-1 pr-2 w-auto m-1 text-sm bg-white border justify-start sm:w-auto rounded-full '>
            <Code height={14} width={14} className='text-gray-500' />
            <div className='flex-1 ml-1 text-gray-500'>
              {renderSelectedCodeBlock()}
            </div>
            <span className='cursor-pointer' onClick={onDeselect}>
              <X height={16} width={16} className='text-gray-500' />
            </span>
          </div>
          <div className="flex flex-col relative border border-primary rounded-md m-1 overflow-hidden">
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
            {/* <div className="flex flex-row justify-between items-center "> */}
            {/* <Recorder onOutput={onRecorderOutput} /> */}
            {/* <Terminal size={16} /> */}
            {/* <IconSvg
                name="plane"
                className='text-primary cursor-pointer'
                style={{
                  // color: '#127934',
                  height: 18,
                  width: 18
                }}
                onClick={onEnter}
              ></IconSvg> */}
            {/* </div> */}

            {input && (
              // <Icon
              //   className=" absolute top-1 w-5 h-5 right-1 opacity-50 text-gray-500 cursor-pointer"
              //   type="x-circle-fill"
              //   onClick={handleClear}
              //   aria-label="clear"
              // />
              <XCircle onClick={onClearInput} className=" absolute top-1 w-5 h-5 right-1 opacity-50 text-gray-500 cursor-pointer" />
            )}
          </div>
        </div>
      </div>

      {/* 右侧列 */}
      {/* {
        renderPerview && (
          <div className="flex flex-col flex-1">
            <div className="toolbar">
              <div className="title">
                {t('preview', 'Preview')}
              </div>
              <div className="action">
                <div
                  title="Update To Sheet"
                  className=" flex flex-row items-center text-sm cursor-pointer "
                >
                  <IconButton name="Save" className="mx-2" onClick={saveToSheet}>
                    {t('save_to_sheet', 'Save To Sheet')}
                  </IconButton>
                </div>
              </div>
            </div>
            <div className="markdown px-2 flex-1 overflow-auto">
              {renderPerview && renderPerview()}
            </div>
          </div>
        )
      } */}

    </div >
  );
}

export default App;
