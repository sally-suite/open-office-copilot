import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from 'chat-list/components/header';
import { Plus, Play, Trash } from 'lucide-react';
import IconButton from '../icon-button';
import { PlanContext } from './planContext';
import Button from '../button';
const PlanList: React.FC = () => {
    // const [plans, setPlans] = useState<IPlan[]>([]);
    const { plans, removePlan } = useContext(PlanContext);
    const naviate = useNavigate();

    const handleExecutePlan = (id: string) => {
        // 在这里执行导航到计划明细页面的操作
        naviate(`/planner/plan/${id}`);
    };
    const addPlan = () => {
        naviate(`/planner/add`);
    };

    const edit = async (id: string) => {
        naviate(`/planner/plan/${id}`);
    };
    const run = async (id: string, e: Event) => {
        e.stopPropagation();
        console.log(id);
    };
    const remove = async (id: string, e: Event) => {
        e.stopPropagation();
        await removePlan(id);
    };

    return (
        <div className="container mx-auto p-0">
            <Header title='Plans' />
            <div className='p-1 px-2 flex flex-row justify-start space-x-1 mt-1'>
                <Button icon={Plus} variant='default' size='sm' className='px-0 w-auto text-sm' onClick={addPlan}>
                    Add Plan
                </Button>
            </div>
            <div className='p-2'>
                {plans.map((plan) => (
                    <div key={plan.id} className="mb-2 p-2 border rounded flex justify-between items-center cursor-pointer" onClick={() => edit(plan.id)}>
                        <div>
                            <h2 className="text-base">{plan.name}</h2>
                            {/* <p className="text-gray-600">{plan.description}</p> */}
                        </div>
                        <div className='flex flex-row items-center space-x-1'>
                            {/* <IconButton className='mx-2' icon={Edit} onClick={() => edit(plan.id)}> </IconButton> */}
                            <IconButton className=' w-auto ml-0 px-1 py-3 text-sm ' icon={Play} onClick={run.bind(null, plan.id)}> Run</IconButton>
                            <IconButton className=' w-auto ml-0 px-1 py-3 text-sm' icon={Trash} onClick={remove.bind(null, plan.id)}> Remove</IconButton>

                        </div>
                    </div>
                ))}
                {/* <div className='flex flex-row items-center justify-center py-1 border cursor-pointer w-40' onClick={addPlan}>
                    <Plus height={16} width={16} />
                    <span className='ml-2 text-sm font-medium'>
                        Add Plan
                    </span>
                </div> */}
                {/* <IconButton className='w-auto ml-0 px-1 py-3 text-sm inline-flex' icon={Plus} onClick={addPlan}>Add Plan</IconButton> */}
            </div>
        </div >
    );
};

export default PlanList;
