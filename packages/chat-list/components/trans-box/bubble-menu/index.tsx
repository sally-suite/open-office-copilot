import React, { useMemo, useRef, useState } from 'react';
import sheetApi from '@api/sheet';
import docApi from '@api/doc';
import slideApi from '@api/slide';

// import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkMath from 'remark-math'
import rehypeMathjax from 'rehype-mathjax'
import remarkMermaid from 'remark-mermaidjs'

import remarkGfm from 'remark-gfm';
import { unified } from 'unified';
import { copyByClipboard, removeMentions } from 'chat-list/utils';
import useChatState from 'chat-list/hook/useChatState';
import { Check, Code, Copy, FileOutput } from 'lucide-react';
import IconButton from '../button';
import cn from 'classnames'
import { useTranslation } from 'react-i18next';
interface IBubbleMenuProps {
  element?: HTMLElement;
  content: string;
  className?: string;
  showCopy?: boolean;
  showCopyMark?: boolean;
  showInsert?: boolean;
}

export default React.memo(function index(props: IBubbleMenuProps) {
  const { element, content, showCopy = true, showCopyMark = true, showInsert = true, className } = props;
  const [waiting, setWaiting] = useState(false);
  const { docType, platform } = useChatState();
  const [copyOk, setCopyOk] = React.useState(false);
  const [copyMarkOk, setCopyMarkOk] = React.useState(false);
  const container = useRef(null)
  const { t } = useTranslation();
  const onInsertCell = async () => {
    setWaiting(true);
    console.log(content)
    const result = removeMentions(content)
    let html = await buildHtml(result);
    if (element) {
      html = element.innerHTML;
    }

    if (docType === 'sheet') {
      await sheetApi.insertText(result);
    } else if (docType === 'slide') {
      await slideApi.insertText(result);
    } else {
      if (platform === 'only' || platform == 'office') {
        await docApi.insertText(html);
      } else {
        await docApi.insertText(result);
      }
    }
    setWaiting(false);
  };

  const buildHtml = async (text: string) => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkMermaid)
      .use(remarkRehype, {
        allowDangerousHtml: true,
      })
      .use(rehypeMathjax)
      // .use(svgToImagePlugin)
      .use(rehypeStringify);

    const hastNode = await processor.process(text);
    const html = hastNode.value as string;
    return html;
  }
  const handleClick = async () => {
    const result = content;
    let html = await buildHtml(result);
    console.log(container.current)
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
    const result = content;
    await copyByClipboard(result, result);
    setCopyMarkOk(true);
    setTimeout(() => {
      setCopyMarkOk(false);
    }, 1000);
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end'
      }}
      className={cn(className)}
    >
      {
        showCopy && (
          <IconButton
            title="Copy Text"
            onClick={handleClick}
            icon={(
              copyOk ? Check : Copy
            )}
          />
        )
      }
      <IconButton
        title="Copy Markdown"
        onClick={onCopyMark}
        icon={(
          copyMarkOk ? Check : Code
        )}
      />
    </div>
  );
});
