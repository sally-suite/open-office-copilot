import React, { useState } from 'react';
import TaskItem from './TaskItem';
import IconButton from 'chat-list/components/icon-button';
import { Plus } from 'lucide-react';
import { uuid } from 'chat-list/utils';

interface Task {
    id: string;
    name: string;
    steps: string[];
}

const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);

    const addTask = () => {
        setTasks([...tasks, { id: uuid(), name: '', steps: [] }]);
    };

    const updateTask = (index: number, updatedTask: Task) => {
        const newTasks = tasks.map((task, i) => (i === index ? updatedTask : task));
        setTasks(newTasks);
    };

    const removeTask = (index: number) => {
        setTasks(tasks.filter((_, i) => i !== index));
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className=" text-base font-bold mb-2">Task List</h1>
            <IconButton icon={Plus} onClick={addTask} className='my-1' >
            </IconButton>
            <div>
                {tasks.map((task, index) => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        updateTask={(updatedTask) => updateTask(index, updatedTask)}
                        removeTask={() => removeTask(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default TaskList;
