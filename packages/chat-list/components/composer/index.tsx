import React, {
  useRef,
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import { Composer, ComposerHandle, ComposerProps } from './Composer';
import { ChatContext } from 'chat-list/store/chatContext';
import { IconButtonProps } from 'chat-list/components/icon-button';
// import { speechToText } from 'chat-list/service/message';
import { File, MessageSquarePlus, Plus, Settings, Volume2, VolumeX } from 'lucide-react';
import { ToolbarItemProps } from "./Composer/Toolbar";
import QuickReply from 'chat-list/components/quick-reply';
// import Icon from '../icon';
import { QuickReplyItem } from 'chat-list/types/message';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// import prompt from 'chat-list/data/prompts'
// import i18n from 'chat-list/locales/i18n';
// import GoogleDrive from 'chat-list/components/drive-google';
// import Commands from 'chat-list/components/commands';
// import PluginSetting from 'chat-list/components/plugin-setting'
// eslint-disable-next-line @typescript-eslint/ban-types
type ChatComposerExtProps = {
  context?: React.ReactNode;
  canRecord: boolean;
  hideMute?: boolean;
  hideNewChat?: boolean;
};

type IChatComposerProps = ComposerProps &
  React.RefAttributes<ComposerHandle> &
  ChatComposerExtProps;

export default React.memo(function ChatComposer(props: IChatComposerProps) {
  const {
    text,
    onSend,
    onChange,
    placeholder,
    canRecord,
    hideMute = false,
    hideNewChat = false,
    ...rest
  } = props;
  // const [isAccessoryOpen, setIsAccessoryOpen] = useState(false);
  const { plugin, setText, plugins, docType, mute,
    setMute, resetList, appendMsg, setTyping, replies, quickReply,
    colAgents, newChat, fileList, setFileList, platform, prompts
  } = useContext(ChatContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mentions, setMentions] = useState([]);
  const [toolbars, setToolbars] = useState([]);
  const inputPanelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef(null);
  // const placeholder = plugin
  //   ? `${plugin.placeholder || plugin.description}`
  //   : oldPlaceholder;

  const onInputChange = (value: string, e: any) => {

    if (onChange) {
      onChange(value, e);
    }
    // setInput(value);
  };

  const onSendMessage = async (type: string, content: string) => {
    setText('');
    if (type === 'text') {
      await onSend(type, content);
      return;
    }
    await onSend(type, content);

    setTimeout(() => {
      const input: HTMLInputElement = document.querySelector('.composer-input');
      if (input) {
        input.focus();
      }
    }, 1000);
  };
  const onToolbarClick = (item: ToolbarItemProps) => {
    if (item.type == '$add$') {
      navigate('/create-agent');
      return;
    }
    onSend('text', item.type);
  };
  const onAccessoryToggle = () => {
    // setIsAccessoryOpen(isAccessoryOpen);
  };


  const onRecorderOutput = useCallback((input: string) => {
    setText(text + input);
  }, [text]);

  // const onImageSend = (file: any) => {
  //   console.log(file);
  // }


  const onQuickReply = (item: QuickReplyItem, index: number) => {
    quickReply(item, index);
  };

  const onFilesChange = (files: File[]) => {
    setFileList(files);
  };

  const onFileSelect = useCallback(async (files: File[]) => {

    const oldFiles = fileList.filter((file: File) => !files.some((item: File) => item.name === file.name && item.size === file.size));
    const newFiles = oldFiles.concat(files);
    setFileList(newFiles);
  }, [fileList]);


  const leftActions: IconButtonProps[] = useMemo(() => {
    let leftActions: IconButtonProps[] = [];
    if (plugin && plugin.action !== plugins[0].action) {
      leftActions = leftActions.concat([
        {
          icon: plugins[0].icon,
          title: 'Back to ' + plugins[0].name,
          onClick: () => {
            onSend('text', '/');
            resetList([]);
          },
        }
      ]);
    }

    // if (platform == 'other') {
    //   leftActions = leftActions.concat([
    //     {
    //       title: 'Attach Google Drive file',
    //       children: (
    //         <GoogleDrive onSelect={onFileSelect} />
    //       )
    //     }
    //   ]);
    // }


    return leftActions;
  }, [plugin]);


  const rightActions: IconButtonProps[] = useMemo(() => {
    const actions: IconButtonProps[] = [];
    // if (!hideMute) {
    //   actions.push({
    //     icon: mute ? VolumeX : Volume2,
    //     title: mute ? t('base:common.mute') : t('base:common.mute'),
    //     onClick: () => {
    //       setTyping(false);
    //       plugin.stop();
    //       appendMsg({
    //         role: 'user',
    //         content: mute ? t('base:common.unmute.message') : t('base:common.mute.message'),
    //         type: 'text',
    //         position: 'right',
    //         _id: Date.now() + ''
    //       })
    //       setMute(!mute)
    //     },
    //   })
    // }

    if (!hideNewChat) {
      actions.push({
        icon: MessageSquarePlus as any,
        title: t('base:common.new_chat'),
        onClick: () => {
          newChat();
        },
      });
    }
    return actions;
  }, [mute, plugin]);

  useEffect(() => {
    if (colAgents) {
      const list = plugins
        .filter(p => colAgents.some(a => a.id == p.action && a.enable))
        .map(p => ({ name: p.action, avatar: p.icon, description: p.shortDescription }));

      const extendAgens = plugins.filter(p => p.isCustom)
        .map(p => ({ name: p.action, avatar: p.icon, description: p.description }));

      setMentions(list.concat(extendAgens));
    }

  }, [plugins, colAgents]);
  // useEffect(() => {
  //   if (docType === 'chat' || docType == 'side') {
  //     return;
  //   }
  //   const plgs = plugins
  //     .filter(p => p.action == plugins[0].action || p.isCustom)
  //     .map((item) => {
  //       return {
  //         type: `@${item.action}`,
  //         title: item.action,
  //         icon: item.icon,
  //       };
  //     });
  //   setToolbars(plgs.concat([{ type: '$add$', title: 'Create', icon: Plus }]))
  // }, [plugins])

  return (
    <div className=' pt-1'>
      {/* <Commands
        input={text}
        className=" absolute left-0 right-0"
      onSelect={onCommandSelect}
      /> */}
      {/* <PluginSetting onChange={() => void 0} /> */}
      <div className='px-1 relative'>
        <QuickReply items={replies} quickReply={onQuickReply} />
      </div>
      < div ref={inputPanelRef} className='p-1 pt-0'>
        <Composer
          ref={inputRef}
          {...rest}
          fileConfig={plugin.fileConfig}
          text={text}
          placeholder={placeholder}
          rightActions={rightActions}
          leftActions={leftActions}
          recorder={{
            canRecord: canRecord,
            // onEnd: onRecorderEnd,
            onOutput: onRecorderOutput,
          }}

          onSend={onSendMessage}
          onChange={onInputChange}
          toolbar={toolbars}
          onToolbarClick={onToolbarClick}
          onAccessoryToggle={onAccessoryToggle}
          mentions={[]}
          prompts={prompts}
          // prompts={[]}
          files={fileList}
          onFilesChange={onFilesChange}
        // onImageSend={onImageSend}
        />
        {/* <div className='flex flex-row p-1 text-sm justify-between'>
          <span className='text-sm'>
            Upgrade
          </span>
          <span>
            <Twitter height={14} width={14} />
          </span>
        </div> */}
      </div >
    </div>
  );
});
