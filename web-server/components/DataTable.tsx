// components/OrderTable.tsx
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import React from 'react';
import { boolean } from 'zod';
import Loading from './Loading';
import { cn } from '@/lib/utils';

interface DataTableProps {

    loading?: boolean;
    caption?: string;
    dataSource: any[];
    columns: DataTableColumn[];
    onRowClick?: (row: any) => void;
}

interface DataTableColumn {
    title: string | React.ReactNode;
    dataIndex: string;
    key: string;
    render?: (value: any, record: any, rowIndex?: number) => React.ReactNode;
}


{/* <Table>
<thead>
    <tr>
        {columns.map((column) => (
            <th key={column.key}>{column.title}</th>
        ))}
    </tr>
</thead>
<tbody>
    {dataSource.map((data) => (
        <tr key={data.id}>
            {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(data[column.dataIndex]) : data[column.dataIndex]}</td>
            ))}
        </tr>
    ))}
</tbody>
</Table> */}


const DataTable: React.FC<DataTableProps> = ({ loading, dataSource, columns, caption, onRowClick = () => void 0 }) => {
    const handleRowClick = (rowData: any) => {
        if (onRowClick) {
            onRowClick(rowData)
        }
    }
    if (loading) {
        return (
            <Loading />
        )
    }
    return (
        <Table>
            {
                caption && (
                    <TableCaption >{caption}</TableCaption>
                )
            }
            <TableHeader>
                <TableRow>
                    {
                        columns.map((column) => {
                            return (
                                <TableHead key={column.dataIndex}>{column.title}</TableHead>
                            )
                        })
                    }
                </TableRow>
            </TableHeader>
            <TableBody>
                {dataSource.map((data, rowIndex) => (
                    <TableRow key={data.id} onClick={handleRowClick.bind(null, data)}>
                        {columns.map((column) => (
                            <TableCell key={column.key}>
                                {column.render ? column.render(data[column.dataIndex], data, rowIndex) : data[column.dataIndex]}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>

    );
};

export default DataTable;
