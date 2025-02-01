import React, { useState } from 'react';
import IconButton from 'chat-list/components/icon-button';
import { Trash } from 'lucide-react';
import { Input } from '../ui/input';

interface Step {
    id: string;
    text: string;
}

interface StepItemProps {
    num: number;
    step: Step;
    updateStep: (step: string) => void;
    removeStep: () => void;
}

const StepItem: React.FC<StepItemProps> = ({ num, step, updateStep, removeStep }) => {
    const [currentStep, setCurrentStep] = useState(step.text);

    return (
        <div className=" mb-2 flex items-center">
            <span className='px-1 text-gray-500'>
                [{num}]
            </span>
            <Input
                type="text"
                value={currentStep}
                onChange={(e) => {
                    setCurrentStep(e.target.value);
                    updateStep(e.target.value);
                }}
                placeholder="Step"
                className="w-full p-2 border rounded"
            />
            <IconButton icon={Trash} onClick={removeStep} className="ml-2"></IconButton>
        </div>
    );
};

export default StepItem;
