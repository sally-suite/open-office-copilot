import React, { useMemo, useRef, useState } from 'react';
import sheetApi from '@api/sheet';
import docApi from '@api/doc';
import slideApi from '@api/slide';
import api from '@api/index';
// import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkMath from 'remark-math';
// import rehypeMathjax from 'rehype-mathjax'
import rehypeKatex from 'rehype-katex';

import remarkMermaid from 'remark-mermaidjs';

import remarkGfm from 'remark-gfm';
import { unified } from 'unified';
import { buildHtml, copyByClipboard, removeMentions } from 'chat-list/utils';
import useChatState from 'chat-list/hook/useChatState';
import { Check, Code, Copy, FileOutput, Bookmark, BookmarkCheck, Replace } from 'lucide-react';
import IconButton from '../icon-button';
import { cn } from 'chat-list/lib/utils';
import { useTranslation } from 'react-i18next';
import Button from '../button';

interface IBubbleMenuProps {
  element?: HTMLElement;
  content: string;
  className?: string;
  showCopy?: boolean;
  showCopyMark?: boolean;
  showInsert?: boolean;
  showBookmark?: boolean;
}

export default React.memo(function index(props: IBubbleMenuProps) {
  const { element, content, showCopy = true, showCopyMark = true, showBookmark = true, showInsert = true, className } = props;
  const [waiting, setWaiting] = useState(false);
  const { docType, platform, plugin } = useChatState();
  const [copyOk, setCopyOk] = React.useState(false);
  const [copyMarkOk, setCopyMarkOk] = React.useState(false);
  const [isMarked, setIsMarked] = useState(false);
  const container = useRef(null);
  const { t } = useTranslation();
  const onInsertCell = async () => {
    setWaiting(true);
    const result = removeMentions(content);
    if (docType === 'sheet') {
      await sheetApi.insertText(result);
    } else if (docType === 'slide') {
      await slideApi.insertText(result);
    } else {
      if (platform === 'only' || platform == 'office') {
        await docApi.insertText(result, {
          text: result,
          type: 'text',
          position: 'After'
        });
      } else if (platform == 'google' || platform == 'chrome') {
        const html = await buildHtml(result, true);
        await docApi.insertText(html, { type: 'html', text: result });
      } else {
        await docApi.insertText(result);
      }
    }
    setWaiting(false);
  };
  // const onReplace = async () => {
  //   setWaiting(true);
  //   const result = removeMentions(content)

  //   if (platform == 'office') {
  //     await docApi.insertText(result, {
  //       type: 'text',
  //       position: 'Replace'
  //     });
  //   } else if (platform == 'google' || platform == 'chrome') {
  //     const html = await buildHtml(result, true);
  //     await docApi.insertText(html, { type: 'html', text: result, position: 'Replace' });
  //   } else {
  //     await docApi.insertText(result, { type: 'text', position: 'Replace' });
  //   }

  //   setWaiting(false);
  // }
  const onAddBookmark = async () => {
    await api.addBookmark({
      type: docType,
      agent: plugin.action,
      data: content
    });
    setIsMarked(true);
  };
  // const buildHtml = async (text: string) => {
  //   const processor = unified()
  //     .use(remarkParse)
  //     .use(remarkGfm)
  //     .use(remarkMath)
  //     .use(remarkMermaid)
  //     .use(remarkRehype, {
  //       allowDangerousHtml: true,
  //     })
  //     .use(rehypeKatex)
  //     // .use(svgToImagePlugin)
  //     .use(rehypeStringify);

  //   const hastNode = await processor.process(text);
  //   const html = hastNode.value as string;
  //   return html;
  // }
  const handleClick = async () => {
    const result = removeMentions(content);
    let html = await buildHtml(result);
    console.log(container.current);
    if (container.current) {
      html = container.current.innerHTML;
    }
    await copyByClipboard(result, `<div class="markdown" style="background-color: #fff;">${html}</div>`);
    setCopyOk(true);
    setTimeout(() => {
      setCopyOk(false);
    }, 1000);
  };
  const onCopyMark = async () => {
    const result = removeMentions(content);
    await copyByClipboard(result, result);
    setCopyMarkOk(true);
    setTimeout(() => {
      setCopyMarkOk(false);
    }, 1000);
  };
  const insertTitle = useMemo(() => {
    let tip = '';
    if (docType === 'doc') {
      tip = t('common.insert_to_doc');
    } else if (docType == 'sheet') {
      tip = t('common.insert_to_sheet');
    }
    return tip;
  }, []);
  const copyTitle = useMemo(() => {
    return t('common.copy');
  }, []);

  return (
    <div
      className={cn(` flex flex-row `, className)}
    >
      {
        showCopy && (
          <IconButton
            title={copyTitle}
            onClick={handleClick}
            className='ml-0 w-auto sm:w-auto px-1 h-6'
            icon={(
              copyOk ? Check : Copy
            )}
          >
          </IconButton>
        )
      }
      {
        process.env.NODE_ENV === 'development' && (
          <IconButton
            title="Copy Markdown"
            onClick={onCopyMark}
            className='ml-1 w-auto sm:w-auto px-1 h-6'
            icon={(
              copyMarkOk ? Check : Code
            )}
          >
          </IconButton>
        )
      }
      {/* {
        showInsert && docType == 'doc' && (
          <IconButton
            title={t('common.replace')}
            onClick={onReplace}
            className='ml-1 w-auto sm:w-auto px-1 h-6'
            icon={Replace}
          >
          </IconButton>
        )
      } */}
      {
        showInsert && docType !== 'chat' && (
          <IconButton
            title={insertTitle}
            onClick={onInsertCell}
            className='ml-1 w-auto sm:w-auto px-1 h-6'
            icon={FileOutput}
          >
          </IconButton>
        )
      }
      {
        showBookmark && (
          <IconButton
            title={t('common.bookmark')}
            onClick={onAddBookmark}
            className={cn('ml-1 w-auto sm:w-auto px-1 h-6', isMarked ? 'text-primary' : '')}
            variant='secondary'
            icon={isMarked ? BookmarkCheck : Bookmark}
          >
            {/* {t('common.bookmark')} */}
          </IconButton>
        )
      }

    </div>
  );
});
