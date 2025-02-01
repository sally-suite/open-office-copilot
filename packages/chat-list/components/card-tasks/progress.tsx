import React from "react";
import {
    Card,
    CardContent,
    CardTitle,
    // RadioGroup,
} from "chat-list/components/ui/card";
import { ITask } from "chat-list/types/task";
import { Check, MoreHorizontal, X } from 'lucide-react';

export const Status: any = {
    'pending': <MoreHorizontal height={20} width={20} className="text-gray-200" />,
    'done': <Check height={20} width={20} className="text-green-700" />,
    'failed': <X height={20} width={20} className="text-red-500 h-5 w-5" />
};
export default React.memo(function CardCreate(props: ICardTasksProps) {
    const { tasks, title } = props;
    if (tasks.length === 0) {
        return (
            <Card className=" w-card">
                <CardTitle>{title || 'Task Progress'}</CardTitle>
                <CardContent>
                    <div>
                        <p>Hi, No tasks need to execution now. 😊:</p>
                    </div>
                </CardContent>
            </Card>
        );
    }
    return (
        <Card className=" w-card">
            <CardTitle>{title || 'Task Progress'}</CardTitle>
            <CardContent>
                <div className="markdown">
                    <p>Hi, Here is the task&apos;s execution progress. 😊:</p>
                    <ol style={{ padding: 0 }}>
                        {tasks.map((item: ITask) => {
                            return (
                                <li key={item.id} className="flex flex-row py-1 items-start cursor-pointer hover:bg-slate-100">
                                    {/* <span className={Status[item.status]}> [{item.status}]</span> */}
                                    <span className="h-5 w-5">
                                        {Status[item.status]}
                                    </span>
                                    <span className="ml-2">{item.id}. {item.task}</span>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </CardContent>
        </Card>
    );
});
