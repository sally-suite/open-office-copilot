"use client"

import Button from "@/components/Button";
import { iniDatabase } from '@/service/database'
import { toast } from "sonner"

export default function Database() {
    const initDatabase = async () => {
        await iniDatabase();
        toast.success("Database initialized successfully")
    }
    return (
        <div className="container mx-auto py-2">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Database</h1>
            </div>
            <Button onClick={initDatabase}>
                Initlize database
            </Button>
        </div>

    )
}