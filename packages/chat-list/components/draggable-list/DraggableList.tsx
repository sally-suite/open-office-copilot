
import React, { useState, useCallback, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from "chat-list/components/ui/button";
import { Input } from "chat-list/components/ui/input";
import { Plus, Trash2, ChevronRight, ChevronDown, GripVertical } from "lucide-react";

interface OutlineItem {
    id: string;
    title: string;
    children: OutlineItem[];
}

interface DraggableItemProps {
    item: OutlineItem;
    index: number;
    parentId: string | null;
    moveItem: (dragIndex: number, hoverIndex: number, parentId: string | null) => void;
    updateItem: (id: string, newTitle: string, parentId: string | null) => void;
    removeItem: (id: string, parentId: string | null) => void;
    addItem: (parentId: string | null) => void;
    toggleExpand: (id: string) => void;
    isExpanded: boolean;
}

const DraggableItem: React.FC<DraggableItemProps> = ({
    item,
    index,
    parentId,
    moveItem,
    updateItem,
    removeItem,
    addItem,
    toggleExpand,
    isExpanded
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [{ handlerId }, drop] = useDrop({
        accept: `ITEM${parentId ? `-${parentId}` : ''}`,
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(item: { index: number }, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = (item as any).index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) {
                return;
            }
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }
            moveItem(dragIndex, hoverIndex, parentId)
                ; (item as any).index = hoverIndex;
        },
    });

    const [{ isDragging }, drag, preview] = useDrag({
        type: `ITEM${parentId ? `-${parentId}` : ''}`,
        item: () => {
            return { id: item.id, index };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const opacity = isDragging ? 0.4 : 1;
    drag(drop(ref));

    return (
        <div ref={preview} style={{ opacity }} className={`space-y-2 ${parentId ? 'ml-6' : ''}`}>
            <div className="flex items-center space-x-2">
                <div ref={ref} className="cursor-move">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                </div>
                {item.children.length > 0 && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleExpand(item.id)}
                        className="p-0 w-6 h-6"
                    >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                )}
                <span className="text-sm font-medium w-6">{`${index + 1}.`}</span>
                <Input
                    value={item.title}
                    onChange={(e) => updateItem(item.id, e.target.value, parentId)}
                    placeholder="输入标题"
                    className="flex-grow"
                />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id, parentId)}
                    className="text-red-500 hover:text-red-700"
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">删除项目</span>
                </Button>
                {!parentId && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => addItem(item.id)}
                        className="text-green-500 hover:text-green-700"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">添加子项目</span>
                    </Button>
                )}
            </div>
            {isExpanded && item.children.length > 0 && (
                <div className="pl-6">
                    {item.children.map((child, childIndex) => (
                        <DraggableItem
                            key={child.id}
                            item={child}
                            index={childIndex}
                            parentId={item.id}
                            moveItem={moveItem}
                            updateItem={updateItem}
                            removeItem={removeItem}
                            addItem={addItem}
                            toggleExpand={toggleExpand}
                            isExpanded={isExpanded}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function OutlineConfirmation({ initialOutline = [], onConfirm }: {
    initialOutline?: OutlineItem[];
    onConfirm: (outline: OutlineItem[]) => void;
}) {
    const [outline, setOutline] = useState<OutlineItem[]>(initialOutline);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const moveItem = useCallback((dragIndex: number, hoverIndex: number, parentId: string | null) => {
        setOutline((prevOutline) => {
            const newOutline = JSON.parse(JSON.stringify(prevOutline));
            const items = parentId
                ? newOutline.find((item: OutlineItem) => item.id === parentId)?.children
                : newOutline;
            const [reorderedItem] = items.splice(dragIndex, 1);
            items.splice(hoverIndex, 0, reorderedItem);
            return newOutline;
        });
    }, []);

    const addItem = (parentId: string | null = null) => {
        const newItem = { id: Date.now().toString(), title: '', children: [] };
        setOutline((prevOutline) => {
            const newOutline = JSON.parse(JSON.stringify(prevOutline));
            if (parentId === null) {
                newOutline.push(newItem);
            } else {
                const parent = newOutline.find((item: OutlineItem) => item.id === parentId);
                if (parent) {
                    parent.children.push(newItem);
                }
            }
            return newOutline;
        });
    };

    const updateItem = (id: string, newTitle: string, parentId: string | null = null) => {
        setOutline((prevOutline) => {
            const newOutline = JSON.parse(JSON.stringify(prevOutline));
            const updateItemRecursive = (items: OutlineItem[]) => {
                for (const item of items) {
                    if (item.id === id) {
                        item.title = newTitle;
                        return true;
                    }
                    if (item.children.length > 0 && updateItemRecursive(item.children)) {
                        return true;
                    }
                }
                return false;
            };
            updateItemRecursive(newOutline);
            return newOutline;
        });
    };

    const removeItem = (id: string, parentId: string | null = null) => {
        setOutline((prevOutline) => {
            const newOutline = JSON.parse(JSON.stringify(prevOutline));
            const removeItemRecursive = (items: OutlineItem[]) => {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].id === id) {
                        items.splice(i, 1);
                        return true;
                    }
                    if (items[i].children.length > 0 && removeItemRecursive(items[i].children)) {
                        return true;
                    }
                }
                return false;
            };
            removeItemRecursive(newOutline);
            return newOutline;
        });
    };

    const toggleExpand = (id: string) => {
        setExpandedItems((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleConfirm = () => {
        const cleanOutline = (items: OutlineItem[]): OutlineItem[] => {
            return items
                .filter((item) => item.title.trim() !== '')
                .map((item) => ({
                    ...item,
                    children: cleanOutline(item.children),
                }));
        };
        onConfirm(cleanOutline(outline));
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">确认PPT大纲</h2>
                <div className="space-y-4">
                    {outline.map((item, index) => (
                        <DraggableItem
                            key={item.id}
                            item={item}
                            index={index}
                            parentId={null}
                            moveItem={moveItem}
                            updateItem={updateItem}
                            removeItem={removeItem}
                            addItem={addItem}
                            toggleExpand={toggleExpand}
                            isExpanded={expandedItems.has(item.id)}
                        />
                    ))}
                </div>
                <Button onClick={() => addItem()} className="mt-4 w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    添加新章节
                </Button>
                <Button onClick={handleConfirm} className="mt-6 w-full">
                    确认并开始生成
                </Button>
            </div>
        </DndProvider>
    );
}