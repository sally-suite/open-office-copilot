import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import Markdown from '../markdown/plain';

type MarkdownEditorProps = {
    value?: string;
    onChange?: (value: string) => void;
};


const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(value || '\n\n');
    const editorRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditing && editorRef.current) {
            editorRef.current.focus();
        }
    }, [isEditing]);

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setText(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    useEffect(() => {
        setText(value || '\n')
    }, [value])

    return (
        <div className="p-1">
            {isEditing ? (
                <textarea
                    ref={editorRef}
                    className="w-full h-64 p-2 border border-gray-300 rounded outline-none"
                    value={text}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
            ) : (
                <div onDoubleClick={handleDoubleClick} style={{ minHeight: '32px' }}>
                    <Markdown >
                        {(text)}
                    </Markdown>
                </div>
            )}
        </div >
    );
};

export default MarkdownEditor;
