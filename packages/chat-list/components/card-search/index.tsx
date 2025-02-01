import React, { } from 'react';
import {
    Card,
    CardContent,
    CardTitle,
    // RadioGroup,
} from "chat-list/components/ui/card";
import { SearchResult } from 'chat-list/types/search';
import { useTranslation } from 'react-i18next';

interface ICardFormulaInfoProps {
    results: SearchResult[]
}

export default function CardSearch(props: ICardFormulaInfoProps) {
    const { results } = props;
    const { t } = useTranslation(['base']);
    return (
        <Card className="w-full">
            <CardTitle>{t('common.reference')}</CardTitle>
            <CardContent className="flex flex-col items-start justify-start space-y-1 sm:items-stretch sm:flex-row sm:space-x-1 sm:space-y-0">
                {
                    results.map((result, index) => {
                        return (
                            <a target='_blank' href={result.url} rel="noreferrer" key={index} className="text-sm w-full sm:w-1/2 p-2 border rounded hover:bg-gray-100 cursor-pointer ">
                                <div className='font-bold my-1'>
                                    {result.title}
                                </div>
                                <div className='text-sm'>
                                    {result.snippet}
                                </div>
                            </a>
                        );
                    })
                }
            </CardContent>
        </Card>
    );
}
