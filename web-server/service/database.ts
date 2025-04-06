"use server"
import { sync } from '@/models/sync'

export const iniDatabase = async () => {
    await sync();
}