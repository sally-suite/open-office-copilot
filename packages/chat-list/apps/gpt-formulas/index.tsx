import React from 'react';
import { createRoot } from 'react-dom/client';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import sheetApi from '@api/sheet';
import CopyButton from 'chat-list/components/copy-button';
import 'chat-list/assets/css/global.css';
import 'chat-list/assets/css/common.less';
import 'chat-list/assets/css/editor.less';
import 'chat-list/assets/css/markdown.less';


const GOOGLE_GPT_FUNCTIONS_EXAMPLE = [`=SALLY_GPT3("What's your name?")`, `=SALLY_GPT4(A2,"Generate proposals ...")`];
const GOOGLE_GPT_FUNCTIONS = ['SALLY_GPT3', 'SALLY_GPT4'];

const OFFICE_GPT_FUNCTIONS_EXAMPLE = [`=SL.GPT3("What's your name?")`, `=SL.GPT4(A2,"Generate proposals ...")`];
const OFFICE_GPT_FUNCTIONS = ['SL.GPT3', 'SL.GPT4'];

const GPT_FUNCTION: { [x: string]: { name: string, functions: string[], examples: string[] } } = {
    google: {
        name: 'Google',
        functions: GOOGLE_GPT_FUNCTIONS,
        examples: GOOGLE_GPT_FUNCTIONS_EXAMPLE
    },
    office: {
        name: 'Office',
        functions: OFFICE_GPT_FUNCTIONS,
        examples: OFFICE_GPT_FUNCTIONS_EXAMPLE
    }
};

export default function GPTFormulas() {
    const { t } = useTranslation(['base', 'tool']);
    const platform = 'office';
    const formula = GPT_FUNCTION[platform] || GPT_FUNCTION['google'];
    const onSelectFunction = async (index: number) => {
        await sheetApi.insertText(formula.examples[index]);
    };
    return (
        <div className='w-full p-2'>
            <p className='text-base mt-3 mb-1'>
                {t('common.gpt_formulas', 'GPT Formulas')}:
            </p>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1'>
                {
                    formula?.functions.map((item, index) => {
                        return (
                            <div key={index} className='mb-2'>
                                <div
                                    className='flex flex-row items-center relative group rounded-full sm:w-auto font-bold'
                                >
                                    <span className='ml-2  whitespace-nowrap overflow-hidden text-ellipsis mr-2'>{item}</span>
                                    <CopyButton className='cursor-pointer' content={`=${formula.functions[index]}("")`} />
                                </div>
                                <p className="my-1">
                                    Example:
                                </p>
                                <p>
                                    {formula.examples[index]}
                                </p>
                            </div>

                        );
                    })
                }
            </div>
        </div>
    );
}


export function Main() {
    // useEffect(() => {
    //   const loading = document.getElementById('loading');
    //   if (loading) {
    //     loading.remove();
    //   }
    // }, []);
    return (
        <React.StrictMode>
            <GPTFormulas />
        </React.StrictMode>
    );
}


export const render = () => {
    const container: any = document.getElementById('root');
    const root = createRoot(container); // createRoot(container!) if you use TypeScript
    root.render(<Main />);
};
