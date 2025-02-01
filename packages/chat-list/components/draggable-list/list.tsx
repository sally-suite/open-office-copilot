import React, { useState, useCallback } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Button } from "chat-list/components/ui/button"
import { Plus } from "lucide-react"
import DraggableList from './DraggableList'

interface OutlineItem {
    id: string;
    title: string;
    children: OutlineItem[];
}

export default function OutlineConfirmation({ initialOutline = [], onConfirm }: {
    initialOutline?: OutlineItem[];
    onConfirm: (outline: OutlineItem[]) => void;
}) {
    const [outline, setOutline] = useState<OutlineItem[]>(initialOutline)

    const handleChange = (newOutline: OutlineItem[]) => {
        setOutline(newOutline)
    }

    const addItem = (parentId: string | null = null) => {
        const newItem = { id: Date.now().toString(), title: '', children: [] }
        setOutline((prevOutline) => {
            const newOutline = JSON.parse(JSON.stringify(prevOutline))
            if (parentId === null) {
                newOutline.push(newItem)
            } else {
                const parent = newOutline.find((item: OutlineItem) => item.id === parentId)
                if (parent) {
                    parent.children.push(newItem)
                }
            }
            return newOutline
        })
    }

    const handleConfirm = () => {
        const cleanOutline = (items: OutlineItem[]): OutlineItem[] => {
            return items
                .filter((item) => item.title.trim() !== '')
                .map((item) => ({
                    ...item,
                    children: cleanOutline(item.children),
                }))
        }
        onConfirm(cleanOutline(outline))
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">确认PPT大纲</h2>
                <DraggableList items={outline} onChange={handleChange} />
                <Button onClick={() => addItem()} className="mt-4 w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    添加新章节
                </Button>
                <Button onClick={handleConfirm} className="mt-6 w-full">
                    确认并开始生成
                </Button>
            </div>
        </DndProvider>
    )
}