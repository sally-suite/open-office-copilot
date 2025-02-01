import { ChatContext } from 'chat-list/store/chatContext'
import React, { useContext, useEffect, useState } from 'react'
import sheetApi from '@api/sheet'
import { getHeaderList } from 'chat-list/service/sheet';
import { Textarea } from 'chat-list/components/ui/textarea';
import Button from 'chat-list/components/button';
import Markdown from 'chat-list/components/markdown';
import { FormulaInfo } from 'chat-list/components/card-sheet-info/form';

import { buildChatMessage } from 'chat-list/utils';
import { useTranslation } from 'react-i18next'
export default function ChartRender() {
    const { t } = useTranslation('chart');
    const { plugin } = useContext(ChatContext);
    const [inputValue, setInputValue] = useState('');
    const [formValue, setFormValue] = useState<FormulaInfo>({});
    const [loading, setLoading] = useState(true)

    const [result, setResult] = useState('')
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const checkHeader = async () => {
        const heads = await getHeaderList();
        if (!heads || heads.length == 0 || heads.every(h => h == '' || h == undefined)) {
            const msg = "I'm sorry, I can't detect the table header, you need to select the data range first.";
            setResult(msg)
            return null;
        }
        return heads;
    }

    const generate = async () => {
        // const context = await buildContext();
        setResult('');
        const heads = await checkHeader();
        if (!heads) {
            return;
        }
        plugin.memory = [];
        const result = await plugin.onReceive(buildChatMessage(inputValue, 'text', 'user'), { stream: false })
        setResult(result.content);
    };
    const recommend = async () => {
        // await sheetApi.AddChart('Pie', 'Orders', 'City', 'Orders', ['Orders', 'Sales'], "false", [0, 0])
        // return;
        setResult('');
        const heads = await checkHeader();
        if (!heads) {
            return;
        }
        plugin.memory = [];
        const result = await plugin.onReceive(buildChatMessage('Help me recommend charts based on data from the current table', 'text', 'user'), { stream: false })
        setResult(result.content);
    }

    const init = async () => {
        try {
            setLoading(true);
            const heads = await checkHeader();
            if (!heads) {
                return;
            }
            const dataRangeCells = await sheetApi.getRangeA1Notation();
            setFormValue({
                header: {
                    names: heads,
                    range: dataRangeCells
                },
                dataRangeCells,
                headerInDataRange: 'Yes'
            })
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        init();
    }, [])

    return (
        <div className=" p-2 flex flex-col mx-auto mt-2">
            <p>

            </p>
            <Textarea
                rows={3}
                value={inputValue}
                onChange={handleInputChange}
                className="border p-2 mt-2"
                placeholder={t('chart.render_input_placeholder', "Click on the Recommend Charts button and let me recommend it for you! Or enter your chart requirements and click on Create.")}
            />
            <div className='flex flex-row items-center mt-2'>
                <Button
                    className=' mx-2 sm:w-auto'
                    onClick={recommend}
                >
                    {t('chart.recommend_charts', 'Recommend')}
                </Button>
                <Button
                    className=' mx-2 sm:w-auto'
                    onClick={generate}
                >
                    {t('chart.create_chart', 'Create')}
                </Button>
            </div>

            <Markdown className='mt-2'>
                {result}
            </Markdown>
        </div>
    );
}
