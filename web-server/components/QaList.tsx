import React from 'react';
import QaItem from './QaItem';
import data from '@/constants/qa'
const QaList = () => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 w-full'>
      {data.map((item, index) => (
        <QaItem key={index} question={item.question} answer={item.answer} />
      ))}
    </div>
  );
};

export default QaList;
