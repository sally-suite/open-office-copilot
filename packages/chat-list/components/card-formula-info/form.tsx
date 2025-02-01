// MyForm.tsx

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Input } from 'chat-list/components/ui/input';
import { MousePointerSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Button from '../button';
import Icondbutton from '../icon-button';
import sheetApi from '@api/sheet';
import { getHeaderList } from 'chat-list/service/sheet';
export interface FormulaInfo {
    headers: string;
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
    onChange: (value: string) => void;
    onSetValue: () => void;
    placeholder?: string;
}

const InputField: React.FC<InputProps> = ({ label, value, placeholder, onSetValue, onChange }) => {
    // const [waiting, setaiting] = useState(second)
    return (
        <>
            <h3 className="input-label">{label}</h3>
            <div className='flex flex-row items-center'>
                <Input
                    placeholder={placeholder}
                    className=" h-8"
                    value={value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                />

                <Icondbutton title='Click and get data ragne' className=' bg-transparent border-0 ml-2 ' icon={MousePointerSquare} onClick={onSetValue}></Icondbutton>
            </div>

        </>
    );
};


export interface IFormProps {
    value: FormulaInfo;
    onSubmit: (data: FormulaInfo) => void;
}

const MyForm: React.FC<IFormProps> = (props: IFormProps) => {
    const { value, onSubmit } = props;
    const [formData, setFormData] = useState<FormulaInfo>({
        headers: '',
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

    const onSetValue = async (name: string) => {
        const result = await sheetApi.getRangeA1Notation();
        setFormData({
            ...formData,
            [name]: result
        });
    };

    const onSetHeaders = async () => {
        // const range = await sheetApi.getRangeA1Notation();
        const heads = await getHeaderList();
        setFormData({
            ...formData,
            headers: heads.join(',')
        });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // 在这里可以处理表单提交的逻辑
        // formData 对象包含了所有的表单数据
        console.log('Form Data:', formData);
        onSubmit?.(formData);
    };

    useEffect(() => {
        setFormData(value);
    }, [value]);

    return (
        <form className="w-full max-w-md mx-auto">
            <InputField label="Headers"
                value={formData.headers}
                placeholder="Select header range"
                onChange={(value) => handleChange('headers', value)}
                onSetValue={onSetHeaders}
            />
            <InputField label="Data range cells"
                value={formData.dataRangeCells}
                placeholder="Select data range"
                onChange={(value) => handleChange('dataRangeCells', value)}
                onSetValue={onSetValue.bind(null, 'dataRangeCells')}
            />
            {/* <InputField label="Data range sheet name" value={formData.dataRangeSheetName} onChange={(value) => handleChange('dataRangeSheetName', value)} /> */}
            {/* <InputField label="Header in data range" value={formData.headerInDataRange} onChange={(value) => handleChange('headerInDataRange', value)} /> */}
            {/* < InputField label="Column and/or row references" value={formData.columnRowReferences} onChange={(value) => handleChange('columnRowReferences', value)} /> */}
            <h3 className="input-label">Header in data range</h3>
            <div className='flex flex-row items-center'>
                <Select className=" h-8"
                    value={formData.headerInDataRange}
                    onValueChange={(value: any) => handleChange('headerInDataRange', value)}

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

            <Button
                action="translate-text"
                color="primary"
                className='mt-2 max-w-md'
                onClick={handleSubmit}
            >
                Ok
            </Button>
        </form >
    );
};

export default MyForm;
