import React from 'react';
import { Element } from '../types';

interface PropertyPanelProps {
  selectedElement: Element | null;
  onUpdateElement: (element: Element) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ selectedElement, onUpdateElement }) => {
  if (!selectedElement) return <div className="w-64 bg-gray-200 p-4">No element selected</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onUpdateElement({
      ...selectedElement,
      [name]: name === 'content' ? value : Number(value),
    });
  };

  return (
    <div className="w-64 bg-gray-200 p-4">
      <h2 className="text-lg font-bold mb-4">Element Properties</h2>
      <div className="space-y-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <input type="text" value={selectedElement.type} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        {selectedElement.type === 'text' && (
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
            <textarea
              id="content"
              name="content"
              rows={3}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={selectedElement.content}
              onChange={handleChange}
            />
          </div>
        )}
        <div>
          <label htmlFor="x" className="block text-sm font-medium text-gray-700">X Position</label>
          <input
            type="number"
            id="x"
            name="x"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={selectedElement.position.x}
            onChange={(e) => onUpdateElement({...selectedElement, position: {...selectedElement.position, x: Number(e.target.value)}})}
          />
        </div>
        <div>
          <label htmlFor="y" className="block text-sm font-medium text-gray-700">Y Position</label>
          <input
            type="number"
            id="y"
            name="y"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={selectedElement.position.y}
            onChange={(e) => onUpdateElement({...selectedElement, position: {...selectedElement.position, y: Number(e.target.value)}})}
          />
        </div>
        <div>
          <label htmlFor="width" className="block text-sm font-medium text-gray-700">Width</label>
          <input
            type="number"
            id="width"
            name="width"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={selectedElement.size.width}
            onChange={(e) => onUpdateElement({...selectedElement, size: {...selectedElement.size, width: Number(e.target.value)}})}
          />
        </div>
        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700">Height</label>
          <input
            type="number"
            id="height"
            name="height"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={selectedElement.size.height}
            onChange={(e) => onUpdateElement({...selectedElement, size: {...selectedElement.size, height: Number(e.target.value)}})}
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;