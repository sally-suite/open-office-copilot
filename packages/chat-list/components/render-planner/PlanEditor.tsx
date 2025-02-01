import React, { useState } from 'react';
import PlanItem from './PlanItem';

const PlanEditor = () => {
    const [plans, setPlans] = useState([]);
    const addPlan = () => {
        setPlans([...plans, { name: '', description: '', tasks: [] }]);
    };
    const updatePlan = (index, updatedPlan) => {
        const newPlans = plans.map((plan, i) => (i === index ? updatedPlan : plan));
        setPlans(newPlans);
    };
    const removePlan = (index) => {
        setPlans(plans.filter((_, i) => i !== index));
    };
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">计划编辑器</h1>
            <button onClick={addPlan} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">添加计划</button>
            <div>
                {plans.map((plan, index) => (
                    <PlanItem
                        key={index}
                        plan={plan}
                        updatePlan={(updatedPlan) => updatePlan(index, updatedPlan)}
                        removePlan={() => removePlan(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default PlanEditor;
