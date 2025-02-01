import React, { useCallback, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Input } from "chat-list/components/ui/input";
import { Button } from "chat-list/components/ui/button";
import { Trash2, GripVertical, List, Text, Grid3X3, LineChart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface DraggableItem {
  id: string;
  content: string;
  type?: string;
}

export const SlideType: any = {
  list: <List className="h-4 w-4" />,
  table: <Grid3X3 className="h-4 w-4" />,
  chart: <LineChart className="h-4 w-4" />,
}
interface DraggableItemProps {
  item: DraggableItem;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  updateItem: (id: string, newContent: string) => void;
  removeItem: (id: string) => void;
  updateType: (id: string, newType: string) => void;
}

const DraggableListItem: React.FC<DraggableItemProps> = ({
  item,
  index,
  moveItem,
  updateItem,
  removeItem,
  updateType
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'ITEM',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(draggedItem: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveItem(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'ITEM',
    item: () => ({ id: item.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  return (
    <div ref={ref} style={{ opacity }} className="flex items-center space-x-2 mb-1">
      <div className="cursor-move">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        value={item.content}
        onChange={(e) => updateItem(item.id, e.target.value)}
        className="flex-grow"
      />
      <div>
        <Select value={item.type}
          onValueChange={(value) => {
            updateType(item.id, value)
          }}>
          <SelectTrigger>
            <SelectValue >
              {SlideType[item.type] || <List className="h-4 w-4" />}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              hideIndicator={true}

              value="list">
              <div
                className='flex flex-row space-x-1 px-2'
              >
                <List className="h-4 w-4" />
                <span>List</span>
              </div>
            </SelectItem>
            <SelectItem
              hideIndicator={true}
              className='flex flex-row space-x-1'
              value="table">
              <div
                className='flex flex-row space-x-1 px-2'
              >
                <Grid3X3 className="h-4 w-4" />
                <span>Table</span>
              </div>
            </SelectItem>
            <SelectItem
              hideIndicator={true}
              className='flex flex-row space-x-1'
              value="chart">
              <div
                className='flex flex-row space-x-1 px-2'
              >
                <LineChart className="h-4 w-4" />
                <span>Chart</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeItem(item.id)}
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div >
  );
};

interface DraggableListProps {
  items: DraggableItem[];
  onChange: (newItems: DraggableItem[]) => void;
}

const DraggableList: React.FC<DraggableListProps> = ({ items, onChange }) => {
  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    const newItems = [...items];
    const [reorderedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, reorderedItem);
    onChange(newItems);
  }, [items, onChange]);

  const updateItem = useCallback((id: string, newContent: string) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, content: newContent } : item
    );
    onChange(newItems);
  }, [items, onChange]);

  const updateType = useCallback((id: string, newType: string) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, type: newType } : item
    );
    onChange(newItems);
  }, [items, onChange]);

  const removeItem = useCallback((id: string) => {
    const newItems = items.filter(item => item.id !== id);
    onChange(newItems);
  }, [items, onChange]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full max-w-2xl mx-auto ">
        {items.map((item, index) => (
          <DraggableListItem
            key={item.id}
            item={item}
            index={index}
            moveItem={moveItem}
            updateItem={updateItem}
            removeItem={removeItem}
            updateType={updateType}
          />
        ))}
      </div>
    </DndProvider>
  );
};

export default DraggableList;