import React from 'react';
import { Trash2, File, Image } from 'lucide-react';

interface FileListProps {
  fileList: File[];
  onFileRemove: (index: number) => void;
}

const renderFileIcon = (file: File) => {
  if (file.type.startsWith('image')) {
    return <Image height={14} width={14} />;
  }
  return <File height={14} width={14} />;
};

export const FileList: React.FC<FileListProps> = ({ fileList, onFileRemove }) => {
  if (!fileList || fileList.length === 0) return null;

  return (
    <>
      <div className="flex flex-row justify-start w-full my-1 max-h-40 overflow-auto">
        {fileList.filter((file) => file.type.startsWith('image/')).map((file, i) => (
          <div
            className="flex flex-row flex-shrink-0 text-sm h-16 text-gray-600 items-center justify-between overflow-hidden relative"
            key={file.name}
          >
            <div className="relative flex-shrink-0 w-16 h-16 mr-1 rounded-sm overflow-hidden border">
              <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" style={{ borderRadius: 5 }} />
              <span
                className="absolute top-1 right-1 p-1 cursor-pointer text-white bg-gray-800 rounded-full"
                onClick={() => onFileRemove(i)}
              >
                <Trash2 height={14} width={14} />
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col justify-start w-full my-1 max-h-40 overflow-auto">
        {fileList.filter((file) => !file.type.startsWith('image/')).map((file, i) => (
          <div
            className="flex flex-row flex-shrink-0 text-sm p-1 h-8 text-gray-600 items-center justify-between overflow-hidden hover:bg-secondary relative"
            key={file.name}
          >
            <div className="flex flex-row flex-shrink-0 text-sm p-1 h-6 text-gray-600 items-center justify-between overflow-hidden hover:bg-secondary w-full">
              <span className="flex flex-row overflow-hidden">
                <span className="flex justify-center items-center w-4 mr-1">
                  {renderFileIcon(file)}
                </span>
                <span className="whitespace-nowrap overflow-ellipsis overflow-hidden w-4/5">{file.name}</span>
              </span>
              <span
                className="flex justify-center items-center w-4 mr-1 cursor-pointer"
                onClick={() => onFileRemove(i)}
              >
                <Trash2 height={14} width={14} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default FileList;