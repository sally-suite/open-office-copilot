import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../header';
import TaskList from './TaskList';
interface PlanDetailParams {
    id: string;
}

const PlanDetail: React.FC = () => {
    const { id } = useParams<PlanDetailParams>();

    return (
        <div className="container mx-auto p-0">
            <Header title='Tasks' />
            <p>计划ID: {id}</p>
            <TaskList />
        </div>
    );
};

export default PlanDetail;
