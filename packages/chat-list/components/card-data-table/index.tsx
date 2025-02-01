import React, { useEffect, useRef, useState } from 'react';
import {
    Card,
    CardContent,
    // RadioGroup,
} from "chat-list/components/ui/card";
import DataTable from '../data-table/table';
import html2canvas from 'html2canvas';


interface ICardConfirmProps {
    sheetName?: string;
    dataRange?: string;
    values?: string[][];
    onScreenshot?: (data: string) => void;
}


export function CardDataTable(props: ICardConfirmProps) {
    const { sheetName, dataRange, values = [], onScreenshot } = props;
    const [imgData, setImgData] = useState('')
    const table = useRef(null);

    useEffect(() => {
        if (onScreenshot) {
            html2canvas(table.current).then(canvas => {
                const base64 = canvas.toDataURL();
                setImgData(base64);
                onScreenshot(base64)
            })
        }
    }, [])
    return (
        <Card className="w-card">
            <CardContent>
                <div ref={table}   >
                    <div className='text-sm my-2'>
                        Sheet: <b>{sheetName}</b>, Used Range: <b>{dataRange}</b>
                    </div>
                    <div className=' text-sm' style={{ margin: '8px 0 0 0' }}>
                        <p>Screenshot:</p>
                        <DataTable data={values} />
                    </div>
                </div>
                {/* <img src={imgData} alt="" /> */}
            </CardContent>
        </Card>
    );
}

export default React.memo(CardDataTable);
