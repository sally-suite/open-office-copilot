/* eslint-disable react/display-name */
import React, {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  useCallback,
} from "react";
// import clsx from 'clsx';
import { IconButtonProps } from "chat-list/components/icon-button";
import { Recorder, RecorderProps } from "./Recorder";
import { Toolbar, ToolbarItemProps } from "./Toolbar";
import { InputProps } from "chat-list/components/ui/input";
import { ComposerInput } from "./ComposerInput";
import { SendButton } from "./SendButton";
import { Action } from "./Action";
export const CLASS_NAME_FOCUSING = "S--focusing";
import Mentions, { completeTextWithMetion, completeTextWithSelectedMetion, IMention } from './Mentions';
import Prompts, { IPrompts, completeTextWithPrompt, completeTextWithSelectedPrompt } from './Prompts';
import { XCircle, File, Image, AtSign, Bot, Wand2, Paperclip } from "lucide-react";
import FileSelector from './FileSelector';
import ActionSheet from 'chat-list/components/action-sheet';
import { toggleClass } from "chat-list/utils";
import { useTranslation } from "react-i18next";
import { FileList } from './FileList'; // Add this import
export type InputType = "voice" | "text";

export type ComposerProps = {
  wideBreakpoint?: string;
  text?: string;
  textOnce?: string;
  inputOptions?: InputProps & { rows: number, autoSize: boolean };
  placeholder?: string;
  inputType?: InputType;
  onInputTypeChange?: (inputType: InputType) => void;
  recorder?: RecorderProps;
  onSend: (type: string, content: string | (File[]) | { text: string, fileList: File[] }) => void;
  onImageSend?: (file: File) => Promise<any>;
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  onChange?: (value: string, event: React.ChangeEvent<Element>) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  toolbar?: ToolbarItemProps[];
  onToolbarClick?: (item: ToolbarItemProps, event?: React.MouseEvent) => void;
  onAccessoryToggle?: (isAccessoryOpen: boolean) => void;
  leftActions?: IconButtonProps[];
  rightActions?: IconButtonProps[];
  mentions?: IMention[]
  prompts?: IPrompts[]
  fileConfig?: any;
  files?: File[];
  onFilesChange?: (files: File[]) => void;
  context?: React.ReactNode;
};

export interface ComposerHandle {
  // setText: (text: string) => void;
  focus: () => void;
}

export const Composer = React.forwardRef<ComposerHandle, ComposerProps>(
  (props, ref) => {
    const {
      text,
      textOnce: oTextOnce,
      inputType: initialInputType = "text",
      wideBreakpoint,
      placeholder: oPlaceholder = "Please input...",
      recorder = {},
      onFocus,
      onBlur,
      onChange,
      onSend,
      onImageSend,
      onAccessoryToggle,
      toolbar = [],
      onToolbarClick,
      rightActions,
      leftActions,
      inputOptions,
      mentions,
      prompts,
      fileConfig,
      files = [],
      onFilesChange,
      context
    } = props;
    const { t } = useTranslation();
    // const [text, setText] = useState(initialText);
    const [textOnce, setTextOnce] = useState("");
    const [placeholder, setPlaceholder] = useState(oPlaceholder);
    const [isAccessoryOpen, setAccessoryOpen] = useState(false);
    const [accessoryContent, setAccessoryContent] = useState("");
    const inputRef = useRef<HTMLTextAreaElement>(null!);
    const focused = useRef(false);
    const blurTimer = useRef<any>();
    const popoverTarget = useRef<any>();
    const isMountRef = useRef(false);
    const [isWide, setWide] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [fileList, setFileList] = useState<File[]>(files);

    const handleInputFocus = useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        clearTimeout(blurTimer.current);
        toggleClass(CLASS_NAME_FOCUSING, true);
        focused.current = true;

        if (onFocus) {
          onFocus(e);
        }
      },
      [onFocus]
    );

    const handleInputBlur = useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        blurTimer.current = setTimeout(() => {
          toggleClass(CLASS_NAME_FOCUSING, false);
          focused.current = false;
        }, 0);

        if (onBlur) {
          onBlur(e);
        }
      },
      [onBlur]
    );

    const send = useCallback(async () => {
      if (fileList.length > 0 && text.length > 0) {
        await onSend('parts', { text, fileList });
        setFileList([]);
        onFilesChange([]);
        return;
      }
      if (fileList.length > 0) {
        await onSend('file', fileList);
        setFileList([]);
        onFilesChange([]);
      }
      if (text) {
        await onSend("text", text);
        // setText('');
      } else if (textOnce) {
        await onSend("text", textOnce);
      }
      if (textOnce) {
        setTextOnce("");
        setPlaceholder(oPlaceholder);
      }
      if (focused.current) {
        inputRef.current.focus();
      }
    }, [oPlaceholder, onSend, text, textOnce, fileList]);

    const handleInputKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {

        if (!e.shiftKey && e.key == "Tab") {
          const output = completeTextWithMetion(mentions, text, cursorPosition);
          if (output) {
            e.preventDefault();
            onChange(output, e as any);
            return;
          }
          e.preventDefault();
        }
        if (!e.shiftKey && e.key === "Enter") {
          if (text.startsWith('/')) {
            const output = completeTextWithPrompt(prompts, text);
            if (output) {
              e.preventDefault();
              onChange(output, e as any);
              return;
            }
          } else {
            const output = completeTextWithMetion(mentions, text, cursorPosition);
            if (output) {
              e.preventDefault();
              onChange(output, e as any);
              return;
            }
          }
          send();
          e.preventDefault();
        }
      },
      [send]
    );

    const handleTextChange = useCallback(
      (value: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e) {
          const newCursorPosition = e.target.selectionStart;
          setCursorPosition(newCursorPosition);
        }
        if (onChange) {
          onChange(value, e);
        }
      },
      [onChange]
    );

    const handleSendBtnClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        send();
        e.preventDefault();
      },
      [send]
    );
    const inputAt = () => {
      // onSend("text", '@');
      onChange('@', null);
      setCursorPosition(1);
      if (inputRef.current)
        inputRef.current.focus();
    };
    const inputSlash = () => {
      // onSend("text", '@');
      onChange('/', null);
      setCursorPosition(1);
      if (inputRef.current)
        inputRef.current.focus();
    };
    const handleAccessoryToggle = useCallback(() => {
      setAccessoryOpen(!isAccessoryOpen);
    }, [isAccessoryOpen]);

    const handleAccessoryBlur = useCallback(() => {
      setTimeout(() => {
        setAccessoryOpen(false);
        setAccessoryContent("");
      });
    }, []);

    const handleToolbarClick = useCallback(
      (item: ToolbarItemProps, e: React.MouseEvent) => {
        if (onToolbarClick) {
          onToolbarClick(item, e);
        }
        setAccessoryOpen(false);
        if (item.render) {
          popoverTarget.current = e.currentTarget;
          setAccessoryContent(item.render);
        }
      },
      [onToolbarClick]
    );
    const handleClear = () => {
      onChange("", null);
    };
    const onMenionSelect = (item: any) => {
      const output = completeTextWithSelectedMetion(item, text, cursorPosition);
      if (output) {
        onChange(output, null);
        inputRef.current.focus();
        return;
      }
    };

    const onPromptSelect = (item: any) => {
      const output = completeTextWithSelectedPrompt(item, text);
      if (output) {
        onChange(output, null);
        inputRef.current.focus();
        return;
      }
    };

    const onFileSelect = useCallback(async (files: File[]) => {

      const oldFiles = fileList.filter((file: File) => !files.some((item: File) => item.name === file.name && item.size === file.size));
      const newFiles = oldFiles.concat(files);
      setFileList(newFiles);
      onFilesChange(newFiles);
    }, [fileList]);

    const onFileRemove = (index: number) => {
      const newFiles = fileList.filter((item, i) => i !== index);
      setFileList(newFiles);
      onFilesChange(newFiles);
    };

    useEffect(() => {
      const mq =
        wideBreakpoint && window.matchMedia
          ? window.matchMedia(`(min-width: ${wideBreakpoint})`)
          : false;

      function handleMq(e: MediaQueryListEvent) {
        setWide(e.matches);
      }

      setWide(mq && mq.matches);

      if (mq) {
        mq.addListener(handleMq);
      }
      return () => {
        if (mq) {
          mq.removeListener(handleMq);
        }
      };
    }, [wideBreakpoint]);

    // useEffect(() => {
    //   toggleClass("S--wide", isWide);
    //   if (!isWide) {
    //     setAccessoryContent("");
    //   }
    // }, [isWide]);

    useEffect(() => {
      if (isMountRef.current && onAccessoryToggle) {
        onAccessoryToggle(isAccessoryOpen);
      }
    }, [isAccessoryOpen, onAccessoryToggle]);

    useEffect(() => {
      if (oTextOnce) {
        setTextOnce(oTextOnce);
        setPlaceholder(oTextOnce);
      } else {
        setTextOnce("");
        setPlaceholder(oPlaceholder);
      }
    }, [oPlaceholder, oTextOnce]);

    useEffect(() => {
      isMountRef.current = true;
    }, []);

    useEffect(() => {
      setFileList(files);
    }, [files]);

    useImperativeHandle(ref, () => ({
      setPlaceholder,
      // setText,
      getText() {
        return inputRef.current.value;
      },
      focus: () => {
        inputRef.current.focus();
      },
    }));

    const renderImageSelector = (fileConfig: any) => {
      if (!fileConfig) {
        return null;
      }
      const { accept, ...rest } = fileConfig;
      if (accept?.image) {
        const config = {
          accept: {
            image: true,
          },
          ...rest
        };
        return (
          <Action
            // className=" ml-1"
            title={t('base:common.uppload_image')}
          >
            <FileSelector icon={Image} config={config} onSelect={onFileSelect} />
          </Action>
        );
      }
      return null;
    };
    const renderFileSelector = (fileConfig: any) => {
      if (!fileConfig) {
        return null;
      }
      const { accept, ...rest } = fileConfig;
      const actions = [];
      // if (accept?.text) {
      //   const config = {
      //     accept: {
      //       text: accept?.text,
      //       image: accept?.image,
      //       xlsx: accept?.xlsx
      //     },
      //     ...rest
      //   };
      //   actions.push(
      //     <Action
      //     // className=" ml-1"
      //     // title={t('base:common.uppload_file_tip')}
      //     >
      //       <FileSelector icon={Upload} config={config} onSelect={onFileSelect} />
      //     </Action>
      //   )
      // }

      // if (accept?.xlsx) {
      //   const config = {
      //     accept: {
      //       xlsx: accept?.xlsx
      //     },
      //     ...rest
      //   };
      //   actions.push(
      //     <Action
      //       // className=" ml-1"
      //       title={t('base:common.uppload_excel_tip')}
      //     >
      //       <FileSelector icon={FileSpreadsheet} config={config} onSelect={onFileSelect} />
      //     </Action>
      //   )
      // }

      const config = {
        accept: {
          text: accept?.text,
          image: accept?.image,
          xlsx: accept?.xlsx
        },
        ...rest
      };
      actions.push(
        <Action
          // className=" ml-1"
          title={t('base:common.uppload_file_tip')}
        >
          <FileSelector icon={Paperclip} config={config} onSelect={onFileSelect} />
        </Action>
      );
      return actions;
    };
    const renderFileIcon = (file: File) => {
      if (file.type.startsWith('image')) {
        return <Image height={14} width={14} />;
      }
      return <File height={14} width={14} />;
    };

    const hasToolbar = toolbar.length > 0;

    const inputProps = {
      ...inputOptions,
      value: text,
      inputRef,
      placeholder,
      onFocus: handleInputFocus,
      onBlur: handleInputBlur,
      onKeyDown: handleInputKeyDown,
      onChange: handleTextChange,
      onImageSend,
    };

    return (
      <>
        <div className="p-0 pb-0 flex flex-col bg-white border border-primary rounded-md">
          {
            !!context && (
              <div className="text-sm p-0">
                {context}
              </div>
            )
          }
          <div className="w-full relative">
            <Prompts
              prompts={prompts}
              input={text}
              onSelect={onPromptSelect}
            />
            <Mentions
              mentions={mentions}
              input={text}
              cursorPosition={cursorPosition}
              onSelect={onMenionSelect}
            />
            <ComposerInput invisible={false} {...inputProps} />
            {text && (
              // <Icon
              //   className=" absolute top-1 w-5 h-5 right-1 opacity-50 text-gray-500 cursor-pointer"
              //   type="x-circle-fill"
              //   onClick={handleClear}
              //   aria-label="clear"
              // />
              <XCircle onClick={handleClear} className=" absolute top-1 w-5 h-5 right-1 opacity-50 text-gray-500 cursor-pointer" />
            )}
          </div>

          <FileList
            fileList={fileList}
            onFileRemove={onFileRemove}
          />

          <div className="flex flex-row w-full h-7 justify-between bg-white rounded-md overflow-hidden">
            <div className="flex flex-row">
              {recorder.canRecord && <Recorder {...recorder} />}
              {
                prompts.length > 0 && (
                  <Action
                    // className=" ml-1"
                    icon={Wand2}
                    title="Prompts"
                    onClick={inputSlash}
                  />
                )
              }

              {
                mentions.length > 0 && (
                  <Action
                    // className=" ml-1"
                    icon={AtSign}
                    title="@ Agent"
                    onClick={inputAt}
                  />
                )
              }
              {hasToolbar && (
                <Action
                  // className=" ml-1"
                  icon={Bot}
                  title={t('base:common.show_agents')}
                  onClick={handleAccessoryToggle}
                  aria-label={
                    isAccessoryOpen ? "close toolbar" : "expand toolbar"
                  }
                />
              )}
              {/* {
                renderImageSelector(fileConfig)
              } */}
              {
                renderFileSelector(fileConfig)
              }
              {leftActions.map((action, index: number) => (
                <Action key={index} className="" {...action} />
              ))}
            </div>
            <div className="flex flex-row">
              {rightActions.map((action, index: number) => (
                <Action key={index} className=" mr-1" {...action} />
              ))}
              <SendButton
                onClick={handleSendBtnClick}
                disabled={!(text || textOnce)}
              />
            </div>
          </div>
        </div>
        {/* {isAccessoryOpen && (
          <AccessoryWrap onClickOutside={handleAccessoryBlur}>
            {accessoryContent || (
              <Toolbar items={toolbar} onClick={handleToolbarClick} />
            )}
          </AccessoryWrap>
        )} */}
        <ActionSheet open={isAccessoryOpen} title="" onClose={handleAccessoryBlur}>
          <Toolbar items={toolbar} onClick={handleToolbarClick} />
        </ActionSheet>
      </>
    );
  }
);
