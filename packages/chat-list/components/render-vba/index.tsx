import React, { useEffect, useState } from 'react'
import sheetApi from '@api/sheet'
import { getHeaderList } from 'chat-list/service/sheet';
import { Textarea } from 'chat-list/components/ui/textarea';
import Button from 'chat-list/components/button';
import Markdown from 'chat-list/components/markdown';
import CardSheetInfo, { FormulaInfo } from 'chat-list/components/card-sheet-info/form';
import { numberToLetter, parseCellAddress } from 'chat-list/utils';
import Loading from '../loading';
import { useTranslation } from 'react-i18next'
import { chatByPrompt } from 'chat-list/service/message';
import writeFunctionPrompt from './prompts/function'

export default function CoderRender() {
    const { t } = useTranslation(['vba']);
    const [inputValue, setInputValue] = useState('');
    const [formValue, setFormValue] = useState<FormulaInfo>({});
    const [loading, setLoading] = useState(true)

    const [result, setResult] = useState('')
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };
    const onFormChange = (formValue: FormulaInfo) => {
        setFormValue(formValue)
    }

    const buildContext = async () => {
        const sheet = await sheetApi.getSheetInfo();
        const start = formValue.dataRangeCells.split(':')[0];
        console.log('start', start);
        // const { column, row } = parseCellAddress(start);
        const headStart = (formValue.header.range || formValue.dataRangeCells).split(':')[0];
        const headRange = parseCellAddress(headStart);
        const headers = formValue.header.names.map((h, i) => {
            const letter = numberToLetter(headRange.column + i)
            return `${h}<${letter}${headRange.row}>`
        }).join(' , ')

        const context = `
Here is the information about sheet:

Spreadsheet include sheets: ${sheet.sheets.join(' , ')}.

Active sheet is ${sheet.current}.

Information about data range:
1. Header names: ${headers}
2. Data range : ${formValue.dataRangeCells}
3. Is header in data range: ${formValue.headerInDataRange}
`;
        return context;
    }

    const generate = async () => {
        const dataContext = await buildContext();
        const prompt = `${writeFunctionPrompt}\n${dataContext}`;
        await chatByPrompt(prompt, `My requirement:${inputValue}`, { stream: true }, (done, result) => {
            if (done) {
                return;
            }
            if (result.content) {
                setResult(result.content);
            }
        });
    };

    const init = async () => {
        setLoading(true);
        const heads = await getHeaderList();
        const dataRangeCells = await sheetApi.getRangeA1Notation();
        setFormValue({
            header: {
                names: heads,
                range: dataRangeCells
            },
            dataRangeCells,
            headerInDataRange: 'Yes'
        })
        setLoading(false);
    }
    useEffect(() => {
        init();
    }, [])

    return (
        <div className="p-2 flex flex-col mx-auto mt-2">
            {
                loading && (
                    <Loading className=' h-40' text={t('vba:load_sheet_info', 'Loading Sheet Info')} />
                )
            }
            {
                !loading && (
                    <CardSheetInfo value={formValue} onChange={onFormChange} />
                )
            }
            <Textarea
                rows={3}
                value={inputValue}
                onChange={handleInputChange}
                className="border p-2 mt-2"
                placeholder={t('vba:placeholder')}
            />
            <div className='flex flex-row items-center mt-2'>
                <Button
                    className=' mx-2'
                    onClick={generate}
                >
                    {t('vba:generate')}
                </Button>
            </div>

            <Markdown className='mt-2'>
                {result}
            </Markdown>
        </div>
    );
}
