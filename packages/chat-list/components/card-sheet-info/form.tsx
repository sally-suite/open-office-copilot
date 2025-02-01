// MyForm.tsx

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Input } from 'chat-list/components/ui/input';
import { MousePointerSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Button from '../button';
import Icondbutton from '../icon-button';
import sheetApi from '@api/sheet';
import { getHeaderList, getValuesByRange } from 'chat-list/service/sheet';
import { useTranslation } from 'react-i18next';
export interface FormulaInfo {
    // header: {
    //     names: string[],
    //     range: string
    // },
    // spreadsheetPlatform: string;
    // formula: string;
    dataRangeCells: string;
    // dataRangeSheetName: string;
    headerInDataRange: string;
    // columnRowReferences: string;
    // formulaType: string;
}

interface InputProps {
    label: string;
    value: string;
    onSetValue: () => void;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

const InputField: React.FC<InputProps> = ({ label, value, onSetValue, onChange }) => {
    const { t } = useTranslation('sheet');

    // const [waiting, setaiting] = useState(second)
    return (
        <>
            <h3 className="input-label">{label}</h3>
            <div className='flex flex-row items-center'>
                <Input value={value}
                    className='flex w-full rounded-md border border-input bg-background px-4 py-1 text-sm ring-offset-background '
                    onChange={onChange}
                >
                </Input>
                <Icondbutton title={t('sheet.context.select_data_and_click', 'Select data range and click')} className=' bg-transparent border-0 ml-2 ' icon={MousePointerSquare} onClick={onSetValue}></Icondbutton>
            </div>
        </>
    );
};


export interface IFormProps {
    value: FormulaInfo;
    onChange: (data: FormulaInfo) => void;
}

const MyForm: React.FC<IFormProps> = (props: IFormProps) => {
    const { value, onChange } = props;
    const { t } = useTranslation('sheet');

    const [formData, setFormData] = useState<FormulaInfo>({
        // header: {
        //     name: [],
        //     range: ''
        // },
        // spreadsheetPlatform: '',
        // formula: '',
        dataRangeCells: '',
        // dataRangeSheetName: '',
        headerInDataRange: 'Yes',
        // columnRowReferences: '',
        // formulaType: '',
        ...value
    });

    const handleChange = (field: keyof FormulaInfo, value: string) => {

        setFormData((prevData) => ({
            ...prevData,
            [field]: value,
        }));

    };

    const onSetDataRange = async () => {
        const range = await sheetApi.getRangeA1Notation();
        const value = {
            ...formData,
            dataRangeCells: range,
        };
        setFormData(value);
        onChange?.(value);

    };

    const onSetHeaders = async () => {
        const range = await sheetApi.getRangeA1Notation();
        const heads = await getValuesByRange(range);
        const value = {
            ...formData,
            header: {
                names: heads[0],
                range
            },
        };
        setFormData(value);
        onChange?.(value);
    };

    const onHeaderInDataRange = async (value: string) => {
        const val = {
            ...formData,
            headerInDataRange: value
        };
        setFormData(val);
        onChange?.(val);
    };
    const onAddrChanbge = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData) => ({
            ...prevData,
            dataRangeCells: e.target.value,
        }));
    };
    const initEvent = async () => {
        return sheetApi?.registSelectEvent?.(async ({ address, values }) => {

            setFormData({
                ...formData,
                dataRangeCells: address
            });
        });
    };

    useEffect(() => {
        setFormData(value);
    }, [value]);

    useEffect(() => {
        const unregist = initEvent();
        return () => {
            if (unregist) {
                unregist.then((unreg: any) => {
                    unreg?.();
                });
            }
        };
    }, []);

    // useEffect(() => {
    //     onChange?.(formData);
    // }, [formData])

    return (
        <form className="w-full mx-auto">
            <InputField
                label={t('sheet.context.data_range', 'Data Range')}
                value={formData.dataRangeCells}
                placeholder={t('sheet.context.select_data_range', 'Select data range')}
                onChange={onAddrChanbge}
                onSetValue={onSetDataRange}
            />
            <h3 className="input-label">{t('sheet.context.is_header_in_data_range', 'Is header in data range')}</h3>
            <div className='flex flex-row items-center'>
                <Select className="h-8"
                    value={formData.headerInDataRange}
                    onValueChange={onHeaderInDataRange}
                >
                    <SelectTrigger className="h-8 w-[110px]">
                        <SelectValue placeholder="Yes or No" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {/*  <InputField label={t('sheet.context.headers', 'Headers')}
                value={formData.header?.names?.join(', ')}
                placeholder={t('sheet.context.select_header_range', 'Select header range')}
                onSetValue={onSetHeaders}
            /> */}


            {/* <InputField label="Data range sheet name" value={formData.dataRangeSheetName} onChange={(value) => handleChange('dataRangeSheetName', value)} /> */}
            {/* <InputField label="Header in data range" value={formData.headerInDataRange} onChange={(value) => handleChange('headerInDataRange', value)} /> */}
            {/* < InputField label="Column and/or row references" value={formData.columnRowReferences} onChange={(value) => handleChange('columnRowReferences', value)} /> */}
        </form >
    );
};

export default MyForm;
