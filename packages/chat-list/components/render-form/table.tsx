import React, { useState } from 'react';

interface TableCellProps {
    content: string | number;
    onChange: (value: string) => void;
}

const TableCell: React.FC<TableCellProps> = ({ content, onChange }) => {
    const [value, setValue] = useState<string | number>(content);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        onChange(e.target.value);
    };

    return (
        <td className="border border-gray-400 px-4 py-2">
            <input
                className="w-full"
                type="text"
                value={value}
                onChange={handleChange}
            />
        </td>
    );
};

interface TableRowProps {
    rowData: (string | number)[];
    onChange: (cellIndex: number, value: string | number) => void;
}

const TableRow: React.FC<TableRowProps> = ({ rowData, onChange }) => (
    <tr>
        {rowData.map((cellData, index) => (
            <TableCell key={index} content={cellData} onChange={(value) => onChange(index, value)} />
        ))}
    </tr>
);

interface TableProps {
    data: (string | number)[][];
    onDataChange: (rowIndex: number, cellIndex: number, value: string | number) => void;
}

export const Table: React.FC<TableProps> = ({ data, onDataChange }) => (
    <table className="border-collapse border border-gray-400">
        <tbody>
            {data.map((rowData, index) => (
                <TableRow key={index} rowData={rowData} onChange={(cellIndex, value) => onDataChange(index, cellIndex, value)} />
            ))}
        </tbody>
    </table>
);
