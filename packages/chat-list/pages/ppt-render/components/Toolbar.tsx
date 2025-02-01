import React from 'react';

interface ToolbarProps {
  onAddElement: (type: 'text' | 'image' | 'shape') => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddElement }) => {
  return (
    <div className="w-16 bg-gray-200 p-2">
      <button onClick={() => onAddElement('text')} className="mb-2 p-2 bg-blue-500 text-white rounded">T</button>
      <button onClick={() => onAddElement('image')} className="mb-2 p-2 bg-green-500 text-white rounded">I</button>
      <button onClick={() => onAddElement('shape')} className="p-2 bg-yellow-500 text-white rounded">S</button>
    </div>
  );
};

export default Toolbar;