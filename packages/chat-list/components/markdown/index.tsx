/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math'
// import rehypeKatex from 'rehype-katex'
import rehypeMathjax from './rehype-mathjax/svg'
import remarkMermaid from './remark-mermaidjs/browser'
import BubbleMenu from '../bubble-menu';
import Table from './table';
import image from 'chat-list/utils/image';
import Image from './image'
import { NormalComponents } from 'react-markdown/lib/complex-types';
import { SpecialComponents } from 'react-markdown/lib/ast-to-react';
import Code from './code'
import { isImageLink } from 'chat-list/utils';
import CodeInline from './code-inline';
import ErrorBoundary from 'chat-list/components/error-boundary'
import Svg from './svg'
import rehypeKatex from 'rehype-katex'
import Katex from './katex'
import MathMark from './math'
import Link from './link'
// import remarkPlantUml from '@akebifiky/remark-simple-plantuml'
import './index.less';
import useChatState from 'chat-list/hook/useChatState';

interface IMarkdownProps {
  docType?: string;
  supportMath?: boolean;
  copyContentBtn?: boolean;
  children: string;
  className?: string;
  components?: Partial<Omit<NormalComponents, keyof SpecialComponents> & SpecialComponents>;
  showTableMenu?: boolean;
  showBookmark?: boolean;
}


export function replaceImageLinks(markdownText: string,) {
  if (!markdownText) {
    return markdownText;
  }
  const regex = /(!{0,1})\[(.*?)\]\((.*?)\)/g;
  // 使用replace方法替换匹配到的图片链接
  const replacedText = markdownText.replace(regex, function (match, type = '', altText, imageUrl) {
    // match是整个匹配到的字符串，altText是第一个捕获组，即alt文本，imageUrl是第二个捕获组，即图片链接部分
    // 在这里你可以根据需要进行逻辑处理，例如替换成固定链接或者加上额外的参数
    const newImageUrl = image.get(imageUrl);
    if (newImageUrl) {
      return `![${altText}](${newImageUrl})`;
    }
    // 判断链接是否为图片链接，判断是base64图片，还是链接
    if (imageUrl.match(/\.(jpg|jpeg|png|gif|bmp)$/i) || imageUrl.match(/^data:image\//i)) {
      return `![${altText}](${imageUrl})`;
    }
    return `${type}[${altText}](${imageUrl})`;
  });

  return replacedText;
}
export default React.memo(function Markdown(props: IMarkdownProps) {
  const {
    docType = 'doc',
    copyContentBtn = true,
    children,
    className,
    components = {},
    showTableMenu = true,
    supportMath = true,
    showBookmark = true,
  } = props;
  const [root, setRoot] = useState(null)
  const container = useRef();
  const { platform } = useChatState();
  useEffect(() => {
    setRoot(container.current)
  }, []);

  const content = replaceImageLinks(children);
  let remarkPlugins = [remarkGfm, remarkMermaid]
  let rehypePlugins = [];
  if (supportMath) {
    remarkPlugins = [remarkGfm, remarkMath, remarkMermaid]
    rehypePlugins = (platform == 'google' || docType == 'slide') ? [rehypeMathjax] : [rehypeKatex]
  }

  return (
    <div className={`relative group w-full ${className}`}>
      <div ref={container}>
        {/* <ErrorBoundary fallback={content}> */}
        <ReactMarkdown
          className={`markdown`}
          children={content}
          components={{
            pre: Code,
            // "mjx-container": ({ node, ...props }: any) => {
            //   // console.log(node)
            //   return <MathMark {...props} />
            // },
            code: CodeInline,
            svg: ({ node, ...props }: any) => {
              // console.log(node)
              return <Svg {...props}></Svg>;
            },
            a: ({ node, ...props }: any) => {
              const url = props.href as string;
              if (isImageLink(url)) {
                return <Image src={url} />;
              }
              return <Link target='_blank' {...props}></Link>;
            },
            img: ({ node, ...props }: any) => {
              // console.log(props)
              return <Image {...props}></Image>;
            },
            table: ({ node, ...props }: any) => {
              return <Table showMenu={showTableMenu} {...props}></Table>;
            },
            span: ({ node, ...props }: any) => {
              // 如果class名为katex-display，则不渲染
              if (props.className === 'katex') {
                return <Katex {...props}></Katex>;
              }
              return <span {...props}></span>;
            },
            ...components
          }}
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}

        />
        {/* </ErrorBoundary> */}

      </div>
      {copyContentBtn && (
        <BubbleMenu
          className="absolute -bottom-[28px] left-1 "
          element={root}
          content={content}
          showBookmark={showBookmark}
        />
      )}
    </div>
  );
});
