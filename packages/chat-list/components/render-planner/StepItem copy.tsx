import React, { useState } from 'react';
import { Input } from '../ui/input';
import IconButton from 'chat-list/components/icon-button';
import { Trash } from 'lucide-react';

interface StepItemProps {
    step: string;
    updateStep: (step: string) => void;
    removeStep: () => void;
}

const StepItem: React.FC<StepItemProps> = ({ step, updateStep, removeStep }) => {
    const [currentStep, setCurrentStep] = useState(step);

    return (
        <div className="ml-4 mb-2 flex items-center">
            <Input
                type="text"
                value={currentStep}
                onChange={(e) => {
                    setCurrentStep(e.target.value);
                    updateStep(e.target.value);
                }}
                placeholder="步骤"
                className="w-full p-2 border rounded"
            />
            <IconButton icon={Trash} onClick={removeStep} className="ml-2 py-2"></IconButton>
        </div>
    );
};

export default StepItem;
