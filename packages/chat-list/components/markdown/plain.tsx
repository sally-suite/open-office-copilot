/* eslint-disable react/no-children-prop */

import React, { } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// import rehypeKatex from 'rehype-katex'
import remarkMermaid from './remark-mermaidjs/browser';
import Table from './table';
import image from 'chat-list/utils/image';
import Image from './image';
import { NormalComponents } from 'react-markdown/lib/complex-types';
import { SpecialComponents } from 'react-markdown/lib/ast-to-react';
import { isImageLink } from 'chat-list/utils';
import ErrorBoundary from 'chat-list/components/error-boundary';
import Svg from './svg';
// import remarkPlantUml from '@akebifiky/remark-simple-plantuml'
import './index.less';

interface IMarkdownProps {
  children: string;
  className?: string;
  components?: Partial<Omit<NormalComponents, keyof SpecialComponents> & SpecialComponents>;
  showTableMenu?: boolean;
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
    children,
    className,
    components = {},
    showTableMenu = true,
  } = props;

  const content = replaceImageLinks(children);
  const remarkPlugins = [remarkGfm, remarkMermaid];
  const rehypePlugins: any[] = [];

  return (
    <div className={`relative group w-full ${className}`}>
      <ErrorBoundary fallback={content}>
        <ReactMarkdown
          className={`markdown`}
          children={content}
          components={{
            svg: ({ node, ...props }: any) => {
              // console.log(node)
              return <Svg {...props}></Svg>;
            },
            a: ({ node, ...props }: any) => {
              const url = props.href;
              if (isImageLink(url)) {
                return <Image src={url} />;
              }
              return <a target='_blank' {...props}></a>;
            },
            img: ({ node, ...props }: any) => {
              // console.log(props)
              return <Image {...props}></Image>;
            },
            table: ({ node, ...props }: any) => {
              return <Table showMenu={showTableMenu} {...props} showScroll={false}></Table>;
            },
            ...components
          }}
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
        />
      </ErrorBoundary>
    </div>
  );
});
