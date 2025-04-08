import React, { useState } from 'react';
import data from '../data/data.json';
import code from '../data/return.md';
import CodeEditor from 'chat-list/components/code-editor';
import { getChartEditValue } from 'chat-list/local/session';
import Preview from '../components/Preview';
import { editFunction } from '../service/edit';
import sheetApi from '@api/sheet';
// import '../theme';
// import return2 from '../data/return2.md';
// const { code, data } = getChartEditValue();

export default function Main() {
  const [jsonData, setJsonData] = useState(data || {}); // 初始化JSON数据
  const [editorCode, setEditorCode] = useState(code || ''); // 初始化代码
  const [executionResult, setExecutionResult] = useState<string[][]>([]); // 执行结果
  const [imageData, setImageData] = useState('');
  const buildFunc = (jsCode: string) => {
    const fun = eval(`(function() {${jsCode}; \n return createEchartOption;})`);
    return fun();
  };
  const onCodeChange = (code: string) => {
    setEditorCode(code);
  };

  const onInsertToSheet = async () => {
    // // 获取 <body> 内的 HTML 内容
    if (imageData) {
      await sheetApi.insertImage(imageData);
    }
  };
  const onRender = (base64: string) => {
    setImageData(base64);
  };
  const onRun = (code: string) => {
    const fun = buildFunc(code); // 在浏览器中执行JavaScript代码
    const copy = JSON.parse(JSON.stringify(jsonData));
    const result = fun(copy);
    setExecutionResult(result);
  };
  const codeCompletion = async (code: string, input: string) => {
    return await editFunction(input, code, JSON.stringify(jsonData));
  };
  const renderPerview = () => {
    return <Preview option={executionResult} onRender={onRender} />;
  };
  return (
    <CodeEditor
      code={editorCode}
      onChange={onCodeChange}
      onSaveToSheet={onInsertToSheet}
      onRun={onRun}
      renderPerview={renderPerview}
      codeCompletion={codeCompletion}
    ></CodeEditor>
  );
}
