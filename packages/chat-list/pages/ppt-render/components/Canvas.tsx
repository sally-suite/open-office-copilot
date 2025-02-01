import React, { useCallback, useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Slide, Element } from '../types';

interface CanvasProps {
  slide: Slide;
  onSelectElement: (element: Element) => void;
  onUpdateElement: (element: Element) => void;
}

const DraggableElement: React.FC<{
  element: Element;
  onDrag: (elementId: string, delta: { x: number; y: number }) => void;
  onDragEnd: (elementId: string) => void;
}> = ({ element, onDrag, onDragEnd }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'element',
    item: { ...element, type: 'element' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    // 在拖拽过程中持续调用 onDrag
    // 在拖拽结束时调用 onDragEnd
    // 这里使用 useEffect 来处理，因为 useDrag 的回调中不能直接使用最新的 props
  }), [element, onDrag, onDragEnd]);

  useEffect(() => {
    if (isDragging) {
      const handleDrag = (e: MouseEvent) => {
        console.log('=====')
        onDrag(element.id, { x: e.movementX, y: e.movementY });
      };
      const handleDragEnd = () => {
        onDragEnd(element.id);
      };
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, element.id, onDrag, onDragEnd]);

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        width: '100%',
        height: '100%',
      }}
    >
      {element.type === 'text' && <div>{element.content}</div>}
      {element.type === 'image' && <img src={element.content} alt="Element" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
      {element.type === 'shape' && <div className="bg-blue-500 w-full h-full"></div>}
    </div>
  );
};

const Canvas: React.FC<CanvasProps> = ({ slide, onSelectElement, onUpdateElement }) => {
  const [draggedElements, setDraggedElements] = useState<{ [key: string]: { x: number; y: number } }>({});

  const ptToPx = useCallback((pt: number) => pt * 1.33333, []);

  const handleDrag = (elementId: string, delta: { x: number; y: number }) => {
    console.log('====')
    setDraggedElements(prev => {
      const oldDelta = prev[elementId] || { x: 0, y: 0 };
      return {
        ...prev,
        [elementId]: {
          x: oldDelta.x + delta.x,
          y: oldDelta.y + delta.y
        }
      };
    });
  }

  const handleDragEnd = useCallback((elementId: string) => {
    const updatedElement = slide.elements.find(el => el.id === elementId);
    const dragDelta = draggedElements[elementId];
    if (updatedElement && dragDelta) {
      onUpdateElement({
        ...updatedElement,
        position: {
          x: updatedElement.position.x + dragDelta.x / 1.33333,
          y: updatedElement.position.y + dragDelta.y / 1.33333,
        },
      });
      setDraggedElements(prev => {
        const newState = { ...prev };
        delete newState[elementId];
        return newState;
      });
    }
  }, [slide.elements, draggedElements, onUpdateElement]);

  return (
    <div className="flex-grow bg-gray-100 relative" style={{ width: '1024px', height: '768px' }}>
      {slide.elements.map((element) => {
        const dragDelta = draggedElements[element.id] || { x: 0, y: 0 };
        return (
          <div
            key={element.id}
            className="absolute"
            style={{
              left: ptToPx(element.position.x) + dragDelta.x,
              top: ptToPx(element.position.y) + dragDelta.y,
              width: ptToPx(element.size.width),
              height: ptToPx(element.size.height),
            }}
            onClick={() => onSelectElement(element)}
          >
            <DraggableElement
              element={element}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Canvas;