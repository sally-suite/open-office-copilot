import React, { useState } from 'react';
import IconButton from 'chat-list/components/icon-button'
import { Plus, Trash } from 'lucide-react';
import StepItem from './StepItem';
import { Input } from '../ui/input';

interface Task {
    name: string;
    steps: string[];
}

interface TaskItemProps {
    task: Task;
    updateTask: (task: Task) => void;
    removeTask: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, updateTask, removeTask }) => {
    const [name, setName] = useState(task.name);
    const [steps, setSteps] = useState(task.steps);

    const addStep = () => {
        setSteps([...steps, '']);
    };

    const updateStep = (stepIndex: number, updatedStep: string) => {
        const newSteps = steps.map((step, i) => (i === stepIndex ? updatedStep : step));
        setSteps(newSteps);
        updateTask({ ...task, name, steps: newSteps });
    };

    const removeStep = (stepIndex: number) => {
        const newSteps = steps.filter((_, i) => i !== stepIndex);
        setSteps(newSteps);
        updateTask({ ...task, name, steps: newSteps });
    };

    return (
        <div className="mb-4 p-4 border rounded shadow">
            <div className="mb-2">
                <Input
                    type="text"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        updateTask({ ...task, name: e.target.value, steps });
                    }}
                    placeholder="任务名称"
                    className="w-full p-2 border rounded"
                />
            </div>
            <div className='flex flex-row items-center space-x-1 my-1'>
                <IconButton icon={Plus} onClick={addStep} ></IconButton>
                <IconButton icon={Trash} onClick={removeTask} ></IconButton>
            </div>

            {steps.map((step, index) => (
                <StepItem
                    key={index}
                    step={step}
                    updateStep={(updatedStep) => updateStep(index, updatedStep)}
                    removeStep={() => removeStep(index)}
                />
            ))}
        </div>
    );
};

export default TaskItem;
