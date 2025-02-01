import React from 'react';
import { Slide } from '../types';

interface CodeViewerProps {
  slide: Slide;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ slide }) => {
  return (
    <div className="h-64 bg-gray-800 text-white p-4 overflow-auto">
      <pre>{JSON.stringify(slide, null, 2)}</pre>
    </div>
  );
};

export default CodeViewer;