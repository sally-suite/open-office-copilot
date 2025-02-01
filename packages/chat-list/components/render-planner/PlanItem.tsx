import React, { useState } from 'react';
import TaskItem from './TaskItem';

const PlanItem = ({ plan, updatePlan, removePlan }) => {
    const [name, setName] = useState(plan.name);
    const [description, setDescription] = useState(plan.description);
    const [tasks, setTasks] = useState(plan.tasks);

    const addTask = () => {
        setTasks([...tasks, { name: '', steps: [] }]);
    };

    const updateTask = (taskIndex, updatedTask) => {
        const newTasks = tasks.map((task, i) => (i === taskIndex ? updatedTask : task));
        setTasks(newTasks);
        updatePlan({ ...plan, name, description, tasks: newTasks });
    };

    const removeTask = (taskIndex) => {
        const newTasks = tasks.filter((_, i) => i !== taskIndex);
        setTasks(newTasks);
        updatePlan({ ...plan, name, description, tasks: newTasks });
    };

    return (
        <div className="mb-4 p-4 border rounded shadow">
            <div className="mb-2">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        updatePlan({ ...plan, name: e.target.value, description, tasks });
                    }}
                    placeholder="计划名称"
                    className="w-full p-2 border rounded"
                />
            </div>
            <div className="mb-2">
                <textarea
                    value={description}
                    onChange={(e) => {
                        setDescription(e.target.value);
                        updatePlan({ ...plan, name, description: e.target.value, tasks });
                    }}
                    placeholder="描述"
                    className="w-full p-2 border rounded"
                />
            </div>
            <button onClick={addTask} className="mb-2 px-4 py-2 bg-green-500 text-white rounded">添加任务</button>
            {tasks.map((task, index) => (
                <TaskItem
                    key={index}
                    task={task}
                    updateTask={(updatedTask) => updateTask(index, updatedTask)}
                    removeTask={() => removeTask(index)}
                />
            ))}
            <button onClick={removePlan} className="mt-2 px-4 py-2 bg-red-500 text-white rounded">删除计划</button>
        </div>
    );
};

export default PlanItem;
