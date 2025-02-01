import React, { useContext, useEffect, useState } from 'react';
import TaskItem from './TaskItem';
import { v4 as uuidv4 } from 'uuid';
import { Play, Plus, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../header';
import { Input } from '../ui/input';
import Button from '../button';
import { PlanContext } from './planContext';
import { IPlanTask } from 'chat-list/types/user';
import IconButton from '../icon-button';

const TaskList: React.FC = () => {
    const [name, setName] = useState('');
    const [tasks, setTasks] = useState<IPlanTask[]>([]);
    const { addPlan, getPlan, plan } = useContext(PlanContext);

    const navigate = useNavigate();
    const { id } = useParams();
    const addTask = () => {
        setTasks([...tasks, { id: uuidv4(), text: '', steps: [] }]);
    };

    const updateTask = (id: string, updatedTask: IPlanTask) => {
        const newTasks = tasks.map((task) => (task.id === id ? updatedTask : task));
        setTasks(newTasks);
    };

    const removeTask = (id: string) => {
        setTasks(tasks.filter((task) => task.id !== id));
    };

    const onSave = async () => {
        await addPlan({
            name,
            tasks
        });
        navigate(-1);
    };
    const loadPlan = async (id: string) => {
        const result = await getPlan(id);
        console.log(result);
        setName(result.name);
        setTasks(result.tasks);
    };
    useEffect(() => {
        if (id) {
            loadPlan(id);
        }
    }, []);
    return (
        <div className="container mx-auto p-0">
            <Header title={id ? "Edit Plan" : "Add Plan"} onBack={() => {
                navigate(-1);
            }} />
            <div className='p-1 px-2 flex flex-row justify-start space-x-1 mt-1'>
                <Button icon={Save} variant='default' size='sm' className='px-0 w-auto text-sm' onClick={onSave}>
                    Save
                </Button>
                <Button icon={Play} variant='secondary' size='sm' className='px-0 w-auto  text-sm' onClick={onSave}>
                    Run
                </Button>
            </div>
            <div className=" p-2 flex items-center">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder='Plan name' className="w-full p-2 border rounded" />
            </div>
            <div className='p-2'>
                {/* <IconButton icon={Plus} onClick={addTask} className="my-2"> </IconButton> */}
                <div>
                    {tasks.map((task, i) => (
                        <TaskItem
                            num={i + 1}
                            key={task.id}
                            task={task}
                            updateTask={(updatedTask) => updateTask(task.id, updatedTask)}
                            removeTask={() => removeTask(task.id)}
                        />
                    ))}
                </div>
                <IconButton className='w-auto ml-0 px-1 py-3 text-sm inline-flex' icon={Plus} onClick={addTask}>Add Task</IconButton>
            </div>

        </div>
    );
};

export default TaskList;
