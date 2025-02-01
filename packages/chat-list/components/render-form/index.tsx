import React, { useEffect, useState } from 'react';
import { ApplyPromptByRowForm } from 'chat-list/components/card-prompt-by-row';
import sheetApi from '@api/sheet';
import Button from '../button';
import data from './data.json';
import { extractCodeFromMd, extractJsonDataFromMd, letter2columnNum, numberToLetter, template } from 'chat-list/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "chat-list/components/ui/select";
import { getHeaderList, getValues } from 'chat-list/service/sheet';
import useChatState from 'chat-list/hook/useChatState';
import row2FormTemplete from './prompts/v1.md';
import temp from './temp.json';
import { Table } from './table';
import { cn } from 'chat-list/lib/utils';

export default function IntelligentRender() {
    const { chat } = useChatState();
    const [sheets, setSheets] = useState([]);
    const [sampleSheet, setSampleSheet] = useState('');
    const [dataSheet, setDataSheet] = useState('');
    const [datasetAddress, setDatasetAddress] = useState('');
    const [headers, setHeaders] = useState([]);
    const [targetSheetName, setTargetSheetName] = useState('');
    const [formTemplate, setFormTemplate] = useState([]);
    const [templateSheetList, setTemplateSheetList] = useState([]);
    const [templateSheet, setTemplateSheet] = useState('');

    const onvertToForm = async () => {
        // const address = await sheetApi.getRangeA1Notation();
        console.log(dataSheet);
        const rawValues = await sheetApi.getValuesByRange(datasetAddress, 0, 0, 0, dataSheet);
        const dataValues = JSON.parse(rawValues) as string[][];
        console.log(dataValues);
        // const headers = dataValues[0];
        // 根据表头和行数据，构建每一行的表单数据，
        const dataSource = dataValues.slice(1);

        const jsonTemplate = await getValues(0, templateSheet, { range: 'all' });

        const addressInfo = await sheetApi.getRowColNum(dataSheet, datasetAddress);
        console.log(addressInfo);
        const tarSheetColNum = headers.indexOf(targetSheetName);
        for (let i = 0; i < dataSource.length; i++) {
            console.log(`sheet${i}`);
            const tarSheetName = await sheetApi.copySheet(templateSheet, dataSource[i][tarSheetColNum] || `sheet${i}`);
            const tarSheetInfo = await sheetApi.getRowColNum(tarSheetName);

            for (let n = 0; n < jsonTemplate.length; n++) {
                for (let m = 0; m < jsonTemplate[n].length; m++) {
                    if (jsonTemplate[n][m] && jsonTemplate[n][m].length > 0) {
                        console.log(jsonTemplate[n][m]);
                        const tempValue: string = jsonTemplate[n][m];
                        if (tempValue.includes('{{')) {
                            // 通过正则 从val的{{vaue}} 提取value值
                            const head = tempValue.match(/\{\{(.*?)\}\}/g)?.[0]?.replace(/{{|}}/g, '');
                            if (!head) {
                                continue;
                            }
                            const col = headers.indexOf(head.replace(/[\r\n\s]+/g, ''));
                            if (col < 0) {
                                continue;
                            }
                            const address = `${numberToLetter(addressInfo.col + col)}${addressInfo.row + i + 1}`;
                            console.log([[`=${dataSheet}!${address}`]], tarSheetInfo.row + n, tarSheetInfo.col + m, 1, 1, tarSheetName);
                            await sheetApi.setValuesByRange([[`=${dataSheet}!${address}`]], tarSheetInfo.row + n, tarSheetInfo.col + m, 1, 1, tarSheetName);
                        }
                    }
                }
            }
        }


    };
    const buildFormTemplate = async () => {
        const values = await getValues(0, sampleSheet);
        // const address = await sheetApi.getRangeA1Notation();
        const rawValues = await getValues(0, dataSheet);
        const headers = rawValues[0];

        const normalHeaders = headers.map((header) => {
            const head = header.replace(/[\r\n\s]+/g, '');
            return head;
        });
        const formData = normalHeaders.map((header) => {
            return `${header}:{{${header}}}`;
        }).join('\n');

        const jsonTemplate = temp;// await createNewSheet(JSON.stringify(values), formData);
        // setFormTemplate(jsonTemplate)
        const templateSheetName = await sheetApi.copySheet(sampleSheet, 'form_template');
        const tarSheetInfo = await sheetApi.getRowColNum(templateSheetName);

        // await sheetApi.setValues(jsonTemplate, 'form_template')
        for (let n = 0; n < jsonTemplate.length; n++) {
            for (let m = 0; m < jsonTemplate[n].length; m++) {
                if (jsonTemplate[n][m] && jsonTemplate[n][m].length > 0) {
                    console.log(jsonTemplate[n][m]);
                    const tempValue = jsonTemplate[n][m] as string;
                    if (tempValue.includes('{{')) {
                        console.log(tempValue, tarSheetInfo.row + n, tarSheetInfo.col + m, 1, 1, templateSheetName);
                        await sheetApi.setValuesByRange([[tempValue]], tarSheetInfo.row + n, tarSheetInfo.col + m, 1, 1, templateSheetName);
                    }
                }
            }
        }

        const result = await sheetApi.getSheetInfo();
        setTemplateSheetList(result.sheets);
        setTemplateSheet(templateSheetName);
    };
    const createNewSheet = async (samplateData: string, formData: string) => {
        const prompt = template(row2FormTemplete, {
            samplate_data: samplateData,
            form_data: formData
        });
        const result = await chat({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            stream: false,
            temperature: 0.5,
            max_tokens: 4000,
            // response_format: { "type": "json_object" },
        });
        const content = result.content;
        console.log(content);
        const jsonData = extractJsonDataFromMd(content);
        if (jsonData.table && Array.isArray(jsonData.table)) {
            return jsonData.table;
        }
        if (Array.isArray(jsonData)) {
            return jsonData;
        }
    };
    const onValueChange = (value: string) => {
        setSampleSheet(value);
    };
    const onTarSheetChange = (value: string) => {
        setTargetSheetName(value);
    };
    const onTempSheetChange = (value: string) => {
        sheetApi.activeSheet(value);
        setTemplateSheet(value);
    };
    const handleDataChange = (rowIndex: number, cellIndex: number, value: string | number) => {
        const newData = [...formTemplate];
        newData[rowIndex][cellIndex] = value;
        setFormTemplate(newData);
    };
    const onInsert = async (head: string) => {
        // console.log(head)
        // await sheetApi.setValues([[`{{${head}}}`]])
        await sheetApi.insertText(`{{${head}}}`);
    };
    const init = async () => {
        const result = await sheetApi.getSheetInfo();
        setDataSheet(result.current);
        const address = await sheetApi.getRangeA1Notation(result.current);
        console.log(address);
        setDatasetAddress(address);
        setSheets(result.sheets);
        setTemplateSheetList(result.sheets);
        const heads = await getHeaderList();
        const normalHeaders = heads.map((header) => {
            const head = header.replace(/[\r\n\s]+/g, '');
            return head;
        });
        setHeaders(normalHeaders);
    };

    // useEffect(() => {
    //     init();
    // }, [])
    return (
        <div className="markdown flex flex-col p-2 h-full">
            <p>
                首先，请选择表格所在区域，然后点击确认。
            </p>
            <Button onClick={init}>
                确认表格区域
            </Button>
            {
                dataSheet && (
                    <>
                        {/* <label className='input-label' htmlFor="">Form Sample Sheet</label>
                        <Select value={sampleSheet} onValueChange={onValueChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Template Sheet" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    sheets.map((sheet, i) => {
                                        return (
                                            <SelectItem key={i} value={sheet}>
                                                {sheet}
                                            </SelectItem>
                                        )
                                    })
                                }
                            </SelectContent>
                        </Select>
                        <p className='mb-2'>
                            Refer to the form example Sheet to create a form template
                        </p>
                        <Button onClick={buildFormTemplate}>
                            Build Form Template
                        </Button> */}
                        <label className=' text-sm font-bold  mt-4' htmlFor="">表单模板所在工作表</label>
                        <div>
                            <Select value={templateSheet} onValueChange={onTempSheetChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Template Sheet" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        templateSheetList.map((sheet, i) => {
                                            return (
                                                <SelectItem key={i} value={sheet}>
                                                    {sheet}
                                                </SelectItem>
                                            );
                                        })
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                        <p>
                            选择表单所在的工作表，然后选择以下字段，点击插入到模板里。
                        </p>
                        <div className=' grid  grid-cols-2  gap-2 '>
                            {
                                headers.map((head, i) => {
                                    return (
                                        <Button key={i} variant='secondary' className='sm:w-auto' onClick={onInsert.bind(null, head)}>
                                            {head}
                                        </Button>
                                    );
                                })
                            }
                        </div>
                        <label className="text-sm font-bold  mt-4" htmlFor="">新工作表名称</label>
                        <div className='flex flex-row items-center  space-x-1'>
                            <Select value={targetSheetName} onValueChange={onTarSheetChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Template Sheet" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        headers.map((head, i) => {
                                            return (
                                                <SelectItem key={i} value={head}>
                                                    {head}
                                                </SelectItem>
                                            );
                                        })
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                        <p className='mb-1'>
                            选择一列，作为新的表达工作表的名称。
                        </p>
                        <p className='my-2'>
                            完成以上步骤，点击开始。
                        </p>
                        <Button onClick={onvertToForm}>
                            开始
                        </Button>
                    </>
                )
            }

        </div >
    );
}
