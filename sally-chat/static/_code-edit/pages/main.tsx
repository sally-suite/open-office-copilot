import React, { useState } from 'react';
import data from '../data/data.json';
import code from '../data/return.md';
import CodeEditor from 'chat-list/components/code-editor';
import { getCodeEditValue } from 'chat-list/local/session';
import Preview from '../components/Preview';
import sheetApi from '@api/sheet';
import { editFunction } from '../service/edit';

// const { code, data } = getCodeEditValue();

export default function Main() {
  const [jsonData, setJsonData] = useState(data || {}); // 初始化JSON数据
  const [editorCode, setEditorCode] = useState(code || ''); // 初始化代码
  const [executionResult, setExecutionResult] = useState<string[][]>([]); // 执行结果

  const buildFunc = (jsCode: string) => {
    const fun = eval(`(function() {${jsCode}; \n return handleSheetData;})`);
    return fun();
  };
  const onCodeChange = (code: string) => {
    setEditorCode(code);
  };
  const onSaveToSheet = async () => {
    await sheetApi.setValues(executionResult);
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
    return <Preview data={executionResult} />;
  };
  return (
    <CodeEditor
      code={editorCode}
      onChange={onCodeChange}
      onSaveToSheet={onSaveToSheet}
      onRun={onRun}
      renderPerview={renderPerview}
      codeCompletion={codeCompletion}
    ></CodeEditor>
  );
}
