import React, { useState } from 'react';
import DataTable from '../data-table'
import { cn } from 'chat-list/lib/utils';
interface IPreviewProps {
  data: { name: string, data: any[][] }[];
}
export default function Preview(props: IPreviewProps) {
  const { data } = props;
  const [current, setCurrent] = useState(0)
  if (!data || data.length == 0) return null;
  return (
    <div>
      <div className='flex flex-row items-center mb-1 h-8 w-full overflow-auto'>
        {
          data.map((item, index) => {
            return (
              <div className={cn('text-center py-1 px-2 border cursor-pointer whitespace-nowrap',
                index == current ? 'bg-primary text-white' : 'bg-white text-gray-500'
              )} key={index} onClick={() => setCurrent(index)}>
                {item.name}
              </div>
            )
          })
        }
      </div>
      <div className='p-1 w-full overflow-auto'>
        <DataTable data={data[current].data} />
      </div>
    </div>
  );
}
