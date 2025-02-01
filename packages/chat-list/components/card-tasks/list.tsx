import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardTitle,
    CardActions,
    // RadioGroup,
} from "chat-list/components/ui/card";
import { ITask } from "chat-list/types/task";
import { CheckSquare, Square, XSquare } from 'lucide-react'
import useLocalStore from "chat-list/hook/useLocalStore";
import { SHEET_CHAT_TASK_AUTO_EXEC } from "chat-list/config/task";
import Button from "chat-list/components/button";

interface ICardTasksProps {
    title?: string;
    tasks: ITask[];
    onConfirm?: (tasks: ITask[]) => void;
}

export const Status: any = {
    'uncheck': <Square height={20} width={20} />,
    'checked': <CheckSquare height={20} width={20} />
}

const AutomaticExecutionOptions = [
    { label: "Auto", value: "auto" },
    { label: "Confirmation", value: "confirmation" },
];


export default React.memo(function CardCreate(props: ICardTasksProps) {
    const { tasks, title, onConfirm } = props;
    const [checkState, setCheckState] = useState<any>(tasks.reduce((pre, cur) => {
        return {
            ...pre,
            [cur.id]: 'checked'
        }
    }, {}))
    const { value: automatic, setValue: setAutomatic } = useLocalStore(
        SHEET_CHAT_TASK_AUTO_EXEC,
        "confirmation"
    );

    const onAutoChanage = () => {
        setAutomatic(automatic === 'confirmation' ? 'auto' : 'confirmation')
    }
    const onOk = () => {
        const list = tasks.filter(item => checkState[item.id] === 'checked')
        onConfirm?.(list);
    }
    const onChose = (item: ITask) => {
        setCheckState({
            ...checkState,
            [item.id]: checkState[item.id] === 'checked' ? 'uncheck' : 'checked'
        }
        )
    }
    return (
        <Card className=" w-card">
            <CardTitle>{title || 'To-do List'}</CardTitle>
            <CardContent>
                <h3 className="input-label">Tasks:</h3>
                <div className="markdown">
                    <p>Hi, I created a task list. You can check and select the ones to be executed, or choose automatic execution:</p>
                    <ol style={{ padding: 0 }}>
                        {tasks.map((item: ITask, index) => {
                            return (
                                <li className="flex flex-row py-1 items-start cursor-pointer hover:bg-slate-100" key={item.id} onClick={onChose.bind(null, item)}>
                                    <span className="h-5 w-5">
                                        {Status[checkState[item.id]]}
                                    </span>

                                    <span className="ml-2">{item.id}. [{item.skill}] {item.task}</span>
                                </li>
                            )
                        })}
                    </ol>
                </div>
                {/* <h3 className="input-label">Automatic Execution:</h3>
                <RadioGroup
                    value={automatic}
                    options={AutomaticExecutionOptions}
                    onChange={onAutoChanage}
                /> */}
            </CardContent>
            <CardActions>
                <Button
                    action="confirm-task"
                    color="primary"
                    title="Confirm Task List"
                    onClick={onOk}
                >
                    Ok
                </Button>
            </CardActions>
        </Card>
    );
});
