import React, { useEffect, useState } from 'react';
import sheetApi from '@api/sheet';
import { Textarea } from 'chat-list/components/ui/textarea';
import Button from 'chat-list/components/button';
import Markdown from 'chat-list/components/markdown';
import CardSheetInfo, { FormulaInfo } from 'chat-list/components/card-sheet-info/form';

import Loading from '../loading';
import { useTranslation } from 'react-i18next';
import { chatByPrompt } from 'chat-list/service/message';
import writeFunctionPrompt from './prompts/function';
import explainFunctionPrompt from './prompts/explain.md';
import { ScanSearch, Sigma } from 'lucide-react';

export default function CoderRender() {
    const { t, i18n } = useTranslation(['function']);
    const [inputValue, setInputValue] = useState('');
    const [formValue, setFormValue] = useState<FormulaInfo>({});
    const [loading, setLoading] = useState(true);

    const [result, setResult] = useState('');
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };
    const onFormChange = (formValue: FormulaInfo) => {
        setFormValue(formValue);
    };

    const buildContext = async () => {
        const sheet = await sheetApi.getSheetInfo();

        const context = `
Here is the information about sheet:

SHEET_INFO:

${JSON.stringify(sheet, null, 2)}

IS HEADER IN DATA RANGE: ${formValue.headerInDataRange}
`;
        return context;
    };

    const generate = async () => {
        const dataContext = await buildContext();
        const prompt = `${writeFunctionPrompt}\n\n${dataContext}\n\nMy requirement:${inputValue}`;
        await chatByPrompt(null, prompt, { stream: true }, (done, result) => {
            if (done) {
                return;
            }
            if (result.content) {
                setResult(result.content);
            }
        });
    };
    const explain = async () => {
        const dataContext = await buildContext();
        const prompt = `${explainFunctionPrompt}\n${dataContext}\n\nMy function or formula:${inputValue}\n\nReply with language:${i18n.resolvedLanguage}`;
        await chatByPrompt(null, prompt, { stream: true }, (done, result) => {
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
        const dataRangeCells = await sheetApi.getRangeA1Notation();
        setFormValue({
            dataRangeCells,
            headerInDataRange: 'Yes'
        });
        setLoading(false);
    };
    useEffect(() => {
        init();
    }, []);

    return (
        <div className="p-2 flex flex-col mx-auto mt-2">
            {
                loading && (
                    <Loading className=' h-40' text={t('function:load_sheet_info', 'Loading Sheet Info')} />
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
                placeholder={t('function:placeholder')}
            />
            <div className='flex flex-row items-center mt-2'>
                <Button
                    icon={Sigma}
                    className=' mx-2'
                    onClick={generate}
                >
                    {t('function:generate')}
                </Button>
                <Button
                    icon={ScanSearch}
                    className='mx-2'
                    onClick={explain}
                    variant='secondary'
                >
                    {t('function:explain')}
                </Button>
            </div>

            <Markdown className='mt-2'>
                {result}
            </Markdown>
        </div>
    );
}
