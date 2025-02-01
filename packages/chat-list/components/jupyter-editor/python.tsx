import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CodeEditor from '@uiw/react-codemirror';

// import { javascript } from '@codemirror/lang-javascript';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { basicLight } from '@uiw/codemirror-theme-basic'
import Console from './Console';
import IconButton from './IconButton';
import CopyButton from './CopyButton';
import LogTabs from './LogTabs';
import { Terminal, Upload, XCircle } from 'lucide-react';
import { IActionState, ILog, LogType } from 'chat-list/types/log';
import { blobToArrayBuffer, isCtrlPlus, uuid } from 'chat-list/utils';
import { cn } from 'chat-list/lib/utils';
import { Recorder } from 'chat-list/components/composer/Composer/Recorder';
import { useTranslation } from 'react-i18next';
import IconSvg from 'chat-list/components/icon';
import { python } from '@codemirror/lang-python';
import Folder from './Folder'
import FileSelector from 'chat-list/components/file-selector'
import { clearFolder, prepareFolder, writeFile } from 'chat-list/tools/sheet/python/util';
import sheetApi from '@api/sheet'
import useChatState from 'chat-list/hook/useChatState';
// import { editFunction } from '../service/edit';
// import return1 from '../data/return1.md';

interface ICodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onRun: (code: string) => Promise<any>;
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
  const [editorHeight, setEditorHeight] = useState('50%'); // 初始化编辑器高度
  const [consoleHeight, setConsoleHeight] = useState(100); // 初始化控制台高度
  const [editorCode, setEditorCode] = useState(code || ''); // 初始化代码
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<ILog[]>([]);
  const [logType, setLogType] = useState<LogType | 'all'>('all');
  const [actions, setActions] = useState<ILog[]>([]);
  const [undoActions, setUndoActions] = useState([]);
  const [actionState, setActionState] = useState<IActionState>(null);
  const [waitting, setWaitting] = useState(false);
  const [mode, setMode] = useState<'input' | 'output' | 'code'>('code');
  const [status, setStatus] = useState<'running' | 'stop'>('stop')
  const inputFolder = useRef(null);
  const outputFolder = useRef(null);
  const editorRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const [minHeight] = useState(200); // 最小高度限制
  const { platform } = useChatState();
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartY(e.pageY);
    setStartHeight(editorRef.current.offsetHeight);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newHeight = startHeight + e.pageY - startY;
    if (newHeight > minHeight) {
      editorRef.current.style.height = newHeight + 'px';
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 当鼠标离开编辑器区域时，也停止拖动
  const handleMouseLeave = () => {
    setIsDragging(false);
  };


  const onCodeChange = (value: string) => {
    setEditorCode(value);
  };
  const addLog = (newLog: ILog) => {
    setLogs((prevLogs) => [...prevLogs, newLog]);
  };
  const addAction = (newAction: ILog) => {
    setActions((prevActions) => [...prevActions, newAction]);
  };
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
    const action = actions[actions.length - 1];
    if (action) {
      const id = action.id;
      const newActions = actions.filter((action) => action.id !== id);
      setActions(newActions);
      setLogs((prevActions) => {
        return prevActions.filter((action) => action.id !== id);
      });
      addUndoActions(action);
      // TODO
      let resultCode = '';
      if (newActions.length > 0) {
        resultCode = actionState[newActions[newActions.length - 1].id].code;
      } else {
        // TODO
        resultCode = code;
      }
      setEditorCode(resultCode);
      if (onUndo) {
        await onUndo(action)
      } else {
        await executeCode(resultCode);
      }
    }
  };
  const redoAction = async () => {
    if (undoActions.length <= 0) {
      return;
    }
    const action = undoActions[undoActions.length - 1];
    if (action) {
      addAction(action);
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
    setActions([]);
    setUndoActions([]);
    setActionState({});
  };
  const onSelectAction = (log: ILog) => {
    const resultCode = actionState[log.id].code;
    setEditorCode(resultCode);
    executeCode(resultCode);
  };
  const onEnter = async () => {
    if (waitting) {
      return;
    }
    setWaitting(true);
    // executeCode();
    if (!input.trim()) return;
    const log: ILog = {
      id: uuid(),
      type: LogType.action,
      content: input,
      time: new Date(),
      status: 'running',
    };
    setActionState({
      ...actionState,
      [log.id]: log,
    });
    addLog(log);
    addAction(log);
    setInput('');
    const result = await codeCompletion(editorCode, input);
    if (!result) {
      appendLog('Return code is empty, please try again.', LogType.error);
      return;
    }
    try {
      setEditorCode(result);
      await executeCode(result);
      // const result = code;
      // await sleep(1000);
      setActionState({
        ...actionState,
        [log.id]: {
          ...log,
          status: 'success',
          code: result,
        },
      });
    } catch (err) {
      setActionState({
        ...actionState,
        [log.id]: {
          ...log,
          status: 'error',
          code: result,
        },
      });
    } finally {
      setWaitting(false);
    }
  };

  const onKeyDown = async (e: KeyboardEvent) => {
    // if (e.key === 'Enter') {
    //   event.preventDefault();
    //   await onEnter();
    // }
    if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      // 在这里执行你的自定义操作，比如缩进文本等
    }

    if (isCtrlPlus(e, 'z')) {
      event.preventDefault();
      await undoAction();
    }

    if (isCtrlPlus(e, 'y')) {
      event.preventDefault();
      await redoAction();
    }
  };
  // 执行代码的函数
  const executeCode = async (editorCode: string) => {
    try {
      setStatus('running')
      const result = await onRun?.(editorCode);
      if (result) {
        appendLog(`Script run result:\n${typeof result == 'object' ? JSON.stringify(result) : result}.`, LogType.info);
      } else {
        appendLog(`Script run finished.`, LogType.info);
      }
      setStatus('stop')
    } catch (error) {
      appendLog(error.message, LogType.error);
    } finally {
      setStatus('stop')
    }
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
    if (outputFolder.current) {
      outputFolder.current.refresh();
    }
  }

  const insertToCell = async () => {
    await sheetApi.setFormula(`SL.PY("${editorCode}")`)
  }

  useEffect(() => {
    // console.log(editorCode);
    if (autoRun && editorCode) {
      executeCode(editorCode);
    }

  }, []);

  // useEffect(() => {
  //   onChange?.(editorCode);
  // }, [editorCode]);

  useEffect(() => {
    const log = console.log;
    const error = console.error;
    console.log = (...args) => {
      const texts = args.map((arg) => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg, null, 2);
        } else {
          return arg;
        }
      }).filter(p => !!p)
      appendLog(texts.join(' '), LogType.info);
      // log(...args);
      if (args) {
        console.info(...args)
      }

    };
    console.error = (...args) => {
      const texts = args.map((arg) => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg, null, 2);
        } else {
          return arg;
        }
      })
      appendLog(texts.join(' '), LogType.error);
      // error(...args);
      if (args) {
        console.info(...args)
      }
    };
    return () => {
      console.log = log;
      console.error = error;
    };
  }, []);
  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseLeave);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isDragging]);


  return (
    <div className={cn([
      "flex flex-row items-stretch h-screen border border-gray-300",
      className,
      status === 'running' ? "pointer-events-none" : ""
    ])}>
      <div className="flex flex-col  flex-1 overflow-auto border-r border-gray-300 ">
        <div className="flex flex-col  overflow-auto relative" ref={editorRef} style={{
          height: 400
        }}>
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
                mode === 'input' ? " border-b-gray-700" : " border-b-white"
              ])} onClick={setMode.bind(null, 'input')}>
                {t('input', 'Input')}
              </button>
              <button className={cn([
                'px-1  mr-2 cursor-pointer border-b-2',
                mode === 'output' ? " border-b-gray-700" : " border-b-white"
              ])} onClick={setMode.bind(null, 'output')}>
                {t('output', 'Output')}
              </button>
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
                      onClick={async () => {
                        await executeCode(editorCode);
                      }}
                    >
                      <span className=' hidden sm:inline-block'>
                        {t('run', 'Run')}
                      </span>
                    </IconButton>
                    <CopyButton type='text' content={editorCode} >
                      <span className=' hidden sm:inline-block'>
                        {t('copy', 'Copy')}
                      </span>
                    </CopyButton>
                    {
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
                    }
                  </>
                )
              }

            </div>
          </div>
          {
            mode === 'input' && (
              <div className="panel flex-1 overflow-auto">
                <Folder ref={inputFolder} folder='/input' />
              </div>
            )
          }
          {
            mode === 'output' && (
              <div className="panel flex-1 overflow-auto">
                <Folder ref={outputFolder} folder='/output' />
              </div>
            )
          }
          {
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
          }
          <div className="h-1 w-full absolute left-0 bottom-0 bg-gray-100 cursor-row-resize " onMouseDown={handleMouseDown}></div>
        </div>
        <div className="flex flex-col flex-1 overflow-auto" >
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
          <div className="panel border-b-0" style={{ height: consoleHeight }}>
            <Console
              logType={logType}
              logs={logs}
              actions={actions}
              actionState={actionState}
              onUndo={undoAction}
              onSelectAction={onSelectAction}
            />
          </div>
          <div className="flex flex-col relative border border-primary rounded-md m-1 overflow-hidden">
            <textarea
              disabled={status === 'running'}
              value={input}
              placeholder={
                status === 'running' ? t('running', "Script running, please wait...") : t('input_placeholder', "Input your update requirments and press enter.")
              }
              className=" flex-1 p-1  focus:outline-none resize-none text-sm rounded-md"
              onChange={onInputChange}
              rows={2}
            />
            <div className="flex flex-row justify-between items-center ">
              <Recorder onOutput={onRecorderOutput} />
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

    </div>
  );
}

export default App;
