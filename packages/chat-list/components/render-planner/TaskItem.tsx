import React, { useState } from 'react';
import StepItem from './StepItem';
import { XCircle, Plus, Trash } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import IconButton from 'chat-list/components/icon-button';
import { Textarea } from '../ui/textarea';
import { IPlanTask } from 'chat-list/types/user';


interface TaskItemProps {
    num: number;
    task: IPlanTask;
    updateTask: (task: IPlanTask) => void;
    removeTask: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ num, task, updateTask, removeTask }) => {
    const [name, setName] = useState(task.text);
    const [steps, setSteps] = useState(task.steps);

    const addStep = () => {
        setSteps([...steps, { id: uuidv4(), text: '' }]);
    };

    const updateStep = (stepId: string, updatedStep: string) => {
        const newSteps = steps.map((step) => (step.id === stepId ? { ...step, text: updatedStep } : step));
        setSteps(newSteps);
        updateTask({ ...task, text: name, steps: newSteps });
    };

    const removeStep = (stepId: string) => {
        const newSteps = steps.filter((step) => step.id !== stepId);
        setSteps(newSteps);
        updateTask({ ...task, text: name, steps: newSteps });
    };

    return (
        <div className="mb-4 p-2 border rounded ">
            <div className="mb-2 flex items-center">
                <span className='px-1 font-medium text-gray-500'>
                    {num}.
                </span>
                <Textarea

                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        updateTask({ ...task, text: e.target.value, steps });
                    }}
                    placeholder="Task"
                    className="w-full p-2 border rounded mr-2"
                />
                <IconButton icon={Trash} onClick={removeTask} className=" ">

                </IconButton>
            </div>
            <div className='pl-4'>
                {steps.map((step, i) => (
                    <StepItem
                        num={i + 1}
                        key={step.id}
                        step={step}
                        updateStep={(updatedStep) => updateStep(step.id, updatedStep)}
                        removeStep={() => removeStep(step.id)}
                    />
                ))}
                <IconButton className='w-auto ml-0 px-1 py-3 text-sm inline-flex' icon={Plus} onClick={addStep}>Add Step</IconButton>
            </div>

        </div>
    );
};

export default TaskItem;
