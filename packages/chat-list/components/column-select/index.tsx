import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "chat-list/components/ui/select";
import React, { useEffect, useState } from "react";
import { cn } from "chat-list/lib/utils";

interface IModelSelectProps {
    className?: string;
    value: string;
    defaultValue?: string;
    placeholder?: string;
    onChange: (value: string) => void;
}

export const ColumnSelect = (props: IModelSelectProps) => {
    const { className, value, placeholder, onChange } = props;
    const [columns, setColumns] = useState([]);

    const onValueChange = (value: string) => {
        onChange(value);
    };

    const initColumns = () => {
        const cols = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
        setColumns(cols);
    };

    useEffect(() => {
        initColumns();
    }, []);
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className={cn("w-30", className)}>
                <SelectValue placeholder={placeholder}>
                </SelectValue>
            </SelectTrigger>
            <SelectContent side="top">
                <div className=" grid grid-cols-6">
                    {
                        columns && columns.map(item =>
                            <SelectItem hideIndicator={true} key={item} className="cursor-pointer flex flex-row justify-center pr-0" value={item}>
                                {item}
                            </SelectItem>
                        )
                    }
                </div>
            </SelectContent>
        </Select>


    );
};

export default ColumnSelect;