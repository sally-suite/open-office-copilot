import React, { useEffect, useState } from 'react';
import CodeEditor from '@uiw/react-codemirror';

// import { javascript } from '@codemirror/lang-javascript';
import { githubLight } from '@uiw/codemirror-theme-github';

import Console from './Console';
import IconButton from './IconButton';
import CopyButton from './CopyButton';
import LogTabs from './LogTabs';

import { XCircle } from 'lucide-react';
import { IActionState, ILog, LogType } from 'chat-list/types/log';
import { isCtrlPlus, uuid } from 'chat-list/utils';
import { cn } from 'chat-list/lib/utils';
import { Recorder } from 'chat-list/components/composer/Composer/Recorder';
import { useTranslation } from 'react-i18next';
import IconSvg from 'chat-list/components/icon';

// import { editFunction } from '../service/edit';
// import return1 from '../data/return1.md';

interface ICodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onRun: (code: string) => Promise<any>;
  renderPerview?: (code: string) => React.ReactNode;
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
  const [consoleHeight, setConsoleHeight] = useState('50%'); // 初始化控制台高度
  const [editorCode, setEditorCode] = useState(code || ''); // 初始化代码
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<ILog[]>([]);
  const [logType, setLogType] = useState<LogType | 'all'>('all');
  const [actions, setActions] = useState<ILog[]>([]);
  const [undoActions, setUndoActions] = useState([]);
  const [actionState, setActionState] = useState<IActionState>(null);
  const [waitting, setWaitting] = useState(false);
  const [mode, setMode] = useState<'preview' | 'code'>('preview');
  const onCodeChange = (value: string) => {
    setEditorCode(value);
    if (onChange) {
      onChange(value);
    }
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
        await onUndo(action);
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
      const result = await onRun?.(editorCode);
      // const fun = buildFunc(editorCode); // 在浏览器中执行JavaScript代码
      // const copy = JSON.parse(JSON.stringify(jsonData));
      // const result = fun(copy);
      if (result) {
        appendLog(`Script run result:${JSON.stringify(result)}.`, LogType.info);
      } else {
        appendLog(`Script run finished.`, LogType.info);
      }
    } catch (error) {
      appendLog(error.message, LogType.error);
      // setExecutionResult([]);
      // throw error;
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
  };

  const onClearInput = () => {
    setInput('');
  };

  const toggleMode = () => {
    setMode(mode === 'code' ? 'preview' : 'code');
  };

  // useEffect(() => {
  //   // console.log(editorCode);
  //   if (autoRun && editorCode) {
  //     executeCode(editorCode);
  //   }

  // }, []);

  // useEffect(() => {
  //   onChange?.(editorCode);
  // }, [editorCode]);

  useEffect(() => {
    // const log = console.log;
    // const error = console.error;
    // console.log = (...args) => {
    //   appendLog(args.join(' '), LogType.info);
    //   // log(...args);
    // };
    // console.error = (...args) => {
    //   appendLog(args.join(' '), LogType.error);
    //   // error(...args);
    // };
    // return () => {
    //   console.log = log;
    //   console.error = error;
    // };
  }, []);
  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  return (
    <div className={cn(["flex flex-row items-stretch h-screen border border-gray-300", className])}>
      <div className="flex flex-col  flex-1 overflow-auto border-r border-gray-300 ">
        <div className="flex flex-col flex-[2] overflow-auto">
          <div className="toolbar">
            <div className="title">
              <span className={cn(['mr-2 cursor-pointer', mode === 'code' ? " font-bold" : ""])} onClick={toggleMode}>
                {t('code', 'Code')}
              </span>
              <span className={cn(['mr-2 cursor-pointer', mode === 'preview' ? " font-bold" : ""])} onClick={toggleMode}>
                {t('preview', 'Preview')}
              </span>
            </div>
            <div className="action">
              {/* <IconButton
                name="Play"
                className="mx-2"
                onClick={async () => {
                  await executeCode(editorCode);
                }}
              >
                {t('run', 'Run')}
              </IconButton> */}{
                mode == 'code' && (
                  <CopyButton text={t('copy', 'Copy')} className="mx-2" content={editorCode} />
                )
              }
            </div>
          </div>
          {
            mode === 'preview' && (
              <div className="markdown px-2 flex-1 overflow-auto">
                {renderPerview && renderPerview(editorCode)}
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
                  // lang="javascript"
                  value={editorCode}
                  extensions={[]}
                  theme={githubLight}
                  onChange={onCodeChange}
                />
              </div>
            )
          }


        </div>
        <div className="flex flex-col flex-1 overflow-auto">
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
              value={input}
              placeholder={t('input_placeholder', "Input your update requirments and press enter.")}
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
    </div>
  );
}

export default App;
