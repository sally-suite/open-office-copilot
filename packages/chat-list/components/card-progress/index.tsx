// FileList.js
import React from 'react';
import ProgressBar from '../progress'

interface ICardProgressProps {
    percentage: number;
}


const CardProgress = ({ percentage }: ICardProgressProps) => {

    return (
        <div className="flex flex-col p-2 shadow rounded-xl rounded-tr-none items-center bg-white w-[280px]">
            <ProgressBar percentage={percentage == 0 ? 10 : percentage} />
        </div>
    );
};

export default CardProgress;

