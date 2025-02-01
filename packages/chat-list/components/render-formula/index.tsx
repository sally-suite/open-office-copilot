import React, { useState } from 'react'
import { Textarea } from 'chat-list/components/ui/textarea';
import Button from 'chat-list/components/button';
import Markdown from 'chat-list/components/markdown';
import { useTranslation } from 'react-i18next'
import { explainFormula, writeFormula } from './edit';

export default function FormulaRender() {
    const { t } = useTranslation(['base', 'formula']);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(true)

    const [result, setResult] = useState('')
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const generate = async () => {
        if (!inputValue) {
            setResult('');
            return;
        }
        setLoading(true);
        const result = await writeFormula(inputValue)
        setResult(result);
    };
    const explain = async () => {

        const result = await explainFormula(inputValue)
        setResult(result);
    }

    return (
        <div className="p-2 flex flex-col mx-auto mt-2">
            <Textarea
                rows={3}
                value={inputValue}
                onChange={handleInputChange}
                className="border p-2 mt-2"
                placeholder={t('formula:placeholder', '')}
            />
            <div className='flex flex-row items-center mt-2'>
                <Button
                    className=' mx-2'
                    onClick={generate}
                >
                    {t('formula:generate', '')}
                </Button>
                <Button
                    className=' mx-2'
                    onClick={explain}
                >
                    {t('formula:explain', '')}
                </Button>
            </div>
            <Markdown className='mt-2'>
                {result}
            </Markdown>
        </div>
    );
}
