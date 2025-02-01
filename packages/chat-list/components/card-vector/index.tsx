import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardTitle,
    CardFooter,
    // RadioGroup,
} from "chat-list/components/ui/card";
import Button from "../button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { CheckboxGroup } from "../ui/checkbox";
import { getHeaderList, getValuesByRange } from "chat-list/service/sheet";
import FileSelector from 'chat-list/components/file-selector';
import { chunkText, parseDocument } from "chat-list/utils/file";
import gptApi from '@api/gpt';
import sheetApi from '@api/sheet';
import { getValues } from 'chat-list/service/sheet';
import toast from 'chat-list/components/ui/use-toast';
import { Trash2, Image, File } from "lucide-react";
import Tooltip from "../tooltip";
import Progress from 'chat-list/components/progress';
import { Input } from "../ui/input";
import { useTranslation } from 'react-i18next';
import { cn } from "chat-list/lib/utils";

const modeOpions = [
    {
        value: 'file',
        text: 'Upload Files'
    },
    {
        value: 'columns',
        text: 'Select Columns'
    }
];

interface ICardVectorProps {
    files?: File[],
    title?: string,
    description?: string,
    className?: string
}

const defaultDesc = 'No vector information is found in the current sheet, you can either upload a file, or select the key columns to build the vector.';


export default React.memo(function CardVector(props: ICardVectorProps) {
    const { className, files: initFiles, title, description } = props;
    const { t } = useTranslation(['knowledge']);
    const [mode, setMode] = useState('file');
    const [loading, setLoading] = useState(true);
    const [titles, setTitles] = useState<{ value: string, text: string }[]>([]);
    const [columns, setColumns] = useState([]);
    const [files, setFiles] = useState(initFiles || []);
    const [progress, setProgress] = useState(0);
    const [chunkSize, setChunkSize] = useState(500);
    const onFileSelect = async (fs: File[]) => {
        // const imgs = await Promise.all(files.map(file => blobToBase64Image(file)));
        setFiles(files.concat(fs));
        // setFiles(files);
    };
    const initHeaders = async () => {
        setLoading(true);
        const list = await getHeaderList();
        setTitles(list.map((name) => {
            return {
                value: name,
                text: name
            };
        }));
        setLoading(false);
    };
    const onSelectColumn = (vals: string[]) => {
        setColumns(vals);
    };
    const initByFile = async () => {
        setProgress(0);
        const titles = ['chunk', 'vector'];
        const values = [];

        let sheetName = '';
        for (let i = 0; i < files.length; i++) {
            const file: File = files[i];
            const text = await parseDocument(file);
            if (text) {
                const chunks = chunkText(text, chunkSize);
                for (let j = 0; j < chunks.length; j++) {
                    const result = await gptApi.embeddings({
                        model: 'text-embedding-ada-002',
                        input: chunks[j]
                    });
                    console.log(JSON.stringify(result || ''));
                    values.push([chunks[j], JSON.stringify(result)]);
                }
            }
            sheetName += file.name;
        }
        await sheetApi.initSheet(sheetName, titles);
        await sheetApi.setValues([titles].concat(values), sheetName);
    };
    const initByBatch = async (vectorIndex: number, colIndexs: number[], titles: string[], row: number, col: number, rowNum: number, colNum: number, batch: number) => {
        if (batch <= 0) {
            return;
        }
        const values = await getValuesByRange(row, col, batch, colNum);
        // const titles = values[0];
        // const colIndexs = columns.map((column) => {
        //     return titles.indexOf(column);
        // })
        for (let i = 0; i < batch; i++) {
            const row = values[i];
            if (row[vectorIndex]) {
                continue;
            }
            //检查row的数据是否都是空的
            if (row.every((v) => {
                return v == '' || v == undefined || v == null;
            })) {
                continue;
            }
            const text = colIndexs.map((colIndex) => {
                return `${titles[colIndex]}:${row[colIndex]}`;
            }).join('\n');
            const result = await gptApi.embeddings({
                model: 'text-embedding-ada-002',
                input: text
            });
            console.log(JSON.stringify(result || ''));
            row[vectorIndex] = JSON.stringify(result);
        }
        await sheetApi.setValuesByRange(values, row, col, batch, colNum);
    };
    const initByColumns = async () => {
        setProgress(0);
        const { row, col, rowNum, colNum, } = await sheetApi.getRowColNum();
        if (row == 1 && rowNum == 1 && col == 1 && colNum == 1) {
            return;
        }
        const titles = await getHeaderList();
        let vectorIndex = titles.indexOf('vector');
        const colIndexs = columns.map((column) => {
            return titles.indexOf(column);
        });
        let colNumber = colNum;
        if (vectorIndex < 0) {
            titles.push('vector');
            sheetApi.setValuesByRange([titles], 1, 1, 1, colNum + 1);
            colNumber = colNum + 1;
            vectorIndex = colNum;
        }

        const batch = 5;
        for (let i = 2; i <= rowNum; i += batch) {
            if (i + batch > rowNum + 1) {
                const lastBatch = rowNum - i + 1;
                console.log(vectorIndex, colIndexs, titles, i, col, rowNum, colNumber, lastBatch);
                await initByBatch(vectorIndex, colIndexs, titles, i, col, rowNum, colNumber, lastBatch);
                setProgress(100);
            } else {
                console.log(vectorIndex, colIndexs, titles, i, col, rowNum, colNumber, batch);
                await initByBatch(vectorIndex, colIndexs, titles, i, col, rowNum, colNumber, batch);
                if (i - 1 >= rowNum) {
                    setProgress(100);
                } else {
                    setProgress(Math.floor((i + batch - 1) / rowNum * 100));
                }
            }

        }


    };
    const onCreateVector = async () => {
        try {
            if (mode == 'file') {
                await initByFile();
            } else {
                await initByColumns();
            }
            toast.show('Initialization successful');
        } catch (e) {
            toast.fail('Initialization failure,reason is ' + e.message, 3000);
        }
    };
    const onFileRemove = (index: number) => {
        setFiles(files.filter((item, i) => i !== index));
    };
    const onChunkSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setChunkSize(parseFloat(e.target.value));
    };
    useEffect(() => {
        initHeaders();
    }, []);
    return (
        <Card className={cn(" w-card ", className)}>
            <CardTitle>{title || t('knowledge:initialization')}</CardTitle>
            <CardContent className=" w-card flex flex-col  justify-center">
                <p className="mb-2">
                    {
                        description || defaultDesc
                    }
                </p>
                <RadioGroup className="mt-2 flex flex-row" defaultValue={mode} onValueChange={setMode}>
                    {
                        modeOpions.map((opt) => {
                            return (
                                <div key={opt.value} className="flex items-center">
                                    <RadioGroupItem id={`x-${opt.value}}`} value={opt.value} />
                                    <label
                                        className="mx-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        htmlFor={`x-${opt.value}}`}>
                                        {t(`knowledge:init_from_${opt.value}`, '')}
                                    </label>
                                </div>
                            );
                        })
                    }
                </RadioGroup>

                <div className="flex flex-row mt-1 justify-start">
                    {
                        mode === 'file' && (
                            <div className="flex flex-col mt-4 w-full text-sm border p-2 rounded-sm ">
                                {
                                    files && files.length > 0 && (
                                        <div className="flex flex-col justify-start w-full my-1 max-h-40 overflow-auto ">
                                            {
                                                files.map((file, i) => {
                                                    return (
                                                        <div className="flex flex-row flex-shrink-0 text-sm p-1 h-6 text-gray-600 items-center justify-between overflow-hidden hover:bg-secondary" key={file.name}>
                                                            <span className="flex flex-row overflow-hidden">
                                                                <span className="flex justify-center items-center w-4 mr-1">
                                                                    {
                                                                        file.type.startsWith('image') ? <Image height={14} width={14} /> : <File height={14} width={14} />
                                                                    }
                                                                </span>
                                                                <span className="whitespace-nowrap overflow-ellipsis overflow-hidden w-4/5">{file.name}</span>
                                                            </span>
                                                            <span className="flex justify-center items-center w-4 mr-1 cursor-pointer" onClick={onFileRemove.bind(null, i)}>
                                                                <Trash2 height={14} width={14} />
                                                            </span>
                                                        </div>
                                                    );
                                                })
                                            }

                                        </div>
                                    )
                                }
                                <div className="flex flex-col items-start w-full">
                                    <div className="flex flex-row">
                                        <div className="label whitespace-nowrap mr-1 w-28 shrink-0">
                                            {
                                                t('knowledge:knowledge_file')
                                            }
                                        </div>
                                        <Tooltip tip="Support PDF/Word/Text/Markdown" >
                                            <FileSelector config={{ maxFiles: 9, multiple: true }} onSelect={onFileSelect} >
                                                {t('knowledge:upload_files')}
                                            </FileSelector>
                                        </Tooltip>
                                    </div>
                                    <div className="flex flex-row mt-1 items-center">
                                        <div className="label whitespace-nowrap mr-1 w-28 shrink-0">
                                            {t('knowledge:chunk_size')}
                                        </div>
                                        <Input value={chunkSize} onChange={onChunkSizeChange} />
                                    </div>
                                </div>

                            </div>
                        )
                    }
                    {
                        mode === 'columns' && (
                            <div className="flex flex-col mt-4 text-sm border p-2 rounded-sm w-full">
                                <CheckboxGroup
                                    value={columns}
                                    options={titles}
                                    onChange={onSelectColumn}
                                />
                                <Button className=" w-20 mt-2" variant="secondary" onClick={initHeaders}>
                                    {t('knowledge:refresh')}
                                </Button>
                            </div>

                        )
                    }
                </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start">
                {
                    progress > 0 && (
                        <Progress className="my-2" percentage={progress} />
                    )
                }
                <Button
                    action="translate-text"
                    color="primary"
                    onClick={onCreateVector}
                >
                    {t('knowledge:initialize')}
                </Button>
            </CardFooter>
        </Card>
    );
});
