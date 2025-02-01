import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import PropertyPanel from './PropertyPanel';
import CodeViewer from './CodeViewer';
import { Slide, Element } from '../types';

const initialSlide: Slide = {
  id: 'slide1',
  layout: 'TITLE_AND_CONTENT',
  background: { color: '#FFFFFF' },
  elements: []
};

const PPTEditor: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<Slide>(initialSlide);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);

  const handleAddElement = (type: 'text' | 'image' | 'shape') => {
    const newElement: Element = {
      id: `element_${Date.now()}`,
      type,
      position: { x: 1, y: 1 },
      size: { width: 20, height: 20 },
      content: type === 'text' ? '新文本' : '',
      style: {}
    };

    setCurrentSlide(prevSlide => ({
      ...prevSlide,
      elements: [...prevSlide.elements, newElement]
    }));
  };

  const handleUpdateElement = (updatedElement: Element) => {
    setCurrentSlide(prevSlide => ({
      ...prevSlide,
      elements: prevSlide.elements.map(element =>
        element.id === updatedElement.id ? updatedElement : element
      )
    }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen">
        <Toolbar onAddElement={handleAddElement} />
        <div className="flex flex-col flex-grow">
          <Canvas
            slide={currentSlide}
            onSelectElement={setSelectedElement}
            onUpdateElement={handleUpdateElement}
          />
          <CodeViewer slide={currentSlide} />
        </div>
        <PropertyPanel
          selectedElement={selectedElement}
          onUpdateElement={handleUpdateElement}
        />
      </div>
    </DndProvider>
  );
};

export default PPTEditor;